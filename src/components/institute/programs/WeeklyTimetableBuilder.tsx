import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eraser,
  Repeat,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  WeekDay,
  WeeklyTimetable,
  WeeklyTimetableCell,
} from '@/types/instituteProgram';
import {
  addDays,
  computeDayLayout,
  isoWeekStart,
  parseISO,
  toISO,
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

interface Props {
  config: ScheduleConfig;
  subjects: Subject[];
  onChange: (tt: WeeklyTimetable) => void;
}

/** Compute the list of week-start ISOs (Mondays) covered by the academic window. */
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

export const WeeklyTimetableBuilder: React.FC<Props> = ({ config, subjects, onChange }) => {
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

  // Build cell lookup for the active week.
  const cellMap = useMemo(() => {
    const m = new Map<string, string | null>(); // key = `${weekday}#${periodIndex}`
    tt.cells
      .filter((c) => c.weekStartDate === activeWeek)
      .forEach((c) => m.set(`${c.weekday}#${c.periodIndex}`, c.subjectId));
    return m;
  }, [tt.cells, activeWeek]);

  // Track which weeks have at least one authored cell.
  const authoredWeeks = useMemo(() => {
    const s = new Set<string>();
    tt.cells.forEach((c) => s.add(c.weekStartDate));
    return s;
  }, [tt.cells]);

  const writeCells = (mutator: (cells: WeeklyTimetableCell[]) => WeeklyTimetableCell[]) => {
    onChange({ cells: mutator(tt.cells) });
  };

  const setCell = (weekStart: string, weekday: WeekDay, periodIndex: number, subjectId: string | null) => {
    writeCells((cells) => {
      const others = cells.filter(
        (c) => !(c.weekStartDate === weekStart && c.weekday === weekday && c.periodIndex === periodIndex),
      );
      return [...others, { weekStartDate: weekStart, weekday, periodIndex, subjectId }];
    });
  };

  const fillRow = (periodIndex: number, subjectId: string | null) => {
    writeCells((cells) => {
      const others = cells.filter(
        (c) => !(c.weekStartDate === activeWeek && c.periodIndex === periodIndex),
      );
      const added: WeeklyTimetableCell[] = workingDows.map((d) => ({
        weekStartDate: activeWeek,
        weekday: d.d,
        periodIndex,
        subjectId,
      }));
      return [...others, ...added];
    });
  };

  const fillColumn = (weekday: WeekDay, subjectId: string | null) => {
    writeCells((cells) => {
      const others = cells.filter(
        (c) => !(c.weekStartDate === activeWeek && c.weekday === weekday),
      );
      const added: WeeklyTimetableCell[] = periodRows.map((_, i) => ({
        weekStartDate: activeWeek,
        weekday,
        periodIndex: i,
        subjectId,
      }));
      return [...others, ...added];
    });
  };

  const clearWeek = () => {
    writeCells((cells) => cells.filter((c) => c.weekStartDate !== activeWeek));
  };

  const copyWeekTo = (mode: 'next' | 'next4' | 'all') => {
    const source = tt.cells.filter((c) => c.weekStartDate === activeWeek);
    if (source.length === 0) return;
    const targets: string[] = [];
    if (mode === 'next' && weekStarts[activeIdx + 1]) targets.push(weekStarts[activeIdx + 1]);
    if (mode === 'next4') {
      for (let i = 1; i <= 4 && weekStarts[activeIdx + i]; i++) {
        targets.push(weekStarts[activeIdx + i]);
      }
    }
    if (mode === 'all') {
      for (let i = activeIdx + 1; i < weekStarts.length; i++) targets.push(weekStarts[i]);
    }
    writeCells((cells) => {
      const others = cells.filter((c) => !targets.includes(c.weekStartDate));
      const cloned: WeeklyTimetableCell[] = [];
      targets.forEach((ws) => {
        source.forEach((c) => cloned.push({ ...c, weekStartDate: ws }));
      });
      return [...others, ...cloned];
    });
  };

  const applyToAllWeeks = () => {
    const source = tt.cells.filter((c) => c.weekStartDate === activeWeek);
    if (source.length === 0) return;
    writeCells(() => {
      const result: WeeklyTimetableCell[] = [];
      weekStarts.forEach((ws) => {
        source.forEach((c) => result.push({ ...c, weekStartDate: ws }));
      });
      return result;
    });
  };

  const activeFilled = tt.cells.filter((c) => c.weekStartDate === activeWeek && c.subjectId).length;
  const totalCells = workingDows.length * periodRows.length;

  return (
    <div className="space-y-4">
      {/* Header & week navigator */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" /> Weekly timetable
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick a subject for each period · day. Use the row/column tools to fill quickly, then copy to other
                weeks.
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

          {/* Week chips */}
          <div className="flex flex-wrap gap-1.5">
            {weekStarts.map((ws, i) => {
              const filled = authoredWeeks.has(ws);
              return (
                <button
                  key={ws}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                    i === activeIdx
                      ? 'bg-blue-600 text-white border-blue-600'
                      : filled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300',
                  )}
                >
                  W{i + 1}
                  {filled && i !== activeIdx && ' ✓'}
                </button>
              );
            })}
          </div>

          {/* Tools */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {activeFilled} / {totalCells} cells filled
            </Badge>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy this week to…
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyWeekTo('next')}>Next week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyWeekTo('next4')}>Next 4 weeks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyWeekTo('all')}>All remaining weeks</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={applyToAllWeeks}>
              <Repeat className="h-3.5 w-3.5" /> Apply as repeating pattern
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-rose-600 hover:text-rose-700"
              onClick={clearWeek}
            >
              <Eraser className="h-3.5 w-3.5" /> Clear week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium w-32 border-b">
                  Period
                </th>
                {workingDows.map((d) => (
                  <th
                    key={d.d}
                    className="text-left px-2 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium border-b"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{d.short}</span>
                      <ColumnFillMenu
                        subjects={subjects}
                        onFill={(sid) => fillColumn(d.d, sid)}
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
                      <td className="px-3 py-1.5 text-[11px] text-amber-800 font-medium italic">
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
                    <td className="px-3 py-1.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">P{pIdx + 1}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">
                            {row.startTime}–{row.endTime}
                          </div>
                        </div>
                        <RowFillMenu
                          subjects={subjects}
                          onFill={(sid) => fillRow(pIdx, sid)}
                        />
                      </div>
                    </td>
                    {workingDows.map((d) => {
                      const value = cellMap.get(`${d.d}#${pIdx}`);
                      const sub = subjects.find((s) => s.id === value);
                      const pal = sub ? subjectPalette(sub.color) : null;
                      return (
                        <td key={d.d} className="px-1 py-1 align-top">
                          <Select
                            value={value ?? '__free__'}
                            onValueChange={(v) =>
                              setCell(activeWeek, d.d, pIdx, v === '__free__' ? null : v)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-9 text-xs border bg-white',
                                pal && cn(pal.slot, 'font-medium'),
                              )}
                            >
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__free__">— Free —</SelectItem>
                              {subjects.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

const RowFillMenu: React.FC<{ subjects: Subject[]; onFill: (id: string | null) => void }> = ({
  subjects,
  onFill,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="h-5 w-5 rounded hover:bg-slate-200 grid place-items-center text-slate-400 hover:text-slate-700"
        title="Fill this row"
      >
        <Wand2 className="h-3 w-3" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <div className="px-2 py-1 text-[10px] uppercase text-slate-500 font-semibold">
        Fill row across week
      </div>
      {subjects.map((s) => (
        <DropdownMenuItem key={s.id} onClick={() => onFill(s.id)}>
          {s.name}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onFill(null)} className="text-slate-500">
        Clear row
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ColumnFillMenu: React.FC<{ subjects: Subject[]; onFill: (id: string | null) => void }> = ({
  subjects,
  onFill,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="h-5 w-5 rounded hover:bg-slate-200 grid place-items-center text-slate-400 hover:text-slate-700"
        title="Fill this day"
      >
        <Sparkles className="h-3 w-3" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <div className="px-2 py-1 text-[10px] uppercase text-slate-500 font-semibold">Fill column</div>
      {subjects.map((s) => (
        <DropdownMenuItem key={s.id} onClick={() => onFill(s.id)}>
          {s.name}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onFill(null)} className="text-slate-500">
        Clear column
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default WeeklyTimetableBuilder;
