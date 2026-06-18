import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { LessonPlanContent } from '@/types/program';
import { AnnotationOverlay } from '@/components/teacher/preview/AnnotationOverlay';
import { DemoSlideDeck } from '@/components/teacher/preview/DemoSlideDeck';

interface Props {
  open: boolean;
  onClose: () => void;
  content: LessonPlanContent | null;
}

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
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

function RichNote({ title, body }: { title: string; body: string }) {
  // Very light renderer: paragraph breaks on blank lines, bullets for "• " or "- " or "1. "
  const blocks = body.split(/\n{2,}/);
  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="max-w-4xl mx-auto px-12 py-14">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="space-y-6 text-lg text-gray-800 leading-relaxed">
          {blocks.map((block, bi) => {
            const lines = block.split('\n');
            const first = lines[0];
            const rest = lines.slice(1);
            const isBulletList = rest.length > 0 && rest.every((l) => /^(•|-|\d+\.)\s+/.test(l.trim()));
            if (isBulletList) {
              return (
                <div key={bi}>
                  <p className="font-semibold text-gray-900 mb-3">{first}</p>
                  <ul className="space-y-2 pl-1">
                    {rest.map((l, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <span>{l.replace(/^(•|-|\d+\.)\s+/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <p key={bi} className="whitespace-pre-wrap">
                {block}
              </p>
            );
          })}
        </div>
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
        if (!url) return <PlaceholderSlide title={content.title} subtitle="Video preview" />;
        if (isYouTube(url)) {
          return (
            <iframe
              src={url}
              title={content.title}
              className="w-full h-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          );
        }
        return <video src={url} controls className="w-full h-full object-contain bg-black" />;

      case 'html':
        return url ? (
          <iframe
            src={url}
            title={content.title}
            className="w-full h-full bg-white"
            allow="accelerometer; gyroscope; fullscreen"
            allowFullScreen
          />
        ) : (
          <PlaceholderSlide title={content.title} subtitle="Interactive simulation" />
        );

      case 'pdf':
        return url ? (
          <iframe
            src={`${url}#toolbar=1&navpanes=0`}
            title={content.title}
            className="w-full h-full bg-white"
          />
        ) : (
          <PlaceholderSlide title={content.title} subtitle="PDF preview" />
        );

      case 'ppt':
        return <DemoSlideDeck title={content.title} />;

      case 'note':
        return (
          <RichNote
            title={content.title}
            body={
              content.body ||
              'Note content goes here. Use Pen / Marker / Highlighter to annotate while you teach.'
            }
          />
        );

      default:
        return <PlaceholderSlide title={content.title} subtitle="Preview" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 border-0 rounded-none bg-black w-screen h-screen max-w-[100vw] sm:max-w-[100vw] sm:rounded-none"
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
