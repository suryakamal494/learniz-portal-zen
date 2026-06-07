import React from 'react';
import { CalendarDays, AlertCircle, CheckCircle2, ArrowDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Program, TopicStatus } from '@/types/program';
import { getTodayFocus } from '@/utils/programSchedule';

interface Props {
  program: Program;
  onStatusChange?: (topicId: string, status: TopicStatus) => void;
  onJumpToChapter?: (chapterId: string) => void;
}

function formatHrs(h: number): string {
  if (h <= 0) return '0h';
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (whole === 0) return `${m}m`;
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function weekRangeLabel(d = new Date()): string {
  // Mon → Sun week containing `d`
  const dow = d.getDay(); // 0=Sun..6=Sat
  const offsetToMon = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + offsetToMon);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return `Week of ${mon.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export function ThisWeekCard({ program, onStatusChange, onJumpToChapter }: Props) {
  const focus = getTodayFocus(program);

  if (!focus) {
    return (
      <div id="this-week" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Currently running</h2>
            <p className="text-xs text-gray-500 mt-0.5">{weekRangeLabel()}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Nothing scheduled for this week.</p>
            <p className="text-xs text-emerald-800 mt-0.5">Check back when your next topic begins.</p>
          </div>
        </div>
      </div>
    );
  }

  const { topic, chapter, subject } = focus;
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parse = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };
  const MS = 24 * 60 * 60 * 1000;
  const todayMs = startOfDay(today).getTime();
  const startMs = parse(topic.plannedStartDate).getTime();
  const endMs = parse(topic.plannedEndDate).getTime();

  let state: 'on-track' | 'behind' | 'upcoming' | 'done' = 'on-track';
  let deltaDays = 0;
  let explanation = '';
  if (topic.status === 'done') {
    state = 'done';
    explanation = `"${topic.name}" is marked done.`;
  } else if (todayMs < startMs) {
    state = 'upcoming';
    deltaDays = Math.round((startMs - todayMs) / MS);
    explanation = `Scheduled to start on ${fmtDate(topic.plannedStartDate)}.`;
  } else if (todayMs > endMs) {
    state = 'behind';
    deltaDays = Math.round((todayMs - endMs) / MS);
    explanation = `Was scheduled to finish on ${fmtDate(topic.plannedEndDate)}. You're ${deltaDays} day${deltaDays === 1 ? '' : 's'} behind.`;
  } else {
    state = 'on-track';
    explanation = `On track — due by ${fmtDate(topic.plannedEndDate)}.`;
  }

  const isBehind = state === 'behind';
  const isUpcoming = state === 'upcoming';
  const isDone = state === 'done';

  const tileTint = isBehind
    ? 'bg-rose-50 border-rose-100 text-rose-900'
    : isUpcoming
    ? 'bg-blue-50 border-blue-100 text-blue-900'
    : isDone
    ? 'bg-gray-50 border-gray-200 text-gray-700'
    : 'bg-emerald-50 border-emerald-100 text-emerald-900';

  const pillCls = isBehind
    ? 'bg-rose-50 border-rose-200 text-rose-700'
    : isUpcoming
    ? 'bg-blue-50 border-blue-200 text-blue-700'
    : isDone
    ? 'bg-gray-50 border-gray-200 text-gray-600'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  const pillLabel = isBehind
    ? `Behind ${deltaDays}d`
    : isUpcoming
    ? `Starts in ${deltaDays}d`
    : isDone
    ? 'Done'
    : 'On track';

  return (
    <div id="this-week" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">Currently running</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {weekRangeLabel()}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${pillCls}`}>{pillLabel}</span>
      </div>

      <div className={`mt-4 rounded-xl border px-4 py-3.5 ${tileTint}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          {subject.name} · {chapter.name}
        </p>
        <p className="text-base md:text-lg font-bold mt-0.5">{topic.name}</p>
        <p className="text-xs mt-1 opacity-80">
          Planned {formatHrs(topic.plannedHours)} · {fmtDate(topic.plannedStartDate)} → {fmtDate(topic.plannedEndDate)}
        </p>
        {(isBehind || isUpcoming) && (
          <p className="text-xs mt-2 flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{explanation}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {topic.status !== 'in-progress' && topic.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange?.(topic.id, 'in-progress')}
            className="h-9 text-xs"
          >
            Mark in progress
          </Button>
        )}
        {topic.status !== 'done' && (
          <Button
            size="sm"
            onClick={() => onStatusChange?.(topic.id, 'done')}
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Mark done
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onJumpToChapter?.(chapter.id)}
          className="h-9 text-xs text-blue-700 hover:bg-blue-50"
        >
          <ArrowDown className="h-3.5 w-3.5 mr-1" />
          Jump to {chapter.name}
        </Button>
      </div>
    </div>
  );
}
