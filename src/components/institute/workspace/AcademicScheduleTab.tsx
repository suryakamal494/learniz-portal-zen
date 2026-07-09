import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section, AcademicWindow } from '@/types/section';
import { SectionPreviewStep } from '@/components/institute/sections/SectionPreviewStep';
import { DevNote } from '@/components/dev/DevNote';
import { useInstituteHolidays } from '@/hooks/useInstitutePrograms';
import { windowCompleteness, formatRange } from '@/utils/sectionUtils';
import { markWindowGenerated, acknowledgeWindowChanges } from '@/hooks/useSection';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  window: AcademicWindow;
  onJumpToTimetable: () => void;
}

export const AcademicScheduleTab: React.FC<Props> = ({ section, window, onJumpToTimetable }) => {
  const navigate = useNavigate();
  const holidays = useInstituteHolidays();

  const status = window.status ?? 'draft';
  const isPublished = status === 'published';

  // Sequentially-gated: window N is generatable only if all earlier windows are
  // published AND complete. If earlier is published-but-incomplete, this
  // (later) window remains locked.
  const idx = section.windows.findIndex((w) => w.id === window.id);
  const earlier = section.windows.slice(0, idx);
  const blockingEarlier = earlier.find((w) => {
    const c = windowCompleteness(section, w, holidays);
    return w.status !== 'published' || !c.complete;
  });

  const completeness = windowCompleteness(section, window, holidays);

  // Post-publish changes not yet acknowledged/regenerated.
  const unacknowledged = (window.changeLog ?? []).filter((e) => !e.acknowledged);
  const generatedAt = window.lastGeneratedAt ? new Date(window.lastGeneratedAt) : null;
  const changesAfterGen = generatedAt
    ? unacknowledged.filter((e) => new Date(e.at).getTime() > generatedAt.getTime())
    : unacknowledged;

  // Publish gating — draft window blocks the schedule tab entirely.
  if (!isPublished) {
    return (
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 grid place-items-center">
            <AlertTriangle className="h-6 w-6 text-amber-700" />
          </div>
          <div className="text-lg font-semibold text-slate-900">Weekly timetable is still a draft</div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Publish the timetable for <b>{window.label ?? formatRange(window)}</b> from the Weekly Timetable tab
            before generating the academic schedule.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button onClick={onJumpToTimetable} className="bg-indigo-600 hover:bg-indigo-700">
              Open Weekly Timetable <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <DevNote title="Why is this locked?">
              <p>The Academic Schedule reads from a <b>published</b> weekly timetable. Drafts are ignored so
              teachers don't receive routine changes in flight.</p>
              <p>Toggle publish in the Weekly Timetable tab header.</p>
            </DevNote>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Earlier-term gating.
  if (blockingEarlier) {
    const earlierC = windowCompleteness(section, blockingEarlier, holidays);
    return (
      <Card className="border-rose-200 bg-rose-50/40">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 grid place-items-center">
            <AlertTriangle className="h-6 w-6 text-rose-700" />
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Finish {blockingEarlier.label ?? 'earlier term'} first
          </div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            The academic schedule for later terms can only be generated once all earlier terms are
            <b> published and completely filled</b>. <b>{blockingEarlier.label}</b> is currently
            {' '}{earlierC.pct}% filled ({earlierC.filled}/{earlierC.capacity} periods) and status is
            {' '}<Badge variant="outline" className="text-[10px] mx-0.5">{blockingEarlier.status ?? 'draft'}</Badge>.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onJumpToTimetable}>
              Complete earlier timetable
            </Button>
            <DevNote title="Sequential term gating">
              <p>Rule: generation for term N runs only if terms 1..N-1 are <code>published</code> AND
              every working period is placed.</p>
              <p>If term 1 is published-but-partial, term 1 <i>can</i> still generate the partial schedule,
              but term 2 stays locked until term 1 hits 100%.</p>
            </DevNote>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + generate button */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Academic Schedule · {window.label ?? formatRange(window)}
          </div>
          <div className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {section.name}
            <DevNote title="How generation works">
              <p>Generation walks the published weekly timetable across every working day of the window,
              skipping holidays, and stamps dated slots that feed the teacher schedule.</p>
              <p>Partial timetables generate what exists. Later terms stay locked until this term is
              complete (see the completeness meter).</p>
              <p>Any post-publish change appears in the yellow notice above until you regenerate or
              acknowledge.</p>
            </DevNote>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            {generatedAt ? (
              <span>Last generated {generatedAt.toLocaleString()}</span>
            ) : (
              <span>Not yet generated</span>
            )}
            <span className="text-slate-300">·</span>
            <span>Completeness {completeness.pct}% ({completeness.filled}/{completeness.capacity})</span>
            {!completeness.complete && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                partial — will generate what's filled
              </Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => {
            markWindowGenerated(section.id, window.id);
            toast.success(`Academic schedule ${generatedAt ? 're-generated' : 'generated'}`);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {generatedAt ? 'Re-generate schedule' : 'Generate schedule'}
        </Button>
      </div>

      {/* Post-publish change notice */}
      {changesAfterGen.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/70">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  Timetable updated after last generation
                  <DevNote title="Change tracking">
                    <p>Every mutation to a published timetable (paint, delete, swap, disable) is
                    appended to <code>window.changeLog</code> with the affected dates.</p>
                    <p>This notice persists until the user regenerates or explicitly acknowledges,
                    so a schedule planned on day 1 doesn't silently drift by day 90.</p>
                  </DevNote>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
                  {changesAfterGen.slice(0, 6).map((e) => (
                    <li key={e.id} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>
                        <b>{e.summary}</b>
                        {e.affectedDates?.length ? (
                          <span className="text-amber-800/70"> · affects {e.affectedDates.length} date{e.affectedDates.length === 1 ? '' : 's'}</span>
                        ) : null}
                        <span className="text-amber-700/70"> · {new Date(e.at).toLocaleString()}</span>
                      </span>
                    </li>
                  ))}
                  {changesAfterGen.length > 6 && (
                    <li className="text-amber-800/70 text-[11px]">+{changesAfterGen.length - 6} more…</li>
                  )}
                </ul>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      markWindowGenerated(section.id, window.id);
                      toast.success('Academic schedule re-generated');
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Re-generate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      acknowledgeWindowChanges(section.id, window.id);
                      toast('Changes acknowledged');
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Acknowledge
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reuse preview UI (subject lifecycle + coverage + mini grid) */}
      <SectionPreviewStep section={section} onBack={() => navigate(-1)} />
    </div>
  );
};
