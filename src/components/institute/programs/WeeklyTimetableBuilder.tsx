import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eraser,
  LayoutList,
  MoreHorizontal,
  Plus,
  Repeat,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { subjectPalette } from '@/lib/subjectColors';
import {
  ScheduleConfig,
  ScheduleTrack,
  SubProgram,
  WeekDay,
  WeeklyTimetable,
  WeeklyTimetableCell,
  InstituteFaculty,
} from '@/types/instituteProgram';
import {
  addDays,
  computeDayLayout,
  isoWeekStart,
} from '@/utils/calendarAutomation';

const DOW_FULL: { d: WeekDay; short: string; long: string }[] = [
  { d: 1, short: 'Mon', long: 'Monday' },
  { d: 2, short: 'Tue', long: 'Tuesday' },
  { d: 3, short: 'Wed', long: 'Wednesday' },
  { d: 4, short: 'Thu', long: 'Thursday' },
  { d: 5, short: 'Fri', long: 'Friday' },
  { d: 6, short: 'Sat', long: 'Saturday' },
  { d: 0, short: 'Sun', long: 'Sunday' },
];

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface AllocationOption {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  trackId: string;
  trackName: string;
  facultyId?: string;
  target: number;
}

interface Props {
  config: ScheduleConfig;
  subjects: Subject[];
  /** Available faculty for per-cell / per-row assignment in Step 3. */
  faculty?: InstituteFaculty[];
  onChange: (tt: WeeklyTimetable) => void;
}

function weeksInWindow(startIso: string, endIso: string): string[] {
  const start = isoWeekStart(startIso);
  const out: string[] = [];
  let cur = start;
  let safety = 0;
  while (cur <= endIso && safety < 260) {
    out.push(cur);
    cur = addDays(cur, 7);
    safety += 1;
  }
  return out;
}

type CopyMode = 'next' | 'next4' | 'remaining' | 'all';

export const WeeklyTimetableBuilder: React.FC<Props> = ({ config, subjects, faculty = [], onChange }) => {
  const layout = useMemo(() => computeDayLayout(config), [config]);
  const periodRows = useMemo(() => layout.filter((r) => r.kind === 'period'), [layout]);

  const workingDows = useMemo(
    () => DOW_FULL.filter((d) => config.workingDays.includes(d.d)),
    [config.workingDays],
  );

  const windowEnd = config.endDate ?? addDays(config.startDate, 90);
  const weekStarts = useMemo(
    () => weeksInWindow(config.startDate, windowEnd),
    [config.startDate, windowEnd],
  );

  const tt: WeeklyTimetable = config.weeklyTimetable ?? { cells: [] };
  const [activeIdx, setActiveIdx] = useState(0);
  const activeWeek = weekStarts[activeIdx] ?? weekStarts[0];
  const [armed, setArmed] = useState<AllocationOption | null>(null);
  const [replaceIntent, setReplaceIntent] = useState<{
    weekStart: string;
    weekday: WeekDay;
    periodIndex: number;
    next: AllocationOption;
    existing: WeeklyTimetableCell;
  } | null>(null);

  // Single-level undo snapshot (Gmail-style).
  const snapshotRef = useRef<WeeklyTimetableCell[] | null>(null);

  // Confirm dialog state for bulk copy.
  const [confirmCopy, setConfirmCopy] = useState<{ mode: CopyMode; count: number } | null>(null);

  const tracksBySubject = useMemo<Record<string, ScheduleTrack[]>>(() => {
    const out: Record<string, ScheduleTrack[]> = {};
    subjects.forEach((s) => {
      const stored = config.subjectTracks?.[s.id];
      out[s.id] = stored && stored.length > 0
        ? stored
        : [{
            id: `trk-${s.id}-t1`,
            subjectId: s.id,
            name: 'T1',
            facultyId: config.defaultFaculty[s.id],
            allottedPeriods: config.subjectTargetPeriods?.[s.id] ?? 0,
          }];
    });
    return out;
  }, [subjects, config.subjectTracks, config.subjectTargetPeriods, config.defaultFaculty]);

  const placedByTrack = useMemo(() => {
    const out: Record<string, number> = {};
    tt.cells.forEach((c) => {
      if (!c.subjectId) return;
      const trackId = c.trackId ?? tracksBySubject[c.subjectId]?.[0]?.id ?? `trk-${c.subjectId}-t1`;
      out[trackId] = (out[trackId] ?? 0) + 1;
    });
    return out;
  }, [tt.cells, tracksBySubject]);

  const allocationOptions = useMemo<AllocationOption[]>(() => subjects.flatMap((s) =>
    (tracksBySubject[s.id] ?? [])
      .filter((tr) => tr.enabled !== false)
      .map((tr) => ({
        subjectId: s.id,
        subjectName: s.name,
        subjectColor: s.color,
        trackId: tr.id,
        trackName: tr.name,
        facultyId: tr.facultyId ?? config.defaultFaculty[s.id],
        target: config.trackTargetPeriods?.[tr.id] ?? tr.allottedPeriods ?? config.subjectTargetPeriods?.[s.id] ?? 0,
      })),
  ), [subjects, tracksBySubject, config.defaultFaculty, config.trackTargetPeriods, config.subjectTargetPeriods]);

  /** Map of "weekday#periodIndex" -> cell info for active week. */
  const cellMap = useMemo(() => {
    const m = new Map<string, WeeklyTimetableCell>();
    tt.cells
      .filter((c) => c.weekStartDate === activeWeek)
      .forEach((c) => m.set(`${c.weekday}#${c.periodIndex}`, c));
    return m;
  }, [tt.cells, activeWeek]);

  const authoredWeeks = useMemo(() => {
    const s = new Set<string>();
    tt.cells.forEach((c) => {
      if (c.subjectId) s.add(c.weekStartDate);
    });
    return s;
  }, [tt.cells]);

  const snapshotAndWrite = (
    nextCells: WeeklyTimetableCell[],
    undoMessage: string,
  ) => {
    snapshotRef.current = tt.cells;
    onChange({ cells: nextCells });
    toast(undoMessage, {
      action: {
        label: 'Undo',
        onClick: () => {
          if (snapshotRef.current) {
            onChange({ cells: snapshotRef.current });
            snapshotRef.current = null;
            toast.success('Reverted');
          }
        },
      },
    });
  };

  const writeNoSnapshot = (mutator: (cells: WeeklyTimetableCell[]) => WeeklyTimetableCell[]) => {
    onChange({ cells: mutator(tt.cells) });
  };

  const setCellSubject = (
    weekStart: string,
    weekday: WeekDay,
    periodIndex: number,
    subjectId: string | null,
    trackId?: string | null,
    facultyIdOverride?: string | null,
  ) => {
    writeNoSnapshot((cells) => {
      const existing = cells.find(
        (c) => c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex,
      );
      const others = cells.filter(
        (c) => !(c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex),
      );
      // Reset faculty override when subject is cleared or changed.
      const facultyId =
        facultyIdOverride !== undefined
          ? facultyIdOverride
          : subjectId && existing?.subjectId === subjectId && existing?.trackId === trackId
            ? existing?.facultyId ?? null
            : null;
      return [...others, { weekStartDate: weekStart, weekday, periodIndex, subjectId, trackId: subjectId ? trackId ?? null : null, facultyId }];
    });
  };

  const placeAllocation = (
    weekStart: string,
    weekday: WeekDay,
    periodIndex: number,
    option: AllocationOption,
    opts: { force?: boolean } = {},
  ) => {
    const existing = tt.cells.find(
      (c) => c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex,
    );
    const same = existing?.subjectId === option.subjectId && (existing.trackId ?? tracksBySubject[option.subjectId]?.[0]?.id) === option.trackId;
    if (existing?.subjectId && !opts.force && !same) {
      setReplaceIntent({ weekStart, weekday, periodIndex, next: option, existing });
      return;
    }
    setCellSubject(weekStart, weekday, periodIndex, option.subjectId, option.trackId, option.facultyId ?? null);
  };

  const setCellFaculty = (
    weekStart: string,
    weekday: WeekDay,
    periodIndex: number,
    facultyId: string | null,
  ) => {
    writeNoSnapshot((cells) => {
      const existing = cells.find(
        (c) => c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex,
      );
      if (!existing || !existing.subjectId) return cells;
      const others = cells.filter(
        (c) => !(c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex),
      );
      return [...others, { ...existing, facultyId }];
    });
  };

  const fillRow = (periodIndex: number, subjectId: string | null, facultyId: string | null = null, trackId?: string | null) => {
    const targetTrack = subjectId ? trackId ?? tracksBySubject[subjectId]?.[0]?.id ?? null : null;
    const existingKeys = new Set(
      tt.cells
        .filter((c) => c.weekStartDate === activeWeek && c.periodIndex === periodIndex && c.subjectId)
        .map((c) => `${c.weekday}#${c.periodIndex}`),
    );
    const added: WeeklyTimetableCell[] = [];
    let skipped = 0;
    workingDows.forEach((d) => {
      const key = `${d.d}#${periodIndex}`;
      if (subjectId && existingKeys.has(key)) {
        skipped += 1;
        return;
      }
      added.push({ weekStartDate: activeWeek, weekday: d.d, periodIndex, subjectId, trackId: targetTrack, facultyId: subjectId ? facultyId : null });
    });
    const addedKeys = new Set(added.map((c) => `${c.weekday}#${c.periodIndex}`));
    const others = tt.cells.filter(
      (c) => !(c.weekStartDate === activeWeek && c.periodIndex === periodIndex && addedKeys.has(`${c.weekday}#${c.periodIndex}`)),
    );
    const sub = subjects.find((s) => s.id === subjectId);
    const fac = faculty.find((f) => f.id === facultyId);
    snapshotAndWrite(
      [...others, ...added],
      subjectId
        ? `Filled ${added.length} cells · skipped ${skipped} occupied cells${sub ? ` with ${sub.name}` : ''}${fac ? ` · ${fac.name}` : ''}`
        : `P${periodIndex + 1} cleared across the week`,
    );
  };

  // "Plan this day": ordered subject list -> drops into the day's periods top-down.
  const planDay = (
    weekday: WeekDay,
    orderedSubjectIds: string[],
    opts: { overwrite: boolean; repeat: boolean },
  ) => {
    if (orderedSubjectIds.length === 0) return;
    const existing = new Map<number, string | null>();
    tt.cells
      .filter((c) => c.weekStartDate === activeWeek && c.weekday === weekday)
      .forEach((c) => existing.set(c.periodIndex, c.subjectId));

    let cursor = 0;
    const assignments = new Map<number, string>();
    for (let pIdx = 0; pIdx < periodRows.length; pIdx++) {
      const filled = existing.get(pIdx);
      if (filled && !opts.overwrite) continue;
      if (cursor >= orderedSubjectIds.length) {
        if (opts.repeat) cursor = 0;
        else break;
      }
      assignments.set(pIdx, orderedSubjectIds[cursor]);
      cursor += 1;
    }
    if (assignments.size === 0) {
      toast.info('No empty periods to fill. Enable "Overwrite filled periods" to replace.');
      return;
    }
    const others = tt.cells.filter(
      (c) =>
        !(c.weekStartDate === activeWeek && c.weekday === weekday && assignments.has(c.periodIndex)),
    );
    const added: WeeklyTimetableCell[] = Array.from(assignments.entries()).map(([pIdx, sid]) => ({
      weekStartDate: activeWeek,
      weekday,
      periodIndex: pIdx,
      subjectId: sid,
    }));
    const dayName = DOW_FULL.find((d) => d.d === weekday)?.long ?? '';
    snapshotAndWrite([...others, ...added], `Planned ${assignments.size} period(s) for ${dayName}`);
  };

  const clearWeek = (weekStart: string, label: string) => {
    const next = tt.cells.filter((c) => c.weekStartDate !== weekStart);
    snapshotAndWrite(next, `Cleared ${label}`);
  };

  const clearAllWeeks = () => {
    snapshotAndWrite([], 'Cleared all weeks');
  };

  const targetsFor = (mode: CopyMode): string[] => {
    if (mode === 'next') return weekStarts[activeIdx + 1] ? [weekStarts[activeIdx + 1]] : [];
    if (mode === 'next4') {
      const out: string[] = [];
      for (let i = 1; i <= 4 && weekStarts[activeIdx + i]; i++) out.push(weekStarts[activeIdx + i]);
      return out;
    }
    if (mode === 'remaining') return weekStarts.slice(activeIdx + 1);
    if (mode === 'all') return weekStarts.filter((_, i) => i !== activeIdx);
    return [];
  };

  const requestCopy = (mode: CopyMode) => {
    const source = tt.cells.filter((c) => c.weekStartDate === activeWeek);
    if (source.length === 0) {
      toast.error('This week is empty — nothing to copy.');
      return;
    }
    const targets = targetsFor(mode);
    if (targets.length === 0) {
      toast.info('No target weeks available.');
      return;
    }
    setConfirmCopy({ mode, count: targets.length });
  };

  const performCopy = () => {
    if (!confirmCopy) return;
    const source = tt.cells.filter((c) => c.weekStartDate === activeWeek);
    const targets = targetsFor(confirmCopy.mode);
    const others = tt.cells.filter((c) => !targets.includes(c.weekStartDate));
    const cloned: WeeklyTimetableCell[] = [];
    targets.forEach((ws) => {
      source.forEach((c) => cloned.push({ ...c, weekStartDate: ws }));
    });
    snapshotAndWrite([...others, ...cloned], `Copied this week to ${targets.length} week(s)`);
    setConfirmCopy(null);
  };

  const activeFilled = tt.cells.filter((c) => c.weekStartDate === activeWeek && c.subjectId).length;
  const totalCells = workingDows.length * periodRows.length;

  const copyLabel: Record<CopyMode, string> = {
    next: 'Next week',
    next4: 'Next 4 weeks',
    remaining: 'All remaining weeks',
    all: 'All weeks in window',
  };

  return (
    <div className="space-y-4 min-w-0 w-full">
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" /> Weekly timetable
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick a subject for each period. Use the row tool to repeat across the week, the column tool
                to plan a day, then copy the week to others.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium text-slate-700 tabular-nums px-2">
                Week {activeIdx + 1} of {weekStarts.length}
                <span className="text-slate-400 ml-2">· starts {activeWeek}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={activeIdx >= weekStarts.length - 1}
                onClick={() => setActiveIdx(Math.min(weekStarts.length - 1, activeIdx + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week chips with hover-delete */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">

            {weekStarts.map((ws, i) => {
              const filled = authoredWeeks.has(ws);
              const isActive = i === activeIdx;
              return (
                <div key={ws} className="relative group shrink-0">

                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : filled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300',
                      filled && 'pr-5',
                    )}
                  >
                    W{i + 1}
                    {filled && !isActive && ' ✓'}
                  </button>
                  {filled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearWeek(ws, `W${i + 1}`);
                      }}
                      title="Clear this week"
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 right-0.5 h-4 w-4 rounded grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity',
                        isActive
                          ? 'text-white/80 hover:bg-white/20'
                          : 'text-emerald-700 hover:bg-emerald-200',
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tools */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {activeFilled} / {totalCells} cells filled
            </Badge>
            {armed && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Armed: {armed.subjectName} · {armed.trackName}
              </Badge>
            )}
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy this week to…
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => requestCopy('next')}>Next week only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestCopy('next4')}>Next 4 weeks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestCopy('remaining')}>
                  All remaining weeks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => requestCopy('all')}>
                  <Repeat className="h-3.5 w-3.5 mr-1.5" /> All weeks in window
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-rose-600 hover:text-rose-700"
              onClick={() => clearWeek(activeWeek, `W${activeIdx + 1}`)}
            >
              <Eraser className="h-3.5 w-3.5" /> Clear this week
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="px-2">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={clearAllWeeks}
                  className="text-rose-600 focus:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear all weeks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Subject / track palette</h4>
              <p className="text-[11px] text-slate-500">Pick a track, then click grid cells. Occupied cells ask before replacing.</p>
            </div>
            {armed && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setArmed(null)}>Clear armed</Button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {allocationOptions.map((opt) => {
              const pal = subjectPalette(opt.subjectColor);
              const placed = placedByTrack[opt.trackId] ?? 0;
              const isArmed = armed?.trackId === opt.trackId;
              return (
                <button
                  type="button"
                  key={opt.trackId}
                  onClick={() => setArmed(opt)}
                  className={cn(
                    'min-h-12 rounded-lg border px-3 py-2 text-left transition-all bg-white',
                    isArmed ? cn(pal.slot, 'ring-2 ring-offset-1', pal.ring) : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{opt.subjectName}</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/70">{opt.trackName}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 tabular-nums mt-0.5">
                    {placed} / {opt.target || '—'} placed
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card className="border-slate-200/70 shadow-sm min-w-0">
        <CardContent className="p-0 overflow-x-auto min-w-0">
          <table className="w-full text-sm border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium w-28 border-b border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                  Period
                </th>
                {workingDows.map((d) => (
                  <th
                    key={d.d}
                    className="text-left px-2 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium border-b min-w-[100px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{d.short}</span>
                      <PlanDayPopover
                        dayName={d.long}
                        subjects={subjects}
                        periodCount={periodRows.length}
                        onApply={(ids, opts) => planDay(d.d, ids, opts)}
                      />
                    </div>
                  </th>
                ))}
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
                        className="px-3 py-1.5 text-[11px] text-amber-700 italic"
                      >
                        {row.startTime} – {row.endTime}
                      </td>
                    </tr>
                  );
                }
                const pIdx = row.index ?? 0;
                return (
                  <tr key={`p-${pIdx}`} className="border-b border-slate-100">
                    <td className="px-3 py-1.5 align-top sticky left-0 bg-white border-r border-slate-200 z-[1]">
                      <div className="flex items-center gap-1.5">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">P{pIdx + 1}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">
                            {row.startTime}–{row.endTime}
                          </div>
                        </div>
                        <RowFillMenu
                          subjects={subjects}
                          allocationOptions={allocationOptions}
                          faculty={faculty}
                          defaultFaculty={config.defaultFaculty}
                          onFill={(sid, fid, tid) => fillRow(pIdx, sid, fid, tid)}
                        />
                      </div>
                    </td>

                    {workingDows.map((d) => {
                      const cell = cellMap.get(`${d.d}#${pIdx}`);
                      const subjectId = cell?.subjectId ?? null;
                      const sub = subjects.find((s) => s.id === subjectId);
                      const trackId = subjectId ? cell?.trackId ?? tracksBySubject[subjectId]?.[0]?.id : null;
                      const track = subjectId ? tracksBySubject[subjectId]?.find((tr) => tr.id === trackId) : null;
                      const pal = sub ? subjectPalette(sub.color) : null;
                      const effectiveFacultyId =
                        cell?.facultyId || track?.facultyId || (subjectId ? config.defaultFaculty[subjectId] : '') || '';
                      const fac = faculty.find((f) => f.id === effectiveFacultyId);
                      const facultyOptions = faculty.filter(
                        (f) => !f.subjectId || f.subjectId === subjectId,
                      );
                      return (
                        <td key={d.d} className="px-1 py-1 align-top">
                          <button
                            type="button"
                            onClick={() => armed && placeAllocation(activeWeek, d.d, pIdx, armed)}
                            className={cn(
                              'w-full min-h-[64px] rounded-lg border px-2 py-1.5 text-left transition-all',
                              subjectId && pal ? cn(pal.slot, 'hover:ring-1', pal.ring) : 'border-dashed border-slate-200 bg-white text-slate-300 hover:border-blue-300 hover:bg-blue-50/30',
                              armed && !subjectId && 'ring-1 ring-blue-200',
                            )}
                          >
                            {subjectId && sub ? (
                              <>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] font-bold truncate">{sub.name}</span>
                                  {(() => {
                                    const enabledTracks = (tracksBySubject[subjectId] ?? []).filter((tr) => tr.enabled !== false);
                                    return enabledTracks.length > 1 ? (
                                      <span className="text-[10px] font-semibold shrink-0">{track?.name ?? 'T1'}</span>
                                    ) : null;
                                  })()}
                                </div>
                                {fac && (
                                  <div className="text-[10px] text-slate-600 truncate mt-1">
                                    {fac.name.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '')}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="h-full grid place-items-center text-lg">＋</div>
                            )}
                          </button>
                          <div className="space-y-1 mt-1">
                            {subjectId && facultyOptions.length > 0 && (
                              <Select
                                value={effectiveFacultyId || '__default__'}
                                onValueChange={(v) =>
                                  setCellFaculty(
                                    activeWeek,
                                    d.d,
                                    pIdx,
                                    v === '__default__' ? null : v,
                                  )
                                }
                              >
                                <SelectTrigger
                                  className="h-7 text-[10px] border-slate-200 bg-slate-50/70 text-slate-700"
                                  title={fac ? `Faculty: ${fac.name}` : 'No faculty set'}
                                >
                                  <SelectValue placeholder="Faculty">
                                    {fac ? fac.name : 'Faculty'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__default__">
                                    Use default
                                  </SelectItem>
                                  {facultyOptions.map((f) => (
                                    <SelectItem key={f.id} value={f.id} className="text-xs">
                                      {f.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
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

      {/* Confirm bulk copy dialog */}
      <AlertDialog open={!!confirmCopy} onOpenChange={(o) => !o && setConfirmCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy week to {confirmCopy && copyLabel[confirmCopy.mode]}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the timetable for <b>{confirmCopy?.count}</b> week
              {confirmCopy && confirmCopy.count !== 1 ? 's' : ''} with the contents of W{activeIdx + 1}.
              You can undo this immediately after.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performCopy}>Replace {confirmCopy?.count} week(s)</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!replaceIntent} onOpenChange={(o) => !o && setReplaceIntent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              This slot already has{' '}
              <b>
                {(() => {
                  const existingSubject = subjects.find((s) => s.id === replaceIntent?.existing.subjectId);
                  const existingTrack = replaceIntent?.existing.subjectId
                    ? tracksBySubject[replaceIntent.existing.subjectId]?.find((tr) => tr.id === replaceIntent.existing.trackId)
                    : null;
                  return `${existingSubject?.name ?? 'Subject'} · ${existingTrack?.name ?? 'T1'}`;
                })()}
              </b>
              . Replacing will assign <b>{replaceIntent?.next.subjectName} · {replaceIntent?.next.trackName}</b> here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!replaceIntent) return;
                setCellSubject(
                  replaceIntent.weekStart,
                  replaceIntent.weekday,
                  replaceIntent.periodIndex,
                  replaceIntent.next.subjectId,
                  replaceIntent.next.trackId,
                  replaceIntent.next.facultyId ?? null,
                );
                setReplaceIntent(null);
              }}
            >
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const RowFillMenu: React.FC<{
  subjects: Subject[];
  allocationOptions: AllocationOption[];
  faculty: InstituteFaculty[];
  defaultFaculty: Record<string, string>;
  onFill: (subjectId: string | null, facultyId: string | null, trackId?: string | null) => void;
}> = ({ subjects, allocationOptions, faculty, defaultFaculty, onFill }) => {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [facultyId, setFacultyId] = useState<string>('__default__');

  const selectedOption = allocationOptions.find((o) => o.trackId === picked);
  const subject = subjects.find((s) => s.id === selectedOption?.subjectId);
  const facultyOptions = faculty.filter((f) => !f.subjectId || f.subjectId === selectedOption?.subjectId);

  const apply = () => {
    if (!picked) return;
    const fid = facultyId === '__default__'
      ? (selectedOption?.facultyId ?? (selectedOption?.subjectId ? defaultFaculty[selectedOption.subjectId] : null))
      : facultyId;
    onFill(selectedOption?.subjectId ?? picked, fid || null, selectedOption?.trackId ?? null);
    setOpen(false);
    setPicked(null);
    setFacultyId('__default__');
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setPicked(null); setFacultyId('__default__'); } }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-5 w-5 rounded hover:bg-slate-200 grid place-items-center text-slate-400 hover:text-slate-700"
          title="Fill this period across the week"
        >
          <Wand2 className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 space-y-2.5">
        <div>
          <div className="text-sm font-semibold text-slate-900">Fill this period</div>
          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
            Pick the subject track for every empty working-day cell in this period. Occupied cells are skipped.
          </p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Subject</div>
          <Select value={picked ?? ''} onValueChange={(v) => { setPicked(v); setFacultyId('__default__'); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Pick subject" />
            </SelectTrigger>
            <SelectContent>
              {allocationOptions.map((s) => (
                <SelectItem key={s.trackId} value={s.trackId} className="text-xs">
                  {s.subjectName} · {s.trackName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {subject && facultyOptions.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Faculty for this row
            </div>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__" className="text-xs">
                  Default for {subject.name}
                </SelectItem>
                {facultyOptions.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-rose-600 hover:text-rose-700"
            onClick={() => { onFill(null, null); setOpen(false); }}
          >
            Clear row
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={apply} disabled={!picked}>
            Apply to week
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface PlanDayPopoverProps {
  dayName: string;
  subjects: Subject[];
  periodCount: number;
  onApply: (orderedIds: string[], opts: { overwrite: boolean; repeat: boolean }) => void;
}

const PlanDayPopover: React.FC<PlanDayPopoverProps> = ({ dayName, subjects, periodCount, onApply }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<string[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const reset = () => {
    setRows([]);
    setOverwrite(false);
    setRepeat(false);
  };

  const addRow = () => {
    if (rows.length >= periodCount) return;
    setRows([...rows, subjects[0]?.id ?? '']);
  };

  const updateRow = (i: number, id: string) => {
    const next = [...rows];
    next[i] = id;
    setRows(next);
  };

  const removeRow = (i: number) => {
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const apply = () => {
    const cleaned = rows.filter(Boolean);
    onApply(cleaned, { overwrite, repeat });
    setOpen(false);
    reset();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
        if (o && rows.length === 0 && subjects[0]) setRows([subjects[0].id]);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-5 w-5 rounded hover:bg-slate-200 grid place-items-center text-slate-400 hover:text-slate-700"
          title={`Plan ${dayName}`}
        >
          <LayoutList className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="space-y-2.5">
          <div>
            <div className="text-sm font-semibold text-slate-900">Plan {dayName}</div>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Pick subjects in order. They drop into {dayName}'s empty periods top-down. Already-filled
              periods are skipped unless overwrite is on.
            </p>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {rows.map((sid, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 w-4 text-right tabular-nums">{i + 1}.</span>
                <Select value={sid} onValueChange={(v) => updateRow(i, v)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="h-6 w-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 h-8 text-xs"
            onClick={addRow}
            disabled={rows.length >= periodCount}
          >
            <Plus className="h-3.5 w-3.5" /> Add subject
          </Button>

          <div className="space-y-1.5 pt-1 border-t">
            <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
              <Checkbox
                checked={overwrite}
                onCheckedChange={(c) => setOverwrite(c === true)}
              />
              Overwrite filled periods
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
              <Checkbox checked={repeat} onCheckedChange={(c) => setRepeat(c === true)} />
              Repeat list if periods left
            </label>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              disabled={rows.filter(Boolean).length === 0}
              onClick={apply}
            >
              Apply to {dayName}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WeeklyTimetableBuilder;
