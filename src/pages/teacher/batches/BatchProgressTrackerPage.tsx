import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LineChart, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBatches } from '@/data/mockBatches';
import { getProgramByBatchId } from '@/data/mockPrograms';
import {
  formatHours,
  getChapterProgressList,
  getProgressOverview,
  meaningFromPct,
  toneForPct,
} from '@/utils/programProgress';
import { ProgramSubjectTabs } from '@/components/teacher/programs/ProgramSubjectTabs';

type StatusFilter = 'all' | 'in-progress' | 'not-started' | 'done';

export default function BatchProgressTrackerPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const batch = mockBatches.find((b) => b.id === batchId);
  const program = batchId ? getProgramByBatchId(batchId) : undefined;
  const overview = batchId ? getProgressOverview(batchId) : null;

  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>(
    program?.subjects[0]?.id,
  );
  const [status, setStatus] = useState<StatusFilter>('all');

  const activeSubject = useMemo(
    () => program?.subjects.find((s) => s.id === (activeSubjectId ?? program?.subjects[0]?.id)),
    [program, activeSubjectId],
  );

  const chapterRows = useMemo(() => {
    if (!program || !activeSubject) return [];
    let rows = getChapterProgressList(program, activeSubject.id);
    if (status === 'done') rows = rows.filter((r) => r.completionPct >= 100);
    else if (status === 'not-started') rows = rows.filter((r) => r.completionPct === 0);
    else if (status === 'in-progress') rows = rows.filter((r) => r.completionPct > 0 && r.completionPct < 100);
    return rows;
  }, [program, activeSubject, status]);

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
          <span className="text-gray-900 font-medium">Progress</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <LineChart className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">My progress · {batch.name}</h1>
                <p className="text-xs text-gray-500">Chapter-wise teaching progress for this section.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/teacher/batches/${batch.id}/programs`)}
            >
              <BookOpenCheck className="h-4 w-4 mr-2" />
              View programs
            </Button>
          </div>
        </div>


        {!program || !activeSubject ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-700 font-medium">No program assigned to this section yet.</p>
            <p className="text-xs text-gray-500 mt-1">Progress will appear once a program is assigned.</p>
          </div>
        ) : (
          <ProgramSubjectTabs
            subjects={program.subjects}
            activeSubjectId={activeSubject.id}
            onChange={setActiveSubjectId}
          >
            <div className="space-y-4">
              {/* Filter */}
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

              {/* Chapter rows */}
              {chapterRows.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                  No chapters match this filter.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {chapterRows.map((row) => {
                    const tone = toneForPct(row.completionPct);
                    const bar = tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
                    const pill =
                      tone === 'green'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tone === 'amber'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700';
                    return (
                      <div key={row.chapterId} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{row.chapterName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {row.completedLessonPlans} completed · {row.partialLessonPlans} in progress · {row.totalLessonPlans} total
                              {row.lastTaughtDate ? ` · last taught ${row.lastTaughtDate}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pill}`}>
                              {row.completionPct}%
                            </span>
                            <p className="text-[11px] text-gray-500 mt-1">
                              {formatHours(row.hoursSpent)} / {formatHours(row.hoursPlanned)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${bar} transition-all`} style={{ width: `${row.completionPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meaning */}
              {overview && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs text-blue-700 font-medium">What it means</p>
                  <p className="text-sm text-blue-900 mt-0.5">
                    {meaningFromPct(overview.overallPct, activeSubject.name)}
                  </p>
                </div>
              )}
            </div>
          </ProgramSubjectTabs>
        )}
      </div>
    </div>
  );
}

function OverviewTile({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 p-4 ${tint}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
