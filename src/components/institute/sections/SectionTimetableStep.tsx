import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Copy, Eraser, GripVertical, MoreHorizontal, Plus,
  Sparkles, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  CellAllocation, CellOccupiedError, Section, SectionProgram, SectionSubject,
  SectionTrack, SlotKey, slotKeyEq,
} from '@/types/section';
import {
  clearCell, clearWeek, copyWeekTo, fillSlotsSkippingOccupied, getCellsSnapshot,
  restoreCells, setCellAllocation, setCellFaculty, swapCells,
} from '@/hooks/useSection';
import { useFaculty, useInstituteHolidays } from '@/hooks/useInstitutePrograms';
import {
  WEEKDAY_LABELS, computePeriodTimes, listWeekStarts, placedByTrack,
  placedByTrackInWeek, weekStats,
} from '@/utils/sectionUtils';
import { sectionPalette } from '@/lib/sectionColors';
import { DevNote } from '@/components/dev/DevNote';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  onBack?: () => void;
  onNext?: () => void;
  hideFooter?: boolean;
  readOnly?: boolean;
}

/** One flat palette entry: program + subject + track. */
interface PaletteEntry {
  key: string;
  programId: string;
  programCode: string;
  subjectId: string;
  subjectName: string;
  subjectColor: SectionSubject['color'];
  trackId: string;
  trackName: string;
  facultyId: string;
  target: number;
  subjectHasMultipleTracks: boolean;
}

function buildPalette(section: Section): PaletteEntry[] {
  return section.programs.flatMap((p) =>
    p.subjects.flatMap((s) =>
      s.tracks.map((t) => ({
        key: `${p.id}::${s.id}::${t.id}`,
        programId: p.id,
        programCode: p.code,
        subjectId: s.id,
        subjectName: s.name,
        subjectColor: s.color,
        trackId: t.id,
        trackName: t.name,
        facultyId: t.facultyId,
        target: t.allottedPeriods || 0,
        subjectHasMultipleTracks: s.tracks.length > 1,
      })),
    ),
  );
}

export const SectionTimetableStep: React.FC<Props> = ({
  section, onBack, onNext, hideFooter, readOnly,
}) => {
  const facultyList = useFaculty();
  const instituteHolidays = useInstituteHolidays();
  const window = section.windows[section.windows.length - 1];
  const weekStarts = useMemo(() => listWeekStarts(window), [window]);
  const [weekIdx, setWeekIdx] = useState(0);
  const weekStart = weekStarts[weekIdx] ?? weekStarts[0];

  const [armed, setArmed] = useState<CellAllocation | null>(null);
  const [conflict, setConflict] = useState<{
    slot: SlotKey; incoming: CellAllocation; existing: CellAllocation;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState<{ mode: CopyMode; targets: string[] } | null>(null);

  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const snapshotRef = useRef<Section['cells'] | null>(null);

  const palette = useMemo(() => buildPalette(section), [section]);
  const placedCounts = useMemo(() => placedByTrack(section, window), [section, window]);
  const placedThisWeek = useMemo(
    () => placedByTrackInWeek(section, weekStart),
    [section, weekStart],
  );
  const facultyById = useMemo(
    () => Object.fromEntries(facultyList.map((f) => [f.id, f])),
    [facultyList],
  );
  const showProgram = section.programs.length > 1;

  const periodTimes = useMemo(
    () => computePeriodTimes({
      ...section.config,
      startDate: window?.startDate ?? '',
      defaultFaculty: {},
    } as never),
    [section.config, window],
  );

  const stats = useMemo(
    () => weekStats(section, window, weekStart, instituteHolidays),
    [section, window, weekStart, instituteHolidays],
  );
  const authoredWeeks = useMemo(() => {
    const set = new Set<string>();
    section.cells.forEach((c) => { if (c.allocation) set.add(c.weekStartDate); });
    return set;
  }, [section.cells]);

  const cellAt = (weekday: number, periodIndex: number) =>
    section.cells.find((c) =>
      slotKeyEq(c, { weekStartDate: weekStart, weekday: weekday as never, periodIndex }),
    );

  const snapshotAndToast = (msg: string) => {
    snapshotRef.current = getCellsSnapshot(section.id);
    toast(msg, {
      action: {
        label: 'Undo',
        onClick: () => {
          if (snapshotRef.current) {
            restoreCells(section.id, snapshotRef.current);
            snapshotRef.current = null;
            toast.success('Reverted');
          }
        },
      },
    });
  };

  const tryPlace = (slot: SlotKey, allocation: CellAllocation) => {
    try {
      setCellAllocation(section.id, slot, allocation);
    } catch (e) {
      if (e instanceof CellOccupiedError) {
        setConflict({ slot, incoming: allocation, existing: e.existing });
      }
    }
  };

  const handleCellClick = (weekday: number, periodIndex: number) => {
    if (readOnly) return;
    if (!armed) return;
    tryPlace(
      { weekStartDate: weekStart, weekday: weekday as never, periodIndex },
      armed,
    );
  };

  const handleColumnFill = (
    weekday: number,
    entryKey: string,
    facultyOverride: string | undefined,
    overwrite: boolean,
  ) => {
    const entry = palette.find((p) => p.key === entryKey);
    if (!entry) return;
    const alloc: CellAllocation = {
      programId: entry.programId,
      subjectId: entry.subjectId,
      trackId: entry.trackId,
      facultyId: facultyOverride,
    };
    const slots: SlotKey[] = Array.from(
      { length: section.config.periodsPerDay },
      (_, p) => ({ weekStartDate: weekStart, weekday: weekday as never, periodIndex: p }),
    );
    const snap = getCellsSnapshot(section.id);
    if (overwrite) {
      slots.forEach((s) => setCellAllocation(section.id, s, alloc, { force: true }));
      snapshotRef.current = snap;
      const dayName = WEEKDAY_LABELS.find((w) => w.d === weekday)?.long ?? '';
      toast(`Filled ${slots.length} periods on ${dayName}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            if (snapshotRef.current) {
              restoreCells(section.id, snapshotRef.current);
              snapshotRef.current = null;
              toast.success('Reverted');
            }
          },
        },
      });
    } else {
      const { filled, skipped } = fillSlotsSkippingOccupied(section.id, slots, alloc);
      snapshotRef.current = snap;
      toast(`Filled ${filled} · skipped ${skipped}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            if (snapshotRef.current) {
              restoreCells(section.id, snapshotRef.current);
              snapshotRef.current = null;
              toast.success('Reverted');
            }
          },
        },
      });
    }
  };

  const handleRowFill = (
    periodIndex: number,
    entryKey: string | null,
    facultyOverride: string | undefined,
    overwrite: boolean,
  ) => {
    const snap = getCellsSnapshot(section.id);
    if (entryKey === null) {
      // Clear this period across the week.
      section.config.workingDays.forEach((d) => {
        clearCell(section.id, { weekStartDate: weekStart, weekday: d, periodIndex });
      });
      snapshotRef.current = snap;
      toast(`P${periodIndex + 1} cleared across the week`, {
        action: {
          label: 'Undo',
          onClick: () => {
            if (snapshotRef.current) {
              restoreCells(section.id, snapshotRef.current);
              snapshotRef.current = null;
              toast.success('Reverted');
            }
          },
        },
      });
      return;
    }
    const entry = palette.find((p) => p.key === entryKey);
    if (!entry) return;
    const alloc: CellAllocation = {
      programId: entry.programId,
      subjectId: entry.subjectId,
      trackId: entry.trackId,
      facultyId: facultyOverride,
    };
    const slots: SlotKey[] = section.config.workingDays.map((d) => ({
      weekStartDate: weekStart, weekday: d, periodIndex,
    }));
    if (overwrite) {
      slots.forEach((s) => setCellAllocation(section.id, s, alloc, { force: true }));
      snapshotRef.current = snap;
      toast(`Filled ${slots.length} cells in P${periodIndex + 1}`, {
        action: { label: 'Undo', onClick: () => {
          if (snapshotRef.current) { restoreCells(section.id, snapshotRef.current); snapshotRef.current = null; toast.success('Reverted'); }
        }},
      });
    } else {
      const { filled, skipped } = fillSlotsSkippingOccupied(section.id, slots, alloc);
      snapshotRef.current = snap;
      toast(`Filled ${filled} · skipped ${skipped}`, {
        action: { label: 'Undo', onClick: () => {
          if (snapshotRef.current) { restoreCells(section.id, snapshotRef.current); snapshotRef.current = null; toast.success('Reverted'); }
        }},
      });
    }
  };

  const handlePlanDay = (
    weekday: number,
    orderedKeys: string[],
    opts: { overwrite: boolean; repeat: boolean },
  ) => {
    if (orderedKeys.length === 0) return;
    const snap = getCellsSnapshot(section.id);
    let cursor = 0;
    let placed = 0;
    for (let p = 0; p < section.config.periodsPerDay; p++) {
      const slot: SlotKey = { weekStartDate: weekStart, weekday: weekday as never, periodIndex: p };
      const filled = section.cells.find((c) => slotKeyEq(c, slot));
      if (filled && !opts.overwrite) continue;
      if (cursor >= orderedKeys.length) {
        if (opts.repeat) cursor = 0;
        else break;
      }
      const entry = palette.find((e) => e.key === orderedKeys[cursor]);
      cursor += 1;
      if (!entry) continue;
      const alloc: CellAllocation = {
        programId: entry.programId,
        subjectId: entry.subjectId,
        trackId: entry.trackId,
      };
      setCellAllocation(section.id, slot, alloc, { force: true });
      placed += 1;
    }
    snapshotRef.current = snap;
    const dayName = WEEKDAY_LABELS.find((w) => w.d === weekday)?.long ?? '';
    toast(`Planned ${placed} period(s) for ${dayName}`, {
      action: { label: 'Undo', onClick: () => {
        if (snapshotRef.current) { restoreCells(section.id, snapshotRef.current); snapshotRef.current = null; toast.success('Reverted'); }
      }},
    });
  };

  const doCopyWeek = (mode: CopyMode) => {
    const targets = copyTargets(weekStarts, weekIdx, mode);
    if (targets.length === 0) {
      toast.info('No target weeks');
      return;
    }
    setConfirmCopy({ mode, targets });
  };

  const performCopy = () => {
    if (!confirmCopy) return;
    const snap = getCellsSnapshot(section.id);
    const added = copyWeekTo(section.id, weekStart, confirmCopy.targets);
    snapshotRef.current = snap;
    toast(`Copied to ${confirmCopy.targets.length} week(s) · ${added} cells`, {
      action: { label: 'Undo', onClick: () => {
        if (snapshotRef.current) { restoreCells(section.id, snapshotRef.current); snapshotRef.current = null; toast.success('Reverted'); }
      }},
    });
    setConfirmCopy(null);
  };

  const performClearWeek = () => {
    const snap = getCellsSnapshot(section.id);
    const n = clearWeek(section.id, weekStart);
    snapshotRef.current = snap;
    toast(`Cleared ${n} cells`, {
      action: { label: 'Undo', onClick: () => {
        if (snapshotRef.current) { restoreCells(section.id, snapshotRef.current); snapshotRef.current = null; toast.success('Reverted'); }
      }},
    });
    setConfirmClear(false);
  };

  /* ── drag-swap ── */
  const cellKey = (wd: number, pi: number) => `${wd}#${pi}`;
  const parseCellKey = (k: string): [number, number] => {
    const [wd, pi] = k.split('#').map(Number);
    return [wd, pi];
  };
  const handleDrop = (dstKey: string) => {
    if (!dragKey || dragKey === dstKey || readOnly) { setDragKey(null); setDragOverKey(null); return; }
    const [sWd, sPi] = parseCellKey(dragKey);
    const [dWd, dPi] = parseCellKey(dstKey);
    swapCells(
      section.id,
      { weekStartDate: weekStart, weekday: sWd as never, periodIndex: sPi },
      { weekStartDate: weekStart, weekday: dWd as never, periodIndex: dPi },
    );
    setDragKey(null); setDragOverKey(null);
    toast.success('Swapped');
  };

  return (
    <TooltipProvider delayDuration={120}>
    <div className="space-y-3">
      {/* HEADER: title + week nav */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-slate-900">Weekly timetable</div>
              <DevNote title="How the timetable works">
                <p>Pick a subject/track card in the palette, then click a grid cell to place it.</p>
                <p>Use the ⋮ menu on any day header for <b>Plan this day</b>, and on any period row for <b>Fill this period across the week</b>.</p>
                <p>Drag one cell onto another to <b>swap</b>; drag onto an empty cell to <b>move</b>.</p>
              </DevNote>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Pick a subject for each period. Use the row tool to repeat across the week, the column tool to plan a day, then copy the week to others.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
              disabled={weekIdx === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
              Week <b>{weekIdx + 1}</b> of {weekStarts.length}
              <span className="text-slate-400"> · starts {weekStart}</span>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => setWeekIdx(Math.min(weekStarts.length - 1, weekIdx + 1))}
              disabled={weekIdx >= weekStarts.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week chip bar */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {weekStarts.map((ws, i) => {
              const active = i === weekIdx;
              const hasCells = authoredWeeks.has(ws);
              return (
                <button
                  key={ws}
                  onClick={() => setWeekIdx(i)}
                  className={cn(
                    'shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold tabular-nums transition-all border',
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : hasCells
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400',
                  )}
                >
                  W{i + 1}
                  {hasCells && !active && <span className="ml-1">✓</span>}
                  {active && hasCells && <span className="ml-1">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress + bulk actions */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-semibold text-indigo-700 tabular-nums cursor-help">
                    {stats.filled}
                    <span className="text-slate-400"> / </span>
                    {stats.capacity}
                    <span className="text-slate-500 font-normal"> cells filled this week</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold">Week fill meter</p>
                  <p className="text-slate-500">
                    {stats.filled} of {stats.capacity} available period slots in the selected week are already assigned.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="text-[10px] text-slate-500">({stats.pct}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-md">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy this week to…
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-[10px]">Overwrites target weeks</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => doCopyWeek('next')}>Next week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doCopyWeek('next4')}>Next 4 weeks</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doCopyWeek('remaining')}>All remaining weeks</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doCopyWeek('all')}>All other weeks</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
                onClick={() => setConfirmClear(true)}
                disabled={stats.filled === 0}
              >
                <Eraser className="h-3.5 w-3.5 mr-1" /> Clear this week
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PALETTE + GRID — 20/80 split on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,20%)_1fr] gap-3 items-start">
        {/* Subject cards rail */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-3">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-900">Subject cards</div>
            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
              This week&apos;s count / periods needed in this window.
            </div>
          </div>
          <div className="p-2 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
            {palette.map((entry) => {
              const pal = sectionPalette(entry.subjectColor);
              const isArmed =
                armed?.programId === entry.programId &&
                armed?.subjectId === entry.subjectId &&
                armed?.trackId === entry.trackId;
              const thisWeek = placedThisWeek[entry.trackId] ?? 0;
              const windowPlaced = placedCounts[entry.trackId] ?? 0;
              const target = entry.target || 0;
              return (
                <button
                  key={entry.key}
                  onClick={() => setArmed(isArmed
                    ? null
                    : { programId: entry.programId, subjectId: entry.subjectId, trackId: entry.trackId })}
                  disabled={readOnly}
                  className={cn(
                    'text-left rounded-lg border p-1.5 transition-all shrink-0 lg:shrink w-44 lg:w-full',
                    isArmed
                      ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow'
                      : cn(pal.border, pal.surface, 'hover:shadow-sm'),
                    readOnly && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className={cn('text-xs font-semibold truncate', pal.text)}>
                      {entry.subjectName}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {showProgram && (
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1 rounded font-bold">
                          {entry.programCode}
                        </span>
                      )}
                      {entry.subjectHasMultipleTracks && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded font-bold">
                          {entry.trackName}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Top: this-week placement / window target */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-1 flex items-baseline justify-between gap-1.5 cursor-help">
                        <span className="text-[11px] tabular-nums">
                          <span className={cn(
                            'font-bold',
                            target > 0 && thisWeek >= 0 ? pal.text : 'text-slate-700',
                          )}>
                            {thisWeek}
                          </span>
                          <span className="text-slate-400"> / </span>
                          <span className="font-semibold text-slate-700">{target || '\u2014'}</span>
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wide">
                          this wk
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold">This week vs window target</p>
                      <p className="text-slate-500">
                        {thisWeek} periods placed in the selected week, out of {target || '—'} total periods required for this track across the whole active academic window.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  {target > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-1 h-3 flex items-center rounded-full bg-slate-100 overflow-hidden cursor-help">
                          <div className="h-1 w-full rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all',
                                windowPlaced >= target ? 'bg-emerald-500' : 'bg-indigo-400',
                              )}
                              style={{ width: `${Math.min(100, (windowPlaced / target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold">Window progress</p>
                        <p className="text-slate-500">
                          {windowPlaced} of {target} periods placed across the entire active window. Green means the track target is fully met.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {/* Bottom: window-total */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500 cursor-help">
                        <span>Window total</span>
                        <span className="tabular-nums">
                          <span className={cn(
                            'font-semibold',
                            target > 0 && windowPlaced >= target ? 'text-emerald-700' : 'text-slate-700',
                          )}>{windowPlaced}</span>
                          <span> / {target || '\u2014'}</span>
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold">Window total</p>
                      <p className="text-slate-500">
                        {windowPlaced} periods placed across the whole active academic window, against a target of {target || '—'} for this track.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </button>
              );
            })}
          </div>
        </div>

        {/* GRID */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: 56 }} />
              {section.config.workingDays.map((d) => (
                <col key={d} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="bg-slate-50 border-b border-r border-slate-200 px-1 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-left">
                  P
                </th>
                {section.config.workingDays.map((d) => {
                  const label = WEEKDAY_LABELS.find((w) => w.d === d);
                  return (
                    <th key={d} className="border-b border-slate-200 px-1 py-2 text-xs font-semibold text-slate-700 bg-slate-50 min-w-0">
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <span className="uppercase text-[11px] tracking-wider truncate">{label?.short}</span>
                        {!readOnly && (
                          <PlanDayMenu
                            palette={palette}
                            onApply={(keys, opts) => handlePlanDay(d as number, keys, opts)}
                            showProgram={showProgram}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: section.config.periodsPerDay }).map((_, p) => (
                <React.Fragment key={p}>
                  <tr>
                    <td className="bg-white border-b border-r border-slate-200 px-1 py-1.5 align-top">
                      <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-0.5 w-full">
                          <div className="text-[11px] font-bold text-slate-900">P{p + 1}</div>
                          {!readOnly && (
                            <FillRowMenu
                              palette={palette}
                              facultyPool={section.facultyPool}
                              facultyById={facultyById}
                              onApply={(key, fac, overwrite) => handleRowFill(p, key, fac, overwrite)}
                              showProgram={showProgram}
                            />
                          )}
                        </div>
                        <div className="text-[9px] text-slate-500 tabular-nums leading-tight">
                          {periodTimes[p]?.startTime}
                        </div>
                      </div>
                    </td>
                    {section.config.workingDays.map((d) => {
                      const cell = cellAt(d as number, p);
                      const k = cellKey(d as number, p);
                      return (
                        <td
                          key={d}
                          className={cn(
                            'border-b border-r border-slate-100 p-1 align-top h-20 min-w-0',
                            dragOverKey === k && 'bg-indigo-50',
                          )}
                          onDragOver={(e) => { if (dragKey && !readOnly) { e.preventDefault(); setDragOverKey(k); } }}
                          onDragLeave={() => setDragOverKey((cur) => (cur === k ? null : cur))}
                          onDrop={(e) => { e.preventDefault(); handleDrop(k); }}
                        >
                          <TimetableCell
                            section={section}
                            cell={cell}
                            armed={armed}
                            readOnly={readOnly}
                            slot={{ weekStartDate: weekStart, weekday: d, periodIndex: p }}
                            onClick={() => handleCellClick(d as number, p)}
                            onPickFromPalette={(entry) => {
                              tryPlace(
                                { weekStartDate: weekStart, weekday: d as never, periodIndex: p },
                                { programId: entry.programId, subjectId: entry.subjectId, trackId: entry.trackId },
                              );
                            }}
                            palette={palette}
                            facultyById={facultyById}
                            showProgram={showProgram}
                            onDragStart={() => setDragKey(k)}
                            onDragEnd={() => { setDragKey(null); setDragOverKey(null); }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  {section.config.breaks
                    ?.filter((b) => b.afterPeriod === p + 1)
                    .map((brk) => (
                      <tr key={brk.id}>
                        <td className="bg-amber-50 border-b border-r border-slate-200 px-1 py-0.5">
                          <div className="text-[9px] font-semibold text-amber-700 truncate">{brk.name}</div>
                          <div className="text-[9px] text-amber-600 tabular-nums">{brk.durationMins}m</div>
                        </td>
                        <td
                          colSpan={section.config.workingDays.length}
                          className="bg-amber-50 border-b border-slate-200 px-2 py-0.5 text-[10px] text-amber-700 italic"
                        >
                          Break
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!hideFooter && (
        <div className="flex items-center justify-between gap-2 pt-2">
          {onBack && <Button variant="outline" size="sm" onClick={onBack}>Back</Button>}
          {onNext && (
            <Button size="sm" onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700">
              Continue to Preview <Sparkles className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Conflict dialog */}
      <AlertDialog open={!!conflict} onOpenChange={(o) => !o && setConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              This slot already holds an allocation. Replacing will free the previous one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConflict(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (!conflict) return;
                setCellAllocation(section.id, conflict.slot, conflict.incoming, { force: true });
                toast.success('Allocation replaced');
                setConflict(null);
              }}
            >
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear-week dialog */}
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this week?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes all {stats.filled} placed cells in week starting {weekStart}. You can undo from the toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={performClearWeek}>
              Clear week
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy-week dialog */}
      <AlertDialog open={!!confirmCopy} onOpenChange={(o) => !o && setConfirmCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy this week to {confirmCopy?.targets.length} week(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite any existing cells in the target weeks. You can undo from the toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700" onClick={performCopy}>
              Copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};

/* ──────────────── Copy helpers ──────────────── */

type CopyMode = 'next' | 'next4' | 'remaining' | 'all';

function copyTargets(weekStarts: string[], srcIdx: number, mode: CopyMode): string[] {
  switch (mode) {
    case 'next': return weekStarts[srcIdx + 1] ? [weekStarts[srcIdx + 1]] : [];
    case 'next4': return weekStarts.slice(srcIdx + 1, srcIdx + 5);
    case 'remaining': return weekStarts.slice(srcIdx + 1);
    case 'all': return weekStarts.filter((_, i) => i !== srcIdx);
  }
}

/* ──────────────── Cell ──────────────── */

const TimetableCell: React.FC<{
  section: Section;
  cell: ReturnType<Section['cells']['find']>;
  armed: CellAllocation | null;
  readOnly?: boolean;
  slot: SlotKey;
  onClick: () => void;
  onPickFromPalette: (entry: PaletteEntry) => void;
  palette: PaletteEntry[];
  facultyById: Record<string, { id: string; name: string } | undefined>;
  showProgram: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ section, cell, armed, readOnly, slot, onClick, onPickFromPalette, palette, facultyById, showProgram, onDragStart, onDragEnd }) => {
  if (!cell) {
    const emptyBtn = (
      <button
        onClick={armed ? onClick : undefined}
        disabled={readOnly}
        className={cn(
          'w-full h-full min-h-[64px] rounded-md border border-dashed transition-all flex items-center justify-center',
          armed && !readOnly
            ? 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/50 hover:border-indigo-500 cursor-copy'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30',
        )}
      >
        <Plus className="h-3.5 w-3.5 text-slate-300" />
      </button>
    );
    if (armed || readOnly) return emptyBtn;
    return (
      <Popover>
        <PopoverTrigger asChild>{emptyBtn}</PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1 pb-1">
            Pick a subject
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {palette.map((entry) => {
              const pal = sectionPalette(entry.subjectColor);
              return (
                <button
                  key={entry.key}
                  onClick={() => onPickFromPalette(entry)}
                  className={cn(
                    'w-full text-left rounded-md border px-2 py-1.5 flex items-center justify-between gap-2 hover:shadow-sm',
                    pal.border, pal.surface,
                  )}
                >
                  <span className={cn('text-xs font-semibold truncate', pal.text)}>
                    {entry.subjectName}
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    {showProgram && (
                      <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1 rounded font-bold">
                        {entry.programCode}
                      </span>
                    )}
                    {entry.subjectHasMultipleTracks && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded font-bold">
                        {entry.trackName}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  const { programId, subjectId, trackId, facultyId } = cell.allocation;
  const program = section.programs.find((p) => p.id === programId);
  const subject = program?.subjects.find((s) => s.id === subjectId);
  const track = subject?.tracks.find((t) => t.id === trackId);
  if (!program || !subject || !track) return null;
  const pal = sectionPalette(subject.color);
  const fac = facultyById[facultyId ?? track.facultyId];
  const showTrack = subject.tracks.length > 1;

  const inner = (
    <div
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={armed && !readOnly ? onClick : undefined}
      className={cn(
        'w-full h-full min-h-[64px] rounded-md border text-left p-1 transition-all group',
        pal.surface, pal.border,
        !readOnly && 'hover:shadow-md cursor-grab active:cursor-grabbing',
      )}
    >
      <div className="flex items-center gap-1 mb-1">
        {showProgram && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded bg-indigo-100 text-indigo-800">
            {program.code}
          </span>
        )}
        {showTrack && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded bg-amber-100 text-amber-800 ml-auto">
            {track.name}
          </span>
        )}
        {!readOnly && (
          <GripVertical className={cn('h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100', !showTrack && 'ml-auto')} />
        )}
      </div>
      <div className={cn('text-xs font-bold truncate', pal.text)}>{subject.name}</div>
      <div className="text-[10px] text-slate-600 truncate mt-0.5">
        {fac ? shortName(fac.name) : 'no faculty'}
      </div>
    </div>
  );

  if (armed || readOnly) return inner;

  return (
    <Popover>
      <PopoverTrigger asChild>{inner}</PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="start">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          {showProgram && `${program.code} · `}{subject.name}{showTrack && ` · ${track.name}`}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-600">Faculty</label>
          <Select
            value={facultyId ?? track.facultyId}
            onValueChange={(v) => setCellFaculty(section.id, slot, v === track.facultyId ? undefined : v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {section.facultyPool.map((fid) => {
                const f = facultyById[fid];
                if (!f) return null;
                return <SelectItem key={fid} value={fid} className="text-xs">{shortName(f.name)}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => { clearCell(section.id, slot); toast('Cell cleared'); }}
          className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md"
        >
          <Trash2 className="h-3 w-3" /> Clear cell
        </button>
      </PopoverContent>
    </Popover>
  );
};

/* ──────────────── Plan-day (column) menu ──────────────── */

const PlanDayMenu: React.FC<{
  palette: PaletteEntry[];
  onApply: (orderedKeys: string[], opts: { overwrite: boolean; repeat: boolean }) => void;
  showProgram: boolean;
}> = ({ palette, onApply, showProgram }) => {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [repeat, setRepeat] = useState(true);

  const add = (k: string) => setPicked((p) => [...p, k]);
  const remove = (i: number) => setPicked((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    setPicked((p) => {
      const next = [...p];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPicked([]); }}>
      <PopoverTrigger asChild>
        <button className="p-0.5 rounded hover:bg-slate-200 text-slate-500" aria-label="Plan this day">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3" align="start">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900">Plan this day</div>
          <DevNote title="Plan-day rules">
            <p>Cells are filled top-down through the day's periods in the order you list.</p>
            <p><b>Overwrite</b>: replace already-filled periods.</p>
            <p><b>Repeat</b>: loop the list to fill remaining periods.</p>
          </DevNote>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Order</div>
          {picked.length === 0 && (
            <div className="text-[11px] text-slate-400 italic">Add subjects below</div>
          )}
          {picked.map((k, i) => {
            const e = palette.find((p) => p.key === k);
            if (!e) return null;
            return (
              <div key={`${k}-${i}`} className="flex items-center gap-1 px-1.5 py-1 bg-slate-50 rounded text-[11px]">
                <span className="w-4 text-slate-400">{i + 1}.</span>
                <span className="flex-1 truncate">
                  {e.subjectName}
                  {showProgram && <span className="text-slate-500"> · {e.programCode}</span>}
                  {e.subjectHasMultipleTracks && <span className="text-slate-500"> · {e.trackName}</span>}
                </span>
                <button onClick={() => move(i, -1)} className="text-slate-400 hover:text-slate-700 px-1">↑</button>
                <button onClick={() => move(i, 1)} className="text-slate-400 hover:text-slate-700 px-1">↓</button>
                <button onClick={() => remove(i)} className="text-rose-500 hover:text-rose-700 px-1"><X className="h-3 w-3" /></button>
              </div>
            );
          })}
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Add subject</div>
          <Select onValueChange={(v) => add(v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick…" /></SelectTrigger>
            <SelectContent>
              {palette.map((e) => (
                <SelectItem key={e.key} value={e.key} className="text-xs">
                  {e.subjectName}
                  {showProgram && ` · ${e.programCode}`}
                  {e.subjectHasMultipleTracks && ` · ${e.trackName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[11px] text-slate-700">
            <Checkbox checked={overwrite} onCheckedChange={(v) => setOverwrite(!!v)} /> Overwrite filled periods
          </label>
          <label className="flex items-center gap-2 text-[11px] text-slate-700">
            <Checkbox checked={repeat} onCheckedChange={(v) => setRepeat(!!v)} /> Repeat to fill remaining
          </label>
        </div>
        <Button
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          disabled={picked.length === 0}
          onClick={() => { onApply(picked, { overwrite, repeat }); setOpen(false); setPicked([]); }}
        >
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
};

/* ──────────────── Fill-row (period) menu ──────────────── */

const FillRowMenu: React.FC<{
  palette: PaletteEntry[];
  facultyPool: string[];
  facultyById: Record<string, { id: string; name: string } | undefined>;
  onApply: (key: string | null, faculty: string | undefined, overwrite: boolean) => void;
  showProgram: boolean;
}> = ({ palette, facultyPool, facultyById, onApply, showProgram }) => {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<string>('');
  const [fac, setFac] = useState<string>('');
  const [overwrite, setOverwrite] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-0.5 rounded hover:bg-slate-200 text-slate-500" aria-label="Row menu">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="start">
        <div className="text-xs font-bold text-slate-900">Fill this period across the week</div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Subject / track</label>
          <Select value={pick} onValueChange={setPick}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick…" /></SelectTrigger>
            <SelectContent>
              {palette.map((e) => (
                <SelectItem key={e.key} value={e.key} className="text-xs">
                  {e.subjectName}
                  {showProgram && ` · ${e.programCode}`}
                  {e.subjectHasMultipleTracks && ` · ${e.trackName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Faculty override</label>
          <Select value={fac} onValueChange={setFac}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Default from track" /></SelectTrigger>
            <SelectContent>
              {facultyPool.map((fid) => {
                const f = facultyById[fid];
                if (!f) return null;
                return <SelectItem key={fid} value={fid} className="text-xs">{shortName(f.name)}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-[11px] text-slate-700">
          <Checkbox checked={overwrite} onCheckedChange={(v) => setOverwrite(!!v)} /> Overwrite occupied cells
        </label>
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            disabled={!pick}
            onClick={() => { onApply(pick, fac || undefined, overwrite); setOpen(false); setPick(''); setFac(''); setOverwrite(false); }}
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-rose-700 border-rose-200 hover:bg-rose-50"
            onClick={() => { onApply(null, undefined, false); setOpen(false); }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function shortName(full: string): string {
  return full.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '');
}
