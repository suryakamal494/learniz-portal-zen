import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Film,
  Globe,
  StickyNote,
  Presentation,
  ExternalLink,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { ProgramLessonPlan, LessonPlanContent, LessonPlanContentType } from '@/types/program';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  lessonPlan: ProgramLessonPlan | null;
  /** Auto-filled context shown as read-only chips when adding material. */
  context?: {
    institute?: string;
    className?: string;
    subjectName?: string;
    chapterName?: string;
  };
  /** Fires when teacher saves new material. Parent appends it to the plan. */
  onAddContent?: (lessonPlanId: string, content: LessonPlanContent) => void;
  /** Open straight into the add-material form. Defaults to 'list'. */
  initialView?: 'list' | 'add';
}

const typeMeta: Record<
  LessonPlanContentType,
  { label: string; icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  ppt: { label: 'Presentation', icon: Presentation, tint: 'bg-orange-50 text-orange-600' },
  html: { label: 'Interactive', icon: Globe, tint: 'bg-purple-50 text-purple-600' },
  video: { label: 'Video', icon: Film, tint: 'bg-blue-50 text-blue-600' },
  pdf: { label: 'PDF', icon: FileText, tint: 'bg-rose-50 text-rose-600' },
  note: { label: 'Note', icon: StickyNote, tint: 'bg-emerald-50 text-emerald-600' },
};

function Chip({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-700">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800">{value}</span>
    </span>
  );
}

export function LessonPlanPreviewModal({ open, onClose, lessonPlan, context, onAddContent, initialView = 'list' }: Props) {
  const [view, setView] = useState<'list' | 'add'>(initialView);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LessonPlanContentType>('pdf');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setView(initialView);
    } else {
      setView('list');
      setTitle('');
      setType('pdf');
      setUrl('');
      setFileName('');
      setNoteBody('');
    }
  }, [open, initialView]);

  if (!lessonPlan) return null;

  const isTeacher = lessonPlan.createdBy === 'teacher';
  const needsUrl = type === 'video' || type === 'html';
  const needsFile = type === 'pdf' || type === 'ppt';
  const needsText = type === 'note';

  const canSave =
    title.trim().length > 0 &&
    ((needsUrl && url.trim().length > 0) ||
      (needsFile && fileName.length > 0) ||
      (needsText && noteBody.trim().length > 0));

  const handleSave = () => {
    if (!canSave || !onAddContent) return;
    const content: LessonPlanContent = {
      id: `lpc-${Date.now()}`,
      type,
      title: title.trim(),
      url: needsUrl ? url.trim() : needsFile ? fileName : undefined,
    };
    onAddContent(lessonPlan.id, content);
    toast({ title: 'Material added', description: `"${content.title}" added to ${lessonPlan.title}.` });
    setView('list');
    setTitle('');
    setUrl('');
    setFileName('');
    setNoteBody('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {view === 'list' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">{lessonPlan.title}</DialogTitle>
              <DialogDescription className="text-xs">{lessonPlan.summary}</DialogDescription>
            </DialogHeader>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                  Lesson plan contents ({lessonPlan.contents.length})
                </p>
                {isTeacher && onAddContent && (
                  <Button
                    size="sm"
                    onClick={() => setView('add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add material
                  </Button>
                )}
              </div>

              {lessonPlan.contents.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  {isTeacher
                    ? 'No material yet — click "Add material" to attach a PDF, video, slides or a note.'
                    : 'No content added to this lesson plan.'}
                </p>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-gray-600"
                  aria-label="Back to contents"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle className="text-base">Add material</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Attach a file, link or note to <span className="font-medium">{lessonPlan.title}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5">
              <Chip label="Institute" value={context?.institute} />
              <Chip label="Class" value={context?.className} />
              <Chip label="Subject" value={context?.subjectName} />
              <Chip label="Chapter" value={context?.chapterName} />
              <Chip label="Lesson plan" value={lessonPlan.title} />
            </div>

            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="mat-title" className="text-xs font-medium text-gray-700">
                  Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="mat-title"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Newton's 1st Law — slides"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as LessonPlanContentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="ppt">Presentation</SelectItem>
                    <SelectItem value="video">Video (URL)</SelectItem>
                    <SelectItem value="html">Interactive link</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {needsFile && (
                <div className="space-y-1.5">
                  <Label htmlFor="mat-file" className="text-xs font-medium text-gray-700">
                    Upload file <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="mat-file"
                    type="file"
                    accept={type === 'pdf' ? '.pdf' : '.ppt,.pptx,.key'}
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                  />
                  {fileName && <p className="text-[11px] text-gray-500">Selected: {fileName}</p>}
                </div>
              )}

              {needsUrl && (
                <div className="space-y-1.5">
                  <Label htmlFor="mat-url" className="text-xs font-medium text-gray-700">
                    URL <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="mat-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {needsText && (
                <div className="space-y-1.5">
                  <Label htmlFor="mat-note" className="text-xs font-medium text-gray-700">
                    Note <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="mat-note"
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Write a short note for the class..."
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setView('list')}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save material
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
