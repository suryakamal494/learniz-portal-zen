import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Minus,
  Plus,
  Wand2,
  AlertTriangle,
  GraduationCap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CapacityStrip } from './CapacityStrip';
import { InstituteProgram, ScheduleConfig, ScheduleTrack } from '@/types/instituteProgram';
import { computeCapacity, topicPeriods } from '@/utils/calendarAutomation';
import { subjectPalette } from '@/lib/subjectColors';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useFaculty, setChapterTrack } from '@/hooks/useInstitutePrograms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  program: InstituteProgram;
  config: ScheduleConfig;
  onConfigChange: (next: ScheduleConfig) => void;
  onTopicPeriodsChange: (topicId: string, periods: number) => void;
  onBack: () => void;
  onNext: () => void;
}

interface SubjectAgg {
  subjectId: string;
  target: number;
  allocated: number;
  topicsConfigured: number;
  topicsTotal: number;
}

export const PeriodAllocationWorkspace: React.FC<Props> = ({
  program,
  config,
  onConfigChange,
  onTopicPeriodsChange,
  onBack,
  onNext,
}) => {
  const capacity = useMemo(() => computeCapacity(config), [config]);
  const targets = config.subjectTargetPeriods ?? {};
  const trackTargets = config.trackTargetPeriods ?? {};
  const allFaculty = useFaculty();
  const pool = config.facultyPool ?? [];
  const faculty = useMemo(
    () => (pool.length === 0 ? allFaculty : allFaculty.filter((f) => pool.includes(f.id))),
    [allFaculty, pool],
  );
  const subjectLocks = config.subjectLocks ?? {};
  const isSubjectLocked = (subjectId: string) => !!subjectLocks[subjectId];
  const isTrackEnabled = (tr: ScheduleTrack) => tr.enabled !== false;

  const tracksBySubject = useMemo(() => {
    const out: Record<string, ScheduleTrack[]> = {};
    program.subjects.forEach((s) => {
      const stored = config.subjectTracks?.[s.id];
      out[s.id] = stored && stored.length > 0
        ? stored
        : [{
            id: `trk-${s.id}-t1`,
            subjectId: s.id,
            name: 'T1',
            facultyId: config.defaultFaculty[s.id],
            allottedPeriods: targets[s.id] ?? 0,
          }];
    });
    return out;
  }, [config.subjectTracks, config.defaultFaculty, program.subjects, targets]);

  const subjectAggs = useMemo<SubjectAgg[]>(() => {
    return program.subjects.map((s) => {
      let allocated = 0;
      let configured = 0;
      let total = 0;
      s.chapters.forEach((c) =>
        c.topics.forEach((t) => {
          total += 1;
          const p = topicPeriods(t);
          if (p > 0) configured += 1;
          allocated += p;
        }),
      );
      const trackTarget = (tracksBySubject[s.id] ?? [])
        .filter(isTrackEnabled)
        .reduce(
          (sum, tr) => sum + (trackTargets[tr.id] ?? tr.allottedPeriods ?? 0),
          0,
        );
      return {
        subjectId: s.id,
        target: trackTarget || targets[s.id] || 0,
        allocated,
        topicsConfigured: configured,
        topicsTotal: total,
      };
    });
  }, [program.subjects, targets, tracksBySubject, trackTargets]);

  const totalAllocated = subjectAggs.reduce((a, s) => a + s.allocated, 0);
  const totalTargets = useMemo(
    () => program.subjects.reduce(
      (sum, s) => sum + (tracksBySubject[s.id] ?? [])
        .filter(isTrackEnabled)
        .reduce(
          (acc, tr) => acc + (trackTargets[tr.id] ?? tr.allottedPeriods ?? 0),
          0,
        ),
      0,
    ),
    [program.subjects, tracksBySubject, trackTargets],
  );
  const targetSurplus = capacity.periodsAvailable - totalTargets;
  const canContinue =
    capacity.periodsAvailable > 0 &&
    totalTargets <= capacity.periodsAvailable &&
    totalTargets > 0;

  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    program.subjects.forEach((s, i) => (map[s.id] = i === 0));
    return map;
  });
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  const setSubjectTarget = (subjectId: string, value: number) => {
    const v = Math.max(0, Math.round(value || 0));
    const tracks = tracksBySubject[subjectId] ?? [];
    const first = tracks[0];
    onConfigChange({
      ...config,
      subjectTargetPeriods: { ...targets, [subjectId]: v },
      subjectTracks: { ...config.subjectTracks, [subjectId]: tracks },
      trackTargetPeriods: first ? { ...trackTargets, [first.id]: v } : trackTargets,
    });
  };

  const setTrackTarget = (subjectId: string, trackId: string, value: number) => {
    const v = Math.max(0, Math.round(value || 0));
    const tracks = (tracksBySubject[subjectId] ?? []).map((tr) =>
      tr.id === trackId ? { ...tr, allottedPeriods: v } : tr,
    );
    const nextTrackTargets = { ...trackTargets, [trackId]: v };
    const subjectTotal = tracks.reduce((sum, tr) => sum + (nextTrackTargets[tr.id] ?? tr.allottedPeriods ?? 0), 0);
    onConfigChange({
      ...config,
      subjectTracks: { ...config.subjectTracks, [subjectId]: tracks },
      trackTargetPeriods: nextTrackTargets,
      subjectTargetPeriods: { ...targets, [subjectId]: subjectTotal },
    });
  };

  const setTrackFaculty = (subjectId: string, trackId: string, facultyId: string) => {
    const tracks = (tracksBySubject[subjectId] ?? []).map((tr) =>
      tr.id === trackId ? { ...tr, facultyId } : tr,
    );
    onConfigChange({ ...config, subjectTracks: { ...config.subjectTracks, [subjectId]: tracks } });
  };

  const addTrack = (subjectId: string) => {
    const tracks = tracksBySubject[subjectId] ?? [];
    const next: ScheduleTrack = {
      id: `trk-${subjectId}-${Date.now()}`,
      subjectId,
      name: `T${tracks.length + 1}`,
      facultyId: config.defaultFaculty[subjectId] ?? faculty[0]?.id,
      allottedPeriods: 0,
    };
    onConfigChange({
      ...config,
      subjectTracks: { ...config.subjectTracks, [subjectId]: [...tracks, next] },
      trackTargetPeriods: { ...trackTargets, [next.id]: 0 },
    });
    toast({ title: 'Track added', description: `${next.name} is now available for timetable placement.` });
  };

  const removeTrack = (subjectId: string, trackId: string) => {
    const tracks = (tracksBySubject[subjectId] ?? []).filter((tr) => tr.id !== trackId);
    if (tracks.length === 0) return;
    const nextTrackTargets = { ...trackTargets };
    delete nextTrackTargets[trackId];
    const subjectTotal = tracks.reduce((sum, tr) => sum + (nextTrackTargets[tr.id] ?? tr.allottedPeriods ?? 0), 0);
    onConfigChange({
      ...config,
      subjectTracks: { ...config.subjectTracks, [subjectId]: tracks },
      trackTargetPeriods: nextTrackTargets,
      subjectTargetPeriods: { ...targets, [subjectId]: subjectTotal },
    });
  };

  const toggleTrackEnabled = (subjectId: string, trackId: string) => {
    const tracks = (tracksBySubject[subjectId] ?? []).map((tr) =>
      tr.id === trackId ? { ...tr, enabled: tr.enabled === false ? true : false } : tr,
    );
    onConfigChange({ ...config, subjectTracks: { ...config.subjectTracks, [subjectId]: tracks } });
  };

  const toggleSubjectLock = (subjectId: string) => {
    const next = { ...subjectLocks, [subjectId]: !subjectLocks[subjectId] };
    onConfigChange({ ...config, subjectLocks: next });
  };

  const distributeTargetsEvenly = () => {
    const n = program.subjects.length;
    if (n === 0 || capacity.periodsAvailable === 0) return;
    const base = Math.floor(capacity.periodsAvailable / n);
    const rem = capacity.periodsAvailable - base * n;
    const next: Record<string, number> = {};
    program.subjects.forEach((s, i) => {
      next[s.id] = base + (i < rem ? 1 : 0);
    });
    const nextTracks: Record<string, ScheduleTrack[]> = { ...(config.subjectTracks ?? {}) };
    const nextTrackTargets: Record<string, number> = { ...trackTargets };
    program.subjects.forEach((s) => {
      const tracks = tracksBySubject[s.id] ?? [];
      if (tracks[0]) {
        nextTracks[s.id] = tracks;
        nextTrackTargets[tracks[0].id] = next[s.id];
      }
    });
    onConfigChange({ ...config, subjectTargetPeriods: next, subjectTracks: nextTracks, trackTargetPeriods: nextTrackTargets });
    toast({ title: 'Targets distributed', description: `${capacity.periodsAvailable} periods split across ${n} subjects.` });
  };

  const distributeWithinSubject = (subjectId: string) => {
    const subject = program.subjects.find((s) => s.id === subjectId);
    const agg = subjectAggs.find((a) => a.subjectId === subjectId);
    if (!subject || !agg || agg.target === 0) return;
    const allTopics = subject.chapters.flatMap((c) => c.topics);
    if (allTopics.length === 0) return;
    const base = Math.floor(agg.target / allTopics.length);
    const rem = agg.target - base * allTopics.length;
    allTopics.forEach((t, i) => {
      onTopicPeriodsChange(t.id, base + (i < rem ? 1 : 0));
    });
    toast({ title: 'Periods distributed', description: `${agg.target} periods spread across ${allTopics.length} topics.` });
  };

  const clearSubject = (subjectId: string) => {
    const subject = program.subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    subject.chapters.forEach((c) => c.topics.forEach((t) => onTopicPeriodsChange(t.id, 0)));
  };

  const targetBlockerMsg = useMemo(() => {
    const reasons: string[] = [];
    if (capacity.periodsAvailable === 0) {
      reasons.push('Configure working days, periods/day and the academic window in Step 1.');
      return reasons;
    }
    if (totalTargets > capacity.periodsAvailable) {
      reasons.push(`Track allocations exceed available periods by ${totalTargets - capacity.periodsAvailable}.`);
    } else if (totalTargets === 0) {
      reasons.push('Allocate at least one period to a subject track.');
    }
    subjectAggs.forEach((s) => {
      const subjectName = program.subjects.find((x) => x.id === s.subjectId)?.name ?? '';
      if (s.target === 0) reasons.push(`${subjectName} has 0 allocated periods. You can continue, but it will not appear in the timetable palette.`);
      else if (s.allocated < s.target) reasons.push(`${subjectName}: ${s.target - s.allocated} more period(s) to allot to topics.`);
      else if (s.allocated > s.target) reasons.push(`${subjectName}: over target by ${s.allocated - s.target} period(s).`);
    });
    return reasons;
  }, [capacity, totalTargets, subjectAggs, program.subjects]);

  return (
    <div className="space-y-4">
      <CapacityStrip
        workingDays={capacity.workingDays}
        periodsAvailable={capacity.periodsAvailable}
        allocated={totalTargets}
        showRemaining
      />

      {/* Subject targets bar */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" /> Allot periods to each subject
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                First, decide how many of the {capacity.periodsAvailable.toLocaleString()} available periods each
                subject track gets. Then expand a subject below to split the subject budget across chapters and topics.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={distributeTargetsEvenly}
              disabled={capacity.periodsAvailable === 0}
            >
              <Wand2 className="h-3.5 w-3.5" /> Split evenly
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {program.subjects.map((s) => {
              const agg = subjectAggs.find((a) => a.subjectId === s.id)!;
              const pal = subjectPalette(s.color);
              const locked = isSubjectLocked(s.id);
              return (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-lg border bg-white p-3 space-y-2 min-w-0 transition-opacity',
                    pal.border,
                    locked && 'opacity-80 ring-1 ring-amber-200',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', pal.dot)} />
                    <div className={cn('flex-1 min-w-0 font-medium text-sm truncate', pal.text)}>{s.name}</div>
                    <div className="text-xs font-semibold tabular-nums text-slate-600">{agg.target}</div>
                    <button
                      type="button"
                      onClick={() => toggleSubjectLock(s.id)}
                      className={cn(
                        'h-6 w-6 rounded grid place-items-center transition-colors',
                        locked
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
                      )}
                      title={locked ? 'Subject is locked — click to unlock' : 'Lock this subject'}
                    >
                      {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(tracksBySubject[s.id] ?? []).map((tr) => {
                      const trackVal = trackTargets[tr.id] ?? tr.allottedPeriods ?? 0;
                      const facultyOptions = faculty.filter((f) => !f.subjectId || f.subjectId === s.id);
                      const enabled = isTrackEnabled(tr);
                      const rowDisabled = locked || !enabled;
                      return (
                        <div
                          key={tr.id}
                          className={cn(
                            'grid grid-cols-[42px_1fr_112px_28px] gap-1.5 items-center transition-opacity',
                            !enabled && 'opacity-50',
                          )}
                        >
                          <Badge variant="outline" className="justify-center h-8 bg-slate-50">{tr.name}</Badge>
                          <Select
                            value={tr.facultyId ?? config.defaultFaculty[s.id] ?? ''}
                            onValueChange={(v) => setTrackFaculty(s.id, tr.id, v)}
                            disabled={rowDisabled}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white min-w-0"><SelectValue placeholder="Faculty" /></SelectTrigger>
                            <SelectContent>
                              {facultyOptions.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <NumberStepper
                            value={trackVal}
                            onChange={(v) => setTrackTarget(s.id, tr.id, v)}
                            ariaLabel={`Periods for ${s.name} ${tr.name}`}
                            disabled={rowDisabled}
                          />
                          <button
                            type="button"
                            onClick={() => toggleTrackEnabled(s.id, tr.id)}
                            disabled={locked}
                            className={cn(
                              'h-7 w-7 rounded grid place-items-center transition-colors',
                              enabled
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100',
                              locked && 'opacity-40 cursor-not-allowed',
                            )}
                            title={enabled ? 'Track enabled — click to disable' : 'Track disabled — click to enable'}
                          >
                            {enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => addTrack(s.id)}
                        disabled={locked}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add track
                      </Button>
                      {(tracksBySubject[s.id] ?? []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-rose-600"
                          disabled={locked}
                          onClick={() => {
                            const tracks = tracksBySubject[s.id] ?? [];
                            const last = tracks[tracks.length - 1];
                            if (last) removeTrack(s.id, last.id);
                          }}
                        >
                          Remove last
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              Targets total:{' '}
              <span className="font-semibold text-slate-900 tabular-nums">
                {totalTargets.toLocaleString()}
              </span>{' '}
              / {capacity.periodsAvailable.toLocaleString()}
            </span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                targetSurplus > 0
                  ? 'text-amber-700'
                  : targetSurplus < 0
                    ? 'text-rose-700'
                    : 'text-emerald-700',
              )}
            >
              {targetSurplus > 0
                ? `${targetSurplus} unused capacity`
                : targetSurplus < 0
                  ? `${Math.abs(targetSurplus)} over`
                  : 'Fully distributed ✓'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Per-subject expand: chapters → topics */}
      <div className="space-y-3">
        {program.subjects.map((s) => {
          const agg = subjectAggs.find((a) => a.subjectId === s.id)!;
          const pal = subjectPalette(s.color);
          const isOpen = openSubjects[s.id] ?? false;
          const isComplete = agg.target > 0 && agg.allocated === agg.target;
          const isOver = agg.allocated > agg.target && agg.target > 0;
          const pct = agg.target === 0 ? 0 : Math.min(100, (agg.allocated / agg.target) * 100);

          return (
            <Card key={s.id} className={cn('border shadow-sm overflow-hidden', isOpen ? 'border-slate-300' : 'border-slate-200/70')}>
              <button
                type="button"
                onClick={() => setOpenSubjects((e) => ({ ...e, [s.id]: !e[s.id] }))}
                className={cn(
                  'w-full flex items-center gap-3 p-3 sm:p-4 text-left transition-colors',
                  isOpen ? pal.bgSoft : 'bg-white hover:bg-slate-50',
                )}
              >
                <div className={cn('w-1 self-stretch rounded-full', pal.bg)} />
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0', pal.bg)}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn('font-bold text-base truncate', pal.text)}>{s.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{s.chapters.length} chapters · {agg.topicsTotal} topics</span>
                    <span className="text-slate-300">·</span>
                    <span className={cn('font-medium tabular-nums', isComplete ? 'text-emerald-700' : isOver ? 'text-rose-700' : 'text-amber-700')}>
                      {agg.allocated} / {agg.target || '—'} periods
                    </span>
                    {isComplete && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Complete
                      </Badge>
                    )}
                    {isOver && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 h-5 px-1.5 text-[10px]">
                        Over target
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={cn('h-8 w-8 rounded-full grid place-items-center border transition-transform', isOpen ? 'rotate-0' : '-rotate-90', pal.border, pal.text, 'bg-white shadow-sm')}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <div className={cn('h-1 w-full', pal.bgSoft)}>
                <div
                  className={cn(
                    'h-full transition-all',
                    isComplete ? 'bg-emerald-500' : isOver ? 'bg-rose-500' : pal.bg,
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 p-3 sm:p-4 space-y-2 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs text-slate-600">
                      Split {agg.target || 0} period{agg.target === 1 ? '' : 's'} across topics. Chapter totals
                      update live.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => distributeWithinSubject(s.id)}
                        disabled={agg.target === 0}
                      >
                        <Wand2 className="h-3 w-3" /> Spread evenly
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-rose-600 hover:text-rose-700"
                        onClick={() => clearSubject(s.id)}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {(() => {
                    const subjTracks = tracksBySubject[s.id] ?? [];
                    const multiTrack = subjTracks.length >= 2;
                    const locked = isSubjectLocked(s.id);
                    return s.chapters.map((c) => {
                      const chOpen = openChapters[c.id] ?? false;
                      const chAlloc = c.topics.reduce((a, t) => a + topicPeriods(t), 0);
                      const assignedTrack = multiTrack ? subjTracks.find((tr) => tr.id === c.trackId) : null;
                      const palAssigned = assignedTrack ? pal : null;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            'rounded-lg border bg-white overflow-hidden',
                            multiTrack && !assignedTrack
                              ? 'border-dashed border-amber-300'
                              : 'border-slate-200',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenChapters((e) => ({ ...e, [c.id]: !e[c.id] }))}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                          >
                            {chOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                            )}
                            <span className="font-medium text-sm text-slate-800 flex-1 truncate">{c.name}</span>
                            {multiTrack && (
                              <span
                                className="shrink-0"
                                onClick={(ev) => ev.stopPropagation()}
                                role="presentation"
                              >
                                <Select
                                  value={assignedTrack?.id ?? '__none__'}
                                  onValueChange={(v) =>
                                    setChapterTrack(program.id, c.id, v === '__none__' ? null : v)
                                  }
                                  disabled={locked}
                                >
                                  <SelectTrigger className={cn(
                                    'h-7 text-[11px] w-[120px] bg-white',
                                    !assignedTrack && 'border-amber-300 text-amber-700',
                                  )}>
                                    <SelectValue placeholder="Assign track" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__" className="text-xs italic text-slate-500">
                                      Unassigned
                                    </SelectItem>
                                    {subjTracks.map((tr) => (
                                      <SelectItem key={tr.id} value={tr.id} className="text-xs">
                                        {tr.name}
                                        {tr.enabled === false ? ' (disabled)' : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </span>
                            )}
                            <span className="text-xs text-slate-500 tabular-nums shrink-0">
                              {c.topics.length} topics · <span className="font-semibold text-slate-700">{chAlloc}</span> periods
                            </span>
                          </button>
                          {chOpen && (
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                              {c.topics.map((t) => (
                                <div key={t.id} className="flex items-center gap-2 px-3 py-2 min-w-0">
                                  <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{t.name}</span>
                                  <NumberStepper
                                    value={topicPeriods(t)}
                                    onChange={(v) => onTopicPeriodsChange(t.id, v)}
                                    ariaLabel={`Periods for ${t.name}`}
                                    disabled={locked}
                                  />
                                </div>
                              ))}
                              {c.topics.length === 0 && (
                                <div className="px-3 py-3 text-xs text-slate-400 italic">No topics yet.</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {!canContinue && targetBlockerMsg.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800">
          <div className="font-semibold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Allocation review
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {targetBlockerMsg.slice(0, 5).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
            {targetBlockerMsg.length > 5 && <li>+ {targetBlockerMsg.length - 5} more…</li>}
          </ul>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="gap-2">
          Next: Weekly Timetable <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const NumberStepper: React.FC<{
  value: number;
  onChange: (v: number) => void;
  ariaLabel?: string;
  disabled?: boolean;
}> = ({ value, onChange, ariaLabel, disabled }) => (
  <div className="flex items-center gap-1 shrink-0">
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="h-8 w-8"
      onClick={() => onChange(Math.max(0, value - 1))}
      aria-label="Decrease"
      disabled={disabled}
    >
      <Minus className="h-3.5 w-3.5" />
    </Button>
    <Input
      type="number"
      min={0}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
      className="h-8 w-16 text-center tabular-nums bg-white px-1"
      aria-label={ariaLabel}
      disabled={disabled}
    />
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="h-8 w-8"
      onClick={() => onChange(value + 1)}
      aria-label="Increase"
      disabled={disabled}
    >
      <Plus className="h-3.5 w-3.5" />
    </Button>
  </div>
);
