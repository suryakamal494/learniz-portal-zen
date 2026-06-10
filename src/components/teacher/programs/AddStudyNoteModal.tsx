import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface StudyNoteContext {
  institute?: string;
  className?: string;
  subjectName?: string;
  chapterName?: string;
}

export interface NewStudyNote {
  title: string;
  fileName: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  context: StudyNoteContext;
  onShare: (note: NewStudyNote) => void;
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

export function AddStudyNoteModal({ open, onClose, context, onShare }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setFileName('');
    }
  }, [open]);

  const canShare = title.trim().length > 0 && fileName.length > 0;

  const handleShare = () => {
    if (!canShare) return;
    onShare({ title: title.trim(), fileName, description: description.trim() || undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share study note</DialogTitle>
          <p className="text-xs text-gray-500">
            Share a study note with this chapter. Students see it immediately — no extra steps.
          </p>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Chip label="Institute" value={context.institute} />
          <Chip label="Class" value={context.className} />
          <Chip label="Subject" value={context.subjectName} />
          <Chip label="Chapter" value={context.chapterName} />
        </div>

        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sn-title" className="text-xs font-medium text-gray-700">
              Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sn-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter summary handout"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sn-file" className="text-xs font-medium text-gray-700">
              Upload file <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sn-file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            />
            {fileName && <p className="text-[11px] text-gray-500">Selected: {fileName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sn-desc" className="text-xs font-medium text-gray-700">
              Short description <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="sn-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One line teachers will see alongside the note"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={!canShare}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Share note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
