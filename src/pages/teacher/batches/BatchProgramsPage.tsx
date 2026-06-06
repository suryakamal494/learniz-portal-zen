import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import { ProgramSubjectTabs } from '@/components/teacher/programs/ProgramSubjectTabs';
import { ProgramChapterAccordion } from '@/components/teacher/programs/ProgramChapterAccordion';
import { LessonPlanPreviewModal } from '@/components/teacher/programs/LessonPlanPreviewModal';
import { meaningFromPct } from '@/utils/programProgress';

export default function BatchProgramsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const batch = mockBatches.find((b) => b.id === batchId);
  const program = batchId ? getProgramByBatchId(batchId) : undefined;

  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>(
    program?.subjects[0]?.id,
  );
  const [previewLpId, setPreviewLpId] = useState<string | null>(null);

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
            {batch.name}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Programs</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <BookOpenCheck className="h-5 w-5 text-blue-600" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Programs for {batch.name}</h1>
                <p className="text-xs text-gray-500">
                  {program
                    ? `${program.subjects.length} ${program.subjects.length === 1 ? 'subject' : 'subjects'} · ${program.subjects.reduce(
                        (a, s) => a + s.chapters.length,
                        0,
                      )} chapters`
                    : 'No program assigned yet'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/teacher/batches/${batch.id}/progress`)}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Open progress tracker
            </Button>
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
            <div className="space-y-3">
              {/* Subject meaning */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs text-blue-700 font-medium">What it shows</p>
                <p className="text-sm text-blue-900 mt-0.5">
                  Chapters in <span className="font-semibold">{activeSubject.name}</span>, with the lesson plans you'll
                  teach in each. {meaningFromPct(
                    Math.round(
                      activeSubject.chapters.reduce((acc, ch) => {
                        const planned = ch.lessonPlans.reduce((a, lp) => a + lp.hoursPlanned, 0);
                        const spent = ch.lessonPlans.reduce((a, lp) => a + lp.hoursSpent, 0);
                        return acc + (planned > 0 ? (spent / planned) * 100 : 0);
                      }, 0) / Math.max(1, activeSubject.chapters.length),
                    ),
                    activeSubject.name,
                  )}
                </p>
              </div>

              {activeSubject.chapters.map((ch, i) => (
                <ProgramChapterAccordion
                  key={ch.id}
                  chapter={ch}
                  defaultOpen={i === 0}
                  onPreview={(id) => setPreviewLpId(id)}
                />
              ))}
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
