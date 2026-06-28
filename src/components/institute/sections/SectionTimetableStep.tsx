import React, { useMemo, useState } from 'react';
import {
  ChevronDown, ChevronRight, MoreHorizontal, Sparkles, Trash2, Users, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  CellAllocation, CellOccupiedError, Section, SlotKey, slotKeyEq,
} from '@/types/section';
import {
  clearCell, fillSlotsSkippingOccupied, setCellAllocation, setCellFaculty,
} from '@/hooks/useSection';
import { useFaculty } from '@/hooks/useInstitutePrograms';
import {
  WEEKDAY_LABELS, computePeriodTimes, listWeekStarts, placedByTrack, totalAllocated,
} from '@/utils/sectionUtils';
import { sectionPalette, trackPattern } from '@/lib/sectionColors';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  onBack: () => void;
  onNext: () => void;
}

export const SectionTimetableStep: React.FC<Props> = ({ section, onBack, onNext }) => {
  const facultyList = useFaculty();
  const weekStarts = useMemo(() => listWeekStarts(section.windows[section.windows.length - 1]), [section.windows]);
  const [weekIdx, setWeekIdx] = useState(0);
  const weekStart = weekStarts[weekIdx] ?? weekStarts[0];

  // Currently "armed" allocation — clicking a cell paints this in.
  const [armed, setArmed] = useState<CellAllocation | null>(null);

  // Conflict dialog state.
  const [conflict, setConflict] = useState<{
    slot: SlotKey;
    incoming: CellAllocation;
    existing: CellAllocation;
  } | null>(null);

  const periodTimes = useMemo(
    () => computePeriodTimes({
      ...section.config,
      startDate: section.windows[0]?.startDate ?? '',
      defaultFaculty: {},
    } as never),
    [section.config, section.windows],
  );

  const placedCounts = useMemo(() => placedByTrack(section), [section]);
  const facultyById = useMemo(() => Object.fromEntries(facultyList.map((f) => [f.id, f])), [facultyList]);
  const showProgram = section.programs.length > 1;

  const cellAt = (weekday: number, periodIndex: number) =>
    section.cells.find((c) =>
      slotKeyEq(c, { weekStartDate: weekStart, weekday: weekday as never, periodIndex }),
    );

  const tryPlace = (slot: SlotKey, allocation: CellAllocation) => {
    try {
      setCellAllocation(section.id, slot, allocation);
      toast.success(`Placed in ${WEEKDAY_LABELS.find((w) => w.d === slot.weekday)?.short} · P${slot.periodIndex + 1}`);
    } catch (e) {
      if (e instanceof CellOccupiedError) {
        setConflict({ slot, incoming: allocation, existing: e.existing });
      }
    }
  };

  const handleCellClick = (weekday: number, periodIndex: number) => {
    if (!armed) {
      toast('Pick a subject + track from the palette first', { icon: '👈' });
      return;
    }
    const slot: SlotKey = { weekStartDate: weekStart, weekday: weekday as never, periodIndex };
    tryPlace(slot, armed);
  };

  const handleRowFill = (weekday: number) => {
    if (!armed) {
      toast('Arm a subject first');
      return;
    }
    const slots: SlotKey[] = Array.from({ length: section.config.periodsPerDay }, (_, p) => ({
      weekStartDate: weekStart, weekday: weekday as never, periodIndex: p,
    }));
    const { filled, skipped } = fillSlotsSkippingOccupied(section.id, slots, armed);
    toast.success(`Filled ${filled} of ${slots.length}${skipped ? ` · ${skipped} already taken` : ''}`);
  };

  const handleColumnFill = (periodIndex: number) => {
    if (!armed) { toast('Arm a subject first'); return; }
    const slots: SlotKey[] = section.config.workingDays.map((d) => ({
      weekStartDate: weekStart, weekday: d, periodIndex,
    }));
    const { filled, skipped } = fillSlotsSkippingOccupied(section.id, slots, armed);
    toast.success(`Filled ${filled} of ${slots.length}${skipped ? ` · ${skipped} already taken` : ''}`);
  };

  const armedLabel = useMemo(() => {
    if (!armed) return null;
    const p = section.programs.find((p) => p.id === armed.programId);
    const su = p?.subjects.find((s) => s.id === armed.subjectId);
    const t = su?.tracks.find((tr) => tr.id === armed.trackId);
    return { program: p, subject: su, track: t };
  }, [armed, section.programs]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
        {/* ── PALETTE ────────────────────────────────────────────── */}
        <aside className="xl:sticky xl:top-2 self-start space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Palette</div>
              <div className="text-sm font-semibold text-slate-900">Subjects · Tracks</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tap one to arm it, then click cells to place</div>
            </div>
            <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-2 space-y-3">
              {section.programs.map((program) => (
                <ProgramPaletteGroup
                  key={program.id}
                  program={program}
                  armed={armed}
                  onArm={setArmed}
                  placedCounts={placedCounts}
                />
              ))}
            </div>
          </div>

          {armedLabel?.subject && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
              <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold">Armed</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {armedLabel.program?.code} · {armedLabel.subject.name} · {armedLabel.track?.name}
                </div>
                <button
                  onClick={() => setArmed(null)}
                  className="p-1 rounded hover:bg-white text-slate-500 hover:text-slate-900"
                  aria-label="Disarm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ── GRID ──────────────────────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          {/* Week chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {weekStarts.map((ws, i) => (
              <button
                key={ws}
                onClick={() => setWeekIdx(i)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  i === weekIdx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300',
                )}
              >
                Week {i + 1}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-16 sticky left-0 z-10 bg-slate-50 border-b border-r border-slate-200 px-2 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      Period
                    </th>
                    {section.config.workingDays.map((d) => {
                      const label = WEEKDAY_LABELS.find((w) => w.d === d);
                      return (
                        <th key={d} className="border-b border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 bg-slate-50">
                          <div className="flex items-center justify-between gap-1">
                            <span>{label?.short}</span>
                            <RowMenu onFillRow={() => handleRowFill(d)} />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: section.config.periodsPerDay }).map((_, p) => (
                    <tr key={p}>
                      <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-2 py-2 align-top">
                        <div className="text-xs font-semibold text-slate-900">P{p + 1}</div>
                        <div className="text-[10px] text-slate-500 tabular-nums">
                          {periodTimes[p]?.startTime}
                        </div>
                        <button
                          onClick={() => handleColumnFill(p)}
                          className="mt-1 text-[9px] text-slate-400 hover:text-indigo-600 uppercase font-semibold"
                          title="Fill column"
                        >
                          fill col
                        </button>
                      </td>
                      {section.config.workingDays.map((d) => {
                        const cell = cellAt(d as number, p);
                        return (
                          <td key={d} className="border-b border-r border-slate-100 p-1.5 align-top h-20">
                            <TimetableCell
                              section={section}
                              cell={cell}
                              armed={armed}
                              slot={{ weekStartDate: weekStart, weekday: d, periodIndex: p }}
                              onClick={() => handleCellClick(d as number, p)}
                              facultyById={facultyById}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              {section.cells.length} of {totalAllocated(section)} allocated periods placed across all weeks
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
              <Button size="sm" onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700">
                Continue to Preview <Sparkles className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ── CONFLICT DIALOG ─────────────────────────────────────── */}
      <AlertDialog open={!!conflict} onOpenChange={(o) => !o && setConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              {conflict && (
                <ConflictBody
                  section={section}
                  incoming={conflict.incoming}
                  existing={conflict.existing}
                />
              )}
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
    </TooltipProvider>
  );
};

/* ──────────────── Sub-components ──────────────── */

const ProgramPaletteGroup: React.FC<{
  program: Section['programs'][number];
  armed: CellAllocation | null;
  onArm: (a: CellAllocation | null) => void;
  placedCounts: Record<string, number>;
}> = ({ program, armed, onArm, placedCounts }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl bg-slate-50/70 border border-slate-200/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{program.code}</span>
        </div>
        <span className="text-[10px] text-slate-500">{program.subjects.length} subj</span>
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-1.5">
          {program.subjects.map((su) => (
            <div key={su.id} className="space-y-1">
              <div className="px-1 text-[11px] font-semibold text-slate-600">{su.name}</div>
              {su.tracks.map((tr, tIdx) => {
                const pal = sectionPalette(su.color);
                const isArmed = armed?.programId === program.id && armed?.subjectId === su.id && armed?.trackId === tr.id;
                const placed = placedCounts[tr.id] ?? 0;
                const target = tr.allottedPeriods || 0;
                return (
                  <button
                    key={tr.id}
                    onClick={() => onArm(isArmed ? null : { programId: program.id, subjectId: su.id, trackId: tr.id })}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all border',
                      isArmed
                        ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow-sm'
                        : 'border-transparent bg-white hover:border-slate-300',
                    )}
                  >
                    <span
                      className={cn('h-5 w-5 rounded shrink-0', pal.solid)}
                      style={trackPattern(tIdx)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">{tr.name}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {placed}/{target || '—'} placed
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TimetableCell: React.FC<{
  section: Section;
  cell: ReturnType<Section['cells']['find']>;
  armed: CellAllocation | null;
  slot: SlotKey;
  onClick: () => void;
  facultyById: Record<string, { id: string; name: string } | undefined>;
}> = ({ section, cell, armed, slot, onClick, facultyById }) => {
  if (!cell) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full h-full min-h-[68px] rounded-lg border-2 border-dashed transition-all',
          armed
            ? 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/50 hover:border-indigo-500'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
        )}
      >
        <span className="text-lg text-slate-300">＋</span>
      </button>
    );
  }
  const { programId, subjectId, trackId, facultyId } = cell.allocation;
  const program = section.programs.find((p) => p.id === programId);
  const subject = program?.subjects.find((s) => s.id === subjectId);
  const track = subject?.tracks.find((t) => t.id === trackId);
  const trackIdx = subject?.tracks.findIndex((t) => t.id === trackId) ?? 0;
  if (!program || !subject || !track) return null;
  const pal = sectionPalette(subject.color);
  const fac = facultyById[facultyId ?? track.facultyId];

  // When something is armed, clicks should trigger placement (and thus the
  // conflict-replace dialog when the cell is filled). When NOTHING is armed,
  // clicking a filled cell opens the faculty/clear popover.
  const cellButton = (
    <button
      onClick={armed ? onClick : undefined}
      className={cn(
        'w-full h-full min-h-[68px] rounded-lg border text-left p-2 transition-all hover:shadow-md',
        pal.surface, pal.border,
        armed && 'cursor-copy ring-1 ring-indigo-200/0 hover:ring-2 hover:ring-indigo-300',
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('h-3 w-3 rounded shrink-0', pal.solid)} style={trackPattern(trackIdx)} />
        <span className={cn('text-[10px] font-bold uppercase tracking-wide', pal.text)}>
          {program.code}
        </span>
        <span className="text-[10px] text-slate-500 font-medium ml-auto">{track.name}</span>
      </div>
      <div className="text-xs font-semibold text-slate-900 truncate">{subject.name}</div>
      <div className="text-[10px] text-slate-600 truncate mt-0.5">
        {fac ? shortName(fac.name) : 'no faculty'}
      </div>
    </button>
  );

  if (armed) return cellButton;

  return (
    <Popover>
      <PopoverTrigger asChild>{cellButton}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className={cn('px-3 py-2 bg-gradient-to-r text-white', pal.headerGradient)}>
          <div className="text-[10px] uppercase tracking-wider opacity-80">{program.code}</div>
          <div className="text-sm font-bold">{subject.name} · {track.name}</div>
        </div>
        <div className="p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Faculty</div>
          <CellFacultyPicker
            section={section}
            currentFaculty={facultyId ?? track.facultyId}
            facultyById={facultyById}
            onPick={(fid) => setCellFaculty(section.id, slot, fid === track.facultyId ? undefined : fid)}
          />
          <button
            onClick={() => { clearCell(section.id, slot); toast('Cell cleared'); }}
            className="w-full inline-flex items-center justify-center gap-1.5 mt-2 px-2 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md"
          >
            <Trash2 className="h-3 w-3" /> Clear cell
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CellFacultyPicker: React.FC<{
  section: Section;
  currentFaculty: string;
  facultyById: Record<string, { id: string; name: string } | undefined>;
  onPick: (id: string) => void;
}> = ({ section, currentFaculty, facultyById, onPick }) => {
  return (
    <div className="space-y-1 max-h-44 overflow-y-auto">
      {section.facultyPool.map((fid) => {
        const f = facultyById[fid];
        if (!f) return null;
        const isCurrent = fid === currentFaculty;
        return (
          <button
            key={fid}
            onClick={() => onPick(fid)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left',
              isCurrent ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-100 text-slate-700',
            )}
          >
            <Users className="h-3 w-3" />
            <span className="flex-1 truncate">{shortName(f.name)}</span>
            {isCurrent && <span className="text-[10px]">✓</span>}
          </button>
        );
      })}
    </div>
  );
};

const RowMenu: React.FC<{ onFillRow: () => void }> = ({ onFillRow }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="p-0.5 rounded hover:bg-slate-200 text-slate-500" aria-label="Row menu">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel className="text-[10px]">Bulk actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onFillRow} className="text-xs">
        Fill row with armed allocation
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ConflictBody: React.FC<{
  section: Section;
  incoming: CellAllocation;
  existing: CellAllocation;
}> = ({ section, incoming, existing }) => {
  const label = (a: CellAllocation) => {
    const p = section.programs.find((p) => p.id === a.programId);
    const su = p?.subjects.find((s) => s.id === a.subjectId);
    const tr = su?.tracks.find((t) => t.id === a.trackId);
    return `${p?.code} · ${su?.name} · ${tr?.name}`;
  };
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
        <div className="text-[10px] uppercase tracking-wider text-rose-600 font-semibold">Currently holds</div>
        <div className="text-slate-900 font-semibold">{label(existing)}</div>
      </div>
      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
        <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold">Will be replaced with</div>
        <div className="text-slate-900 font-semibold">{label(incoming)}</div>
      </div>
      <div className="text-xs text-slate-500">
        Each slot can hold only one allocation across all programs. Replacing will free this slot for the previous track.
      </div>
    </div>
  );
};

function shortName(full: string): string {
  return full.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '');
}
