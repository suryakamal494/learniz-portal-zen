import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CalendarRange, CheckCircle2, CircleDot, Circle, Clock, Sparkles, Plus, LibraryBig, FileText, NotebookPen, FileQuestion } from 'lucide-react';
import { ProgramChapter, TopicStatus, ChapterTest } from '@/types/program';
import { toneForPct } from '@/utils/programProgress';
import { getScheduleDeltaForChapter, ScheduleState } from '@/utils/programSchedule';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LessonPlanCard } from './LessonPlanCard';
import { ChapterTestsTab } from './ChapterTestsTab';

interface Props {
  chapter: ProgramChapter;
  defaultOpen?: boolean;
  isCurrent?: boolean;
  onPreview: (lessonPlanId: string) => void;
  onTopicStatusChange?: (topicId: string, status: TopicStatus) => void;
  onCreateLessonPlan?: (chapterId: string) => void;
  onAddFromLibrary?: (chapterId: string) => void;
  onEditLessonPlan?: (lessonPlanId: string) => void;
  onAddMaterial?: (lessonPlanId: string) => void;
  onAddStudyNote?: (chapterId: string) => void;
  studyNoteCount?: number;
  tests?: ChapterTest[];
  onPreviewTest?: (testId: string) => void;
  onToggleTestEnabled?: (testId: string) => void;
  onAddTestsFromLibrary?: (chapterId: string, tests: ChapterTest[]) => void;
  onCreateTest?: (chapterId: string) => void;
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

export function ProgramChapterAccordion({ chapter, defaultOpen, isCurrent, onPreview, onTopicStatusChange, onCreateLessonPlan, onAddFromLibrary, onEditLessonPlan, onAddMaterial, onAddStudyNote, studyNoteCount = 0, tests = [], onPreviewTest, onToggleTestEnabled, onAddTestsFromLibrary, onCreateTest }: Props) {
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

  const panelId = `chapter-panel-${chapter.id}`;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow ${
        isCurrent ? 'border-blue-300 ring-2 ring-blue-300 shadow-md' : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`w-full px-5 py-4 flex items-center gap-3 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
          isCurrent ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
        }`}
      >
        <span className="text-gray-400">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">
              Chapter {chapter.order}: {chapter.name}
            </p>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                <Sparkles className="h-3 w-3" />
                Currently teaching
              </span>
            )}
          </div>
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
            {studyNoteCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <FileText className="h-3 w-3" />
                {studyNoteCount} study note{studyNoteCount === 1 ? '' : 's'} shared
              </span>
            )}
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pill.cls}`}
          title={delta.explanation}
        >
          {pill.label}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${pctPill}`}
              title="What does this percentage mean?"
            >
              {pct}%
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-72 p-0 border border-gray-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <ChapterPctBreakdown
              chapter={chapter}
              pct={pct}
              spent={spent}
              planned={planned}
              deltaLabel={pill.label}
              deltaExplanation={delta.explanation}
            />
          </PopoverContent>
        </Popover>
      </button>

      {open && (
        <div id={panelId} className="border-t border-gray-100 bg-gray-50/50">
          {(() => {
            // Build lessonPlan ↔ topic linking map (still used to pass usedInTopics to LessonPlanCard).
            const lpToTopics = new Map<string, Array<{ id: string; name: string }>>();
            for (const t of topics) {
              for (const lpId of t.lessonPlanIds ?? []) {
                const arr = lpToTopics.get(lpId) ?? [];
                arr.push({ id: t.id, name: t.name });
                lpToTopics.set(lpId, arr);
              }
            }

            return (
              <>
                {topics.length > 0 && (
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Topics</p>
                    <ul className="space-y-1.5">
                      {topics.map((t) => {
                        const range = formatDateRange(t.plannedStartDate, t.plannedEndDate);
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
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="px-5 pb-5 pt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lesson plans</p>
                    {(onCreateLessonPlan || onAddFromLibrary || onAddStudyNote) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {studyNoteCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            {studyNoteCount} study note{studyNoteCount === 1 ? '' : 's'} shared
                          </span>
                        )}
                        {onAddStudyNote && (
                          <button
                            type="button"
                            onClick={() => onAddStudyNote(chapter.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <NotebookPen className="h-3.5 w-3.5" />
                            Add study notes
                          </button>
                        )}
                        {onAddFromLibrary && (
                          <button
                            type="button"
                            onClick={() => onAddFromLibrary(chapter.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <LibraryBig className="h-3.5 w-3.5" />
                            Add from library
                          </button>
                        )}
                        {onCreateLessonPlan && (
                          <button
                            type="button"
                            onClick={() => onCreateLessonPlan(chapter.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create lesson plan
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {chapter.lessonPlans.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No lesson plans in this chapter yet.</p>
                  ) : (
                    chapter.lessonPlans.map((lp) => (
                      <LessonPlanCard
                        key={lp.id}
                        lessonPlan={lp}
                        onPreview={() => onPreview(lp.id)}
                        onEdit={onEditLessonPlan ? () => onEditLessonPlan(lp.id) : undefined}
                        onAddMaterial={onAddMaterial ? () => onAddMaterial(lp.id) : undefined}
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

/* ──────────────── Chapter % breakdown popover ──────────────── */

function fmtHrs(h: number): string {
  if (!h || h <= 0) return '0h';
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (whole === 0) return `${m}m`;
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
}

interface BreakdownProps {
  chapter: ProgramChapter;
  pct: number;
  spent: number;
  planned: number;
  deltaLabel: string;
  deltaExplanation: string;
}

function ChapterPctBreakdown({ chapter, pct, spent, planned, deltaLabel, deltaExplanation }: BreakdownProps) {
  const topics = chapter.topics ?? [];
  const doneCount = topics.filter((t) => t.status === 'done').length;
  const ipCount = topics.filter((t) => t.status === 'in-progress').length;
  const nsCount = topics.filter((t) => t.status === 'not-started').length;
  const total = topics.length;

  const lastTaught = topics
    .filter((t) => t.lastUpdatedAt)
    .map((t) => t.lastUpdatedAt!)
    .sort()
    .pop();

  const barTone = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="p-3 space-y-3 bg-white rounded-md">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">What this means</p>
        <p className="text-xs text-gray-700 mt-0.5">
          {total > 0
            ? `${doneCount} of ${total} topics done · ${fmtHrs(spent)} taught of ${fmtHrs(planned)} planned.`
            : `${fmtHrs(spent)} taught of ${fmtHrs(planned)} planned.`}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <span>Hours taught</span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barTone}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{fmtHrs(spent)} of {fmtHrs(planned)}</p>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-1.5">
            <p className="text-sm font-bold text-emerald-700">{doneCount}</p>
            <p className="text-[10px] text-emerald-700">Done</p>
          </div>
          <div className="rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5">
            <p className="text-sm font-bold text-amber-700">{ipCount}</p>
            <p className="text-[10px] text-amber-700">In progress</p>
          </div>
          <div className="rounded-md bg-gray-50 border border-gray-200 px-2 py-1.5">
            <p className="text-sm font-bold text-gray-700">{nsCount}</p>
            <p className="text-[10px] text-gray-600">Not started</p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-2 space-y-1">
        <div className="flex items-start gap-1.5 text-[11px]">
          <span className="font-semibold text-gray-600">Schedule:</span>
          <span className="text-gray-700">{deltaLabel} — {deltaExplanation}</span>
        </div>
        {lastTaught && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock className="h-3 w-3" />
            Last taught {new Date(lastTaught).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
}

