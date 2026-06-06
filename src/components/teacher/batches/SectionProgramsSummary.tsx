import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProgramSummary, meaningFromPct, toneForPct } from '@/utils/programProgress';

interface Props {
  batchId: string;
}

export function SectionProgramsSummary({ batchId }: Props) {
  const navigate = useNavigate();
  const summary = getProgramSummary(batchId);

  if (!summary || summary.subjects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <BookOpenCheck className="h-4 w-4 text-blue-600" />
          </span>
          <h3 className="font-semibold text-gray-900">Programs & Progress</h3>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          No program assigned to this section yet. Once your institute assigns a program, you'll see the chapter-wise
          plan and your teaching progress here.
        </p>
      </div>
    );
  }

  const subjectLabel = summary.subjects.length === 1 ? '1 subject' : `${summary.subjects.length} subjects`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <BookOpenCheck className="h-4 w-4 text-blue-600" />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">Programs & Progress</h3>
            <p className="text-xs text-gray-500">{subjectLabel} · {summary.overallPct}% overall completion</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {summary.subjects.map((s) => {
          const tone = toneForPct(s.completionPct);
          const barColor =
            tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
          const pillBg =
            tone === 'green'
              ? 'bg-emerald-50 text-emerald-700'
              : tone === 'amber'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-rose-50 text-rose-700';

          return (
            <div key={s.subjectId} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{s.subjectName}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pillBg}`}>
                  {s.completionPct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${s.completionPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {s.chaptersCount} chapters · {s.lessonPlansCount} lesson plans
              </p>
            </div>
          );
        })}

        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-xs text-blue-700 font-medium">What it means</p>
          <p className="text-sm text-blue-900 mt-0.5">
            {meaningFromPct(summary.overallPct, 'this section')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            onClick={() => navigate(`/teacher/batches/${batchId}/programs`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <BookOpenCheck className="h-4 w-4 mr-2" />
            View programs
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/batches/${batchId}/progress`)}
          >
            <LineChart className="h-4 w-4 mr-2" />
            Open progress tracker
          </Button>
        </div>
      </div>
    </div>
  );
}
