import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import {
  formatHours,
  getChapterProgressList,
  getProgressOverview,
  getProgramSummary,
  meaningFromPct,
} from '@/utils/programProgress';
import { SubjectSwitch } from '@/components/teacher/programs/SubjectSwitch';
import { ProgramChapterAccordion } from '@/components/teacher/programs/ProgramChapterAccordion';
import { LessonPlanPreviewModal } from '@/components/teacher/programs/LessonPlanPreviewModal';

type StatusFilter = 'all' | 'in-progress' | 'not-started' | 'done';

export default function BatchCurriculumPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const batch = mockBatches.find((b) => b.id === batchId);
  const program = batchId ? getProgramByBatchId(batchId) : undefined;
  const overview = batchId ? getProgressOverview(batchId) : null;
  const summary = batchId ? getProgramSummary(batchId) : null;

  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>(
    program?.subjects[0]?.id,
  );
  const [status, setStatus] = useState<StatusFilter>('all');
  const [previewLpId, setPreviewLpId] = useState<string | null>(null);

  const activeSubject = useMemo(
    () => program?.subjects.find((s) => s.id === (activeSubjectId ?? program?.subjects[0]?.id)),
    [program, activeSubjectId],
  );

  const subjectOptions = useMemo(() => {
    if (!program || !summary) return [];
    return program.subjects.map((s) => ({
      ...s,
      completionPct: summary.subjects.find((x) => x.subjectId === s.id)?.completionPct ?? 0,
    }));
  }, [program, summary]);

  const chapterRows = useMemo(() => {
    if (!program || !activeSubject) return [];
    let rows = getChapterProgressList(program, activeSubject.id);
    if (status === 'done') rows = rows.filter((r) => r.completionPct >= 100);
    else if (status === 'not-started') rows = rows.filter((r) => r.completionPct === 0);
    else if (status === 'in-progress')
      rows = rows.filter((r) => r.completionPct > 0 && r.completionPct < 100);
    return new Set(rows.map((r) => r.chapterId));
  }, [program, activeSubject, status]);

  const previewLp = useMemo(() => {
    if (!previewLpId || !program) return null;
    for (const s of program.subjects)
      for (const ch of s.chapters) for (const lp of ch.lessonPlans) if (lp.id === previewLpId) return lp;
    return null;
  }, [previewLpId, program]);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-700 font-medium">Section not found</p>
          <Button
            onClick={() => navigate('/teacher/batches')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to My Sections
          </Button>
        </div>
      </div>
    );
  }

  const totalChapters =
    program?.subjects.reduce((a, s) => a + s.chapters.length, 0) ?? 0;

  const activeSubjectPct =
    summary?.subjects.find((s) => s.subjectId === activeSubject?.id)?.completionPct ?? 0;

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
            {batch.name}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Curriculum</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <BookOpenCheck className="h-5 w-5 text-blue-600" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Curriculum · {batch.name}
              </h1>
              <p className="text-xs text-gray-500">
                {program
                  ? `${program.subjects.length} ${program.subjects.length === 1 ? 'subject' : 'subjects'} · ${totalChapters} chapters · ${summary?.overallPct ?? 0}% overall`
                  : 'No program assigned yet'}
              </p>
            </div>
          </div>
        </div>

        {!program || !activeSubject || !overview ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-700 font-medium">
              No program assigned to this section yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Chapters, lesson plans and progress will appear here once a program is assigned.
            </p>
          </div>
        ) : (
          <>
            {/* Progress overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <OverviewTile
                label="Overall completion"
                value={`${overview.overallPct}%`}
                tint="bg-blue-50 text-blue-900"
              />
              <OverviewTile
                label="Hours taught"
                value={`${formatHours(overview.hoursSpent)} / ${formatHours(overview.hoursPlanned)}`}
                tint="bg-emerald-50 text-emerald-900"
              />
              <OverviewTile
                label="Lessons completed"
                value={`${overview.completedLessons} of ${overview.totalLessons}`}
                tint="bg-purple-50 text-purple-900"
              />
              <OverviewTile
                label="In progress / Not started"
                value={`${overview.partialLessons} / ${overview.notStartedLessons}`}
                tint="bg-amber-50 text-amber-900"
              />
            </div>

            {/* Subject switch — only if 2+ subjects */}
            <SubjectSwitch
              subjects={subjectOptions}
              activeSubjectId={activeSubject.id}
              onChange={setActiveSubjectId}
            />

            {/* What it shows / means strip */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs text-blue-700 font-medium">
                What you're looking at · {activeSubject.name}
              </p>
              <p className="text-sm text-blue-900 mt-0.5">
                Chapters and lesson plans for {activeSubject.name}, with your teaching progress per chapter. {meaningFromPct(activeSubjectPct, activeSubject.name)}
              </p>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-1">Show:</span>
              {([
                ['all', 'All'],
                ['in-progress', 'In progress'],
                ['not-started', 'Not started'],
                ['done', 'Done'],
              ] as Array<[StatusFilter, string]>).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setStatus(k)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    status === k
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chapter accordion */}
            <div className="space-y-3">
              {activeSubject.chapters
                .filter((ch) => chapterRows.has(ch.id))
                .map((ch, i) => (
                  <ProgramChapterAccordion
                    key={ch.id}
                    chapter={ch}
                    defaultOpen={i === 0}
                    onPreview={(id) => setPreviewLpId(id)}
                  />
                ))}
              {activeSubject.chapters.filter((ch) => chapterRows.has(ch.id)).length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                  No chapters match this filter.
                </div>
              )}
            </div>
          </>
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

function OverviewTile({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 p-4 ${tint}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-base md:text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
