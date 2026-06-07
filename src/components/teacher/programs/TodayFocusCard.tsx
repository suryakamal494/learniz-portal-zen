import React from 'react';
import { Sparkles, CalendarDays, AlertCircle, CheckCircle2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Program, TopicStatus } from '@/types/program';
import { getTodayFocus } from '@/utils/programSchedule';

interface Props {
  program: Program;
  onStatusChange?: (topicId: string, status: TopicStatus) => void;
  onJumpToChapter?: (chapterId: string) => void;
}

function formatPlannedHours(h: number): string {
  if (h <= 0) return '0h';
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (whole === 0) return `${m}m`;
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
}

function todayHuman(d = new Date()): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

export function TodayFocusCard({ program, onStatusChange, onJumpToChapter }: Props) {
  const focus = getTodayFocus(program);

  if (!focus) {
    return (
      <div id="today" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Today's focus</h2>
            <p className="text-xs text-gray-500 mt-0.5">{todayHuman()}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Nothing scheduled — you're all caught up.</p>
            <p className="text-xs text-emerald-800 mt-0.5">Check back when your institute assigns the next topic.</p>
          </div>
        </div>
      </div>
    );
  }

  const { topic, chapter, subject } = focus;
  const delta = getScheduleDeltaForChapter(chapter);
  const isBehind = delta.state === 'behind';
  const isUpcoming = topic.status === 'not-started' && delta.state === 'not-started';

  const stateTint = isBehind
    ? 'bg-rose-50 border-rose-100 text-rose-900'
    : isUpcoming
    ? 'bg-blue-50 border-blue-100 text-blue-900'
    : 'bg-emerald-50 border-emerald-100 text-emerald-900';

  const stateLabel = isBehind
    ? `Behind by ${Math.abs(delta.deltaDays)} day${Math.abs(delta.deltaDays) === 1 ? '' : 's'}`
    : isUpcoming
    ? `Starts in ${delta.deltaDays} day${delta.deltaDays === 1 ? '' : 's'}`
    : 'On track';

  return (
    <div id="today" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 shrink-0">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">Today's focus</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {todayHuman()}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isBehind
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : isUpcoming
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {stateLabel}
        </span>
      </div>

      <div className={`mt-4 rounded-xl border px-4 py-3.5 ${stateTint}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          {subject.name} · {chapter.name}
        </p>
        <p className="text-base md:text-lg font-bold mt-0.5">{topic.name}</p>
        <p className="text-xs mt-1 opacity-80">
          Planned {formatPlannedHours(topic.plannedHours)} · {topic.plannedStartDate} → {topic.plannedEndDate}
        </p>
        {isBehind && (
          <p className="text-xs mt-2 flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{delta.explanation}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {topic.status !== 'in-progress' && (
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
        {isBehind && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onJumpToChapter?.(chapter.id)}
            className="h-9 text-xs text-rose-700 hover:bg-rose-50"
          >
            <ArrowDown className="h-3.5 w-3.5 mr-1" />
            Jump to {chapter.name}
          </Button>
        )}
      </div>
    </div>
  );
}
