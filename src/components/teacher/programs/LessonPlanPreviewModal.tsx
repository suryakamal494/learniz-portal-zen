import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Film, Globe, StickyNote, Presentation, ExternalLink } from 'lucide-react';
import { ProgramLessonPlan, LessonPlanContentType } from '@/types/program';

interface Props {
  open: boolean;
  onClose: () => void;
  lessonPlan: ProgramLessonPlan | null;
}

const typeMeta: Record<LessonPlanContentType, { label: string; icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  ppt: { label: 'Presentation', icon: Presentation, tint: 'bg-orange-50 text-orange-600' },
  html: { label: 'Interactive', icon: Globe, tint: 'bg-purple-50 text-purple-600' },
  video: { label: 'Video', icon: Film, tint: 'bg-blue-50 text-blue-600' },
  pdf: { label: 'PDF', icon: FileText, tint: 'bg-rose-50 text-rose-600' },
  note: { label: 'Note', icon: StickyNote, tint: 'bg-emerald-50 text-emerald-600' },
};

export function LessonPlanPreviewModal({ open, onClose, lessonPlan }: Props) {
  if (!lessonPlan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{lessonPlan.title}</DialogTitle>
          <DialogDescription className="text-xs">{lessonPlan.summary}</DialogDescription>
        </DialogHeader>

        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">
            Lesson plan contents ({lessonPlan.contents.length})
          </p>

          {lessonPlan.contents.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No content added to this lesson plan.</p>
          ) : (
            <ul className="space-y-2">
              {lessonPlan.contents.map((c) => {
                const meta = typeMeta[c.type];
                const Icon = meta.icon;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${meta.tint}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-500">
                        {meta.label}
                        {c.duration ? ` · ${c.duration}` : ''}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
