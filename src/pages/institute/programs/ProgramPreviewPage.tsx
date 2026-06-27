import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Eye,
  LayoutList,
  Maximize2,
  Minimize2,
  Printer,
} from 'lucide-react';
import CurriculumCalendarView from '@/components/institute/programs/CurriculumCalendarView';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  configWithEffectiveHolidays,
  setGeneratedSlots,
  useFaculty,
  useInstituteHolidays,
  useInstituteProgram,
} from '@/hooks/useInstitutePrograms';
import {
  chapterHours,
  daysBetween,
  formatShort,
  hoursToPeriods,
  planDates,
  rollupProgram,
  rollupSubject,
} from '@/utils/calendarAutomation';
import { subjectPalette } from '@/lib/subjectColors';
import { cn } from '@/lib/utils';
import { formatHoursShort } from '@/utils/formatUtils';


const DEFAULT_SCHEDULE = {
  startDate: '2025-04-14',
  workingDays: [1, 2, 3, 4, 5, 6] as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
  periodsPerDay: 6,
  periodLengthMins: 40,
  dayStartTime: '08:30',
  breaks: [],
  holidays: [],
  defaultFaculty: {},
};

const PRINT_CSS = `
@media print {
  .no-print { display: none !important; }
  .print-open > .accordion-body { display: block !important; }
  .print-open .accordion-chevron { transform: rotate(90deg); }
  .chapter-block { break-inside: avoid; page-break-inside: avoid; }
  body { background: white !important; }
}
`;

const ProgramPreviewPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  const faculty = useFaculty();
  const instituteHolidays = useInstituteHolidays();

  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [forcePrintOpen, setForcePrintOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');


  const periodMins = program?.schedule?.periodLengthMins ?? 40;
  const baseSchedule = program?.schedule ?? DEFAULT_SCHEDULE;
  const schedule = configWithEffectiveHolidays(baseSchedule as never, instituteHolidays);

  const roll = useMemo(() => (program ? rollupProgram(program, periodMins) : null), [program, periodMins]);
  const plan = useMemo(() => (program ? planDates(program, schedule) : null), [program, schedule]);

  if (!program || !roll || !plan) return <div className="p-10 text-slate-500">Program not found.</div>;

  const chaptersCount = program.subjects.reduce((a, s) => a + s.chapters.length, 0);
  const termDays = daysBetween(plan.startDate, plan.endDate);

  const expandAll = () => {
    const subs: Record<string, boolean> = {};
    const chs: Record<string, boolean> = {};
    program.subjects.forEach((s) => {
      subs[s.id] = true;
      s.chapters.forEach((c) => (chs[c.id] = true));
    });
    setOpenSubjects(subs);
    setOpenChapters(chs);
  };

  const collapseAll = () => {
    setOpenSubjects({});
    setOpenChapters({});
  };

  const handlePrint = () => {
    setForcePrintOpen(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setForcePrintOpen(false), 300);
    }, 50);
  };

  const visibleSubjects = activeSubject === 'all'
    ? program.subjects
    : program.subjects.filter((s) => s.id === activeSubject);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <style>{PRINT_CSS}</style>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500 no-print">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Programs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium">{program.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Curriculum preview</span>
        </div>

        {/* Header */}
        <Card className="border-slate-200/70 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  <Eye className="h-3.5 w-3.5" /> Curriculum preview
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 flex-wrap">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">
                    {formatShort(plan.startDate)} → {formatShort(plan.endDate)}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>{termDays} days</span>
                  <span className="text-slate-400">·</span>
                  <span>{program.subjects.length} subjects · {chaptersCount} chapters · {roll.totalTopics} topics</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-semibold text-slate-800">{roll.periods} periods</span>
                </div>
              </div>
              <div className="flex items-center gap-2 no-print flex-wrap sm:justify-end">
                {viewMode === 'list' && (
                  <>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={expandAll}>
                      <Maximize2 className="h-3.5 w-3.5" /> Expand all
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={collapseAll}>
                      <Minimize2 className="h-3.5 w-3.5" /> Collapse all
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>

            {/* Primary view toggle */}
            <div className="no-print flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">View</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  <LayoutList className="h-4 w-4" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors',
                    viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  <CalendarDays className="h-4 w-4" /> Calendar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>


        {viewMode === 'calendar' && (
          <CurriculumCalendarView
            program={program}
            schedule={schedule}
            storedSlots={program.generatedSlots}
            faculty={faculty}
            onChangeFaculty={(_slotId, _facultyId, allSlots) =>
              setGeneratedSlots(program.id, allSlots)
            }
          />
        )}

        {viewMode === 'list' && (<>
        {/* Subject filter tabs */}
        <div className="no-print flex flex-wrap items-center gap-2 sticky top-0 z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 py-2 -mx-1 px-1">

          <button
            type="button"
            onClick={() => setActiveSubject('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              activeSubject === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
            )}
          >
            All subjects
          </button>
          {program.subjects.map((s) => {
            const pal = subjectPalette(s.color);
            const active = activeSubject === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSubject(s.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  active
                    ? cn(pal.bgSoft, pal.text, pal.border)
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Subjects */}
        <div className="space-y-3">
          {visibleSubjects.map((s) => {
            const sRoll = rollupSubject(s, periodMins);
            const pal = subjectPalette(s.color);
            const sPlan = plan.subjects[s.id];
            const isOpen = forcePrintOpen ? true : !!openSubjects[s.id];

            return (
              <Card
                key={s.id}
                className={cn('border-slate-200/70 shadow-sm overflow-hidden', forcePrintOpen && 'print-open')}
              >
                <button
                  type="button"
                  onClick={() => setOpenSubjects((m) => ({ ...m, [s.id]: !m[s.id] }))}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 border-b transition-colors text-left',
                    pal.bgSoft,
                    'hover:brightness-95',
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-500 transition-transform accordion-chevron shrink-0',
                      isOpen ? 'rotate-0' : '-rotate-90',
                    )}
                  />
                  <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', pal.dot)} />
                  <h2 className={cn('font-bold flex-1', pal.text)}>{s.name}</h2>
                  <div className="text-xs text-slate-600 hidden sm:flex items-center gap-3">
                    <span>{s.chapters.length} ch · {sRoll.topics} topics</span>
                    {sPlan && (
                      <span className="font-medium">
                        {formatShort(sPlan.startDate)} → {formatShort(sPlan.endDate)}
                      </span>
                    )}
                    <span className="font-semibold">{formatHoursShort(sRoll.hours)} · ~{sRoll.periods}p</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="accordion-body divide-y divide-slate-100">
                    {s.chapters.length === 0 && (
                      <div className="px-5 py-6 text-sm text-slate-400 italic">No chapters yet.</div>
                    )}
                    {s.chapters.map((c, ci) => {
                      const cPlan = plan.chapterById[c.id];
                      const cOpen = forcePrintOpen ? true : !!openChapters[c.id];
                      const cPeriods = c.topics.reduce((a, t) => a + hoursToPeriods(t.hours, periodMins), 0);
                      return (
                        <div
                          key={c.id}
                          className={cn('chapter-block px-5 py-3', forcePrintOpen && 'print-open')}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenChapters((m) => ({ ...m, [c.id]: !m[c.id] }))
                            }
                            className="w-full flex items-center justify-between gap-3 text-left group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronDown
                                className={cn(
                                  'h-3.5 w-3.5 text-slate-400 transition-transform accordion-chevron shrink-0',
                                  cOpen ? 'rotate-0' : '-rotate-90',
                                )}
                              />
                              <div className="font-semibold text-slate-800 text-sm truncate">
                                Ch {ci + 1}. {c.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                              {cPlan && (
                                <span className="font-medium text-slate-700 hidden sm:inline">
                                  {formatShort(cPlan.startDate)} → {formatShort(cPlan.endDate)}
                                </span>
                              )}
                              <span>
                                {c.topics.length} topics · {formatHoursShort(chapterHours(c))} · ~{cPeriods}p
                              </span>
                            </div>
                          </button>

                          {cOpen && (
                            <div className="accordion-body mt-3">
                              {c.topics.length === 0 ? (
                                <div className="text-xs text-slate-400 italic py-2">No topics.</div>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-[11px] uppercase tracking-wider text-slate-400 text-left">
                                      <th className="font-medium py-1">Topic</th>
                                      <th className="font-medium py-1 w-24 text-right">Start</th>
                                      <th className="font-medium py-1 w-24 text-right">End</th>
                                      <th className="font-medium py-1 w-16 text-right">Hours</th>
                                      <th className="font-medium py-1 w-16 text-right">Periods</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.topics.map((t) => {
                                      const tPlan = plan.topicById[t.id];
                                      const periods = hoursToPeriods(t.hours, periodMins);
                                      return (
                                        <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                                          <td className="py-1.5 text-slate-700">{t.name}</td>
                                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                                            {tPlan ? formatShort(tPlan.startDate) : <span className="text-slate-300">—</span>}
                                          </td>
                                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                                            {tPlan ? formatShort(tPlan.endDate) : <span className="text-slate-300">—</span>}
                                          </td>
                                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                                            {t.hours > 0 ? formatHoursShort(t.hours) : <span className="text-slate-300">—</span>}
                                          </td>
                                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                                            {periods || <span className="text-slate-300">—</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        </>)}
      </div>
    </div>

  );
};

export default ProgramPreviewPage;
