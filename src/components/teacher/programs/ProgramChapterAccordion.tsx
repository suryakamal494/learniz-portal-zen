import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CalendarRange, CheckCircle2, CircleDot, Circle, Clock, Sparkles, Plus, LibraryBig, FileText, NotebookPen, FileQuestion, CalendarDays, BookOpen, ClipboardList, Video, Download } from 'lucide-react';
import { ProgramChapter, TopicStatus, ChapterTest, ChapterStudyNote } from '@/types/program';
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
  studyNotes?: ChapterStudyNote[];
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

export function ProgramChapterAccordion({ chapter, defaultOpen, isCurrent, onPreview, onTopicStatusChange, onCreateLessonPlan, onAddFromLibrary, onEditLessonPlan, onAddMaterial, onAddStudyNote, studyNoteCount = 0, studyNotes = [], tests = [], onPreviewTest, onToggleTestEnabled, onAddTestsFromLibrary, onCreateTest }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});

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
            <span>{topics.length} topics</span>
            <span>· {chapter.lessonPlans.length} lesson plans</span>
            <span>· {tests.length} tests</span>
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
            return (
              <Tabs defaultValue="schedule" className="px-5 py-4">

                <TabsList className="bg-slate-200 border border-slate-300 p-1.5 h-auto rounded-xl shadow-sm">
                  <TabsTrigger
                    value="schedule"
                    className="text-xs font-semibold px-4 py-2 rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-300/60 transition-all"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Schedule <span className="ml-1 text-[10px] opacity-80 font-bold">{topics.length}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="study-notes"
                    className="text-xs font-semibold px-4 py-2 rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-300/60 transition-all"
                  >
                    <NotebookPen className="h-3.5 w-3.5" />
                    Study Notes <span className="ml-1 text-[10px] opacity-80 font-bold">{studyNotes.length || studyNoteCount}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tests"
                    className="text-xs font-semibold px-4 py-2 rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-300/60 transition-all"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Tests <span className="ml-1 text-[10px] opacity-80 font-bold">{tests.length}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="mt-3 space-y-5">
                  {/* Topic → lesson plans inverse map */}
                  {(() => {
                    const topicToLps = new Map<string, typeof chapter.lessonPlans>();
                    for (const t of topics) {
                      const arr: typeof chapter.lessonPlans = [];
                      for (const lpId of t.lessonPlanIds ?? []) {
                        const lp = chapter.lessonPlans.find((p) => p.id === lpId);
                        if (lp) arr.push(lp);
                      }
                      topicToLps.set(t.id, arr);
                    }
                    const linkedLpIds = new Set<string>();
                    topics.forEach((t) => (t.lessonPlanIds ?? []).forEach((id) => linkedLpIds.add(id)));
                    const unlinkedLps = chapter.lessonPlans.filter((lp) => !linkedLpIds.has(lp.id));

                    return (
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Topics</h4>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
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
                        </div>

                        {topics.length === 0 ? (
                          <p className="text-sm text-gray-500 py-2">No schedule topics for this chapter yet.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {topics.map((t) => {
                              const range = formatDateRange(t.plannedStartDate, t.plannedEndDate);
                              const isOpen = !!openTopics[t.id];
                              const tLps = topicToLps.get(t.id) ?? [];
                              return (
                                <li
                                  key={t.id}
                                  className="bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-3 px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenTopics((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                                      }
                                      className="shrink-0 text-gray-400 hover:text-gray-600"
                                      aria-label={isOpen ? 'Collapse topic' : 'Expand topic'}
                                      aria-expanded={isOpen}
                                    >
                                      {isOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                    <span className="shrink-0">{topicStatusIcon(t.status)}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenTopics((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                                      }
                                      className="flex-1 min-w-0 text-left"
                                    >
                                      <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                                      <p className="text-[11px] text-gray-500">
                                        {range ? `${range} · ` : ''}
                                        {t.plannedHours}h planned
                                        {tLps.length > 0 ? ` · ${tLps.length} lesson plan${tLps.length === 1 ? '' : 's'}` : ''}
                                      </p>
                                    </button>
                                    <div className="flex items-center gap-1">
                                      {t.meetingLink && t.status !== 'done' && (
                                        <a
                                          href={t.meetingLink}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={() => {
                                            if (t.status === 'not-started') {
                                              onTopicStatusChange?.(t.id, 'in-progress');
                                            }
                                          }}
                                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${
                                            t.status === 'in-progress'
                                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          <Video className="h-3 w-3" />
                                          {t.status === 'in-progress' ? 'Resume Online Class' : 'Start Online Class'}
                                        </a>
                                      )}
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            className="text-[11px] font-medium px-2 py-1 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
                                          >
                                            Mark status
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          side="bottom"
                                          align="end"
                                          className="w-60 p-2 border border-gray-200 shadow-lg"
                                        >
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-1 pb-1">
                                            Set topic status
                                          </p>
                                          {(
                                            [
                                              { v: 'not-started', label: 'Not started', cls: 'text-gray-700' },
                                              { v: 'in-progress', label: 'In progress', cls: 'text-amber-700' },
                                              { v: 'done', label: 'Done', cls: 'text-emerald-700' },
                                            ] as const
                                          ).map((opt) => (
                                            <button
                                              key={opt.v}
                                              type="button"
                                              onClick={() => onTopicStatusChange?.(t.id, opt.v)}
                                              className={`w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 flex items-center justify-between ${opt.cls}`}
                                            >
                                              <span>{opt.label}</span>
                                              {t.status === opt.v && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                              )}
                                            </button>
                                          ))}
                                          <p className="text-[10px] text-gray-500 px-1 pt-2 border-t border-gray-100 mt-1">
                                            Reflects overall progress across all scheduled periods for this topic.
                                          </p>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>

                                  {isOpen && (
                                    <div className="border-t border-gray-100 px-3 py-2 bg-gray-50/60 rounded-b-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-3 w-3 text-gray-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                          Lesson plans ({tLps.length})
                                        </span>
                                      </div>
                                      {tLps.length === 0 ? (
                                        <div className="text-xs text-gray-500 py-1.5 flex items-center justify-between gap-2">
                                          <span>No lesson plans linked to this topic yet.</span>
                                          {onAddFromLibrary && (
                                            <button
                                              type="button"
                                              onClick={() => onAddFromLibrary(chapter.id)}
                                              className="text-xs font-semibold text-blue-700 hover:underline"
                                            >
                                              Link lesson plan
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {tLps.map((lp) => (
                                            <LessonPlanCard
                                              key={lp.id}
                                              lessonPlan={lp}
                                              onPreview={() => onPreview(lp.id)}
                                              onEdit={onEditLessonPlan ? () => onEditLessonPlan(lp.id) : undefined}
                                              onAddMaterial={onAddMaterial ? () => onAddMaterial(lp.id) : undefined}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {unlinkedLps.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                                Unlinked lesson plans ({unlinkedLps.length})
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {unlinkedLps.map((lp) => (
                                <LessonPlanCard
                                  key={lp.id}
                                  lessonPlan={lp}
                                  onPreview={() => onPreview(lp.id)}
                                  onEdit={onEditLessonPlan ? () => onEditLessonPlan(lp.id) : undefined}
                                  onAddMaterial={onAddMaterial ? () => onAddMaterial(lp.id) : undefined}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </TabsContent>


                <TabsContent value="study-notes" className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-900">{studyNotes.length} study note{studyNotes.length === 1 ? '' : 's'}</span>
                      <span className="text-gray-500"> shared with this chapter</span>
                    </div>
                    {onAddStudyNote && (
                      <button
                        type="button"
                        onClick={() => onAddStudyNote(chapter.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <NotebookPen className="h-3.5 w-3.5" />
                        Add study note
                      </button>
                    )}
                  </div>
                  {studyNotes.length === 0 ? (
                    <p className="text-sm text-gray-500 py-3">No study notes shared for this chapter yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {studyNotes.map((n) => (
                        <li
                          key={n.id}
                          className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-3"
                        >
                          <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {n.fileName}
                              {n.description ? ` · ${n.description}` : ''}
                            </p>
                          </div>
                          <span className="text-[11px] text-gray-500 shrink-0">
                            {new Date(n.sharedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="tests" className="mt-3">
                  <ChapterTestsTab
                    chapterId={chapter.id}
                    tests={tests}
                    onPreviewTest={(id) => onPreviewTest?.(id)}
                    onToggleEnabled={(id) => onToggleTestEnabled?.(id)}
                    onAddFromLibrary={(cid, picked) => onAddTestsFromLibrary?.(cid, picked)}
                    onCreateTest={(cid) => onCreateTest?.(cid)}
                  />
                </TabsContent>
              </Tabs>
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

