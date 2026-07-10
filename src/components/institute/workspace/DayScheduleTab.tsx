import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Plus, Save, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CellAllocation, CellOccupiedError, Section, SectionSubject, SlotKey,
  slotKeyEq,
} from '@/types/section';
import { WeekDay } from '@/types/instituteProgram';
import { WEEKDAY_LABELS } from '@/utils/sectionUtils';
import {
  addDays, isoWeekStart, parseISO, toISO,
} from '@/utils/calendarAutomation';
import {
  clearCell, setCellAllocation, swapCells,
} from '@/hooks/useSection';
import { useFaculty } from '@/hooks/useInstitutePrograms';
import { sectionPalette } from '@/lib/sectionColors';
import { DevNote } from '@/components/dev/DevNote';
import { cn } from '@/lib/utils';

interface Props {
  sections: Section[];
  /** Optional starting section id — used to focus the picker on load. */
  focusSectionId?: string;
}

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
  subjectHasMultipleTracks: boolean;
  showProgram: boolean;
}

function buildPalette(section: Section): PaletteEntry[] {
  const showProgram = section.programs.length > 1;
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
        subjectHasMultipleTracks: s.tracks.length > 1,
        showProgram,
      })),
    ),
  );
}

/** Build a global week list spanning every section's earliest window start to latest end. */
function buildGlobalWeekStarts(sections: Section[]): string[] {
  let min: string | null = null;
  let max: string | null = null;
  for (const s of sections) {
    for (const w of s.windows) {
      if (!min || w.startDate < min) min = w.startDate;
      if (!max || w.endDate > max) max = w.endDate;
    }
  }
  if (!min || !max) return [];
  const out: string[] = [];
  let cursor = isoWeekStart(min);
  const endMs = parseISO(max).getTime();
  while (parseISO(cursor).getTime() <= endMs) {
    out.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return out;
}

/** Resolve which window (if any) of a section is active for a given week Monday. */
function resolveActiveWindow(section: Section, weekStart: string) {
  const wsMs = parseISO(weekStart).getTime();
  return section.windows.find((w) => {
    const s = parseISO(w.startDate).getTime();
    const e = parseISO(w.endDate).getTime();
    return wsMs >= s && wsMs <= e && w.locked !== true;
  });
}

function allocIdentity(a: CellAllocation, fallbackFacultyId?: string): string {
  const fid = a.facultyId ?? fallbackFacultyId ?? '';
  return `${a.programId}|${a.subjectId}|${a.trackId}|${fid}`;
}

function trackFallbackFaculty(section: Section, a: CellAllocation): string | undefined {
  const p = section.programs.find((x) => x.id === a.programId);
  const s = p?.subjects.find((x) => x.id === a.subjectId);
  const t = s?.tracks.find((x) => x.id === a.trackId);
  return t?.facultyId;
}

export const DayScheduleTab: React.FC<Props> = ({ sections, focusSectionId }) => {
  const facultyList = useFaculty();
  const facultyById = useMemo(
    () => Object.fromEntries(facultyList.map((f) => [f.id, f])),
    [facultyList],
  );

  const globalWeekStarts = useMemo(() => buildGlobalWeekStarts(sections), [sections]);

  // Default week: the current week (or first available).
  const initialWeek = useMemo(() => {
    const today = isoWeekStart(toISO(new Date()));
    if (globalWeekStarts.includes(today)) return today;
    // pick first week that has any active window across sections
    for (const ws of globalWeekStarts) {
      if (sections.some((s) => resolveActiveWindow(s, ws))) return ws;
    }
    return globalWeekStarts[0];
  }, [globalWeekStarts, sections]);

  const [weekStart, setWeekStart] = useState<string>(initialWeek);
  const [weekday, setWeekday] = useState<WeekDay>(1); // Monday

  const weekIdx = globalWeekStarts.indexOf(weekStart);

  // Rows: one per section. Editable iff has active window covering this week AND workingDays includes this weekday.
  const rows = useMemo(() => {
    return sections.map((section) => {
      const win = resolveActiveWindow(section, weekStart);
      const isWorkingDay = section.config.workingDays.includes(weekday);
      const reason = !win
        ? 'No active academic window covers this week'
        : !isWorkingDay
          ? `${WEEKDAY_LABELS.find((w) => w.d === weekday)?.long} is not a working day for this section`
          : null;
      return {
        section,
        window: win,
        isEditable: !!win && isWorkingDay,
        reason,
        periodsPerDay: section.config.periodsPerDay,
      };
    });
  }, [sections, weekStart, weekday]);

  const maxPeriods = useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.periodsPerDay), 0),
    [rows],
  );

  // Focus a row (for a rail-style palette; default = focusSectionId or first editable).
  const defaultFocus =
    focusSectionId && rows.some((r) => r.section.id === focusSectionId && r.isEditable)
      ? focusSectionId
      : rows.find((r) => r.isEditable)?.section.id;
  const [focused, setFocused] = useState<string | undefined>(defaultFocus);
  React.useEffect(() => {
    if (!focused || !rows.some((r) => r.section.id === focused && r.isEditable)) {
      const next = rows.find((r) => r.isEditable)?.section.id;
      setFocused(next);
    }
  }, [rows, focused]);

  const focusedRow = rows.find((r) => r.section.id === focused);
  const focusedPalette = useMemo(
    () => (focusedRow ? buildPalette(focusedRow.section) : []),
    [focusedRow],
  );
  const [armed, setArmed] = useState<CellAllocation | null>(null);

  // Drag identity — encoded as `${sectionId}#${periodIndex}`
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const placeCell = (
    section: Section,
    period: number,
    allocation: CellAllocation,
  ) => {
    const slot: SlotKey = { weekStartDate: weekStart, weekday, periodIndex: period };
    try {
      setCellAllocation(section.id, slot, allocation);
      toast.success(`${section.name} · P${period + 1} placed`);
    } catch (e) {
      if (e instanceof CellOccupiedError) {
        setCellAllocation(section.id, slot, allocation, { force: true });
        toast.success(`${section.name} · P${period + 1} replaced`);
      }
    }
  };

  const clearAt = (section: Section, period: number) => {
    clearCell(section.id, { weekStartDate: weekStart, weekday, periodIndex: period });
    toast('Cell cleared');
  };

  const handleDrop = (dstSectionId: string, dstPeriod: number) => {
    if (!dragKey) return;
    const [srcSectionId, srcPeriodStr] = dragKey.split('#');
    const srcPeriod = Number(srcPeriodStr);
    setDragKey(null);
    setDragOverKey(null);
    if (srcSectionId === dstSectionId && srcPeriod === dstPeriod) return;

    const srcRow = rows.find((r) => r.section.id === srcSectionId);
    const dstRow = rows.find((r) => r.section.id === dstSectionId);
    if (!srcRow || !dstRow) return;
    if (!dstRow.isEditable) {
      toast.error("Can't drop here — target section has no active window for this week");
      return;
    }

    const srcCell = srcRow.section.cells.find((c) =>
      slotKeyEq(c, { weekStartDate: weekStart, weekday, periodIndex: srcPeriod }),
    );
    const dstCell = dstRow.section.cells.find((c) =>
      slotKeyEq(c, { weekStartDate: weekStart, weekday, periodIndex: dstPeriod }),
    );

    // Same-section swap uses existing helper.
    if (srcSectionId === dstSectionId) {
      swapCells(
        srcSectionId,
        { weekStartDate: weekStart, weekday, periodIndex: srcPeriod },
        { weekStartDate: weekStart, weekday, periodIndex: dstPeriod },
      );
      toast.success('Swapped');
      return;
    }

    // Cross-section: enforce allocation identity.
    if (srcCell && dstCell) {
      const idA = allocIdentity(
        srcCell.allocation,
        trackFallbackFaculty(srcRow.section, srcCell.allocation),
      );
      const idB = allocIdentity(
        dstCell.allocation,
        trackFallbackFaculty(dstRow.section, dstCell.allocation),
      );
      if (idA !== idB) {
        toast.error("Can't swap across sections — different subject / track / faculty");
        return;
      }
    }

    // Perform cross-section swap (or move if one side empty).
    const srcSlot: SlotKey = { weekStartDate: weekStart, weekday, periodIndex: srcPeriod };
    const dstSlot: SlotKey = { weekStartDate: weekStart, weekday, periodIndex: dstPeriod };
    if (srcCell) {
      setCellAllocation(dstSectionId, dstSlot, srcCell.allocation, { force: true });
      clearCell(srcSectionId, srcSlot);
    }
    if (dstCell) {
      setCellAllocation(srcSectionId, srcSlot, dstCell.allocation, { force: true });
    }
    toast.success('Cross-section move complete');
  };

  const weekdayLabel = WEEKDAY_LABELS.find((w) => w.d === weekday)?.long ?? '';

  return (
    <TooltipProvider delayDuration={120}>
    <div className="space-y-3">
      {/* Scope pickers */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-3 md:p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">Day-direction planning</div>
            <DevNote title="Why Day view is scoped to one week">
              <p>Day view is <b>always scoped to one specific week + one weekday</b>. It never spans
              the whole academic window.</p>
              <p><b>Rationale:</b> different sections have different academic windows (Term 1 vs Term 2
              can start on different dates). Fanning a day across the entire calendar would produce
              cross-window publish conflicts.</p>
              <p>Once you finish a day here, switch to <b>Week view</b> for that section and use
              <b> Copy to weeks…</b> to fan the pattern across the rest of the window.</p>
              <p><b>Draft / Publish is unchanged:</b> every edit here writes into the target section's
              currently-active window. Draft/publish status stays per (section, window), identical to
              Week view — no reconciliation.</p>
            </DevNote>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Week selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Week</span>
              <Button
                size="icon" variant="outline" className="h-8 w-8"
                onClick={() => setWeekStart(globalWeekStarts[Math.max(0, weekIdx - 1)])}
                disabled={weekIdx <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={weekStart} onValueChange={setWeekStart}>
                <SelectTrigger className="w-56 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {globalWeekStarts.map((ws, i) => (
                    <SelectItem key={ws} value={ws} className="text-xs">
                      W{i + 1} · week of {new Date(ws).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon" variant="outline" className="h-8 w-8"
                onClick={() => setWeekStart(globalWeekStarts[Math.min(globalWeekStarts.length - 1, weekIdx + 1)])}
                disabled={weekIdx >= globalWeekStarts.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekday pills */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mr-1">Weekday</span>
              {WEEKDAY_LABELS.filter((w) => w.d !== 0).map((w) => {
                const active = w.d === weekday;
                return (
                  <button
                    key={w.d}
                    onClick={() => setWeekday(w.d)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all',
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400',
                    )}
                  >
                    {w.short}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />
            <Badge variant="outline" className="text-[10px]">
              {rows.filter((r) => r.isEditable).length} / {rows.length} sections editable
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => toast.success('Draft auto-saved for all edits in this week')}
            >
              <Save className="h-3.5 w-3.5 mr-1" /> Save as Draft
            </Button>
            <DevNote title="Publish lives in Week view">
              <p>Day view only supports <b>Save as Draft</b>. Every edit is already persisted per
              (section, window) — this button just confirms.</p>
              <p><b>Publish</b> happens in <b>Week view</b>, where you can see the whole week for one
              section before promoting the timetable.</p>
            </DevNote>
          </div>
        </CardContent>
      </Card>

      {/* Body: focused-section palette rail + day grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(170px,15%)_1fr] gap-3 items-start">
        {/* Palette rail for the focused section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-3">
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Placing into</div>
              <div className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                {focusedRow?.section.name ?? '—'}
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                {focusedRow?.window?.label ?? (focusedRow?.window ? `${focusedRow.window.startDate} → ${focusedRow.window.endDate}` : 'No active window')}
              </div>
            </div>
            <DevNote title="Palette scope">
              <p>Day view can only place cards from <b>one section at a time</b>. Click a section's row header on the right to focus it here.</p>
              <p>Use the per-row <b>Autofill</b> button to fill an entire section row at once.</p>
            </DevNote>
          </div>
          <div className="p-1 flex flex-col gap-1 max-h-[calc(100vh-260px)] overflow-y-auto">
            {focusedPalette.length === 0 && (
              <div className="text-[10px] text-slate-400 italic px-2 py-3">
                Focus an editable section row to see its subject cards.
              </div>
            )}
            {focusedPalette.map((entry) => {
              const pal = sectionPalette(entry.subjectColor);
              const isArmed =
                armed?.programId === entry.programId &&
                armed?.subjectId === entry.subjectId &&
                armed?.trackId === entry.trackId;
              return (
                <Tooltip key={entry.key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setArmed(isArmed
                        ? null
                        : { programId: entry.programId, subjectId: entry.subjectId, trackId: entry.trackId })}
                      className={cn(
                        'text-left rounded-md border px-1.5 py-1 transition-all flex items-center gap-1 min-w-0',
                        isArmed
                          ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow'
                          : cn(pal.border, pal.surface, 'hover:shadow-sm'),
                      )}
                    >
                      <span className={cn('text-[11px] font-semibold truncate flex-1 min-w-0', pal.text)}>
                        {entry.subjectName}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        {entry.showProgram && (
                          <span className="bg-indigo-100 text-indigo-800 text-[8px] px-1 rounded font-bold leading-tight">
                            {entry.programCode}
                          </span>
                        )}
                        {entry.subjectHasMultipleTracks && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] px-1 rounded font-bold leading-tight">
                            {entry.trackName}
                          </span>
                        )}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px]">
                    {entry.subjectName}
                    {entry.subjectHasMultipleTracks && ` · ${entry.trackName}`}
                    <div className="text-slate-400">{facultyById[entry.facultyId]?.name ?? 'no faculty'}</div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {armed && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-[11px]"
                onClick={() => setArmed(null)}
              >
                Disarm
              </Button>
            )}
          </div>
        </div>

        {/* Day grid: rows = sections, cols = periods */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {weekdayLabel} · week of {weekStart}
            </div>
            <span className="text-[11px] text-slate-500">
              · {rows.length} sections across the institute
            </span>
            <div className="flex-1" />
            <DevNote title="Cross-section drag / swap rule">
              <p><b>Identity key</b> = <code>programId | subjectId | trackId | facultyId</code>.</p>
              <p>Within the same row: any swap works.</p>
              <p>Across rows: swap allowed <b>only if both cells share the same identity</b>
              (e.g. Physics&nbsp;T1&nbsp;·&nbsp;Faculty&nbsp;A ↔ Physics&nbsp;T1&nbsp;·&nbsp;Faculty&nbsp;A).
              Different faculty = different card, per requirement.</p>
              <p>Empty target: allowed if the target section's window is active for this week.</p>
              <p>Backend contract mirrors these rules exactly.</p>
            </DevNote>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col style={{ width: 180 }} />
                {Array.from({ length: maxPeriods }).map((_, i) => (
                  <col key={i} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="bg-slate-50 border-b border-r border-slate-200 px-2 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-left">
                    Section
                  </th>
                  {Array.from({ length: maxPeriods }).map((_, i) => (
                    <th key={i} className="border-b border-slate-200 px-1 py-2 text-[11px] font-semibold text-slate-700 bg-slate-50 text-center min-w-[110px]">
                      P{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isFocused = focused === row.section.id;
                  const showProgram = row.section.programs.length > 1;
                  return (
                    <tr
                      key={row.section.id}
                      className={cn(
                        !row.isEditable && 'bg-slate-50/60',
                        isFocused && row.isEditable && 'bg-indigo-50/30',
                      )}
                    >
                      <td
                        onClick={() => row.isEditable && setFocused(row.section.id)}
                        className={cn(
                          'border-b border-r border-slate-200 px-2 py-2 align-top',
                          row.isEditable ? 'cursor-pointer hover:bg-indigo-50' : 'cursor-not-allowed',
                        )}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isFocused && row.isEditable && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            )}
                            <span className={cn(
                              'text-xs font-semibold truncate',
                              row.isEditable ? 'text-slate-900' : 'text-slate-400',
                            )}>
                              {row.section.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {row.section.className}
                          </div>
                          {row.isEditable ? (
                            <Badge
                              className={cn(
                                'text-[9px] px-1.5 py-0 w-fit mt-0.5',
                                (row.window?.status ?? 'draft') === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100',
                              )}
                            >
                              {row.window?.status ?? 'draft'} · {row.window?.label ?? 'window'}
                            </Badge>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[9px] text-slate-400 italic mt-0.5 cursor-help">
                                  No active window
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="font-semibold">Row disabled</p>
                                <p className="text-slate-500">{row.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>

                      {Array.from({ length: maxPeriods }).map((_, p) => {
                        if (p >= row.periodsPerDay) {
                          return (
                            <td key={p} className="border-b border-r border-slate-100 bg-slate-50/40" />
                          );
                        }
                        if (!row.isEditable) {
                          return (
                            <td key={p} className="border-b border-r border-slate-100 bg-slate-50/40" />
                          );
                        }
                        const cell = row.section.cells.find((c) =>
                          slotKeyEq(c, { weekStartDate: weekStart, weekday, periodIndex: p }),
                        );
                        const k = `${row.section.id}#${p}`;
                        return (
                          <td
                            key={p}
                            className={cn(
                              'border-b border-r border-slate-100 p-1 align-top h-20 min-w-0',
                              dragOverKey === k && 'bg-indigo-50',
                            )}
                            onDragOver={(e) => { if (dragKey) { e.preventDefault(); setDragOverKey(k); } }}
                            onDragLeave={() => setDragOverKey((cur) => (cur === k ? null : cur))}
                            onDrop={(e) => { e.preventDefault(); handleDrop(row.section.id, p); }}
                          >
                            <DayCell
                              section={row.section}
                              cell={cell}
                              armed={armed}
                              isFocused={isFocused}
                              showProgram={showProgram}
                              facultyById={facultyById}
                              onPlaceArmed={() => {
                                if (!armed) return;
                                if (!isFocused) {
                                  toast.error('Focus this section first (click its row header) to place armed subject');
                                  return;
                                }
                                placeCell(row.section, p, armed);
                              }}
                              onPickFromPalette={(alloc) => placeCell(row.section, p, alloc)}
                              onClear={() => clearAt(row.section, p)}
                              onDragStart={() => setDragKey(k)}
                              onDragEnd={() => { setDragKey(null); setDragOverKey(null); }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

/* ─────────────── DayCell ─────────────── */

const DayCell: React.FC<{
  section: Section;
  cell: Section['cells'][number] | undefined;
  armed: CellAllocation | null;
  isFocused: boolean;
  showProgram: boolean;
  facultyById: Record<string, { id: string; name: string } | undefined>;
  onPlaceArmed: () => void;
  onPickFromPalette: (a: CellAllocation) => void;
  onClear: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({
  section, cell, armed, isFocused, showProgram, facultyById,
  onPlaceArmed, onPickFromPalette, onClear, onDragStart, onDragEnd,
}) => {
  if (!cell) {
    const emptyBtn = (
      <button
        onClick={armed ? onPlaceArmed : undefined}
        className={cn(
          'w-full h-full min-h-[64px] rounded-md border border-dashed transition-all flex items-center justify-center',
          armed && isFocused
            ? 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/50 hover:border-indigo-500 cursor-copy'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30',
        )}
      >
        <Plus className="h-3.5 w-3.5 text-slate-300" />
      </button>
    );
    if (armed) return emptyBtn;
    return (
      <Popover>
        <PopoverTrigger asChild>{emptyBtn}</PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1 pb-1">
            Pick a subject for {section.name}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {buildPalette(section).map((entry) => {
              const pal = sectionPalette(entry.subjectColor);
              return (
                <button
                  key={entry.key}
                  onClick={() => onPickFromPalette({
                    programId: entry.programId,
                    subjectId: entry.subjectId,
                    trackId: entry.trackId,
                  })}
                  className={cn(
                    'w-full text-left rounded-md border px-2 py-1.5 flex items-center justify-between gap-2 hover:shadow-sm',
                    pal.border, pal.surface,
                  )}
                >
                  <span className={cn('text-xs font-semibold truncate', pal.text)}>
                    {entry.subjectName}
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    {entry.showProgram && (
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
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'w-full h-full min-h-[64px] rounded-md border text-left p-1 transition-all group cursor-grab active:cursor-grabbing',
        pal.surface, pal.border, 'hover:shadow-md',
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
        <GripVertical className={cn('h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100', !showTrack && 'ml-auto')} />
      </div>
      <div className={cn('text-xs font-bold truncate', pal.text)}>{subject.name}</div>
      <div className="text-[10px] text-slate-600 truncate mt-0.5">
        {fac ? fac.name.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '') : 'no faculty'}
      </div>
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{inner}</PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-2" align="start">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          {showProgram && `${program.code} · `}{subject.name}{showTrack && ` · ${track.name}`}
        </div>
        <div className="text-[10px] text-slate-500">
          {fac?.name ?? 'no faculty'} · {section.name}
        </div>
        <button
          onClick={onClear}
          className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md"
        >
          <Trash2 className="h-3 w-3" /> Clear cell
        </button>
      </PopoverContent>
    </Popover>
  );
};
