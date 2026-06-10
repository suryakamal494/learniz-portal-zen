import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramLessonPlan } from '@/types/program';

interface Props {
  lessonPlan: ProgramLessonPlan;
  onPreview: () => void;
  onEdit?: () => void;
  /** Unused — kept for backward compatibility with existing callers. */
  usedInTopics?: Array<{ id: string; name: string }>;
}

export function LessonPlanCard({ lessonPlan, onPreview, onEdit }: Props) {
  const isTeacher = lessonPlan.createdBy === 'teacher';

  return (
    <div
      id={`lp-${lessonPlan.id}`}
      className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all scroll-mt-24 flex items-center justify-between gap-3"
    >
      <div className="min-w-0 flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-gray-900 truncate">{lessonPlan.title}</p>
        {isTeacher && (
          <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Created by you
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isTeacher && onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
            aria-label="Edit lesson plan"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onPreview}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Preview
        </Button>
      </div>
    </div>
  );
}
