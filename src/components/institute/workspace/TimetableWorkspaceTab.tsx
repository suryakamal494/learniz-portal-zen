import React, { useMemo, useState } from 'react';
import { Circle, Send, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Section, AcademicWindow } from '@/types/section';
import { SectionTimetableStep } from '@/components/institute/sections/SectionTimetableStep';
import { DevNote } from '@/components/dev/DevNote';
import { publishWindow, unpublishWindow } from '@/hooks/useSection';
import { windowCompleteness, formatRange } from '@/utils/sectionUtils';
import { useInstituteHolidays } from '@/hooks/useInstitutePrograms';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  window: AcademicWindow;
  /** Passed through when compare mode wants a read-only pane. */
  readOnly?: boolean;
}

export const TimetableWorkspaceTab: React.FC<Props> = ({ section, window, readOnly }) => {
  const holidays = useInstituteHolidays();
  const completeness = useMemo(
    () => windowCompleteness(section, window, holidays),
    [section, window, holidays],
  );
  const status = window.status ?? 'draft';
  const isPublished = status === 'published';
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  return (
    <div className="space-y-3">
      {/* Status header */}
      <Card className={cn('border-slate-200 shadow-sm', isPublished ? 'bg-emerald-50/40' : 'bg-amber-50/40')}>
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex items-center gap-3">
            <Badge
              className={cn(
                'text-[11px] font-bold uppercase tracking-wider',
                isPublished
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-500 text-white',
              )}
            >
              <Circle className="h-2 w-2 mr-1 fill-current" />
              {status}
            </Badge>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {window.label ?? formatRange(window)}
              </div>
              <div className="text-[11px] text-slate-500">
                {window.publishedAt
                  ? `Last published ${new Date(window.publishedAt).toLocaleString()}`
                  : 'Not published yet'}
                {' · '}
                {completeness.pct}% filled ({completeness.filled}/{completeness.capacity} periods)
              </div>
            </div>
            <DevNote title="Draft vs Published">
              <p><b>Save as Draft</b> keeps edits local to this window. The Academic Schedule tab
              treats draft windows as unavailable for generation.</p>
              <p><b>Publish</b> promotes the timetable — from that point on, every edit is appended to
              <code>window.changeLog</code> so the schedule tab can show a change-notice.</p>
              <p><b>Unpublish</b> reverts to draft. Existing generated schedule stays untouched until
              regeneration.</p>
            </DevNote>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2">
              {isPublished ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmUnpublish(true)}
                  >
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Revert to Draft
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      publishWindow(section.id, window.id);
                      toast.success('Re-published — academic schedule will reflect latest edits');
                    }}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Re-publish
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Draft auto-saved')}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      publishWindow(section.id, window.id);
                      toast.success('Timetable published — academic schedule can now be generated');
                    }}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Publish
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reuse existing Step 3 UI verbatim — noop callbacks since workspace owns nav. */}
      <div className={cn(readOnly && 'pointer-events-none opacity-90')}>
        <SectionTimetableStep
          section={section}
          onBack={() => { /* handled by workspace tab switcher */ }}
          onNext={() => { /* handled by workspace tab switcher */ }}
          hideFooter
        />
      </div>

      <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to draft?</AlertDialogTitle>
            <AlertDialogDescription>
              The academic schedule tab will stop showing generation controls for this window until
              you publish again. Existing generated dates are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                unpublishWindow(section.id, window.id);
                toast('Reverted to draft');
              }}
            >
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
