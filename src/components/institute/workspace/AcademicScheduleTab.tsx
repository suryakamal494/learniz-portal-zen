import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AcademicWindow, Section, SectionCell } from '@/types/section';
import { DevNote } from '@/components/dev/DevNote';
import { useInstituteHolidays, useFaculty } from '@/hooks/useInstitutePrograms';
import {
  WEEKDAY_LABELS,
  formatRange,
  listWeekStarts,
  weekStats,
  windowCompleteness,
} from '@/utils/sectionUtils';
import { markWindowGenerated, acknowledgeWindowChanges } from '@/hooks/useSection';
import { generateAcademicSchedule, windowHasGeneratedContent } from '@/utils/scheduleGenerator';
import { sectionPalette, trackPattern } from '@/lib/sectionColors';
import { addDays, computePeriodTimes, parseISO } from '@/utils/calendarAutomation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  window: AcademicWindow;
  onJumpToTimetable: () => void;
}

export const AcademicScheduleTab: React.FC<Props> = ({ section, window, onJumpToTimetable }) => {
  const holidays = useInstituteHolidays();
  const faculty = useFaculty();
  const facultyById = useMemo(() => Object.fromEntries(faculty.map((f) => [f.id, f])), [faculty]);

  const status = window.status ?? 'draft';
  const isPublished = status === 'published';

  // Sequential term gating.
  const idx = section.windows.findIndex((w) => w.id === window.id);
  const earlier = section.windows.slice(0, idx);
  const blockingEarlier = earlier.find((w) => {
    const c = windowCompleteness(section, w, holidays);
    return w.status !== 'published' || !c.complete;
  });
  const completeness = windowCompleteness(section, window, holidays);

  const generatedAt = window.lastGeneratedAt ? new Date(window.lastGeneratedAt) : null;
  const unacknowledged = (window.changeLog ?? []).filter((e) => !e.acknowledged);
  const changesAfterGen = generatedAt
    ? unacknowledged.filter((e) => new Date(e.at).getTime() > generatedAt.getTime())
    : unacknowledged;

  // Auto-populate chapter/topic when window claims to be generated but cells
  // don't yet carry chapterId (fresh page load against seed data).
  useEffect(() => {
    if (!isPublished || !generatedAt) return;
    if (windowHasGeneratedContent(section, window)) return;
    markWindowGenerated(section.id, window.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, window.id, isPublished]);

  // Live in-memory schedule = current cells with generator applied on the fly.
  // We use whatever is in state — markWindowGenerated writes chapters into cells.
  const scheduleStats = useMemo(
    () => generateAcademicSchedule(section, window).stats,
    [section, window],
  );

  // ── Gates ───────────────────────────────────────────────────────────────
  if (!isPublished) {
    return (
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 grid place-items-center">
            <AlertTriangle className="h-6 w-6 text-amber-700" />
          </div>
          <div className="text-lg font-semibold text-slate-900">Weekly timetable is still a draft</div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Publish the timetable for <b>{window.label ?? formatRange(window)}</b> from the Weekly
            Timetable tab before generating the academic schedule.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button onClick={onJumpToTimetable} className="bg-indigo-600 hover:bg-indigo-700">
              Open Weekly Timetable <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <DevNote title="Why is this locked?">
              <p>The Academic Schedule reads from a <b>published</b> weekly timetable. Drafts are
              ignored so teachers don't receive routine changes in flight.</p>
            </DevNote>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (blockingEarlier) {
    const earlierC = windowCompleteness(section, blockingEarlier, holidays);
    return (
      <Card className="border-rose-200 bg-rose-50/40">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 grid place-items-center">
            <Lock className="h-6 w-6 text-rose-700" />
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Finish {blockingEarlier.label ?? 'earlier term'} first
          </div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            The academic schedule for later terms can only be generated once all earlier terms are
            <b> published and completely filled</b>. <b>{blockingEarlier.label}</b> is currently
            {' '}{earlierC.pct}% filled ({earlierC.filled}/{earlierC.capacity} periods) and status
            is <Badge variant="outline" className="text-[10px] mx-0.5">{blockingEarlier.status ?? 'draft'}</Badge>.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onJumpToTimetable}>
              Complete earlier timetable
            </Button>
            <DevNote title="Sequential term gating">
              <p>Rule: Term N+1 unlocks only when Term N is <code>published</code> and 100% filled.</p>
              <p>Term N itself always generates the partial schedule it currently has — the gate is
              purely for downstream terms.</p>
            </DevNote>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TermProgressionStrip section={section} activeWindowId={window.id} holidays={holidays} />

      {/* Header + generate */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Academic Schedule · {window.label ?? formatRange(window)}
          </div>
          <div className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {section.name}
            <DevNote title="How generation works">
              <p>Generator walks published cells inside the window chronologically. For each track it
              enumerates its chapters (filtered by <code>track.chapterIds</code>) and consumes
              <code> topic.periods</code> consecutive cells per topic.</p>
              <p>Cells with <code>manuallyEdited=true</code> are preserved. Any post-publish edit
              appears in the yellow notice above until you re-generate or acknowledge.</p>
            </DevNote>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            {generatedAt ? (
              <span>Last generated {generatedAt.toLocaleString()}</span>
            ) : (
              <span>Not yet generated</span>
            )}
            <span className="text-slate-300">·</span>
            <span>{completeness.pct}% filled ({completeness.filled}/{completeness.capacity})</span>
            {!completeness.complete && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                partial — later terms locked until 100%
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

      {changesAfterGen.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/70">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-amber-900">Timetable updated after last generation</div>
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
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                    markWindowGenerated(section.id, window.id);
                    toast.success('Academic schedule re-generated');
                  }}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Re-generate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    acknowledgeWindowChanges(section.id, window.id);
                    toast('Changes acknowledged');
                  }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Acknowledge
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProgressPanel section={section} window={window} stats={scheduleStats} />

      <DatedScheduleGrid
        section={section}
        window={window}
        holidays={holidays}
        facultyById={facultyById}
      />
    </div>
  );
};

/* ─────────────────────── Term Progression Strip ─────────────────────── */

const TermProgressionStrip: React.FC<{
  section: Section;
  activeWindowId: string;
  holidays: ReturnType<typeof useInstituteHolidays>;
}> = ({ section, activeWindowId, holidays }) => {
  const wins = section.windows;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {wins.map((w, i) => {
        const prev = wins.slice(0, i);
        const locked = prev.some((p) => {
          const c = windowCompleteness(section, p, holidays);
          return p.status !== 'published' || !c.complete;
        });
        const c = windowCompleteness(section, w, holidays);
        const isActive = w.id === activeWindowId;
        const state: 'locked' | 'draft' | 'partial' | 'complete' =
          locked ? 'locked' :
          w.status !== 'published' ? 'draft' :
          c.complete ? 'complete' : 'partial';
        const tone = {
          locked:   'bg-slate-100 text-slate-400 border-slate-200',
          draft:    'bg-white text-slate-600 border-slate-300',
          partial:  'bg-amber-50 text-amber-800 border-amber-300',
          complete: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        }[state];
        return (
          <React.Fragment key={w.id}>
            <div className={cn(
              'shrink-0 rounded-lg border px-3 py-1.5 text-xs flex items-center gap-2',
              tone,
              isActive && 'ring-2 ring-indigo-300 shadow-sm',
            )}>
              {state === 'locked' ? <Lock className="h-3 w-3" />
                : state === 'complete' ? <CheckCircle2 className="h-3 w-3" />
                : <Circle className="h-2.5 w-2.5 fill-current" />}
              <div>
                <div className="font-semibold leading-none">{w.label ?? formatRange(w)}</div>
                <div className="text-[10px] opacity-70 mt-0.5">
                  {state === 'locked' ? 'Locked · complete previous term'
                    : state === 'draft' ? 'Draft timetable'
                    : state === 'partial' ? `${c.pct}% scheduled`
                    : 'Fully scheduled'}
                </div>
              </div>
            </div>
            {i < wins.length - 1 && (
              <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─────────────────────── Collapsible Progress Panel ─────────────────────── */

const ProgressPanel: React.FC<{
  section: Section;
  window: AcademicWindow;
  stats: ReturnType<typeof generateAcademicSchedule>['stats'];
}> = ({ section, stats }) => {
  const [open, setOpen] = useState(true);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const rows = useMemo(() => {
    const out: Array<{
      key: string; programCode: string; subjectName: string; color: string;
      trackName: string; trackIdx: number; scheduled: number; planned: number;
      chapters: { id: string; name: string; scheduled: number; planned: number; startDate?: string; endDate?: string }[];
    }> = [];
    for (const p of section.programs) {
      for (const su of p.subjects) {
        su.tracks.forEach((tr, tIdx) => {
          const k = `${p.id}|${su.id}|${tr.id}`;
          const s = stats.tracks[k];
          if (!s) return;
          out.push({
            key: k, programCode: p.code, subjectName: su.name, color: su.color,
            trackName: tr.name, trackIdx: tIdx,
            scheduled: s.scheduled, planned: s.planned,
            chapters: Object.entries(s.chapters).map(([id, c]) => ({
              id, name: c.name, scheduled: c.scheduled, planned: c.planned,
              startDate: c.startDate, endDate: c.endDate,
            })),
          });
        });
      }
    }
    return out;
  }, [section, stats]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-slate-50"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Chapter progress
            </span>
            <Badge variant="outline" className="text-[10px]">
              {stats.stamped + stats.manualPreserved} / {stats.totalCells} cells assigned
            </Badge>
          </div>
          <span className="text-[11px] text-slate-500">
            {rows.length} track{rows.length === 1 ? '' : 's'}
          </span>
        </button>
        {open && (
          <div className="border-t border-slate-100">
            {rows.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No published cells in this window yet.
              </div>
            )}
            {rows.map((r) => {
              const pal = sectionPalette(r.color as never);
              const pct = r.planned === 0 ? 0 : Math.min(100, Math.round((r.scheduled / r.planned) * 100));
              const isOpen = expandedTrack === r.key;
              return (
                <div key={r.key} className="border-b border-slate-100 last:border-b-0">
                  <button
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50"
                    onClick={() => setExpandedTrack(isOpen ? null : r.key)}
                  >
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    <span className={cn('h-6 w-6 rounded grid place-items-center text-white text-[9px] font-bold shrink-0', pal.solid)} style={trackPattern(r.trackIdx)}>
                      {r.trackName}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {r.programCode} · {r.subjectName}
                      </div>
                      <div className="h-1 mt-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full', pal.solid)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-xs font-bold tabular-nums text-slate-700 shrink-0">
                      {r.scheduled}<span className="text-slate-400"> / </span>{r.planned}
                    </div>
                    <Badge className={cn(
                      'text-[9px] shrink-0',
                      pct >= 100 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                        : pct >= 40 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-100',
                    )}>
                      {pct}%
                    </Badge>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pl-14">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                            <th className="text-left py-1.5 font-semibold">Chapter</th>
                            <th className="text-right py-1.5 font-semibold w-20">Scheduled</th>
                            <th className="text-right py-1.5 font-semibold w-20">Planned</th>
                            <th className="text-left py-1.5 font-semibold pl-4 w-40">Date range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.chapters.map((c) => {
                            const cpct = c.planned === 0 ? 0 : Math.min(100, Math.round((c.scheduled / c.planned) * 100));
                            return (
                              <tr key={c.id} className="border-b border-slate-50 last:border-b-0">
                                <td className="py-1.5 text-slate-800">{c.name}</td>
                                <td className="py-1.5 text-right tabular-nums font-semibold text-slate-900">{c.scheduled}</td>
                                <td className="py-1.5 text-right tabular-nums text-slate-500">{c.planned}</td>
                                <td className="py-1.5 pl-4 text-slate-600 text-[11px]">
                                  {c.startDate ? (
                                    <>
                                      {formatShort(c.startDate)} → {formatShort(c.endDate!)}
                                      <span className={cn(
                                        'ml-2 text-[9px] font-semibold',
                                        cpct >= 100 ? 'text-emerald-700' : cpct >= 40 ? 'text-amber-700' : 'text-rose-700',
                                      )}>{cpct}%</span>
                                    </>
                                  ) : <span className="text-slate-400">not started</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─────────────────────── Dated Grid ─────────────────────── */

const DatedScheduleGrid: React.FC<{
  section: Section;
  window: AcademicWindow;
  holidays: ReturnType<typeof useInstituteHolidays>;
  facultyById: Record<string, { name: string } | undefined>;
}> = ({ section, window, holidays, facultyById }) => {
  const weeks = useMemo(() => listWeekStarts(window), [window]);
  const [weekStart, setWeekStart] = useState<string>(weeks[0] ?? '');
  useEffect(() => {
    if (weeks.length > 0 && !weeks.includes(weekStart)) setWeekStart(weeks[0]);
  }, [weeks, weekStart]);

  const periodTimes = useMemo(() => computePeriodTimes(section.config), [section.config]);
  const workingDays = section.config.workingDays;

  const cellsByKey = useMemo(() => {
    const m = new Map<string, SectionCell>();
    section.cells
      .filter((c) => c.weekStartDate === weekStart)
      .forEach((c) => m.set(`${c.weekday}|${c.periodIndex}`, c));
    return m;
  }, [section.cells, weekStart]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Week chip heatmap */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
            Weeks in this term
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {weeks.map((w, i) => {
              const s = weekStats(section, window, w, holidays);
              const isSel = w === weekStart;
              const tone =
                s.capacity === 0 ? 'bg-slate-100 text-slate-400' :
                s.pct >= 100 ? 'bg-emerald-500 text-white' :
                s.pct >= 40 ? 'bg-amber-400 text-amber-950' :
                s.pct > 0 ? 'bg-rose-300 text-rose-950' :
                'bg-slate-100 text-slate-500';
              return (
                <button
                  key={w}
                  onClick={() => setWeekStart(w)}
                  className={cn(
                    'shrink-0 h-9 min-w-[42px] px-2 rounded-md text-[10px] font-bold flex flex-col items-center justify-center leading-none',
                    tone,
                    isSel && 'ring-2 ring-indigo-500 ring-offset-1',
                  )}
                  title={`${formatShort(w)} · ${s.filled}/${s.capacity}`}
                >
                  <span>W{i + 1}</span>
                  <span className="text-[8px] opacity-90 mt-0.5 font-semibold">{s.pct}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-24 border-b border-r border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-500 sticky left-0 bg-slate-50 z-10">Period</th>
                {workingDays.map((d) => {
                  const dayISO = addDays(weekStart, dayOffsetFor(d));
                  const inWin = dayISO >= window.startDate && dayISO <= window.endDate;
                  return (
                    <th key={d} className={cn(
                      'border-b border-r border-slate-200 px-2 py-2 text-[11px] font-semibold text-slate-700 text-left',
                      !inWin && 'bg-slate-100 text-slate-400',
                    )}>
                      <div>{WEEKDAY_LABELS.find((w) => w.d === d)?.short}</div>
                      <div className="text-[9px] font-normal text-slate-500">{formatShort(dayISO)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: section.config.periodsPerDay }).map((_, p) => (
                <tr key={p}>
                  <td className="border-b border-r border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 sticky left-0 bg-white z-10">
                    <div>P{p + 1}</div>
                    <div className="text-[9px] font-normal text-slate-500">
                      {periodTimes[p]?.startTime}–{periodTimes[p]?.endTime}
                    </div>
                  </td>
                  {workingDays.map((d) => {
                    const cell = cellsByKey.get(`${d}|${p}`);
                    if (!cell) {
                      return <td key={d} className="border-b border-r border-slate-100 p-1 h-16 align-top">
                        <div className="h-full rounded bg-slate-50/60 border border-dashed border-slate-200" />
                      </td>;
                    }
                    const prog = section.programs.find((pg) => pg.id === cell.allocation.programId);
                    const sub = prog?.subjects.find((s) => s.id === cell.allocation.subjectId);
                    const tr = sub?.tracks.find((t) => t.id === cell.allocation.trackId);
                    if (!prog || !sub || !tr) {
                      return <td key={d} className="border-b border-r border-slate-100 p-1" />;
                    }
                    const pal = sectionPalette(sub.color);
                    const tIdx = sub.tracks.findIndex((t) => t.id === tr.id);
                    const facultyName = facultyById[cell.allocation.facultyId ?? tr.facultyId]?.name;
                    return (
                      <td key={d} className="border-b border-r border-slate-100 p-1 align-top h-16">
                        <div className={cn('rounded-md border p-1.5 h-full', pal.surface, pal.border)}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className={cn('h-4 px-1 rounded text-white text-[8px] font-bold flex items-center', pal.solid)} style={trackPattern(tIdx)}>
                              {tr.name}
                            </span>
                            <span className={cn('text-[9px] font-bold uppercase tracking-wide', pal.text)}>
                              {prog.code}·{sub.name.slice(0, 3)}
                            </span>
                            {cell.manuallyEdited && (
                              <span className="ml-auto text-[8px] font-bold text-amber-700" title="Manually edited">✎</span>
                            )}
                          </div>
                          {cell.allocation.chapterName ? (
                            <>
                              <div className="text-[10px] font-semibold text-slate-800 leading-tight line-clamp-1" title={cell.allocation.chapterName}>
                                {cell.allocation.chapterName}
                              </div>
                              <div className="text-[9px] text-slate-600 leading-tight line-clamp-1" title={cell.allocation.topicName}>
                                {cell.allocation.topicName}
                              </div>
                            </>
                          ) : (
                            <div className="text-[9px] italic text-slate-400">generate to assign chapter</div>
                          )}
                          {facultyName && (
                            <div className="text-[8px] text-slate-500 mt-0.5 line-clamp-1" title={facultyName}>
                              {facultyName.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '')}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── helpers ─── */

function dayOffsetFor(weekday: number): number {
  return weekday === 0 ? 6 : weekday - 1;
}

function formatShort(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
