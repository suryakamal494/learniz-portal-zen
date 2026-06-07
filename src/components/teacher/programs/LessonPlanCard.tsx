import React from 'react';
import { Eye, CheckCircle2, CircleDashed, CircleDot, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramLessonPlan, LessonPlanContentType } from '@/types/program';

interface Props {
  lessonPlan: ProgramLessonPlan;
  onPreview: () => void;
  /** Topic names this lesson plan is referenced by — rendered as "Used in" chips. */
  usedInTopics?: Array<{ id: string; name: string }>;
}

const typeLabel: Record<LessonPlanContentType, string> = {
  ppt: 'PPT',
  html: 'HTML',
  video: 'Video',
  pdf: 'PDF',
  note: 'Note',
};

export function LessonPlanCard({ lessonPlan, onPreview, usedInTopics = [] }: Props) {
  const counts: Partial<Record<LessonPlanContentType, number>> = {};
  for (const c of lessonPlan.contents) {
    counts[c.type] = (counts[c.type] ?? 0) + 1;
  }
  const countStr = Object.entries(counts)
    .map(([k, v]) => `${v} ${typeLabel[k as LessonPlanContentType]}${v! > 1 ? 's' : ''}`)
    .join(' · ');

  const statusBadge = {
    completed: { icon: CheckCircle2, label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    partial: { icon: CircleDot, label: 'In progress', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    'not-started': { icon: CircleDashed, label: 'Not started', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  }[lessonPlan.status];
  const StatusIcon = statusBadge.icon;

  return (
    <div
      id={`lp-${lessonPlan.id}`}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{lessonPlan.title}</p>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.cls}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusBadge.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">{lessonPlan.summary}</p>
          {countStr && (
            <p className="mt-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">Contents:</span> {countStr}
            </p>
          )}
          {usedInTopics.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700">
                <Link2 className="h-3 w-3" />
                Used in:
              </span>
              {usedInTopics.map((t) => (
                <span
                  key={t.id}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                  title={`This lesson plan supports topic "${t.name}".`}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onPreview}
          className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Preview
        </Button>
      </div>
    </div>
  );
}
