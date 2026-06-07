import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, AlertTriangle, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import { ProgramSubjectTabs } from '@/components/teacher/programs/ProgramSubjectTabs';
import { ProgramChapterAccordion } from '@/components/teacher/programs/ProgramChapterAccordion';
import { LessonPlanPreviewModal } from '@/components/teacher/programs/LessonPlanPreviewModal';
// ThisWeekCard removed — current chapter is highlighted directly in the chapter list.
import { StatusOverviewStrip } from '@/components/teacher/programs/StatusOverviewStrip';
import { ChapterScheduleFilters, ChapterFilter } from '@/components/teacher/programs/ChapterScheduleFilters';
import { getSubjectById } from '@/lib/voiceCatalog';
import { getStaleStatusInfo, SCHEDULE_STALE_DAYS, getScheduleDeltaForChapter, getTodayFocus } from '@/utils/programSchedule';
import { Program, ProgramChapter, ProgramLessonPlan, TopicStatus } from '@/types/program';
import { AddLessonPlanModal } from '@/components/teacher/programs/AddLessonPlanModal';

export default function BatchProgramsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const batch = mockBatches.find((b) => b.id === batchId);
  const baseProgram = batchId ? getProgramByBatchId(batchId) : undefined;

  // In-session topic-status overrides — toggled by Today's focus + (later) chapter rows.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, { status: TopicStatus; lastUpdatedAt: string }>>({});
  const [addedLessonPlans, setAddedLessonPlans] = useState<Record<string, ProgramLessonPlan[]>>({});
  const [addModalChapterId, setAddModalChapterId] = useState<string | null>(null);

  const program: Program | undefined = useMemo(() => {
    if (!baseProgram) return undefined;
    const hasOverrides = Object.keys(statusOverrides).length > 0;
    const hasAdded = Object.keys(addedLessonPlans).length > 0;
    if (!hasOverrides && !hasAdded) return baseProgram;
    return {
      ...baseProgram,
      subjects: baseProgram.subjects.map(s => ({
        ...s,
        chapters: s.chapters.map(ch => ({
          ...ch,
          lessonPlans: addedLessonPlans[ch.id]
            ? [...ch.lessonPlans, ...addedLessonPlans[ch.id]]
            : ch.lessonPlans,
          topics: ch.topics?.map(t => {
            const o = statusOverrides[t.id];
            return o ? { ...t, status: o.status, lastUpdatedAt: o.lastUpdatedAt } : t;
          }),
        })),
      })),
    };
  }, [baseProgram, statusOverrides, addedLessonPlans]);

  const handleTopicStatus = (topicId: string, status: TopicStatus) => {
    setStatusOverrides(prev => ({
      ...prev,
      [topicId]: { status, lastUpdatedAt: new Date().toISOString() },
    }));
  };

  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>(
    program?.subjects[0]?.id,
  );
  const [previewLpId, setPreviewLpId] = useState<string | null>(null);
  const [staleDismissed, setStaleDismissed] = useState(false);
  const [filter, setFilter] = useState<ChapterFilter>('all');

  // Voice-nav: pre-select subject tab from ?subject=<slug>
  useEffect(() => {
    const subjSlug = searchParams.get('subject');
    if (!subjSlug || !program) return;
    const name = getSubjectById(subjSlug)?.name?.toLowerCase();
    if (!name) return;
    const match = program.subjects.find(s => s.name.toLowerCase() === name);
    if (match) setActiveSubjectId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  // Deep-link via hash:
  //   #progress  → scroll to "Where you stand" strip (legacy /progress route)
  //   #chapter-<id> → scroll to a specific chapter (voice "currently teaching")
  useEffect(() => {
    const h = location.hash;
    if (!h) return;
    const id = h.startsWith('#') ? h.slice(1) : h;
    // Wait for accordion render + subject-tab switch to settle.
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [location.hash, activeSubjectId]);

  const activeSubject = useMemo(
    () => program?.subjects.find((s) => s.id === (activeSubjectId ?? program?.subjects[0]?.id)),
    [program, activeSubjectId],
  );

  const previewLp = useMemo(() => {
    if (!previewLpId || !program) return null;
    for (const s of program.subjects) {
      for (const ch of s.chapters) {
        for (const lp of ch.lessonPlans) {
          if (lp.id === previewLpId) return lp;
        }
      }
    }
    return null;
  }, [previewLpId, program]);

  const staleInfo = useMemo(() => (program ? getStaleStatusInfo(program) : null), [program]);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-700 font-medium">Section not found</p>
          <Button onClick={() => navigate('/teacher/batches')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            Back to My Sections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <button
            onClick={() => navigate('/teacher/batches')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            My Sections
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate(`/teacher/batches/${batch.id}`)}
            className="px-2 py-1 rounded-md text-gray-700 hover:bg-white"
          >
            {batch.class} · {batch.name}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Program</span>
        </div>

        {/* Stale-status alert — nudges teachers to keep their schedule view accurate */}
        {program && staleInfo?.isStale && !staleDismissed && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
          >
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {staleInfo.daysSinceLastUpdate === null
                  ? 'No topic marked yet'
                  : `Your schedule view is ${staleInfo.daysSinceLastUpdate} day${staleInfo.daysSinceLastUpdate === 1 ? '' : 's'} out of date`}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {staleInfo.daysSinceLastUpdate === null
                  ? `Mark a topic as you start teaching so "Behind schedule" stays accurate (we nudge after ${SCHEDULE_STALE_DAYS} days of silence).`
                  : `Mark the topics you've taught — "Today's focus" and "Behind schedule" rely on these updates.`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  const focusId = getTodayFocus(program)?.chapter.id;
                  const el = focusId ? document.getElementById(`chapter-${focusId}`) : null;
                  (el ?? document.getElementById('chapters-section'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
              >
                Update now
              </button>
              <button
                onClick={() => setStaleDismissed(true)}
                aria-label="Dismiss reminder"
                className="text-xs text-amber-800 hover:text-amber-900 font-medium px-2 py-1.5 rounded-md hover:bg-amber-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header — no cross-link button; one unified page now */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <BookOpenCheck className="h-5 w-5 text-blue-600" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Program · {batch.class} · {batch.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {program
                  ? 'Your academic schedule, where you stand, and the lesson material for every topic — in one place.'
                  : 'No program assigned to this section yet.'}
              </p>
            </div>
          </div>
        </div>

        {!program || !activeSubject ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-700 font-medium">No program assigned to this section yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Once your institute assigns a program, chapters and lesson plans will appear here.
            </p>
          </div>
        ) : (
          <ProgramSubjectTabs
            subjects={program.subjects}
            activeSubjectId={activeSubject.id}
            onChange={setActiveSubjectId}
          >
            <div className="space-y-5">
              <StatusOverviewStrip program={program} />

              <ChapterListSection
                chapters={activeSubject.chapters}
                filter={filter}
                onFilterChange={setFilter}
                onPreview={(id) => setPreviewLpId(id)}
                onTopicStatusChange={handleTopicStatus}
                focusChapterId={(() => {
                  const todayIso = new Date().toISOString().slice(0, 10);
                  // Pick the chapter in THIS subject that contains today (or next upcoming).
                  const chapters = activeSubject.chapters;
                  const current = chapters.find(ch =>
                    (ch.topics ?? []).some(t => t.plannedStartDate <= todayIso && todayIso <= t.plannedEndDate)
                  );
                  if (current) return current.id;
                  const upcoming = [...chapters]
                    .filter(ch => (ch.plannedStartDate ?? '') > todayIso)
                    .sort((a, b) => (a.plannedStartDate ?? '').localeCompare(b.plannedStartDate ?? ''))[0];
                  return upcoming?.id;
                })()}
              />
            </div>
          </ProgramSubjectTabs>
        )}
      </div>

      <LessonPlanPreviewModal
        open={!!previewLp}
        onClose={() => setPreviewLpId(null)}
        lessonPlan={previewLp}
      />
    </div>
  );
}

// ─── Chapter list (sorted by planned start, with filter bar) ───
interface ChapterListSectionProps {
  chapters: ProgramChapter[];
  filter: ChapterFilter;
  onFilterChange: (f: ChapterFilter) => void;
  onPreview: (lpId: string) => void;
  onTopicStatusChange: (topicId: string, status: TopicStatus) => void;
  focusChapterId?: string;
}

function ChapterListSection({ chapters, filter, onFilterChange, onPreview, onTopicStatusChange, focusChapterId }: ChapterListSectionProps) {
  const today = new Date();

  // Sort by first topic start date (chapters without dates fall to the end).
  const sorted = useMemo(() => {
    const withMeta = chapters.map((ch) => {
      const startIso = ch.topics?.[0]?.plannedStartDate ?? ch.plannedStartDate ?? '9999-12-31';
      const delta = getScheduleDeltaForChapter(ch, today);
      return { ch, startIso, delta };
    });
    withMeta.sort((a, b) => a.startIso.localeCompare(b.startIso));
    return withMeta;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  // Bucket each chapter for filter counts.
  const bucketOf = (state: ReturnType<typeof getScheduleDeltaForChapter>['state'], hasInProgressTopic: boolean): ChapterFilter[] => {
    const out: ChapterFilter[] = ['all'];
    if (state === 'behind') out.push('behind');
    else if (state === 'done') out.push('done');
    else if (state === 'not-started' && !hasInProgressTopic) out.push('upcoming');
    if (hasInProgressTopic) out.push('in-progress');
    return out;
  };

  const counts: Record<ChapterFilter, number> = { all: 0, behind: 0, 'in-progress': 0, upcoming: 0, done: 0 };
  for (const { ch, delta } of sorted) {
    const hasIP = (ch.topics ?? []).some((t) => t.status === 'in-progress');
    for (const b of bucketOf(delta.state, hasIP)) counts[b] += 1;
  }

  const visible = sorted.filter(({ ch, delta }) => {
    if (filter === 'all') return true;
    const hasIP = (ch.topics ?? []).some((t) => t.status === 'in-progress');
    return bucketOf(delta.state, hasIP).includes(filter);
  });

  // On mount (or when the focus chapter changes), scroll the currently-teaching
  // chapter into view so the teacher lands at "where I am" instead of May.
  useEffect(() => {
    if (!focusChapterId) return;
    const id = `chapter-${focusChapterId}`;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [focusChapterId]);

  return (
    <div id="chapters-section">
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800">Chapters & lesson plans</h2>
        </div>
        <ChapterScheduleFilters value={filter} onChange={onFilterChange} counts={counts} />
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-600">No chapters match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(({ ch }) => (
            <div key={ch.id} id={`chapter-${ch.id}`} className="scroll-mt-24">
              <ProgramChapterAccordion
                chapter={ch}
                defaultOpen={ch.id === focusChapterId}
                isCurrent={ch.id === focusChapterId}
                onPreview={onPreview}
                onTopicStatusChange={onTopicStatusChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


