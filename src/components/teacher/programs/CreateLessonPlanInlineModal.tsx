import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface LessonPlanContext {
  institute?: string;
  className?: string;
  subjectName?: string;
  chapterName?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  context: LessonPlanContext;
  /** Pre-fills the title when editing an existing teacher plan. */
  initialTitle?: string;
  mode?: 'create' | 'edit';
  onSubmit: (title: string) => void;
}

function Chip({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-700">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800">{value}</span>
    </span>
  );
}

export function CreateLessonPlanInlineModal({
  open,
  onClose,
  context,
  initialTitle = '',
  mode = 'create',
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  const handleSubmit = () => {
    const t = title.trim();
    if (!t) return;
    onSubmit(t);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit lesson plan' : 'Create lesson plan'}</DialogTitle>
          <p className="text-xs text-gray-500">
            {mode === 'edit'
              ? 'Update the title — you can manage material from the preview.'
              : 'Give your lesson plan a title. You can add material right after creating it.'}
          </p>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Chip label="Institute" value={context.institute} />
          <Chip label="Class" value={context.className} />
          <Chip label="Subject" value={context.subjectName} />
          <Chip label="Chapter" value={context.chapterName} />
        </div>

        <div className="space-y-1.5 mt-2">
          <Label htmlFor="lp-title" className="text-xs font-medium text-gray-700">
            Lesson plan title <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="lp-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Newton's Laws — Day 1 introduction"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === 'edit' ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
