import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronRight, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInstituteProgram } from '@/hooks/useInstitutePrograms';
import { updateProgram } from '@/hooks/useInstitutePrograms';
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
import { MetricChip } from '@/components/institute/programs/MetricChip';
import { PROGRAM_TOOLTIPS } from '@/lib/programTooltips';
import { cn } from '@/lib/utils';

const DEFAULT_SCHEDULE = {
  startDate: '2025-04-14',
  workingDays: [1, 2, 3, 4, 5, 6] as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
  periodsPerDay: 6,
  periodLengthMins: 40,
  holidays: [],
  defaultFaculty: {},
  classUrlTemplate: 'https://meet.example.com/{date}-p{period}',
};

const ProgramPreviewPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  if (!program) return <div className="p-10 text-slate-500">Program not found.</div>;

  const schedule = program.schedule ?? DEFAULT_SCHEDULE;
  const periodMins = schedule.periodLengthMins;
  const roll = rollupProgram(program, periodMins);
  const plan = planDates(program, schedule);
  const chaptersCount = program.subjects.reduce((a, s) => a + s.chapters.length, 0);
  const termDays = daysBetween(plan.startDate, plan.endDate);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="max-w-6xl mx-auto p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Programs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium">{program.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Curriculum preview</span>
          </div>

          {/* Header card */}
          <Card className="border-slate-200/70 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    <Eye className="h-3.5 w-3.5" /> Read-only preview
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      Term: {formatShort(plan.startDate)} → {formatShort(plan.endDate)}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>{termDays} days</span>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Term start date
                        </label>
                        <Input
                          type="date"
                          value={schedule.startDate}
                          onChange={(e) =>
                            updateProgram(program.id, (p) => ({
                              ...p,
                              schedule: { ...(p.schedule ?? DEFAULT_SCHEDULE), startDate: e.target.value },
                            }))
                          }
                          className="w-44 bg-white"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">{PROGRAM_TOOLTIPS.termWindow}</TooltipContent>
                  </Tooltip>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <MetricChip label="Subjects" accent="indigo" value={program.subjects.length} tooltip={PROGRAM_TOOLTIPS.subjects} />
                <MetricChip label="Chapters" accent="blue" value={chaptersCount} tooltip={PROGRAM_TOOLTIPS.chapters} />
                <MetricChip label="Topics" accent="slate" value={roll.totalTopics} tooltip={PROGRAM_TOOLTIPS.topics} />
                <MetricChip label="Hours" accent="emerald" value={`${roll.hours}h`} tooltip={PROGRAM_TOOLTIPS.hours} />
                <MetricChip
                  label="Periods"
                  accent="violet"
                  value={`≈${roll.periods}`}
                  sub={`${periodMins}m each`}
                  tooltip={PROGRAM_TOOLTIPS.periods}
                />
              </div>
            </CardContent>
          </Card>

          {program.subjects.map((s) => {
            const sRoll = rollupSubject(s, periodMins);
            const pal = subjectPalette(s.color);
            const sPlan = plan.subjects[s.id];
            return (
              <Card key={s.id} className="border-slate-200/70 shadow-sm overflow-hidden">
                <div className={cn('flex items-center gap-3 px-5 py-3 border-b', pal.bgSoft)}>
                  <span className={cn('h-2.5 w-2.5 rounded-full', pal.dot)} />
                  <h2 className={cn('font-bold flex-1', pal.text)}>{s.name}</h2>
                  <div className="text-xs text-slate-600 hidden sm:flex items-center gap-3">
                    <span>{s.chapters.length} ch · {sRoll.topics} topics</span>
                    {sPlan && (
                      <span className="font-medium">
                        {formatShort(sPlan.startDate)} → {formatShort(sPlan.endDate)}
                      </span>
                    )}
                    <span className="font-semibold">{sRoll.hours}h · {sRoll.periods}p</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {s.chapters.map((c, ci) => {
                    const cPlan = plan.chapterById[c.id];
                    return (
                      <div key={c.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <div className="font-semibold text-slate-800 text-sm">
                            Ch {ci + 1}. {c.name}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {cPlan && (
                              <span className="font-medium text-slate-700">
                                {formatShort(cPlan.startDate)} → {formatShort(cPlan.endDate)}
                              </span>
                            )}
                            <span>
                              {chapterHours(c)}h ·{' '}
                              {c.topics.reduce((a, t) => a + hoursToPeriods(t.hours, periodMins), 0)} periods
                            </span>
                          </div>
                        </div>
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
                                    {t.hours > 0 ? `${t.hours}h` : <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="py-1.5 text-right tabular-nums text-slate-700">
                                    {periods || <span className="text-slate-300">—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProgramPreviewPage;
