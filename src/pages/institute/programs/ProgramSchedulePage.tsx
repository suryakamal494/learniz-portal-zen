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
  setGeneratedSlots,
  setSchedule,
  updateProgram,
  useFaculty,
  useInstituteProgram,
} from '@/hooks/useInstitutePrograms';
import {
  addDays,
  capacityCheck,
  formatPretty,
  generateSchedule,
  parseISO,
  rollupProgram,
  toISO,
} from '@/utils/calendarAutomation';
import { formatHoursShort } from '@/utils/formatUtils';

import { Holiday, ScheduleConfig, ScheduleSlot, WeekDay } from '@/types/instituteProgram';
import { subjectPalette } from '@/lib/subjectColors';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Step = 'setup' | 'workload' | 'preview';

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
  const [step, setStep] = useState<Step>('setup');
  const [config, setConfig] = useState<ScheduleConfig>(() => program?.schedule ?? DEFAULT_CONFIG);

  useEffect(() => {
    if (program?.schedule) setConfig(program.schedule);
  }, [program?.id]);

  const slots = program?.generatedSlots ?? [];

  if (!program) {
    return (
      <div className="p-10 text-center text-slate-500">
        Program not found.{' '}
        <Link to="/institute/programs" className="text-blue-600 underline">
          Back
        </Link>
      </div>
    );
  }

  if (!program.hoursFinalised) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Set teaching hours first</h2>
            <p className="text-sm text-slate-600">
              The calendar generator needs hours per topic before it can plan the academic year.
            </p>
            <Button asChild>
              <Link to={`/institute/programs/${program.id}/hours`} className="gap-2">
                <Pencil className="h-4 w-4" /> Open Teaching Hours
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const persistConfig = (c: ScheduleConfig) => {
    setConfig(c);
    setSchedule(program.id, c);
  };

  const steps: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'setup', label: 'Setup', icon: CalendarDays },
    { id: 'workload', label: 'Workload', icon: Layers },
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'calendar', label: 'Preview', icon: Sparkles },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Programs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium truncate">{program.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Schedule</span>
        </div>

        {/* Stepper */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {steps.map((s, i) => {
                const active = s.id === step;
                const done = i < stepIdx;
                return (
                  <React.Fragment key={s.id}>
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
                  </React.Fragment>
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
            onChange={persistConfig}
            onNext={() => setStep('workload')}
          />
        )}
        {step === 'workload' && (
          <WorkloadStep
            program={program}
            config={config}
            onChange={persistConfig}
            onBack={() => setStep('setup')}
            onNext={() => setStep('generate')}
          />
        )}
        {step === 'generate' && (
          <GenerateStep
            program={program}
            config={config}
            existing={slots}
            onGenerated={(newSlots) => {
              setGeneratedSlots(program.id, newSlots);
              setStep('calendar');
            }}
            onBack={() => setStep('workload')}
          />
        )}
        {step === 'calendar' && (
          <CalendarStep
            program={program}
            slots={slots}
            faculty={faculty}
            onChangeSlots={(s) => setGeneratedSlots(program.id, s)}
            onBack={() => setStep('generate')}
          />
        )}
      </div>
    </div>
  );
};

/* ──────────────── STEP 1 SETUP ──────────────── */

const DOW_LABELS: { d: WeekDay; label: string }[] = [
  { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' },
  { d: 4, label: 'Thu' }, { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' }, { d: 0, label: 'Sun' },
];

const SetupStep: React.FC<{
  program: ReturnType<typeof useInstituteProgram> extends infer T ? Exclude<T, undefined> : never;
  config: ScheduleConfig;
  faculty: ReturnType<typeof useFaculty>;
  onChange: (c: ScheduleConfig) => void;
  onNext: () => void;
}> = ({ program, config, faculty, onChange, onNext }) => {
  const update = <K extends keyof ScheduleConfig>(k: K, v: ScheduleConfig[K]) => onChange({ ...config, [k]: v });

  const [holidayDates, setHolidayDates] = useState<Date[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleDay = (d: WeekDay) => {
    const next = config.workingDays.includes(d)
      ? config.workingDays.filter((x) => x !== d)
      : [...config.workingDays, d].sort();
    update('workingDays', next as WeekDay[]);
  };

  return (
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Periods per day</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.periodsPerDay}
                onChange={(e) => update('periodsPerDay', Math.max(1, Number(e.target.value) || 1))}
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
                <div key={s.id} className="flex items-center gap-3">
                  <span className={cn('h-2 w-2 rounded-full', pal.dot)} />
                  <div className="flex-1 text-sm text-slate-700">{s.name}</div>
                  <FacultyCombobox
                    value={config.defaultFaculty[s.id]}
                    options={subjectFaculty}
                    subjectId={s.id}
                    onChange={(facId) =>
                      onChange({ ...config, defaultFaculty: { ...config.defaultFaculty, [s.id]: facId } })
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Holidays */}
      <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" /> Holidays &amp; non-teaching days
          </h3>

          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white sm:w-56 justify-start font-normal">
                  <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                  {holidayDates.length === 0
                    ? 'Pick dates'
                    : holidayDates.length === 1
                      ? formatPretty(toISO(holidayDates[0]))
                      : `${holidayDates.length} dates selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={holidayDates}
                  onSelect={(dates) => setHolidayDates(dates ?? [])}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
            <Input
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="Description (optional, e.g. Diwali)"
              className="bg-white flex-1"
            />
            <Button
              disabled={holidayDates.length === 0}
              onClick={() => {
                if (holidayDates.length === 0) return;
                const existing = new Set(config.holidays.map((h) => h.date));
                const trimmed = holidayName.trim();
                const toAdd: Holiday[] = holidayDates
                  .map((d) => toISO(d))
                  .filter((iso) => !existing.has(iso))
                  .map((iso) => ({ date: iso, name: trimmed || undefined }));
                if (toAdd.length === 0) {
                  toast({ title: 'Already added', description: 'Those dates are already in the list.' });
                  return;
                }
                update(
                  'holidays',
                  [...config.holidays, ...toAdd].sort((a, b) => a.date.localeCompare(b.date)),
                );
                setHolidayDates([]);
                setHolidayName('');
                setPickerOpen(false);
              }}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {config.holidays.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No holidays added yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {config.holidays.map((h) => {
                const isEditing = editingDate === h.date;
                return (
                  <div
                    key={h.date}
                    className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
                  >
                    <span className="font-medium min-w-[8rem]">{formatPretty(h.date)}</span>
                    {isEditing ? (
                      <>
                        <Input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Description (optional)"
                          className="bg-white h-7 text-sm flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              update(
                                'holidays',
                                config.holidays.map((x) =>
                                  x.date === h.date ? { ...x, name: editingName.trim() || undefined } : x,
                                ),
                              );
                              setEditingDate(null);
                            } else if (e.key === 'Escape') {
                              setEditingDate(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            update(
                              'holidays',
                              config.holidays.map((x) =>
                                x.date === h.date ? { ...x, name: editingName.trim() || undefined } : x,
                              ),
                            );
                            setEditingDate(null);
                          }}
                          className="hover:bg-rose-200 rounded p-1"
                          aria-label="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDate(null)}
                          className="hover:bg-rose-200 rounded p-1"
                          aria-label="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={cn('flex-1 truncate', !h.name && 'text-rose-400 italic')}>
                          {h.name || 'No description'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDate(h.date);
                            setEditingName(h.name ?? '');
                          }}
                          className="hover:bg-rose-200 rounded p-1"
                          aria-label="Edit description"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            update('holidays', config.holidays.filter((x) => x.date !== h.date))
                          }
                          className="hover:bg-rose-200 rounded p-1"
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
        </CardContent>
      </Card>



      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next: Review Workload <ArrowRight className="h-4 w-4" />
        </Button>
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
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={(v) => (v === '__add__' ? setAdding(true) : onChange(v))}>
        <SelectTrigger className="w-56 bg-white h-9">
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

/* ──────────────── STEP 2 WORKLOAD ──────────────── */

const WorkloadStep: React.FC<{
  program: any;
  config: ScheduleConfig;
  onChange: (c: ScheduleConfig) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ program, config, onChange, onBack, onNext }) => {
  const roll = rollupProgram(program, config.periodLengthMins);
  const check = capacityCheck(program, config);
  const ok = check.surplus >= 0;

  return (
    <div className="space-y-5">
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-blue-600" /> Workload vs. capacity
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                We compare total teaching periods needed against the working slots available in your window.
              </p>
            </div>
            <Badge
              className={cn(
                'text-sm px-3 py-1',
                ok ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200',
              )}
              variant="outline"
            >
              {ok ? `${check.surplus} slots free` : `${-check.surplus} slots short`}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Stat label="Periods needed" value={check.needed} sub={`${formatHoursShort(roll.hours)} teaching`} />
            <Stat label="Slots available" value={check.available} sub={`${config.periodsPerDay}/day`} />
            <Stat label="Surplus" value={check.surplus} sub={ok ? 'comfortable' : 'extend window'} negative={!ok} />
          </div>

          {!ok && check.suggestedEndDate && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1 text-sm text-amber-900">
                Window is too short. Suggested end date:{' '}
                <strong>{formatPretty(check.suggestedEndDate)}</strong> to fit the workload comfortably.
              </div>
              <Button size="sm" onClick={() => onChange({ ...config, endDate: check.suggestedEndDate })}>
                Auto-fit end date
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 text-left">
                <th className="font-medium p-3">Subject</th>
                <th className="font-medium p-3 text-right">Topics</th>
                <th className="font-medium p-3 text-right">Hours</th>
                <th className="font-medium p-3 text-right">Periods</th>
                <th className="font-medium p-3 text-right">% of plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roll.subjects.map((s) => {
                const pal = subjectPalette(s.color);
                const pct = roll.periods === 0 ? 0 : (s.periods / roll.periods) * 100;
                return (
                  <tr key={s.subjectId}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', pal.dot)} />
                        <span className="font-medium text-slate-800">{s.subjectName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right tabular-nums text-slate-700">{s.topics}</td>
                    <td className="p-3 text-right tabular-nums text-slate-700">{formatHoursShort(s.hours)}</td>
                    <td className="p-3 text-right tabular-nums text-slate-700">{s.periods}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn('h-full', pal.bg)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right tabular-nums">{Math.round(pct)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2" disabled={!ok}>
          Next: Generate <ArrowRight className="h-4 w-4" />
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

/* ──────────────── STEP 3 GENERATE ──────────────── */

const GenerateStep: React.FC<{
  program: any;
  config: ScheduleConfig;
  existing: ScheduleSlot[];
  onGenerated: (s: ScheduleSlot[]) => void;
  onBack: () => void;
}> = ({ program, config, existing, onGenerated, onBack }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ slots: number; end: string; free: number; short: number } | null>(null);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const lockedOnly = existing.filter((s) => s.locked);
      const out = generateSchedule(program, config, lockedOnly);
      onGenerated(out.slots);
      setResult({
        slots: out.slots.length,
        end: out.endDate,
        free: out.freeSlots,
        short: out.unscheduledTopics.reduce((a, x) => a + x.periodsShort, 0),
      });
      setRunning(false);
    }, 600);
  };

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardContent className="p-8 text-center space-y-5">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center shadow-lg">
          <Wand2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Generate academic schedule</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
            We'll walk your curriculum in order, round-robin across subjects, skip Sundays &amp; holidays, and place
            every topic into the calendar.
          </p>
        </div>

        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <Stat label="Slots created" value={result.slots} />
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-4 text-left">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Ends on</div>
              <div className="text-base font-semibold text-slate-900 mt-1">{formatPretty(result.end)}</div>
            </div>
            <Stat label="Free slots" value={result.free} />
            <Stat label="Unscheduled" value={result.short} negative={result.short > 0} />
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={run} disabled={running} className="gap-2 min-w-[10rem]">
            {running ? 'Generating…' : result ? 'Regenerate' : 'Generate now'}
            {!running && <Wand2 className="h-4 w-4" />}
          </Button>
        </div>
        {result && (
          <p className="text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
            Schedule saved. Open the Preview tab to review and override.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/* ──────────────── STEP 4 CALENDAR ──────────────── */

type ViewMode = 'month' | 'week' | 'list';

const CalendarStep: React.FC<{
  program: any;
  slots: ScheduleSlot[];
  faculty: ReturnType<typeof useFaculty>;
  onChangeSlots: (s: ScheduleSlot[]) => void;
  onBack: () => void;
}> = ({ program, slots, faculty, onChangeSlots, onBack }) => {
  const [mode, setMode] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<string>(slots[0]?.date ?? new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  const subjectMap = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    program.subjects.forEach((s: any) => m.set(s.id, { name: s.name, color: s.color }));
    return m;
  }, [program]);

  const topicMap = useMemo(() => {
    const m = new Map<string, { name: string; chapterName: string }>();
    program.subjects.forEach((s: any) =>
      s.chapters.forEach((c: any) =>
        c.topics.forEach((t: any) => m.set(t.id, { name: t.name, chapterName: c.name })),
      ),
    );
    return m;
  }, [program]);

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

  const allocated = slots.length;
  const free = 0;

  const updateSlot = (id: string, patch: Partial<ScheduleSlot>) => {
    onChangeSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setSelectedSlot((cur) => (cur && cur.id === id ? { ...cur, ...patch } : cur));
  };

  const deleteSlot = (id: string) => {
    onChangeSlots(slots.filter((s) => s.id !== id));
    setSelectedSlot(null);
  };

  if (slots.length === 0) {
    return (
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-10 text-center space-y-4">
          <CalendarDays className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-900">No schedule yet</h3>
          <p className="text-sm text-slate-600">Generate a schedule first to see the calendar.</p>
          <Button onClick={onBack}>Back to Generate</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metrics + view switcher */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex gap-3 flex-1">
            <Stat label="Slots allocated" value={allocated} />
            <Stat label="Subjects" value={program.subjects.length} />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(['month', 'week', 'list'] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize',
                  mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {m}
              </button>
            ))}
          </div>
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

      {mode === 'month' && (
        <MonthView
          cursor={cursor}
          onCursor={setCursor}
          slotsByDate={slotsByDate}
          subjectMap={subjectMap}
          onSelectSlot={setSelectedSlot}
        />
      )}
      {mode === 'week' && (
        <WeekView
          cursor={cursor}
          onCursor={setCursor}
          slotsByDate={slotsByDate}
          subjectMap={subjectMap}
          topicMap={topicMap}
          onSelectSlot={setSelectedSlot}
        />
      )}
      {mode === 'list' && (
        <ListView slots={slots} subjectMap={subjectMap} topicMap={topicMap} onSelectSlot={setSelectedSlot} />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Slot drawer */}
      <Sheet open={!!selectedSlot} onOpenChange={(o) => !o && setSelectedSlot(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedSlot && (
            <SlotEditor
              slot={selectedSlot}
              subjectMap={subjectMap}
              topicMap={topicMap}
              faculty={faculty}
              onChange={(patch) => updateSlot(selectedSlot.id, patch)}
              onDelete={() => deleteSlot(selectedSlot.id)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

/* ──────────────── Calendar sub-views ──────────────── */

const MonthView: React.FC<{
  cursor: string;
  onCursor: (iso: string) => void;
  slotsByDate: Map<string, ScheduleSlot[]>;
  subjectMap: Map<string, { name: string; color: string }>;
  onSelectSlot: (s: ScheduleSlot) => void;
}> = ({ cursor, onCursor, slotsByDate, subjectMap, onSelectSlot }) => {
  const d = parseISO(cursor);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const firstDow = monthStart.getDay();
  const days: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let i = 1; i <= monthEnd.getDate(); i++) days.push(toISO(new Date(d.getFullYear(), d.getMonth(), i)));
  while (days.length % 7 !== 0) days.push(null);

  const monthLabel = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">{monthLabel}</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCursor(toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCursor(new Date().toISOString().slice(0, 10))}>
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCursor(toISO(new Date(d.getFullYear(), d.getMonth() + 1, 1)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-slate-50 text-center py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {d}
            </div>
          ))}
          {days.map((iso, i) => {
            const daySlots = iso ? slotsByDate.get(iso) ?? [] : [];
            const todayIso = new Date().toISOString().slice(0, 10);
            return (
              <div
                key={i}
                className={cn(
                  'bg-white min-h-[110px] p-1.5 flex flex-col gap-1',
                  iso === todayIso && 'ring-2 ring-blue-400 ring-inset',
                )}
              >
                {iso ? (
                  <>
                    <div className="text-[11px] font-semibold text-slate-500 px-1">{Number(iso.slice(-2))}</div>
                    <div className="flex flex-col gap-0.5">
                      {daySlots.slice(0, 4).map((sl) => {
                        const sub = subjectMap.get(sl.subjectId);
                        const pal = subjectPalette(sub?.color ?? 'blue');
                        return (
                          <button
                            key={sl.id}
                            type="button"
                            onClick={() => onSelectSlot(sl)}
                            className={cn(
                              'text-left text-[10px] px-1.5 py-0.5 rounded border truncate font-medium hover:opacity-80',
                              pal.slot,
                              sl.locked && 'ring-1 ring-slate-400',
                            )}
                            title={sub?.name}
                          >
                            {sl.startTime} {sub?.name}
                          </button>
                        );
                      })}
                      {daySlots.length > 4 && (
                        <span className="text-[10px] text-slate-500 px-1">+{daySlots.length - 4} more</span>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const WeekView: React.FC<{
  cursor: string;
  onCursor: (iso: string) => void;
  slotsByDate: Map<string, ScheduleSlot[]>;
  subjectMap: Map<string, { name: string; color: string }>;
  topicMap: Map<string, { name: string; chapterName: string }>;
  onSelectSlot: (s: ScheduleSlot) => void;
}> = ({ cursor, onCursor, slotsByDate, subjectMap, topicMap, onSelectSlot }) => {
  const d = parseISO(cursor);
  const weekStart = addDays(cursor, -d.getDay());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">
            Week of {formatPretty(weekStart)}
          </h3>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onCursor(addDays(cursor, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCursor(new Date().toISOString().slice(0, 10))}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCursor(addDays(cursor, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((iso) => {
            const dayName = parseISO(iso).toLocaleDateString(undefined, { weekday: 'short' });
            const dayNum = Number(iso.slice(-2));
            const list = slotsByDate.get(iso) ?? [];
            return (
              <div key={iso} className="rounded-lg border border-slate-200 bg-slate-50/40 min-h-[260px] flex flex-col">
                <div className="px-2 py-1.5 border-b border-slate-200 bg-white">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{dayName}</div>
                  <div className="text-sm font-semibold text-slate-800">{dayNum}</div>
                </div>
                <div className="p-1.5 space-y-1 flex-1">
                  {list.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic px-1 py-3 text-center">—</div>
                  ) : (
                    list.map((sl) => {
                      const sub = subjectMap.get(sl.subjectId);
                      const topic = topicMap.get(sl.topicId);
                      const pal = subjectPalette(sub?.color ?? 'blue');
                      return (
                        <button
                          key={sl.id}
                          type="button"
                          onClick={() => onSelectSlot(sl)}
                          className={cn(
                            'w-full text-left p-1.5 rounded border text-[10px] hover:opacity-80 transition-opacity',
                            pal.slot,
                          )}
                        >
                          <div className="font-semibold">{sl.startTime}–{sl.endTime}</div>
                          <div className="font-medium truncate">{sub?.name}</div>
                          <div className="opacity-80 truncate">{topic?.name}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ListView: React.FC<{
  slots: ScheduleSlot[];
  subjectMap: Map<string, { name: string; color: string }>;
  topicMap: Map<string, { name: string; chapterName: string }>;
  onSelectSlot: (s: ScheduleSlot) => void;
}> = ({ slots, subjectMap, topicMap, onSelectSlot }) => {
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 text-left">
                <th className="font-medium p-3">Date</th>
                <th className="font-medium p-3">Time</th>
                <th className="font-medium p-3">Subject</th>
                <th className="font-medium p-3">Chapter · Topic</th>
                <th className="font-medium p-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slots.slice(0, 200).map((sl) => {
                const sub = subjectMap.get(sl.subjectId);
                const topic = topicMap.get(sl.topicId);
                const pal = subjectPalette(sub?.color ?? 'blue');
                return (
                  <tr key={sl.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onSelectSlot(sl)}>
                    <td className="p-3 text-slate-700 whitespace-nowrap">{formatPretty(sl.date)}</td>
                    <td className="p-3 text-slate-600 tabular-nums whitespace-nowrap">
                      {sl.startTime}–{sl.endTime}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn(pal.slot)}>
                        {sub?.name}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="text-xs text-slate-500">{topic?.chapterName}</div>
                      <div>{topic?.name}</div>
                    </td>
                    <td className="p-3">
                      {sl.locked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {slots.length > 200 && (
            <div className="text-center text-xs text-slate-500 py-3 border-t">
              Showing first 200 of {slots.length} slots. Use Week / Month views to browse the full schedule.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* ──────────────── Slot editor drawer ──────────────── */

const SlotEditor: React.FC<{
  slot: ScheduleSlot;
  subjectMap: Map<string, { name: string; color: string }>;
  topicMap: Map<string, { name: string; chapterName: string }>;
  faculty: ReturnType<typeof useFaculty>;
  onChange: (patch: Partial<ScheduleSlot>) => void;
  onDelete: () => void;
}> = ({ slot, subjectMap, topicMap, faculty, onChange, onDelete }) => {
  const sub = subjectMap.get(slot.subjectId);
  const topic = topicMap.get(slot.topicId);
  const pal = subjectPalette(sub?.color ?? 'blue');
  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Badge variant="outline" className={cn(pal.slot)}>
            {sub?.name}
          </Badge>
          <span className="text-base">{topic?.name}</span>
        </SheetTitle>
      </SheetHeader>
      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          {formatPretty(slot.date)}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          {slot.startTime} – {slot.endTime} · Period {slot.periodIndex + 1}
        </div>
        <div className="text-xs text-slate-500">Chapter: {topic?.chapterName}</div>
      </div>
      <Separator />
      <div className="space-y-3">
        <div>
          <Label className="text-xs uppercase tracking-wider text-slate-500">Faculty</Label>
          <Select value={slot.facultyId} onValueChange={(v) => onChange({ facultyId: v })}>
            <SelectTrigger className="bg-white mt-1">
              <SelectValue placeholder="Assign faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculty.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          variant={slot.locked ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => onChange({ locked: !slot.locked })}
        >
          {slot.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {slot.locked ? 'Unlock' : 'Lock slot'}
        </Button>
        <Button variant="outline" className="gap-2 text-rose-600 hover:text-rose-700" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>
      <p className="text-[11px] text-slate-400">
        Locked slots are preserved if you regenerate the schedule.
      </p>
    </div>
  );
};

export default ProgramSchedulePage;
