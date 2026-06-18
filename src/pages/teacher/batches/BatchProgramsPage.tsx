import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, AlertTriangle, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import { ProgramSubjectTabs } from '@/components/teacher/programs/ProgramSubjectTabs';
import { ProgramChapterAccordion } from '@/components/teacher/programs/ProgramChapterAccordion';
import { LessonPlanPreviewModal } from '@/components/teacher/programs/LessonPlanPreviewModal';
import { StatusOverviewStrip } from '@/components/teacher/programs/StatusOverviewStrip';
import { ChapterScheduleFilters, ChapterFilter } from '@/components/teacher/programs/ChapterScheduleFilters';
import { getSubjectById } from '@/lib/voiceCatalog';
import { getStaleStatusInfo, SCHEDULE_STALE_DAYS, getScheduleDeltaForChapter, getTodayFocus } from '@/utils/programSchedule';
import { Program, ProgramChapter, ProgramLessonPlan, LessonPlanContent, TopicStatus, ChapterStudyNote, ChapterTest } from '@/types/program';
import { AddLessonPlanModal } from '@/components/teacher/programs/AddLessonPlanModal';
import { CreateLessonPlanInlineModal } from '@/components/teacher/programs/CreateLessonPlanInlineModal';
import { AddStudyNoteModal } from '@/components/teacher/programs/AddStudyNoteModal';
import { ChapterTestPreviewModal } from '@/components/teacher/programs/ChapterTestPreviewModal';
import { getChapterTests } from '@/data/mockChapterTests';
import { useToast } from '@/hooks/use-toast';

export default function BatchProgramsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const batch = mockBatches.find((b) => b.id === batchId);
  const baseProgram = batchId ? getProgramByBatchId(batchId) : undefined;

  // In-session overrides
  const [statusOverrides, setStatusOverrides] = useState<Record<string, { status: TopicStatus; lastUpdatedAt: string }>>({});
  const [addedLessonPlans, setAddedLessonPlans] = useState<Record<string, ProgramLessonPlan[]>>({});
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});
  const [contentOverrides, setContentOverrides] = useState<Record<string, LessonPlanContent[]>>({});

  // Modal state
  const [addModalChapterId, setAddModalChapterId] = useState<string | null>(null);
  const [createModalChapterId, setCreateModalChapterId] = useState<string | null>(null);
  const [editLessonPlanId, setEditLessonPlanId] = useState<string | null>(null);
  const [previewLpId, setPreviewLpId] = useState<string | null>(null);
  const [addMaterialLpId, setAddMaterialLpId] = useState<string | null>(null);
  const [addNotesChapterId, setAddNotesChapterId] = useState<string | null>(null);
  const [studyNotes, setStudyNotes] = useState<Record<string, ChapterStudyNote[]>>({});
  const [chapterTests, setChapterTests] = useState<Record<string, ChapterTest[]>>({});
  const [previewTestId, setPreviewTestId] = useState<string | null>(null);
  const { toast } = useToast();


  const program: Program | undefined = useMemo(() => {
    if (!baseProgram) return undefined;
    return {
      ...baseProgram,
      subjects: baseProgram.subjects.map((s) => ({
        ...s,
        chapters: s.chapters.map((ch) => {
          const merged: ProgramLessonPlan[] = [
            ...ch.lessonPlans,
            ...(addedLessonPlans[ch.id] ?? []),
          ].map((lp) => ({
            ...lp,
            title: titleOverrides[lp.id] ?? lp.title,
            contents: contentOverrides[lp.id]
              ? [...lp.contents, ...contentOverrides[lp.id]]
              : lp.contents,
          }));
          return {
            ...ch,
            lessonPlans: merged,
            topics: ch.topics?.map((t) => {
              const o = statusOverrides[t.id];
              return o ? { ...t, status: o.status, lastUpdatedAt: o.lastUpdatedAt } : t;
            }),
          };
        }),
      })),
    };
  }, [baseProgram, statusOverrides, addedLessonPlans, titleOverrides, contentOverrides]);

  const handleTopicStatus = (topicId: string, status: TopicStatus) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [topicId]: { status, lastUpdatedAt: new Date().toISOString() },
    }));
  };

  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>(
    program?.subjects[0]?.id,
  );
  const [staleDismissed, setStaleDismissed] = useState(false);
  const [filter, setFilter] = useState<ChapterFilter>('all');

  useEffect(() => {
    const subjSlug = searchParams.get('subject');
    if (!subjSlug || !program) return;
    const name = getSubjectById(subjSlug)?.name?.toLowerCase();
    if (!name) return;
    const match = program.subjects.find((s) => s.name.toLowerCase() === name);
    if (match) setActiveSubjectId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  useEffect(() => {
    const h = location.hash;
    if (!h) return;
    const id = h.startsWith('#') ? h.slice(1) : h;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [location.hash, activeSubjectId]);

  const activeSubject = useMemo(
    () => program?.subjects.find((s) => s.id === (activeSubjectId ?? program?.subjects[0]?.id)),
    [program, activeSubjectId],
  );

  // Locate any lesson plan + its chapter/subject (used for modal context).
  const findPlanContext = (lpId: string | null) => {
    if (!lpId || !program) return null;
    for (const s of program.subjects) {
      for (const ch of s.chapters) {
        const lp = ch.lessonPlans.find((p) => p.id === lpId);
        if (lp) return { plan: lp, chapter: ch, subject: s };
      }
    }
    return null;
  };

  const activeLpId = addMaterialLpId ?? previewLpId;
  const previewCtx = findPlanContext(activeLpId);
  const editCtx = findPlanContext(editLessonPlanId);

  const findChapter = (chapterId: string | null) => {
    if (!chapterId || !program) return null;
    for (const s of program.subjects) {
      const ch = s.chapters.find((c) => c.id === chapterId);
      if (ch) return { chapter: ch, subject: s };
    }
    return null;
  };

  const createChapter = useMemo(() => findChapter(createModalChapterId), [createModalChapterId, program]);
  const notesChapter = useMemo(() => findChapter(addNotesChapterId), [addNotesChapterId, program]);

  const staleInfo = useMemo(() => (program ? getStaleStatusInfo(program) : null), [program]);

  const handleToggleTestEnabled = (testId: string) => {
    setChapterTests((prev) => {
      let chapterId: string | null = null;
      let source: ChapterTest[] | null = null;
      for (const [cid, arr] of Object.entries(prev)) {
        if (arr.some((t) => t.id === testId)) { chapterId = cid; source = arr; break; }
      }
      if (!chapterId && program) {
        for (const s of program.subjects) {
          for (const ch of s.chapters) {
            const seed = getChapterTests(ch.id);
            if (seed.some((t) => t.id === testId)) { chapterId = ch.id; source = seed; break; }
          }
          if (chapterId) break;
        }
      }
      if (!chapterId || !source) return prev;
      return {
        ...prev,
        [chapterId]: source.map((t) => t.id === testId ? { ...t, enabledForStudents: !t.enabledForStudents } : t),
      };
    });
  };

  const handleAddTestsFromLibrary = (chapterId: string, picked: ChapterTest[]) => {
    setChapterTests((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] ?? getChapterTests(chapterId)), ...picked],
    }));
    toast({ title: `${picked.length} test${picked.length === 1 ? '' : 's'} added`, description: 'Now available for this chapter.' });
  };

  const handleCreateTest = (chapterId: string) => {
    const ctx = findChapter(chapterId);
    const params = new URLSearchParams();
    params.set('chapterId', chapterId);
    if (ctx?.subject.id) params.set('subjectId', ctx.subject.id);
    if (batchId) params.set('batchId', batchId);
    navigate(`/teacher/exams/ai-generator?${params.toString()}`);
  };

  const previewTest: ChapterTest | null = (() => {
    if (!previewTestId || !program) return null;
    for (const s of program.subjects) {
      for (const ch of s.chapters) {
        const arr = chapterTests[ch.id] ?? getChapterTests(ch.id);
        const found = arr.find((t) => t.id === previewTestId);
        if (found) return found;
      }
    }
    return null;
  })();


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

  const baseCtx = {
    institute: 'Learniz Institute',
    className: batch.class,
  };

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
                  ? `Mark a topic as you start teaching so "Periods behind" stays accurate (we nudge after ${SCHEDULE_STALE_DAYS} days of silence).`
                  : `Mark the topics you've taught — "Today's focus" and "Periods behind" rely on these updates.`}
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
                onCreateLessonPlan={(chapterId) => setCreateModalChapterId(chapterId)}
                onAddFromLibrary={(chapterId) => setAddModalChapterId(chapterId)}
                onEditLessonPlan={(lpId) => setEditLessonPlanId(lpId)}
                onAddMaterial={(lpId) => setAddMaterialLpId(lpId)}
                onAddStudyNote={(chapterId) => setAddNotesChapterId(chapterId)}
                studyNoteCounts={Object.fromEntries(
                  Object.entries(studyNotes).map(([k, v]) => [k, v.length]),
                )}
                studyNotesByChapter={studyNotes}
                testsByChapter={Object.fromEntries(
                  activeSubject.chapters.map((ch) => [ch.id, chapterTests[ch.id] ?? getChapterTests(ch.id)])
                )}
                onPreviewTest={(id) => setPreviewTestId(id)}
                onToggleTestEnabled={handleToggleTestEnabled}
                onAddTestsFromLibrary={handleAddTestsFromLibrary}
                onCreateTest={handleCreateTest}
                focusChapterId={(() => {
                  const todayIso = new Date().toISOString().slice(0, 10);
                  const chapters = activeSubject.chapters;
                  const current = chapters.find((ch) =>
                    (ch.topics ?? []).some((t) => t.plannedStartDate <= todayIso && todayIso <= t.plannedEndDate)
                  );
                  if (current) return current.id;
                  const upcoming = [...chapters]
                    .filter((ch) => (ch.plannedStartDate ?? '') > todayIso)
                    .sort((a, b) => (a.plannedStartDate ?? '').localeCompare(b.plannedStartDate ?? ''))[0];
                  return upcoming?.id;
                })()}
              />
            </div>
          </ProgramSubjectTabs>
        )}
      </div>

      <LessonPlanPreviewModal
        open={!!previewCtx}
        initialView={addMaterialLpId ? 'add' : 'list'}
        onClose={() => {
          setPreviewLpId(null);
          setAddMaterialLpId(null);
        }}
        lessonPlan={previewCtx?.plan ?? null}
        context={{
          ...baseCtx,
          subjectName: previewCtx?.subject.name,
          chapterName: previewCtx?.chapter.name,
        }}
        onAddContent={(lessonPlanId, content) => {
          setContentOverrides((prev) => ({
            ...prev,
            [lessonPlanId]: [...(prev[lessonPlanId] ?? []), content],
          }));
        }}
      />


      <AddLessonPlanModal
        open={!!addModalChapterId}
        onClose={() => setAddModalChapterId(null)}
        onAdd={(plans) => {
          if (!addModalChapterId) return;
          setAddedLessonPlans((prev) => ({
            ...prev,
            [addModalChapterId]: [...(prev[addModalChapterId] ?? []), ...plans],
          }));
        }}
      />

      <CreateLessonPlanInlineModal
        open={!!createChapter}
        onClose={() => setCreateModalChapterId(null)}
        context={{
          ...baseCtx,
          subjectName: createChapter?.subject.name,
          chapterName: createChapter?.chapter.name,
        }}
        onSubmit={(title) => {
          if (!createModalChapterId) return;
          const plan: ProgramLessonPlan = {
            id: `lp-teacher-${Date.now()}`,
            title,
            summary: 'Created by you',
            contents: [],
            status: 'not-started',
            hoursPlanned: 0,
            hoursSpent: 0,
            createdBy: 'teacher',
          };
          setAddedLessonPlans((prev) => ({
            ...prev,
            [createModalChapterId]: [...(prev[createModalChapterId] ?? []), plan],
          }));
          // Open preview right away so the teacher can immediately add material.
          setPreviewLpId(plan.id);
        }}
      />

      <CreateLessonPlanInlineModal
        open={!!editCtx}
        mode="edit"
        onClose={() => setEditLessonPlanId(null)}
        context={{
          ...baseCtx,
          subjectName: editCtx?.subject.name,
          chapterName: editCtx?.chapter.name,
        }}
        initialTitle={editCtx?.plan.title ?? ''}
        onSubmit={(title) => {
          if (!editLessonPlanId) return;
          setTitleOverrides((prev) => ({ ...prev, [editLessonPlanId]: title }));
        }}
      />

      <AddStudyNoteModal
        open={!!notesChapter}
        onClose={() => setAddNotesChapterId(null)}
        context={{
          ...baseCtx,
          subjectName: notesChapter?.subject.name,
          chapterName: notesChapter?.chapter.name,
        }}
        onShare={({ title, fileName, description }) => {
          if (!addNotesChapterId) return;
          const note: ChapterStudyNote = {
            id: `sn-${Date.now()}`,
            title,
            fileName,
            description,
            sharedAt: new Date().toISOString(),
          };
          setStudyNotes((prev) => ({
            ...prev,
            [addNotesChapterId]: [...(prev[addNotesChapterId] ?? []), note],
          }));
          toast({ title: 'Study note shared', description: `"${title}" is now shared with this chapter.` });
        }}
      />

      <ChapterTestPreviewModal
        open={!!previewTest}
        onClose={() => setPreviewTestId(null)}
        test={previewTest}
      />
    </div>
  );
}

interface ChapterListSectionProps {
  chapters: ProgramChapter[];
  filter: ChapterFilter;
  onFilterChange: (f: ChapterFilter) => void;
  onPreview: (lpId: string) => void;
  onTopicStatusChange: (topicId: string, status: TopicStatus) => void;
  onCreateLessonPlan?: (chapterId: string) => void;
  onAddFromLibrary?: (chapterId: string) => void;
  onEditLessonPlan?: (lessonPlanId: string) => void;
  onAddMaterial?: (lessonPlanId: string) => void;
  onAddStudyNote?: (chapterId: string) => void;
  studyNoteCounts?: Record<string, number>;
  studyNotesByChapter?: Record<string, ChapterStudyNote[]>;
  testsByChapter?: Record<string, ChapterTest[]>;
  onPreviewTest?: (testId: string) => void;
  onToggleTestEnabled?: (testId: string) => void;
  onAddTestsFromLibrary?: (chapterId: string, tests: ChapterTest[]) => void;
  onCreateTest?: (chapterId: string) => void;
  focusChapterId?: string;
}

function ChapterListSection({
  chapters,
  filter,
  onFilterChange,
  onPreview,
  onTopicStatusChange,
  onCreateLessonPlan,
  onAddFromLibrary,
  onEditLessonPlan,
  onAddMaterial,
  onAddStudyNote,
  studyNoteCounts,
  studyNotesByChapter,
  testsByChapter,
  onPreviewTest,
  onToggleTestEnabled,
  onAddTestsFromLibrary,
  onCreateTest,
  focusChapterId,
}: ChapterListSectionProps) {
  const today = new Date();

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
                onCreateLessonPlan={onCreateLessonPlan}
                onAddFromLibrary={onAddFromLibrary}
                onEditLessonPlan={onEditLessonPlan}
                onAddMaterial={onAddMaterial}
                onAddStudyNote={onAddStudyNote}
                studyNoteCount={studyNoteCounts?.[ch.id] ?? 0}
                tests={testsByChapter?.[ch.id] ?? []}
                onPreviewTest={onPreviewTest}
                onToggleTestEnabled={onToggleTestEnabled}
                onAddTestsFromLibrary={onAddTestsFromLibrary}
                onCreateTest={onCreateTest}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
