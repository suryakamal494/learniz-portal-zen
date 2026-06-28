import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Unlock,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  addFaculty,
  configWithEffectiveHolidays,
  finaliseHours,
  setGeneratedSlots,
  setSchedule,
  updateProgram,
  updateTopicHours,
  useFaculty,
  useInstituteHolidays,
  useInstituteProgram,
} from '@/hooks/useInstitutePrograms';
import {
  addDays,
  capacityCheck,
  computeCapacity,
  computeCoverageCursor,
  computeDayLayout,
  formatPretty,
  generateFromTimetable,
  generateSchedule,
  isoWeekStart,
  parseISO,
  rollupProgram,
  toISO,
  topicPeriods,
} from '@/utils/calendarAutomation';
import { formatHoursShort } from '@/utils/formatUtils';

import { Holiday, ScheduleConfig, ScheduleSlot, WeekDay, WeeklyTimetable } from '@/types/instituteProgram';
import { subjectPalette } from '@/lib/subjectColors';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { WeeklyTimetableBuilder } from '@/components/institute/programs/WeeklyTimetableBuilder';
import { CapacityStrip } from '@/components/institute/programs/CapacityStrip';
import { PeriodAllocationWorkspace } from '@/components/institute/programs/PeriodAllocationWorkspace';


type Step = 'setup' | 'allocation' | 'timetable' | 'preview';


const DEFAULT_CONFIG: ScheduleConfig = {
  startDate: new Date().toISOString().slice(0, 10),
  endDate: undefined,
  workingDays: [1, 2, 3, 4, 5, 6],
  periodsPerDay: 6,
  periodLengthMins: 40,
  dayStartTime: '08:30',
  breaks: [
    { id: 'brk-short', afterPeriod: 2, name: 'Short break', durationMins: 15 },
    { id: 'brk-lunch', afterPeriod: 4, name: 'Lunch', durationMins: 30 },
  ],
  holidays: [],
  holidayOverrides: { removed: [], added: [] },
  defaultFaculty: {},
};

const ProgramSchedulePage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  const faculty = useFaculty();
  const instituteHolidays = useInstituteHolidays();
  const [step, setStep] = useState<Step>('setup');
  const [config, setConfig] = useState<ScheduleConfig>(() => program?.schedule ?? DEFAULT_CONFIG);

  useEffect(() => {
    if (program?.schedule) setConfig(program.schedule);
  }, [program?.id]);

  const slots = program?.generatedSlots ?? [];
  const effectiveConfig = configWithEffectiveHolidays(config, instituteHolidays);


  if (!program) {
    return (
      <div className="p-10 text-center text-slate-500">
        Section not found.{' '}
        <Link to="/institute/programs" className="text-blue-600 underline">
          Back
        </Link>
      </div>
    );
  }

  const persistConfig = (c: ScheduleConfig) => {
    setConfig(c);
    setSchedule(program.id, c);
  };

  const handleTopicPeriodsChange = (topicId: string, periods: number) => {
    updateTopicHours(program.id, topicId, periods);
  };

  const steps: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'setup', label: 'Setup', icon: CalendarDays },
    { id: 'allocation', label: 'Period Allocation', icon: Layers },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
    { id: 'preview', label: 'Preview', icon: Sparkles },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  // ---- Mandatory-field gating ----
  const setupBlockers = useMemo(() => {
    const list: string[] = [];
    if (!config.startDate) list.push('Start date');
    if (!config.workingDays || config.workingDays.length === 0) list.push('At least one working day');
    if (!config.dayStartTime) list.push('Day start time');
    if (!config.periodsPerDay || config.periodsPerDay < 1) list.push('Number of periods');
    program.subjects.forEach((s) => {
      if (!config.defaultFaculty[s.id]) list.push(`Default faculty for ${s.name}`);
    });
    return list;
  }, [config, program.subjects]);

  const timetableBlockers = useMemo(() => {
    const list: string[] = [];
    const cells = config.weeklyTimetable?.cells ?? [];
    if (cells.filter((c) => c.subjectId).length === 0) {
      list.push('Fill at least one period in the weekly timetable');
    }
    return list;
  }, [config.weeklyTimetable]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-w-0 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-6 space-y-5 min-w-0 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Sections
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium truncate">{program.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Setup &amp; Allocation</span>
        </div>

        {/* Stepper */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {steps.map((s, i) => {
                const active = s.id === step;
                const done = i < stepIdx;
                return (
                  <div key={s.id} className="contents">
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : done
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-slate-600 hover:bg-slate-100',
                      )}
                    >
                      <span
                        className={cn(
                          'h-5 w-5 rounded-full grid place-items-center text-xs',
                          active ? 'bg-white/20' : done ? 'bg-emerald-100' : 'bg-slate-100',
                        )}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      {s.label}
                    </button>
                    {i < steps.length - 1 && <div className="h-px flex-1 bg-slate-200 min-w-[1rem]" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step body */}
        {step === 'setup' && (
          <SetupStep
            program={program}
            config={config}
            faculty={faculty}
            blockers={setupBlockers}
            onChange={persistConfig}
            onNext={() => {
              if (setupBlockers.length > 0) {
                toast({
                  title: 'Missing required info',
                  description: setupBlockers.slice(0, 3).join(' · '),
                  variant: 'destructive',
                });
                return;
              }
              setStep('allocation');
            }}
          />
        )}
        {step === 'allocation' && (
          <PeriodAllocationWorkspace
            program={program}
            config={effectiveConfig}
            onConfigChange={persistConfig}
            onTopicPeriodsChange={handleTopicPeriodsChange}
            onBack={() => setStep('setup')}
            onNext={() => {
              // Mark hours/period allocation as finalised for downstream consumers.
              if (!program.hoursFinalised) finaliseHours(program.id, true);
              setStep('timetable');
            }}
          />
        )}
        {step === 'timetable' && (
          <TimetableStep
            program={program}
            config={config}
            faculty={faculty}
            blockers={timetableBlockers}
            onChange={persistConfig}
            onBack={() => setStep('allocation')}
            onGenerate={() => {
              if (timetableBlockers.length > 0) {
                toast({
                  title: 'Timetable incomplete',
                  description: timetableBlockers[0],
                  variant: 'destructive',
                });
                return;
              }
              const lockedOnly = slots.filter((s) => s.locked);
              const out = generateFromTimetable(program, effectiveConfig, lockedOnly);
              setGeneratedSlots(program.id, out.slots);
              toast({
                title: 'Schedule generated',
                description: `${out.slots.length} classes planned${out.unscheduledTopics.length ? ` · ${out.unscheduledTopics.length} topics did not fit` : ''}.`,
              });
              setStep('preview');
            }}
          />
        )}
        {step === 'preview' && (
          <CalendarStep
            program={program}
            slots={slots}
            faculty={faculty}
            config={effectiveConfig}
            onChangeSlots={(s) => setGeneratedSlots(program.id, s)}
            onRegenerate={() => {
              const lockedOnly = slots.filter((s) => s.locked);
              const out = generateFromTimetable(program, effectiveConfig, lockedOnly);
              setGeneratedSlots(program.id, out.slots);
              toast({ title: 'Schedule regenerated', description: `${out.slots.length} classes.` });
            }}
            onBack={() => setStep('timetable')}
          />
        )}
      </div>
    </div>
  );
};


/* ──────────────── STEP 1 SETUP ──────────────── */

function shortFacultyName(full: string): string {
  const parts = full.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '').split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}



const DOW_LABELS: { d: WeekDay; label: string }[] = [
  { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' },
  { d: 4, label: 'Thu' }, { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' }, { d: 0, label: 'Sun' },
];

const SetupStep: React.FC<{
  program: ReturnType<typeof useInstituteProgram> extends infer T ? Exclude<T, undefined> : never;
  config: ScheduleConfig;
  faculty: ReturnType<typeof useFaculty>;
  blockers: string[];
  onChange: (c: ScheduleConfig) => void;
  onNext: () => void;
}> = ({ program, config, faculty, blockers, onChange, onNext }) => {

  const update = <K extends keyof ScheduleConfig>(k: K, v: ScheduleConfig[K]) => onChange({ ...config, [k]: v });
  const instituteHolidays = useInstituteHolidays();

  // Section-only holiday picker state
  const [progHolDates, setProgHolDates] = useState<Date[]>([]);
  const [progHolName, setProgHolName] = useState('');
  const [progPickerOpen, setProgPickerOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Break editor
  const [breakAfter, setBreakAfter] = useState<number>(2);
  const [breakName, setBreakName] = useState('Short break');
  const [breakMins, setBreakMins] = useState<number>(15);

  const overrides = config.holidayOverrides ?? { removed: [], added: [] };
  const removedSet = new Set(overrides.removed);

  const toggleDay = (d: WeekDay) => {
    const next = config.workingDays.includes(d)
      ? config.workingDays.filter((x) => x !== d)
      : [...config.workingDays, d].sort();
    update('workingDays', next as WeekDay[]);
  };

  const setOverrides = (next: typeof overrides) => update('holidayOverrides', next);

  const toggleInstituteSkip = (date: string) => {
    const removed = removedSet.has(date)
      ? overrides.removed.filter((d) => d !== date)
      : [...overrides.removed, date];
    setOverrides({ ...overrides, removed });
  };

  const addProgramOnly = () => {
    if (progHolDates.length === 0) return;
    const existing = new Set([
      ...instituteHolidays.map((h) => h.date),
      ...overrides.added.map((h) => h.date),
    ]);
    const trimmed = progHolName.trim();
    const toAdd: Holiday[] = progHolDates
      .map((d) => toISO(d))
      .filter((iso) => !existing.has(iso))
      .map((iso) => ({ date: iso, name: trimmed || undefined }));
    if (toAdd.length === 0) {
      toast({ title: 'Already covered', description: 'Those dates already exist.' });
      return;
    }
    setOverrides({ ...overrides, added: [...overrides.added, ...toAdd] });
    setProgHolDates([]);
    setProgHolName('');
    setProgPickerOpen(false);
  };

  const removeProgramOnly = (date: string) =>
    setOverrides({ ...overrides, added: overrides.added.filter((h) => h.date !== date) });

  const layout = computeDayLayout(config);
  const dayEnd = layout.length ? layout[layout.length - 1].endTime : config.dayStartTime;
  const breaks = config.breaks ?? [];

  const addBreak = () => {
    const id = `brk-${Date.now()}`;
    update('breaks', [
      ...breaks,
      { id, afterPeriod: Math.max(1, Math.min(config.periodsPerDay, breakAfter)), name: breakName.trim() || 'Break', durationMins: Math.max(5, breakMins) },
    ]);
  };
  const removeBreak = (id: string) => update('breaks', breaks.filter((b) => b.id !== id));

  // ---- Validation: surface overlaps & mismatches between periods, breaks and working days ----
  const issues = useMemo(() => {
    const list: { level: 'error' | 'warning'; msg: string }[] = [];
    const periods = config.periodsPerDay;
    const plen = config.periodLengthMins;

    if (!config.workingDays || config.workingDays.length === 0) {
      list.push({ level: 'error', msg: 'No working days selected — pick at least one weekday.' });
    }
    if (periods < 1) list.push({ level: 'error', msg: 'Number of periods must be at least 1.' });
    if (plen < 15) list.push({ level: 'warning', msg: 'Period length under 15 min is unusually short.' });

    // Day start time sanity
    const [h, m] = (config.dayStartTime || '08:30').split(':').map(Number);
    const startMins = (Number.isFinite(h) ? h : 8) * 60 + (Number.isFinite(m) ? m : 30);
    if (Number.isNaN(startMins)) list.push({ level: 'error', msg: 'Day start time is invalid.' });

    // Breaks: out of range, after last period, duplicates
    const byAfter = new Map<number, number>();
    breaks.forEach((b) => {
      if (b.afterPeriod < 1 || b.afterPeriod > periods) {
        list.push({
          level: 'error',
          msg: `Break “${b.name}” is scheduled after period ${b.afterPeriod} but you only have ${periods} period${periods === 1 ? '' : 's'}.`,
        });
      }
      if (b.afterPeriod === periods) {
        list.push({
          level: 'warning',
          msg: `Break “${b.name}” is after the last period — it extends the day but isn't between classes.`,
        });
      }
      if (b.durationMins < 5) {
        list.push({ level: 'warning', msg: `Break “${b.name}” is under 5 min — consider increasing it.` });
      }
      if (b.durationMins >= plen) {
        list.push({
          level: 'warning',
          msg: `Break “${b.name}” (${b.durationMins} min) is as long as a class period (${plen} min).`,
        });
      }
      byAfter.set(b.afterPeriod, (byAfter.get(b.afterPeriod) ?? 0) + 1);
    });
    byAfter.forEach((count, after) => {
      if (count > 1 && after >= 1 && after <= periods) {
        list.push({
          level: 'warning',
          msg: `${count} breaks are stacked after period ${after} — they'll run back-to-back.`,
        });
      }
    });

    // Total day length sanity (start + periods*plen + breaks)
    const breakMinsTotal = breaks
      .filter((b) => b.afterPeriod >= 1 && b.afterPeriod <= periods)
      .reduce((s, b) => s + b.durationMins, 0);
    const totalDayMins = periods * plen + breakMinsTotal;
    const endMins = startMins + totalDayMins;
    if (endMins > 24 * 60) {
      list.push({
        level: 'error',
        msg: `Computed day ends past midnight (${Math.floor(endMins / 60)}:${String(endMins % 60).padStart(2, '0')}). Reduce periods, breaks or start earlier.`,
      });
    } else if (totalDayMins > 10 * 60) {
      list.push({
        level: 'warning',
        msg: `School day is ${Math.floor(totalDayMins / 60)}h ${totalDayMins % 60}m long — that's over 10 hours.`,
      });
    }

    // Cross-check computed layout has the expected number of period rows
    const periodRows = layout.filter((r) => r.kind === 'period').length;
    if (periodRows !== periods) {
      list.push({
        level: 'error',
        msg: `Computed timeline shows ${periodRows} periods but you configured ${periods}. Check breaks and period length.`,
      });
    }

    return list;
  }, [config.workingDays, config.periodsPerDay, config.periodLengthMins, config.dayStartTime, breaks, layout]);

  const hasErrors = issues.some((i) => i.level === 'error');


  // Live capacity preview so users see the budget forming as Setup fields change.
  const capacityPreview = useMemo(() => computeCapacity(config), [config]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 -mb-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Auto-saved — every change is stored.
        </div>
        <CapacityStrip
          workingDays={capacityPreview.workingDays}
          periodsAvailable={capacityPreview.periodsAvailable}
          compact
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Window */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" /> Academic window
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Start date</Label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className="bg-white mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">
                End date <span className="text-slate-400 normal-case">(auto if blank)</span>
              </Label>
              <Input
                type="date"
                value={config.endDate ?? ''}
                onChange={(e) => update('endDate', e.target.value || undefined)}
                className="bg-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-slate-500">Working days</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DOW_LABELS.map(({ d, label }) => {
                const on = config.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'h-9 w-12 rounded-lg text-sm font-medium transition-all',
                      on
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" /> Default faculty per subject
          </h3>
          <div className="space-y-3">
            {program.subjects.map((s) => {
              const pal = subjectPalette(s.color);
              const subjectFaculty = faculty.filter((f) => !f.subjectId || f.subjectId === s.id);
              return (
                <div key={s.id} className="flex items-center gap-3 min-w-0">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', pal.dot)} />
                  <div className="text-sm text-slate-700 w-24 shrink-0 truncate">{s.name}</div>
                  <div className="flex-1 min-w-0">
                    <FacultyCombobox
                      value={config.defaultFaculty[s.id]}
                      options={subjectFaculty}
                      subjectId={s.id}
                      onChange={(facId) =>
                        onChange({ ...config, defaultFaculty: { ...config.defaultFaculty, [s.id]: facId } })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* School day builder */}
      <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> School day
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set the day start, period length and number of periods. Add breaks between periods — times are
                computed automatically.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Day ends</div>
              <div className="text-base font-semibold text-slate-900 tabular-nums">{dayEnd}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Day starts at</Label>
              <Input
                type="time"
                value={config.dayStartTime || '08:30'}
                onChange={(e) => update('dayStartTime', e.target.value || '08:30')}
                className="bg-white mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Period length (min)</Label>
              <Input
                type="number"
                min={15}
                max={120}
                value={config.periodLengthMins}
                onChange={(e) => update('periodLengthMins', Math.max(15, Number(e.target.value) || 40))}
                className="bg-white mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Number of periods</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.periodsPerDay}
                onChange={(e) => update('periodsPerDay', Math.max(1, Number(e.target.value) || 1))}
                className="bg-white mt-1"
              />
            </div>
          </div>

          {issues.length > 0 && (
            <div
              className={cn(
                'rounded-xl border p-3 space-y-1.5',
                hasErrors ? 'border-rose-200 bg-rose-50/70' : 'border-amber-200 bg-amber-50/70',
              )}
              role="alert"
              aria-live="polite"
            >
              <div
                className={cn(
                  'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider',
                  hasErrors ? 'text-rose-700' : 'text-amber-800',
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {hasErrors
                  ? `${issues.filter((i) => i.level === 'error').length} issue${issues.filter((i) => i.level === 'error').length === 1 ? '' : 's'} to fix`
                  : `${issues.length} thing${issues.length === 1 ? '' : 's'} to review`}
              </div>
              <ul className="text-sm space-y-1">
                {issues.map((iss, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      'flex items-start gap-2',
                      iss.level === 'error' ? 'text-rose-700' : 'text-amber-900',
                    )}
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-current opacity-70" />
                    <span>{iss.msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Day layout preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
              <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 bg-white border-b">
                Your school day
              </div>
              <div className="divide-y divide-slate-100">
                {layout.map((row, i) => {
                  const periodNum = row.kind === 'period' ? (row.index ?? 0) + 1 : null;
                  const overrideVal = periodNum != null ? config.periodOverrides?.[periodNum] : undefined;
                  const isOverridden = overrideVal != null && overrideVal !== config.periodLengthMins;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 px-3 py-1.5 text-sm',
                        row.kind === 'break' && 'bg-amber-50/60 text-amber-800',
                      )}
                    >
                      <span className="w-12 text-xs font-semibold text-slate-600">
                        {row.kind === 'period' ? row.label : '—'}
                      </span>
                      <span className="tabular-nums text-slate-700 text-xs w-28">
                        {row.startTime} – {row.endTime}
                      </span>
                      <span className={cn('flex-1 truncate', row.kind === 'break' ? 'italic font-medium' : 'text-slate-700')}>
                        {row.kind === 'period' ? `Period ${(row.index ?? 0) + 1}` : `${row.label} (${row.durationMins} min)`}
                      </span>
                      {row.kind === 'period' && periodNum != null && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={10}
                            max={240}
                            value={overrideVal ?? config.periodLengthMins}
                            onChange={(e) => {
                              const v = Math.max(10, Number(e.target.value) || config.periodLengthMins);
                              const next = { ...(config.periodOverrides ?? {}) };
                              if (v === config.periodLengthMins) delete next[periodNum];
                              else next[periodNum] = v;
                              update('periodOverrides', next);
                            }}
                            className={cn(
                              'h-7 w-16 text-xs tabular-nums bg-white',
                              isOverridden && 'border-blue-400 ring-1 ring-blue-200',
                            )}
                            title="Period duration (min). Default applies if equal to the period length."
                          />
                          <span className="text-[10px] text-slate-400">min</span>
                          {isOverridden && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = { ...(config.periodOverrides ?? {}) };
                                delete next[periodNum];
                                update('periodOverrides', next);
                              }}
                              className="text-[10px] text-blue-600 hover:underline"
                              title="Reset to default"
                            >
                              reset
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Break editor */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-slate-500">Breaks</Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Select value={String(breakAfter)} onValueChange={(v) => setBreakAfter(Number(v))}>
                    <SelectTrigger className="bg-white h-9">
                      <SelectValue placeholder="After period" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: config.periodsPerDay }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          After P{n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={breakName}
                  onChange={(e) => setBreakName(e.target.value)}
                  placeholder="Name (Lunch, Snacks…)"
                  className="bg-white h-9 col-span-5"
                />
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={breakMins}
                  onChange={(e) => setBreakMins(Number(e.target.value) || 15)}
                  className="bg-white h-9 col-span-2 tabular-nums"
                />
                <Button onClick={addBreak} size="sm" className="col-span-1 h-9 p-0" aria-label="Add break">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {breaks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No breaks configured.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {[...breaks]
                    .sort((a, b) => a.afterPeriod - b.afterPeriod)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800"
                      >
                        <span className="font-semibold text-xs w-16">After P{b.afterPeriod}</span>
                        <span className="flex-1 truncate font-medium">{b.name}</span>
                        <span className="text-xs tabular-nums">{b.durationMins} min</span>
                        <button
                          type="button"
                          onClick={() => removeBreak(b.id)}
                          className="hover:bg-amber-200 rounded p-1"
                          aria-label="Remove break"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holidays */}
      <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" /> Holidays &amp; non-teaching days
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institute-wide holidays apply automatically. Skip individual ones or add section-only dates below.
              </p>
            </div>
            <Link
              to="/institute/programs/holidays"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Manage shared holidays <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Institute-inherited list */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate-500">
              Institute-wide ({instituteHolidays.length})
            </Label>
            {instituteHolidays.length === 0 ? (
              <p className="text-sm text-slate-400 italic mt-2">None set yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5 mt-2">
                {instituteHolidays.map((h) => {
                  const skipped = removedSet.has(h.date);
                  return (
                    <div
                      key={h.date}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
                        skipped
                          ? 'border-slate-200 bg-slate-50 text-slate-400'
                          : 'border-rose-200 bg-rose-50 text-rose-700',
                      )}
                    >
                      <span className={cn('font-medium min-w-[10rem]', skipped && 'line-through')}>
                        {formatPretty(h.date)}
                      </span>
                      <span className={cn('flex-1 truncate', !h.name && 'italic opacity-60')}>
                        {h.name || 'No description'}
                      </span>
                      <Button
                        size="sm"
                        variant={skipped ? 'default' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => toggleInstituteSkip(h.date)}
                      >
                        {skipped ? 'Restore' : 'Skip for this section'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section-only adds */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate-500">
              Section-only dates ({overrides.added.length})
            </Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Popover open={progPickerOpen} onOpenChange={setProgPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white sm:w-56 justify-start font-normal">
                    <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                    {progHolDates.length === 0
                      ? 'Pick dates'
                      : progHolDates.length === 1
                        ? formatPretty(toISO(progHolDates[0]))
                        : `${progHolDates.length} dates selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={progHolDates}
                    onSelect={(d) => setProgHolDates(d ?? [])}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={progHolName}
                onChange={(e) => setProgHolName(e.target.value)}
                placeholder="Description (optional)"
                className="bg-white flex-1"
              />
              <Button onClick={addProgramOnly} disabled={progHolDates.length === 0} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {overrides.added.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {overrides.added.map((h) => {
                  const isEditing = editingDate === h.date;
                  return (
                    <div
                      key={h.date}
                      className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-700"
                    >
                      <span className="font-medium min-w-[10rem]">{formatPretty(h.date)}</span>
                      {isEditing ? (
                        <>
                          <Input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-white h-7 text-sm flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setOverrides({
                                  ...overrides,
                                  added: overrides.added.map((x) =>
                                    x.date === h.date ? { ...x, name: editingName.trim() || undefined } : x,
                                  ),
                                });
                                setEditingDate(null);
                              } else if (e.key === 'Escape') setEditingDate(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOverrides({
                                ...overrides,
                                added: overrides.added.map((x) =>
                                  x.date === h.date ? { ...x, name: editingName.trim() || undefined } : x,
                                ),
                              });
                              setEditingDate(null);
                            }}
                            className="hover:bg-violet-200 rounded p-1"
                            aria-label="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDate(null)}
                            className="hover:bg-violet-200 rounded p-1"
                            aria-label="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={cn('flex-1 truncate', !h.name && 'italic opacity-60')}>
                            {h.name || 'No description'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDate(h.date);
                              setEditingName(h.name ?? '');
                            }}
                            className="hover:bg-violet-200 rounded p-1"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProgramOnly(h.date)}
                            className="hover:bg-violet-200 rounded p-1"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coverage cursor — "previously covered up to" per subject */}
      <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" /> Previously covered up to
          </h3>
          <p className="text-xs text-slate-500 -mt-1">
            Pulled from earlier windows you've already generated. The next plan resumes from here.
          </p>
          <CoverageList program={program} windowStart={config.startDate} />
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {blockers.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm text-rose-700">
            <div className="font-semibold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Required before continuing
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {blockers.slice(0, 6).map((b) => (
                <li key={b}>{b}</li>
              ))}
              {blockers.length > 6 && <li>+ {blockers.length - 6} more…</li>}
            </ul>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={onNext}
            className="gap-2"
            disabled={blockers.length > 0}
          >
            Next: Period Allocation <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};


const FacultyCombobox: React.FC<{
  value?: string;
  options: { id: string; name: string }[];
  subjectId: string;
  onChange: (id: string) => void;
}> = ({ value, options, subjectId, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  if (adding) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New faculty name"
          className="h-9 w-48 bg-white"
        />
        <Button
          size="sm"
          onClick={() => {
            if (!newName.trim()) return;
            const f = addFaculty(newName.trim(), subjectId);
            onChange(f.id);
            setAdding(false);
            setNewName('');
          }}
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 w-full min-w-0">
      <Select value={value} onValueChange={(v) => (v === '__add__' ? setAdding(true) : onChange(v))}>
        <SelectTrigger className="w-full bg-white h-9">
          <SelectValue placeholder="Select faculty" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
          <SelectItem value="__add__" className="text-blue-600 font-medium">
            + Add faculty
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

/* ──────────────── Coverage cursor display ──────────────── */

const CoverageList: React.FC<{
  program: ReturnType<typeof useInstituteProgram> extends infer T ? Exclude<T, undefined> : never;
  windowStart: string;
}> = ({ program, windowStart }) => {
  const cursor = useMemo(() => computeCoverageCursor(program, windowStart), [program, windowStart]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {program.subjects.map((s) => {
        const pal = subjectPalette(s.color);
        const entry = cursor[s.id];

        // Locate the active chapter = chapter of last covered topic; fall back to first.
        let activeChapter = s.chapters[0];
        let coveredTopicIdx = -1;
        if (entry) {
          for (const ch of s.chapters) {
            const idx = ch.topics.findIndex((t) => t.id === entry.lastTopicId);
            if (idx !== -1) {
              activeChapter = ch;
              coveredTopicIdx = idx;
              break;
            }
          }
        }
        const topics = activeChapter?.topics ?? [];
        const covered = coveredTopicIdx + 1; // 0 if none
        const pending = topics.length - covered;
        const pct = topics.length ? Math.round((covered / topics.length) * 100) : 0;
        const chIdx = s.chapters.findIndex((c) => c.id === activeChapter?.id);

        return (
          <div
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', pal.dot)} />
              <div className="font-semibold text-sm text-slate-900 truncate flex-1">{s.name}</div>
              {entry ? (
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                  Last class · {formatPretty(entry.lastDate)}
                </span>
              ) : (
                <span className="text-[10px] italic text-slate-400 shrink-0">Not started</span>
              )}
            </div>

            {activeChapter && (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-700 truncate">
                    Ch {chIdx + 1} · {activeChapter.name}
                  </span>
                  <span className="ml-auto tabular-nums text-slate-500 shrink-0">
                    {covered} / {topics.length} topics
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', pal.dot)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {topics.map((t, i) => {
                    const isCovered = i < covered;
                    return (
                      <span
                        key={t.id}
                        className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
                          isCovered
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-dashed border-slate-300 text-slate-500',
                        )}
                        title={isCovered ? 'Covered' : 'Pending'}
                      >
                        {isCovered ? <Check className="h-2.5 w-2.5" /> : null}
                        {t.name}
                      </span>
                    );
                  })}
                </div>
                {pending > 0 && covered > 0 && (
                  <div className="text-[10px] text-slate-500 italic">
                    {pending} topic{pending === 1 ? '' : 's'} pending in this chapter
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};


/* ──────────────── STEP 2 WEEKLY TIMETABLE ──────────────── */

const TimetableStep: React.FC<{
  program: ReturnType<typeof useInstituteProgram> extends infer T ? Exclude<T, undefined> : never;
  config: ScheduleConfig;
  faculty: ReturnType<typeof useFaculty>;
  blockers: string[];
  onChange: (c: ScheduleConfig) => void;
  onBack: () => void;
  onGenerate: () => void;
}> = ({ program, config, faculty, blockers, onChange, onBack, onGenerate }) => {
  const subjects = program.subjects.map((s) => ({ id: s.id, name: s.name, color: s.color }));

  return (
    <div className="space-y-5">
      <WeeklyTimetableBuilder
        config={config}
        subjects={subjects}
        faculty={faculty}
        onChange={(tt: WeeklyTimetable) => onChange({ ...config, weeklyTimetable: tt })}
      />

      {blockers.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm text-rose-700">
          <div className="font-semibold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Required before generating
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onGenerate} className="gap-2" disabled={blockers.length > 0}>
          Generate &amp; Preview <Wand2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const Stat: React.FC<{ label: string; value: number; sub?: string; negative?: boolean }> = ({
  label,
  value,
  sub,
  negative,
}) => (
  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-4">
    <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
    <div className={cn('text-2xl font-bold mt-1', negative ? 'text-rose-600' : 'text-slate-900')}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

/* (Generate step removed — Workload → Preview is now a single click.) */

/* ──────────────── STEP 3 PREVIEW ──────────────── */

type Layout = 'week' | 'month';

const CalendarStep: React.FC<{
  program: any;
  slots: ScheduleSlot[];
  faculty: ReturnType<typeof useFaculty>;
  config: ScheduleConfig;
  onChangeSlots: (s: ScheduleSlot[]) => void;
  onRegenerate: () => void;
  onBack: () => void;
}> = ({ program, slots, faculty, config, onChangeSlots, onRegenerate, onBack }) => {
  const [layout, setLayout] = useState<Layout>('week');

  const subjectMap = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    program.subjects.forEach((s: any) => m.set(s.id, { name: s.name, color: s.color }));
    return m;
  }, [program]);

  if (slots.length === 0) {
    return (
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-10 text-center space-y-4">
          <CalendarDays className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-900">No schedule yet</h3>
          <p className="text-sm text-slate-600">Generate a schedule to see the preview.</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onRegenerate} className="gap-2">
              <Wand2 className="h-4 w-4" /> Generate now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: layout switcher + regenerate */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Timetable view
            </span>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {(['week', 'month'] as Layout[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLayout(m)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize',
                    layout === m
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRegenerate} className="gap-1.5">
            <Wand2 className="h-3.5 w-3.5" /> Regenerate
          </Button>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {program.subjects.map((s: any) => {
          const pal = subjectPalette(s.color);
          return (
            <div key={s.id} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={cn('h-2.5 w-2.5 rounded-full', pal.dot)} />
              {s.name}
            </div>
          );
        })}
      </div>

      {layout === 'week' ? (
        <Step3TimetableView
          program={program}
          slots={slots}
          config={config}
          faculty={faculty}
          subjectMap={subjectMap}
          onChangeSlots={onChangeSlots}
        />
      ) : (
        <Step3TimetableMonthView
          program={program}
          slots={slots}
          config={config}
          faculty={faculty}
          subjectMap={subjectMap}
          onChangeSlots={onChangeSlots}
        />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </div>
    </div>
  );
};



const DOW_TT: { d: WeekDay; short: string }[] = [
  { d: 1, short: 'Mon' }, { d: 2, short: 'Tue' }, { d: 3, short: 'Wed' },
  { d: 4, short: 'Thu' }, { d: 5, short: 'Fri' }, { d: 6, short: 'Sat' }, { d: 0, short: 'Sun' },
];

const Step3TimetableView: React.FC<{
  program: any;
  slots: ScheduleSlot[];
  config: ScheduleConfig;
  faculty: ReturnType<typeof useFaculty>;
  subjectMap: Map<string, { name: string; color: string }>;
  onChangeSlots: (s: ScheduleSlot[]) => void;
}> = ({ program, slots, config, faculty, subjectMap, onChangeSlots }) => {
  const layout = useMemo(() => computeDayLayout(config), [config]);
  const workingDows = useMemo(
    () => DOW_TT.filter((d) => config.workingDays.includes(d.d)),
    [config.workingDays],
  );

  // Build list of week starts spanning all generated slots
  const weekStarts = useMemo(() => {
    if (slots.length === 0) return [isoWeekStart(config.startDate)];
    const sorted = [...slots].sort((a, b) => a.date.localeCompare(b.date));
    const first = isoWeekStart(sorted[0].date);
    const last = isoWeekStart(sorted[sorted.length - 1].date);
    const out: string[] = [];
    let cur = first;
    let safety = 0;
    while (cur <= last && safety < 260) {
      out.push(cur);
      cur = addDays(cur, 7);
      safety++;
    }
    return out;
  }, [slots, config.startDate]);

  const [weekIdx, setWeekIdx] = useState(0);
  const activeWeek = weekStarts[Math.min(weekIdx, weekStarts.length - 1)] ?? weekStarts[0];

  // Slot lookup by date + periodIndex
  const slotByKey = useMemo(() => {
    const m = new Map<string, ScheduleSlot>();
    slots.forEach((s) => m.set(`${s.date}#${s.periodIndex}`, s));
    return m;
  }, [slots]);

  const dateForWeekday = (wd: WeekDay): string => {
    // Monday-anchored week; offset from Mon (which is dow 1)
    const offset = wd === 0 ? 6 : wd - 1;
    return addDays(activeWeek, offset);
  };

  const updateSlot = (id: string, patch: Partial<ScheduleSlot>) => {
    onChangeSlots(slots.map((s) => (s.id === id ? { ...s, ...patch, locked: true } : s)));
  };

  return (
    <div className="space-y-3">
      {/* Week chips */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={weekIdx === 0}
              onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-nowrap gap-1.5 flex-1 min-w-0 overflow-x-auto pb-1 [scrollbar-width:thin]">
              {weekStarts.map((ws, i) => {
                const isActive = i === weekIdx;
                const end = addDays(ws, 6);
                return (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => setWeekIdx(i)}
                    title={`${formatPretty(ws)} – ${formatPretty(end)}`}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all whitespace-nowrap shrink-0',
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700',
                    )}
                  >
                    W{i + 1}
                  </button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={weekIdx >= weekStarts.length - 1}
              onClick={() => setWeekIdx(Math.min(weekStarts.length - 1, weekIdx + 1))}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Week {weekIdx + 1} · {formatPretty(activeWeek)} – {formatPretty(addDays(activeWeek, 6))}
            <span className="text-slate-300 mx-1">·</span>
            <span className="italic">Subject comes from Step 2 · Time comes from Setup. Edit chapter, topic or teacher per class.</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card className="border-slate-200/70 shadow-sm min-w-0">
        <CardContent className="p-0 overflow-x-auto min-w-0">
          <table className="w-full text-sm border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium w-28 border-b border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                  Period
                </th>
                {workingDows.map((d) => {
                  const date = parseISO(dateForWeekday(d.d));
                  return (
                    <th
                      key={d.d}
                      className="text-left px-2 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium border-b border-l min-w-[120px]"
                    >
                      <div className="font-semibold text-slate-700">{d.short}</div>
                      <div className="text-[10px] text-slate-400 normal-case font-normal">
                        {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>

            </thead>
            <tbody>
              {layout.map((row, i) => {
                if (row.kind === 'break') {
                  return (
                    <tr key={`brk-${i}`} className="bg-amber-50/60">
                      <td className="px-3 py-1.5 text-[11px] text-amber-800 font-medium italic sticky left-0 bg-amber-50/80 border-r border-amber-100 z-[1]">
                        {row.label}
                        <span className="text-amber-500 ml-1">· {row.durationMins}m</span>
                      </td>
                      <td
                        colSpan={workingDows.length}
                        className="px-3 py-1.5 text-[11px] text-amber-700 italic border-l"
                      >
                        {row.startTime} – {row.endTime}
                      </td>
                    </tr>
                  );
                }
                const pIdx = row.index ?? 0;
                return (
                  <tr key={`p-${pIdx}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 align-top bg-slate-50/80 sticky left-0 border-r border-slate-200 z-[1]">
                      <div className="text-sm font-semibold text-slate-800">P{pIdx + 1}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {row.startTime}–{row.endTime}
                      </div>
                    </td>

                    {workingDows.map((d) => {
                      const dateIso = dateForWeekday(d.d);
                      const slot = slotByKey.get(`${dateIso}#${pIdx}`);
                      return (
                        <td key={d.d} className="px-1.5 py-1.5 align-top border-l border-slate-100">
                          {slot ? (
                            <Step3Cell
                              slot={slot}
                              program={program}
                              subjectMap={subjectMap}
                              faculty={faculty}
                              onUpdate={(patch) => updateSlot(slot.id, patch)}
                            />
                          ) : (
                            <div className="text-[11px] text-slate-300 italic text-center py-3">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

const Step3Cell: React.FC<{
  slot: ScheduleSlot;
  program: any;
  subjectMap: Map<string, { name: string; color: string }>;
  faculty: ReturnType<typeof useFaculty>;
  onUpdate: (patch: Partial<ScheduleSlot>) => void;
}> = ({ slot, program, subjectMap, faculty, onUpdate }) => {
  const sub = subjectMap.get(slot.subjectId);
  const pal = subjectPalette(sub?.color ?? 'blue');

  const subject = program.subjects.find((s: any) => s.id === slot.subjectId);
  const chapters = subject?.chapters ?? [];
  const currentChapter = chapters.find((c: any) => c.id === slot.chapterId);
  const topics = currentChapter?.topics ?? [];
  const currentTopic = topics.find((t: any) => t.id === slot.topicId);

  const facultyOptions = faculty.filter((f) => !f.subjectId || f.subjectId === slot.subjectId);
  const currentFaculty = faculty.find((f) => f.id === slot.facultyId);

  const handleChapter = (chapterId: string) => {
    const newCh = chapters.find((c: any) => c.id === chapterId);
    const firstTopic = newCh?.topics?.[0]?.id ?? '';
    onUpdate({ chapterId, topicId: firstTopic });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full text-left rounded-md border px-2 py-1.5 min-h-[78px] transition-all hover:shadow-sm hover:ring-1',
            pal.slot,
            pal.ring,
            slot.locked && 'ring-1 ring-slate-400',
          )}

        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className={cn('inline-block text-[10px] font-semibold uppercase tracking-wide')}>
              {sub?.name}
            </span>
            {slot.locked && <Lock className="h-2.5 w-2.5 opacity-60 shrink-0" />}
          </div>
          <div className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
            {currentTopic?.name ?? <span className="italic text-slate-400">No topic</span>}
          </div>
          <div className="text-[10px] text-slate-600 truncate leading-tight mt-0.5">
            {currentChapter?.name ?? '—'}
          </div>
          <div className="text-[10px] text-slate-700 truncate mt-1 flex items-center gap-1">
            <UserRoundIcon />
            {currentFaculty ? shortFacultyName(currentFaculty.name) : 'Unassigned'}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3" align="start">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {sub?.name} · {slot.startTime}–{slot.endTime}
          </div>
          <div className="text-[10px] text-slate-400 italic">Subject & time are fixed in Step 1 / 2</div>
        </div>

        <div>
          <Label className="text-[11px] uppercase tracking-wider text-slate-500">Chapter</Label>
          <Select value={slot.chapterId} onValueChange={handleChapter}>
            <SelectTrigger className="bg-white h-8 text-xs mt-1">
              <SelectValue placeholder="Pick chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((c: any) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] uppercase tracking-wider text-slate-500">Topic</Label>
          <Select value={slot.topicId} onValueChange={(v) => onUpdate({ topicId: v })}>
            <SelectTrigger className="bg-white h-8 text-xs mt-1">
              <SelectValue placeholder="Pick topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t: any) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] uppercase tracking-wider text-slate-500">Faculty</Label>
          <Select value={slot.facultyId || ''} onValueChange={(v) => onUpdate({ facultyId: v })}>
            <SelectTrigger className="bg-white h-8 text-xs mt-1">
              <SelectValue placeholder="Assign faculty" />
            </SelectTrigger>
            <SelectContent>
              {facultyOptions.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-xs">{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {slot.locked && (
          <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t">
            <Lock className="h-3 w-3" /> This class is locked — preserved when you regenerate.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const UserRoundIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

/* ──────────────── Step 3 Month Timetable View ──────────────── */

const Step3TimetableMonthView: React.FC<{
  program: any;
  slots: ScheduleSlot[];
  config: ScheduleConfig;
  faculty: ReturnType<typeof useFaculty>;
  subjectMap: Map<string, { name: string; color: string }>;
  onChangeSlots: (s: ScheduleSlot[]) => void;
}> = ({ program, slots, config, faculty, subjectMap, onChangeSlots }) => {
  const initial = slots[0]?.date ?? config.startDate ?? new Date().toISOString().slice(0, 10);
  const [cursor, setCursor] = useState<string>(initial);
  const [openDay, setOpenDay] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const m = new Map<string, ScheduleSlot[]>();
    slots.forEach((s) => {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    });
    m.forEach((arr) => arr.sort((a, b) => a.periodIndex - b.periodIndex));
    return m;
  }, [slots]);

  const d = parseISO(cursor);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const firstDow = monthStart.getDay();
  const days: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    days.push(toISO(new Date(d.getFullYear(), d.getMonth(), i)));
  }
  while (days.length % 7 !== 0) days.push(null);
  const monthLabel = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayIso = new Date().toISOString().slice(0, 10);

  const dayList = openDay ? slotsByDate.get(openDay) ?? [] : [];

  const updateSlot = (id: string, patch: Partial<ScheduleSlot>) => {
    onChangeSlots(slots.map((s) => (s.id === id ? { ...s, ...patch, locked: true } : s)));
  };

  return (
    <>
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">{monthLabel}</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCursor(toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)))}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCursor(new Date().toISOString().slice(0, 10))}
                className="h-7 text-xs"
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCursor(toISO(new Date(d.getFullYear(), d.getMonth() + 1, 1)))}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden min-w-[720px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="bg-slate-50 text-center py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {d}
                </div>
              ))}
              {days.map((iso, i) => {
                const list = iso ? slotsByDate.get(iso) ?? [] : [];
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!iso}
                    onClick={() => iso && setOpenDay(iso)}
                    className={cn(
                      'bg-white min-h-[110px] p-1.5 flex flex-col gap-1 text-left transition-colors',
                      iso ? 'hover:bg-blue-50/40' : 'bg-slate-50/40 cursor-default',
                      iso === todayIso && 'ring-2 ring-blue-400 ring-inset',
                    )}
                  >
                    {iso && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {Number(iso.slice(-2))}
                          </span>
                          {list.length > 0 && (
                            <span className="text-[9px] text-slate-400 tabular-nums">
                              {list.length}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {list.slice(0, 4).map((sl) => {
                            const sub = subjectMap.get(sl.subjectId);
                            const pal = subjectPalette(sub?.color ?? 'blue');
                            return (
                              <span
                                key={sl.id}
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded border truncate font-medium',
                                  pal.slot,
                                )}
                                title={`P${sl.periodIndex + 1} · ${sub?.name ?? ''}`}
                              >
                                P{sl.periodIndex + 1} · {sub?.name}
                              </span>
                            );
                          })}
                          {list.length > 4 && (
                            <span className="text-[10px] text-slate-500 px-1">
                              +{list.length - 4} more
                            </span>
                          )}
                          {iso && list.length === 0 && (
                            <span className="text-[10px] text-slate-300 italic px-1">No class</span>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Click any day to view and edit its periods (chapter, topic, teacher).
          </p>
        </CardContent>
      </Card>

      <Sheet open={!!openDay} onOpenChange={(o) => !o && setOpenDay(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{openDay ? formatPretty(openDay) : ''}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-4">
            {dayList.length === 0 ? (
              <div className="text-sm text-slate-400 italic text-center py-8">
                No classes scheduled.
              </div>
            ) : (
              dayList.map((sl) => (
                <div key={sl.id} className="rounded-lg border border-slate-200 p-2">
                  <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">P{sl.periodIndex + 1}</span>
                    <span className="tabular-nums">{sl.startTime}–{sl.endTime}</span>
                  </div>
                  <Step3Cell
                    slot={sl}
                    program={program}
                    subjectMap={subjectMap}
                    faculty={faculty}
                    onUpdate={(patch) => updateSlot(sl.id, patch)}
                  />
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProgramSchedulePage;

