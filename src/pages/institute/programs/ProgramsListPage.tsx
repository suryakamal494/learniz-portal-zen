import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInstitutePrograms } from '@/hooks/useInstitutePrograms';
import { rollupProgram } from '@/utils/calendarAutomation';
import { MetricChip } from '@/components/institute/programs/MetricChip';
import { PROGRAM_TOOLTIPS } from '@/lib/programTooltips';
import { subjectPalette } from '@/lib/subjectColors';
import { cn } from '@/lib/utils';

const ProgramsListPage: React.FC = () => {
  const navigate = useNavigate();
  const programs = useInstitutePrograms();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  const classes = useMemo(
    () => Array.from(new Set(programs.map((p) => p.className))).sort(),
    [programs],
  );

  const filtered = programs.filter(
    (p) =>
      (classFilter === 'all' || p.className === classFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <CalendarRange className="h-3.5 w-3.5" />
                Programs &amp; Calendar Automation
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Programs</h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Capture teaching hours per topic, then generate the full academic calendar in one click — the same plan
                powers the teacher schedule and (later) student LMS access.
              </p>
            </div>
            <Button className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700" disabled title="Coming soon">
              <Plus className="h-4 w-4" /> New Program
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-slate-200/70 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search programs..."
                  className="pl-9 bg-white"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <p className="text-slate-500">No programs match your filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map((p) => {
                const periodMins = p.schedule?.periodLengthMins ?? 40;
                const roll = rollupProgram(p, periodMins);
                const ready = p.hoursFinalised;
                const scheduled = (p.generatedSlots?.length ?? 0) > 0;
                const chaptersCount = p.subjects.reduce((a, s) => a + s.chapters.length, 0);
                // Primary accent — use first subject's palette.
                const primary = subjectPalette(p.subjects[0]?.color ?? 'blue');

                return (
                  <Card
                    key={p.id}
                    className="group relative border-slate-200/70 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden bg-white"
                  >
                    {/* Left accent rail */}
                    <div className={cn('absolute left-0 top-0 bottom-0 w-1', primary.bg)} />

                    {/* Soft gradient header strip */}
                    <div
                      className={cn(
                        'pl-5 pr-5 pt-5 pb-3 bg-gradient-to-br',
                        'from-white via-white to-slate-50/60',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{p.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{p.className}</span>
                            <span className="text-slate-300">•</span>
                            <span>Sections {p.sections.join(', ')}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">Fee</div>
                          <div className="font-semibold text-slate-700">₹{p.fee.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="px-5 pb-5 pt-2 space-y-4">
                      {/* Metric chips with tooltips */}
                      <div className="grid grid-cols-4 gap-2">
                        <MetricChip
                          label="Subjects"
                          accent="indigo"
                          value={p.subjects.length}
                          tooltip={PROGRAM_TOOLTIPS.subjects}
                        />
                        <MetricChip
                          label="Chapters"
                          accent="blue"
                          value={chaptersCount}
                          tooltip={PROGRAM_TOOLTIPS.chapters}
                        />
                        <MetricChip
                          label="Hours"
                          accent="emerald"
                          value={`${roll.hours}h`}
                          tooltip={PROGRAM_TOOLTIPS.hours}
                        />
                        <MetricChip
                          label="Periods"
                          accent="violet"
                          value={`≈${roll.periods}`}
                          sub={`${periodMins}m each`}
                          tooltip={PROGRAM_TOOLTIPS.periods}
                        />
                      </div>

                      {/* Subject legend */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {p.subjects.map((s) => {
                          const pal = subjectPalette(s.color);
                          return (
                            <Tooltip key={s.id}>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-xs border',
                                    pal.bgSoft,
                                    pal.text,
                                    pal.border,
                                  )}
                                >
                                  <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
                                  <span className="font-medium">{s.name}</span>
                                  <span className="opacity-60">· {s.chapters.length} ch</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                {s.chapters.length} chapters ·{' '}
                                {s.chapters.reduce((a, c) => a + c.topics.length, 0)} topics
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>

                      {/* Status pills */}
                      <div className="flex flex-wrap gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn(
                                'gap-1 font-medium',
                                ready
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200',
                              )}
                            >
                              {ready ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {ready ? 'Hours finalised' : 'Hours pending'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {ready
                              ? PROGRAM_TOOLTIPS.hoursFinalised
                              : `${roll.totalTopics - roll.topicsConfigured} of ${roll.totalTopics} topics still need hours.`}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn(
                                'gap-1 font-medium',
                                scheduled
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200',
                              )}
                            >
                              {scheduled ? <Sparkles className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
                              {scheduled ? `${p.generatedSlots!.length} slots scheduled` : 'Not scheduled'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {scheduled
                              ? 'Calendar generated. Open the Schedule workspace to view or edit.'
                              : PROGRAM_TOOLTIPS.notScheduled}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 min-w-[8rem] gap-1.5"
                          onClick={() => navigate(`/institute/programs/${p.id}/hours`)}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          Teaching Hours
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                          onClick={() => navigate(`/institute/programs/${p.id}/preview`)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 min-w-[8rem] gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                          disabled={!ready}
                          onClick={() => navigate(`/institute/programs/${p.id}/schedule`)}
                        >
                          Schedule <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProgramsListPage;
