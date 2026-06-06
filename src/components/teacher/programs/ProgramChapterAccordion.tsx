import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ProgramChapter } from '@/types/program';
import { toneForPct } from '@/utils/programProgress';
import { LessonPlanCard } from './LessonPlanCard';

interface Props {
  chapter: ProgramChapter;
  defaultOpen?: boolean;
  onPreview: (lessonPlanId: string) => void;
}

export function ProgramChapterAccordion({ chapter, defaultOpen, onPreview }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);

  // Chapter % from lesson-plan hours
  let planned = 0;
  let spent = 0;
  for (const lp of chapter.lessonPlans) {
    planned += lp.hoursPlanned;
    spent += lp.hoursSpent;
  }
  const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
  const tone = toneForPct(pct);
  const pill =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-gray-400">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Chapter {chapter.order}: {chapter.name}
          </p>
          <p className="text-xs text-gray-500">
            {chapter.lessonPlans.filter((lp) => lp.status === 'completed').length} of {chapter.lessonPlans.length} lesson plans done
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pill}`}>{pct}%</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-3 bg-gray-50/50">
          {chapter.lessonPlans.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No lesson plans in this chapter yet.</p>
          ) : (
            chapter.lessonPlans.map((lp) => (
              <LessonPlanCard key={lp.id} lessonPlan={lp} onPreview={() => onPreview(lp.id)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
