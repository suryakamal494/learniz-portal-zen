import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subjectPalette } from '@/lib/subjectColors';
import {
  addDays,
  generateSchedule,
  parseISO,
  toISO,
} from '@/utils/calendarAutomation';
import {
  InstituteProgram,
  ScheduleConfig,
  ScheduleSlot,
} from '@/types/instituteProgram';
import { MOCK_FACULTY } from '@/data/mockInstitutePrograms';

type Granularity = 'day' | 'week' | 'month';

interface Props {
  program: InstituteProgram;
  schedule: ScheduleConfig;
}

function shortName(full: string): string {
  // "Ms. Anika Rao" -> "A. Rao"
  const parts = full.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '').split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}


const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeek(iso: string): string {
  const d = parseISO(iso);
  const dow = d.getDay();
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow));
}

function startOfMonth(iso: string): string {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

function fmtHeader(iso: string, g: Granularity): string {
  const d = parseISO(iso);
  if (g === 'day') {
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (g === 'week') {
    const end = parseISO(addDays(iso, 6));
    return `${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const CurriculumCalendarView: React.FC<Props> = ({ program, schedule }) => {
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [cursor, setCursor] = useState<string>(() => schedule.startDate);

  const { slots, slotsByDate, subjectById, chapterById, topicById, facultyById, facultyBySubject, planEnd } = useMemo(() => {
    const res = generateSchedule(program, schedule, []);
    const byDate: Record<string, ScheduleSlot[]> = {};
    res.slots.forEach((s) => {
      (byDate[s.date] ||= []).push(s);
    });
    Object.values(byDate).forEach((arr) => arr.sort((a, b) => a.periodIndex - b.periodIndex));
    const sMap: Record<string, { name: string; color: string }> = {};
    const cMap: Record<string, string> = {};
    const tMap: Record<string, string> = {};
    program.subjects.forEach((s) => {
      sMap[s.id] = { name: s.name, color: s.color };
      s.chapters.forEach((c) => {
        cMap[c.id] = c.name;
        c.topics.forEach((t) => (tMap[t.id] = t.name));
      });
    });
    const fMap: Record<string, string> = {};
    const fBySubj: Record<string, string> = {};
    MOCK_FACULTY.forEach((f) => {
      fMap[f.id] = f.name;
      if (f.subjectId && !fBySubj[f.subjectId]) fBySubj[f.subjectId] = f.name;
    });
    return {
      slots: res.slots,
      slotsByDate: byDate,
      subjectById: sMap,
      chapterById: cMap,
      topicById: tMap,
      facultyById: fMap,
      facultyBySubject: fBySubj,
      planEnd: res.endDate,
    };
  }, [program, schedule]);

  const facultyFor = (slot: ScheduleSlot): string => {
    if (slot.facultyId && facultyById[slot.facultyId]) return facultyById[slot.facultyId];
    return facultyBySubject[slot.subjectId] ?? 'Unassigned';
  };


  const periodsPerDay = schedule.periodsPerDay;

  const shift = (dir: -1 | 1) => {
    if (granularity === 'day') setCursor((c) => addDays(c, dir));
    else if (granularity === 'week') setCursor((c) => addDays(c, dir * 7));
    else {
      const d = parseISO(cursor);
      setCursor(toISO(new Date(d.getFullYear(), d.getMonth() + dir, 1)));
    }
  };

  const goToday = () => setCursor(toISO(new Date()));
  const goStart = () => setCursor(schedule.startDate);

  // Anchor cursor for header label
  const headerAnchor =
    granularity === 'week' ? startOfWeek(cursor) : granularity === 'month' ? startOfMonth(cursor) : cursor;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm w-fit">
          {(['day', 'week', 'month'] as Granularity[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize',
                granularity === g ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold text-slate-800 min-w-[200px] text-center">
            {fmtHeader(headerAnchor, granularity)}
          </div>
          <Button variant="outline" size="sm" onClick={() => shift(1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goStart} className="h-8 text-xs">
            Plan start
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-medium text-slate-500">Subjects:</span>
        {program.subjects.map((s) => {
          const pal = subjectPalette(s.color);
          return (
            <span key={s.id} className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border', pal.bgSoft, pal.text, pal.border)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
              {s.name}
            </span>
          );
        })}
      </div>

      {/* Faculty legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-medium text-slate-500 inline-flex items-center gap-1">
          <UserRound className="h-3 w-3" /> Faculty:
        </span>
        {program.subjects.map((s) => {
          const pal = subjectPalette(s.color);
          const fac = facultyBySubject[s.id] ?? 'Unassigned';
          return (
            <span key={s.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 bg-white">
              <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
              <span className="text-slate-500">{s.name}:</span>
              <span className="font-medium text-slate-800">{fac}</span>
            </span>
          );
        })}
      </div>

      {granularity === 'day' && (
        <DayView
          dateIso={cursor}
          periodsPerDay={periodsPerDay}
          slots={slotsByDate[cursor] ?? []}
          subjectById={subjectById}
          chapterById={chapterById}
          topicById={topicById}
          facultyFor={facultyFor}
        />
      )}

      {granularity === 'week' && (
        <WeekView
          weekStart={startOfWeek(cursor)}
          periodsPerDay={periodsPerDay}
          workingDays={schedule.workingDays}
          slotsByDate={slotsByDate}
          subjectById={subjectById}
          topicById={topicById}
          facultyFor={facultyFor}
        />
      )}

      {granularity === 'month' && (
        <MonthView
          monthAnchor={startOfMonth(cursor)}
          slotsByDate={slotsByDate}
          subjectById={subjectById}
          facultyFor={facultyFor}
          onPickDay={(iso) => {
            setCursor(iso);
            setGranularity('day');
          }}
        />
      )}


      {slots.length === 0 && (
        <div className="text-sm text-slate-500 italic px-4 py-6 text-center border border-dashed rounded-md">
          No scheduled periods yet — set teaching hours to generate the plan.
        </div>
      )}
      {slots.length > 0 && (
        <div className="text-[11px] text-slate-500 text-right">
          Plan ends on {parseISO(planEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  );
};

/* ── Day view ──────────────────────────────────────────────────── */
const DayView: React.FC<{
  dateIso: string;
  periodsPerDay: number;
  slots: ScheduleSlot[];
  subjectById: Record<string, { name: string; color: string }>;
  chapterById: Record<string, string>;
  topicById: Record<string, string>;
  facultyFor: (slot: ScheduleSlot) => string;
}> = ({ dateIso, periodsPerDay, slots, subjectById, chapterById, topicById, facultyFor }) => {
  const slotMap = new Map(slots.map((s) => [s.periodIndex, s]));
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {Array.from({ length: periodsPerDay }, (_, i) => i).map((i) => {
        const sl = slotMap.get(i);
        if (!sl) {
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 text-xs text-slate-400">
              <span className="w-16 font-medium text-slate-500">P{i + 1}</span>
              <span className="italic">Free</span>
            </div>
          );
        }
        const sub = subjectById[sl.subjectId];
        const pal = subjectPalette(sub?.color ?? 'blue');
        const fac = facultyFor(sl);
        return (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0">
            <span className="w-16 text-xs font-semibold text-slate-700">P{i + 1}</span>
            <span className="w-24 text-xs tabular-nums text-slate-600">{sl.startTime} – {sl.endTime}</span>
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border', pal.bgSoft, pal.text, pal.border)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
              {sub?.name}
            </span>
            <div className="text-sm text-slate-800 min-w-0 flex-1 truncate">
              <span className="font-medium">{topicById[sl.topicId]}</span>
              <span className="text-slate-400"> · {chapterById[sl.chapterId]}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 shrink-0">
              <UserRound className="h-3 w-3 text-slate-400" />
              <span className="font-medium">{fac}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};


/* ── Week view ─────────────────────────────────────────────────── */
const WeekView: React.FC<{
  weekStart: string;
  periodsPerDay: number;
  workingDays: number[];
  slotsByDate: Record<string, ScheduleSlot[]>;
  subjectById: Record<string, { name: string; color: string }>;
  topicById: Record<string, string>;
}> = ({ weekStart, periodsPerDay, workingDays, slotsByDate, subjectById, topicById }) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = toISO(new Date());
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: `60px repeat(7, minmax(0, 1fr))` }}>
          <div className="bg-slate-50 border-b border-slate-200" />
          {days.map((iso) => {
            const d = parseISO(iso);
            const isWorking = workingDays.includes(d.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6);
            return (
              <div
                key={iso}
                className={cn(
                  'px-2 py-2 text-center border-b border-l border-slate-200 text-xs',
                  iso === today && 'bg-indigo-50',
                  !isWorking && 'bg-slate-50 text-slate-400',
                )}
              >
                <div className="font-semibold text-slate-700">{WEEKDAY_LABELS[d.getDay()]}</div>
                <div className={cn('text-[11px]', iso === today ? 'text-indigo-700 font-semibold' : 'text-slate-500')}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}

          {Array.from({ length: periodsPerDay }, (_, p) => (
            <React.Fragment key={p}>
              <div className="px-2 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100 bg-slate-50/50 text-center">
                P{p + 1}
              </div>
              {days.map((iso) => {
                const sl = (slotsByDate[iso] ?? []).find((s) => s.periodIndex === p);
                if (!sl) {
                  return <div key={iso + p} className="border-b border-l border-slate-100 min-h-[48px]" />;
                }
                const sub = subjectById[sl.subjectId];
                const pal = subjectPalette(sub?.color ?? 'blue');
                return (
                  <div
                    key={iso + p}
                    className={cn('border-b border-l border-slate-100 p-1', pal.bgSoft)}
                    title={`${sub?.name} · ${topicById[sl.topicId]}`}
                  >
                    <div className={cn('text-[10px] font-semibold uppercase tracking-wide', pal.text)}>
                      {sub?.name}
                    </div>
                    <div className="text-[11px] text-slate-700 leading-tight line-clamp-2">
                      {topicById[sl.topicId]}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Month view ────────────────────────────────────────────────── */
const MonthView: React.FC<{
  monthAnchor: string;
  slotsByDate: Record<string, ScheduleSlot[]>;
  subjectById: Record<string, { name: string; color: string }>;
  onPickDay: (iso: string) => void;
}> = ({ monthAnchor, slotsByDate, subjectById, onPickDay }) => {
  const anchor = parseISO(monthAnchor);
  const monthIdx = anchor.getMonth();
  const gridStart = startOfWeek(monthAnchor);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const today = toISO(new Date());
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="px-2 py-2 text-[11px] font-semibold text-slate-600 text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((iso) => {
          const d = parseISO(iso);
          const inMonth = d.getMonth() === monthIdx;
          const daySlots = slotsByDate[iso] ?? [];
          // Aggregate subject counts
          const counts: Record<string, number> = {};
          daySlots.forEach((s) => (counts[s.subjectId] = (counts[s.subjectId] || 0) + 1));
          const entries = Object.entries(counts);
          return (
            <button
              type="button"
              key={iso}
              onClick={() => onPickDay(iso)}
              className={cn(
                'min-h-[88px] border-b border-l border-slate-100 p-1.5 text-left hover:bg-slate-50 transition-colors flex flex-col gap-1',
                !inMonth && 'bg-slate-50/60 text-slate-400',
                iso === today && 'ring-1 ring-inset ring-indigo-400',
              )}
            >
              <div className={cn('text-[11px] font-semibold', iso === today ? 'text-indigo-700' : 'text-slate-700')}>
                {d.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {entries.slice(0, 3).map(([sid, n]) => {
                  const sub = subjectById[sid];
                  const pal = subjectPalette(sub?.color ?? 'blue');
                  return (
                    <div
                      key={sid}
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate',
                        pal.bgSoft,
                        pal.text,
                      )}
                    >
                      <span className={cn('h-1 w-1 rounded-full shrink-0', pal.dot)} />
                      <span className="truncate">{sub?.name}</span>
                      <span className="ml-auto tabular-nums opacity-70">{n}</span>
                    </div>
                  );
                })}
                {entries.length > 3 && (
                  <div className="text-[10px] text-slate-500">+{entries.length - 3} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CurriculumCalendarView;
