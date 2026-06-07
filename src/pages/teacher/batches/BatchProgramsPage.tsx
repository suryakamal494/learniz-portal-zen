import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, AlertTriangle, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import { ProgramSubjectTabs } from '@/components/teacher/programs/ProgramSubjectTabs';
import { ProgramChapterAccordion } from '@/components/teacher/programs/ProgramChapterAccordion';
import { LessonPlanPreviewModal } from '@/components/teacher/programs/LessonPlanPreviewModal';
import { TodayFocusCard } from '@/components/teacher/programs/TodayFocusCard';
import { StatusOverviewStrip } from '@/components/teacher/programs/StatusOverviewStrip';
import { getSubjectById } from '@/lib/voiceCatalog';
import { getStaleStatusInfo, SCHEDULE_STALE_DAYS } from '@/utils/programSchedule';
import { Program, TopicStatus } from '@/types/program';

export default function BatchProgramsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const batch = mockBatches.find((b) => b.id === batchId);
  const baseProgram = batchId ? getProgramByBatchId(batchId) : undefined;

  // In-session topic-status overrides — toggled by Today's focus + (later) chapter rows.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, { status: TopicStatus; lastUpdatedAt: string }>>({});

  const program: Program | undefined = useMemo(() => {
    if (!baseProgram) return undefined;
    if (Object.keys(statusOverrides).length === 0) return baseProgram;
    return {
      ...baseProgram,
      subjects: baseProgram.subjects.map(s => ({
        ...s,
        chapters: s.chapters.map(ch => ({
          ...ch,
          topics: ch.topics?.map(t => {
            const o = statusOverrides[t.id];
            return o ? { ...t, status: o.status, lastUpdatedAt: o.lastUpdatedAt } : t;
          }),
        })),
      })),
    };
  }, [baseProgram, statusOverrides]);

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

  // Deep-link to #progress section (kept for old /progress route).
  useEffect(() => {
    if (location.hash === '#progress') {
      requestAnimationFrame(() => {
        document.getElementById('progress')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash]);

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

        {/* Stale-status alert (Phase 6 will refine; live now via Phase 1 util) */}
        {program && staleInfo?.isStale && !staleDismissed && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {staleInfo.daysSinceLastUpdate === null
                  ? 'No topic status updated yet'
                  : `You haven't updated progress for ${staleInfo.daysSinceLastUpdate} day${staleInfo.daysSinceLastUpdate === 1 ? '' : 's'}`}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Mark the topics you've taught so your schedule view stays accurate (threshold: {SCHEDULE_STALE_DAYS} days).
              </p>
            </div>
            <button
              onClick={() => setStaleDismissed(true)}
              className="text-xs text-amber-800 hover:text-amber-900 font-medium px-2 py-1 rounded-md hover:bg-amber-100"
            >
              Dismiss
            </button>
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
              {/* Today's focus — Phase 3 will fill in */}
              <SectionPlaceholder
                id="today"
                icon={<Sparkles className="h-5 w-5 text-blue-600" />}
                title="Today's focus"
                subtitle="The topic you're scheduled to teach right now and whether you're on track."
                badge="Coming in Phase 3"
              />

              {/* Status overview — Phase 3 */}
              <SectionPlaceholder
                id="progress"
                icon={<ListChecks className="h-5 w-5 text-emerald-600" />}
                title="Where you stand"
                subtitle="Syllabus completion, chapters in progress, and chapters behind schedule."
                badge="Coming in Phase 3"
              />

              {/* Schedule + chapter list — Phase 4 will rewrite; show current accordion meanwhile */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <CalendarRange className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-800">Chapters & lesson plans</h2>
                </div>
                <div className="space-y-3">
                  {activeSubject.chapters.map((ch, i) => (
                    <ProgramChapterAccordion
                      key={ch.id}
                      chapter={ch}
                      defaultOpen={i === 0}
                      onPreview={(id) => setPreviewLpId(id)}
                    />
                  ))}
                </div>
              </div>
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

function SectionPlaceholder({
  id,
  icon,
  title,
  subtitle,
  badge,
}: {
  id?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
}) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-dashed border-gray-300 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 shrink-0">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
          {badge}
        </span>
      </div>
    </div>
  );
}
