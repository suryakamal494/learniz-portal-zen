import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { LessonPlanContent } from '@/types/program';
import { AnnotationOverlay } from '@/components/teacher/preview/AnnotationOverlay';

interface Props {
  open: boolean;
  onClose: () => void;
  content: LessonPlanContent | null;
}

function PlaceholderSlide({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full h-full grid place-items-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="text-center px-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">{subtitle}</p>
        <h1 className="text-4xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-4 text-slate-500">
          Use the toolbar below to annotate. Switch to <strong>Interact</strong> to click through
          into the content (or press <kbd className="px-1.5 py-0.5 rounded border bg-white text-xs">Space</kbd>).
        </p>
      </div>
    </div>
  );
}

export function LessonContentPreviewModal({ open, onClose, content }: Props) {
  if (!content) return null;

  const url = content.url && content.url !== '#' ? content.url : '';

  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return url ? (
          <video src={url} controls className="w-full h-full object-contain bg-black" />
        ) : (
          <PlaceholderSlide title={content.title} subtitle="Video preview" />
        );
      case 'html':
      case 'ppt':
      case 'pdf':
        return url ? (
          <iframe
            src={url}
            className="w-full h-full bg-white"
            title={content.title}
          />
        ) : (
          <PlaceholderSlide
            title={content.title}
            subtitle={
              content.type === 'html'
                ? 'Interactive simulation'
                : content.type === 'ppt'
                  ? 'Presentation preview'
                  : 'PDF preview'
            }
          />
        );
      case 'note':
        return (
          <div className="w-full h-full bg-white p-10 overflow-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{content.title}</h1>
            <p className="text-lg text-gray-700 whitespace-pre-wrap">
              {url || 'Note content goes here. Use Pen/Marker/Highlighter to annotate as you teach.'}
            </p>
          </div>
        );
      default:
        return <PlaceholderSlide title={content.title} subtitle="Preview" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 border-0 rounded-none bg-black
                   w-screen h-screen max-w-[100vw] sm:max-w-[100vw]
                   sm:rounded-none translate-x-0 translate-y-0 left-0 top-0"
        style={{ left: 0, top: 0, transform: 'none' }}
      >
        {/* Title chip */}
        <div className="absolute top-3 left-4 z-20 rounded-lg bg-white/95 backdrop-blur border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 shadow max-w-[60vw] truncate">
          {content.title}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-3 right-3 z-20 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow border border-gray-200"
        >
          <X className="h-4 w-4" />
        </button>

        <AnnotationOverlay className="h-screen w-screen">{renderContent()}</AnnotationOverlay>
      </DialogContent>
    </Dialog>
  );
}
