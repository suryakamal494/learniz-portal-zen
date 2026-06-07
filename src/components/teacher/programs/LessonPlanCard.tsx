import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramLessonPlan } from '@/types/program';

interface Props {
  lessonPlan: ProgramLessonPlan;
  onPreview: () => void;
  /** Unused — kept for backward compatibility with existing callers. */
  usedInTopics?: Array<{ id: string; name: string }>;
}

export function LessonPlanCard({ lessonPlan, onPreview }: Props) {
  return (
    <div
      id={`lp-${lessonPlan.id}`}
      className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all scroll-mt-24 flex items-center justify-between gap-3"
    >
      <p className="text-sm font-semibold text-gray-900 truncate">{lessonPlan.title}</p>
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
  );
}
