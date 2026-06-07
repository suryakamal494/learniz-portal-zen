import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CalendarRange, CheckCircle2, CircleDot, Circle } from 'lucide-react';
import { ProgramChapter, TopicStatus } from '@/types/program';
import { toneForPct } from '@/utils/programProgress';
import { getScheduleDeltaForChapter, ScheduleState, explainPct } from '@/utils/programSchedule';
import { LessonPlanCard } from './LessonPlanCard';

interface Props {
  chapter: ProgramChapter;
  defaultOpen?: boolean;
  onPreview: (lessonPlanId: string) => void;
  onTopicStatusChange?: (topicId: string, status: TopicStatus) => void;
}

function formatDateRange(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const s = new Date(start).toLocaleDateString(undefined, opts);
  const e = new Date(end).toLocaleDateString(undefined, opts);
  return `${s} → ${e}`;
}

function statePill(state: ScheduleState, deltaDays: number): { label: string; cls: string } {
  switch (state) {
    case 'behind':
      return { label: `Behind ${Math.abs(deltaDays)}d`, cls: 'bg-rose-50 border-rose-200 text-rose-700' };
    case 'done':
      return { label: 'Done', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    case 'not-started':
      return { label: deltaDays > 0 ? `Starts in ${deltaDays}d` : 'Not started', cls: 'bg-gray-50 border-gray-200 text-gray-600' };
    case 'ahead':
    case 'on-track':
    default:
      return { label: 'On track', cls: 'bg-blue-50 border-blue-200 text-blue-700' };
  }
}

function topicStatusIcon(status: TopicStatus) {
  if (status === 'done') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === 'in-progress') return <CircleDot className="h-4 w-4 text-amber-600" />;
  return <Circle className="h-4 w-4 text-gray-400" />;
}

export function ProgramChapterAccordion({ chapter, defaultOpen, onPreview, onTopicStatusChange }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);

  // Chapter % from lesson-plan hours
  let planned = 0;
  let spent = 0;
  for (const lp of chapter.lessonPlans) {
    planned += lp.hoursPlanned;
    spent += lp.hoursSpent;
  }
  const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
  const tone = toneForPct(pct);
  const pctPill =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700';

  const topics = chapter.topics ?? [];
  const delta = getScheduleDeltaForChapter(chapter);
  const pill = statePill(delta.state, delta.deltaDays);

  const firstStart = topics[0]?.plannedStartDate ?? chapter.plannedStartDate;
  const lastEnd = topics[topics.length - 1]?.plannedEndDate ?? chapter.plannedEndDate;
  const dateRange = formatDateRange(firstStart, lastEnd);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-gray-400">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Chapter {chapter.order}: {chapter.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {dateRange && (
              <span className="inline-flex items-center gap-1">
                <CalendarRange className="h-3.5 w-3.5" />
                {dateRange}
              </span>
            )}
            <span>
              {topics.length > 0 ? `${topics.length} topics` : `${chapter.lessonPlans.length} lesson plans`}
            </span>
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pill.cls}`}
          title={delta.explanation}
        >
          {pill.label}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pctPill}`}
          title={explainPct(spent, planned)}
        >
          {pct}%
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {(() => {
            // Build lessonPlan ↔ topic linking maps.
            const lpById = new Map(chapter.lessonPlans.map((lp) => [lp.id, lp]));
            const lpToTopics = new Map<string, Array<{ id: string; name: string }>>();
            for (const t of topics) {
              for (const lpId of t.lessonPlanIds ?? []) {
                const arr = lpToTopics.get(lpId) ?? [];
                arr.push({ id: t.id, name: t.name });
                lpToTopics.set(lpId, arr);
              }
            }

            const scrollToLp = (lpId: string) => {
              requestAnimationFrame(() => {
                document.getElementById(`lp-${lpId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              });
            };

            return (
              <>
                {topics.length > 0 && (
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Topics</p>
                    <ul className="space-y-1.5">
                      {topics.map((t) => {
                        const range = formatDateRange(t.plannedStartDate, t.plannedEndDate);
                        const linkedLps = (t.lessonPlanIds ?? []).map((id) => lpById.get(id)).filter(Boolean) as typeof chapter.lessonPlans;
                        return (
                          <li
                            key={t.id}
                            className="bg-white rounded-lg border border-gray-200 px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="shrink-0">{topicStatusIcon(t.status)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                                <p className="text-[11px] text-gray-500">
                                  {range ? `${range} · ` : ''}
                                  {t.plannedHours}h planned
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {t.status !== 'in-progress' && t.status !== 'done' && (
                                  <button
                                    onClick={() => onTopicStatusChange?.(t.id, 'in-progress')}
                                    className="text-[11px] font-medium px-2 py-1 rounded-md text-amber-700 hover:bg-amber-50"
                                  >
                                    Start
                                  </button>
                                )}
                                {t.status !== 'done' && (
                                  <button
                                    onClick={() => onTopicStatusChange?.(t.id, 'done')}
                                    className="text-[11px] font-medium px-2 py-1 rounded-md text-emerald-700 hover:bg-emerald-50"
                                  >
                                    Mark done
                                  </button>
                                )}
                                {t.status === 'done' && (
                                  <button
                                    onClick={() => onTopicStatusChange?.(t.id, 'in-progress')}
                                    className="text-[11px] font-medium px-2 py-1 rounded-md text-gray-500 hover:bg-gray-100"
                                  >
                                    Reopen
                                  </button>
                                )}
                              </div>
                            </div>
                            {linkedLps.length > 0 && (
                              <div className="mt-2 pl-7 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                                  Lesson plans
                                </span>
                                {linkedLps.map((lp) => (
                                  <button
                                    key={lp.id}
                                    onClick={() => scrollToLp(lp.id)}
                                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                    title="Jump to this lesson plan below"
                                  >
                                    {lp.title}
                                  </button>
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="px-5 pb-5 pt-3 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lesson plans</p>
                  {chapter.lessonPlans.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No lesson plans in this chapter yet.</p>
                  ) : (
                    chapter.lessonPlans.map((lp) => (
                      <LessonPlanCard
                        key={lp.id}
                        lessonPlan={lp}
                        onPreview={() => onPreview(lp.id)}
                        usedInTopics={lpToTopics.get(lp.id) ?? []}
                      />
                    ))
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
