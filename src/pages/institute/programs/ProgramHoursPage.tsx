import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  HelpCircle,
  Info,
  Lock,
  Maximize2,
  Minimize2,
  Plus,
  Sparkles,
  Timer,
  Unlock,
  Wand2,
  Wand,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  addChapter,
  addTopic,
  finaliseHours,
  setChapterTopicsHours,
  updateProgram,
  updateTopicHours,
  useInstituteProgram,
} from '@/hooks/useInstitutePrograms';
import { chapterHours, hoursToPeriods, rollupProgram, rollupSubject } from '@/utils/calendarAutomation';
import { subjectPalette } from '@/lib/subjectColors';
import { PROGRAM_TOOLTIPS } from '@/lib/programTooltips';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────── */

const ProgramHoursPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  const navigate = useNavigate();

  const [periodMins, setPeriodMins] = useState<number>(program?.schedule?.periodLengthMins ?? 40);
  const [periodDraft, setPeriodDraft] = useState<string>(String(program?.schedule?.periodLengthMins ?? 40));
  const [periodOpen, setPeriodOpen] = useState(false);

  const [subjectsOpen, setSubjectsOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    program?.subjects.forEach((s, i) => (init[s.id] = i === 0));
    return init;
  });
  const [chaptersOpen, setChaptersOpen] = useState<Record<string, boolean>>({});

  const roll = useMemo(
    () => (program ? rollupProgram(program, periodMins) : null),
    [program, periodMins],
  );

  if (!program || !roll) {
    return (
      <div className="p-10 text-center text-slate-500">
        Program not found.{' '}
        <Link to="/institute/programs" className="text-blue-600 underline">
          Back to list
        </Link>
      </div>
    );
  }

  const missingTopics = roll.totalTopics - roll.topicsConfigured;
  const ready = missingTopics === 0 && roll.totalTopics > 0;
  const chaptersCount = program.subjects.reduce((a, s) => a + s.chapters.length, 0);
  const allOpen = program.subjects.every((s) =>
    s.chapters.every((c) => chaptersOpen[c.id] !== false && (chaptersOpen[c.id] ?? false)),
  );

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    program.subjects.forEach((s) => s.chapters.forEach((c) => (next[c.id] = true)));
    setChaptersOpen(next);
    const so: Record<string, boolean> = {};
    program.subjects.forEach((s) => (so[s.id] = true));
    setSubjectsOpen(so);
  };
  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    program.subjects.forEach((s) => s.chapters.forEach((c) => (next[c.id] = false)));
    setChaptersOpen(next);
  };

  const commitPeriodLength = () => {
    const v = Math.max(15, Math.min(120, Number(periodDraft) || 40));
    setPeriodMins(v);
    setPeriodDraft(String(v));
    updateProgram(program.id, (p) => ({
      ...p,
      schedule: {
        ...(p.schedule ?? {
          startDate: new Date().toISOString().slice(0, 10),
          workingDays: [1, 2, 3, 4, 5, 6],
          periodsPerDay: 6,
          periodLengthMins: 40,
          holidays: [],
          defaultFaculty: {},
          classUrlTemplate: 'https://meet.example.com/{date}-p{period}',
        }),
        periodLengthMins: v,
      },
    }));
    setPeriodOpen(false);
    toast({ title: 'Period length updated', description: `Period count recomputed at ${v} min/period.` });
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="max-w-7xl mx-auto p-6 space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Programs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium truncate">{program.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Teaching Hours</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Hero / step card with prominent period length */}
              <Card className="border-indigo-200/60 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-5 sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Step 1 — Set hours per topic
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
                      <p className="text-sm text-slate-600 mt-1.5">
                        Enter teaching hours per topic. Chapter and subject totals roll up automatically. We convert
                        hours → class periods using the period length on the right.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
                        <Badge variant="outline" className="bg-white">{program.subjects.length} subjects</Badge>
                        <Badge variant="outline" className="bg-white">{chaptersCount} chapters</Badge>
                        <Badge variant="outline" className="bg-white">{roll.totalTopics} topics</Badge>
                      </div>
                    </div>

                    {/* Period length — promoted */}
                    <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="group shrink-0 rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-3 hover:border-indigo-400 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                            <Timer className="h-3 w-3" />
                            Period length
                            <HelpCircle className="h-3 w-3 opacity-60" />
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-3xl font-bold text-indigo-900 tabular-nums">{periodMins}</span>
                            <span className="text-sm text-indigo-700 font-medium">min</span>
                          </div>
                          <div className="text-[10px] text-indigo-700/70 mt-0.5">tap to edit</div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">Period length</div>
                            <p className="text-xs text-slate-600 mt-0.5">{PROGRAM_TOOLTIPS.periodLength}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={15}
                              max={120}
                              value={periodDraft}
                              onChange={(e) => setPeriodDraft(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && commitPeriodLength()}
                              className="bg-white"
                            />
                            <span className="text-xs text-slate-500">min</span>
                            <Button size="sm" onClick={commitPeriodLength}>
                              Apply
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[30, 40, 45, 50, 60].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  setPeriodDraft(String(v));
                                }}
                                className={cn(
                                  'text-xs px-2 py-1 rounded border',
                                  Number(periodDraft) === v
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300',
                                )}
                              >
                                {v}m
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Toolbar: jump nav + bulk actions */}
              <div className="flex flex-wrap items-center gap-2 sticky top-2 z-10 bg-slate-50/80 backdrop-blur rounded-lg border border-slate-200/60 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1">
                  Jump to
                </span>
                {program.subjects.map((s) => {
                  const pal = subjectPalette(s.color);
                  return (
                    <a
                      key={s.id}
                      href={`#subj-${s.id}`}
                      onClick={() => setSubjectsOpen((e) => ({ ...e, [s.id]: true }))}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                        pal.bgSoft,
                        pal.text,
                        pal.border,
                        'hover:shadow-sm transition-shadow',
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
                      {s.name}
                    </a>
                  );
                })}
                <div className="ml-auto flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={expandAll}>
                    <Maximize2 className="h-3 w-3" /> Expand all
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={collapseAll}>
                    <Minimize2 className="h-3 w-3" /> Collapse all
                  </Button>
                </div>
              </div>

              {/* Subjects */}
              {program.subjects.map((s) => {
                const sRoll = rollupSubject(s, periodMins);
                const pal = subjectPalette(s.color);
                const isOpen = subjectsOpen[s.id];
                const progressPct = sRoll.topics === 0 ? 0 : (sRoll.topicsConfigured / sRoll.topics) * 100;
                return (
                  <Card
                    key={s.id}
                    id={`subj-${s.id}`}
                    className={cn(
                      'border shadow-sm overflow-hidden scroll-mt-24 transition-all',
                      isOpen ? 'border-slate-300 shadow-md' : 'border-slate-200/70',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSubjectsOpen((e) => ({ ...e, [s.id]: !e[s.id] }))}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 text-left transition-colors',
                        isOpen ? pal.bgSoft : 'bg-white hover:bg-slate-50',
                      )}
                    >
                      <div className={cn('w-1.5 self-stretch rounded-full', pal.bg)} />
                      <div
                        className={cn(
                          'h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm transition-transform',
                          pal.bg,
                          'text-white shadow-sm',
                        )}
                      >
                        {s.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-bold text-base', pal.text)}>{s.name}</div>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <span>{s.chapters.length} chapters</span>
                          <span className="text-slate-300">·</span>
                          <span className={cn('font-medium', sRoll.topicsConfigured === sRoll.topics ? 'text-emerald-600' : 'text-amber-600')}>
                            {sRoll.topicsConfigured}/{sRoll.topics} topics
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-5 text-sm">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Hours</div>
                          <div className={cn('font-bold tabular-nums', pal.text)}>{sRoll.hours}h</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Periods</div>
                          <div className={cn('font-bold tabular-nums', pal.text)}>≈{sRoll.periods}</div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center border transition-all',
                          isOpen
                            ? cn('bg-white', pal.border, pal.text, 'shadow-sm rotate-0')
                            : 'bg-slate-100 border-slate-200 text-slate-500 -rotate-90',
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    {/* progress bar */}
                    <div className={cn('h-1 w-full', pal.bgSoft)}>
                      <div className={cn('h-full transition-all', pal.bg)} style={{ width: `${progressPct}%` }} />
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-2.5">
                        {s.chapters.map((c, ci) => (
                          <ChapterBlock
                            key={c.id}
                            programId={program.id}
                            subjectId={s.id}
                            chapter={c}
                            chapterIndex={ci}
                            periodMins={periodMins}
                            color={s.color}
                            open={chaptersOpen[c.id] ?? false}
                            onToggle={() => setChaptersOpen((e) => ({ ...e, [c.id]: !(e[c.id] ?? false) }))}
                          />
                        ))}
                        <InlineAddRow
                          placeholder="+ Add chapter"
                          onAdd={(name) => addChapter(program.id, s.id, name)}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* RIGHT: sticky summary */}
            <aside className="lg:sticky lg:top-20 self-start space-y-4">
              <Card className="border-slate-200/70 shadow-md bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                <CardContent className="p-5 space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</div>
                    <div className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{roll.hours} hrs</div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      ≈ <span className="font-semibold text-slate-800 tabular-nums">{roll.periods}</span> periods of{' '}
                      {periodMins} min
                    </div>
                  </div>

                  {/* Segmented progress bar */}
                  <div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      {roll.subjects.map((s) => {
                        const pal = subjectPalette(s.color);
                        const pct = roll.totalTopics === 0 ? 0 : (s.topicsConfigured / roll.totalTopics) * 100;
                        return <div key={s.subjectId} className={cn('h-full', pal.bg)} style={{ width: `${pct}%` }} />;
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5">
                      {roll.topicsConfigured}/{roll.totalTopics} topics configured
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {roll.subjects.map((s) => {
                      const pal = subjectPalette(s.color);
                      return (
                        <div key={s.subjectId} className="flex items-center gap-2 text-sm">
                          <span className={cn('h-2 w-2 rounded-full', pal.dot)} />
                          <span className="flex-1 truncate text-slate-700">{s.subjectName}</span>
                          <span className="text-slate-500 text-xs tabular-nums">{s.hours}h · {s.periods}p</span>
                        </div>
                      );
                    })}
                  </div>

                  {missingTopics > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2 text-xs text-amber-800">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>{missingTopics} topic{missingTopics > 1 ? 's' : ''}</strong> still need hours before you
                        can generate the schedule.
                      </div>
                    </div>
                  )}

                  <Button
                    className={cn(
                      'w-full gap-2',
                      program.hoursFinalised ? '' : 'bg-indigo-600 hover:bg-indigo-700',
                    )}
                    disabled={!ready}
                    variant={program.hoursFinalised ? 'outline' : 'default'}
                    onClick={() => {
                      const next = !program.hoursFinalised;
                      finaliseHours(program.id, next);
                      toast({
                        title: next ? 'Hours finalised' : 'Hours unlocked',
                        description: next
                          ? 'You can now generate the academic schedule.'
                          : 'Hours can be edited again.',
                      });
                    }}
                  >
                    {program.hoursFinalised ? (
                      <>
                        <Unlock className="h-4 w-4" /> Unlock for editing
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Mark hours as final
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full gap-2"
                    disabled={!program.hoursFinalised}
                    onClick={() => navigate(`/institute/programs/${program.id}/schedule`)}
                  >
                    <Wand2 className="h-4 w-4" /> Continue to scheduling
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

/* ──────────────── Chapter block ──────────────── */

const ChapterBlock: React.FC<{
  programId: string;
  subjectId: string;
  chapter: { id: string; name: string; topics: { id: string; name: string; hours: number }[] };
  chapterIndex: number;
  periodMins: number;
  color: string;
  open: boolean;
  onToggle: () => void;
}> = ({ programId, subjectId, chapter, chapterIndex, periodMins, color, open, onToggle }) => {
  const totalH = chapterHours(chapter);
  const totalP = chapter.topics.reduce((a, t) => a + hoursToPeriods(t.hours, periodMins), 0);
  const configured = chapter.topics.filter((t) => t.hours > 0).length;
  const pal = subjectPalette(color);
  const complete = configured === chapter.topics.length && chapter.topics.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        open
          ? 'bg-white border-slate-300 shadow-md'
          : 'bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-sm',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-stretch text-left"
      >
        {/* Subject-color rail (stronger when open) */}
        <div className={cn('w-1 shrink-0 transition-all', open ? pal.bg : 'bg-slate-200')} />

        <div className="flex-1 flex items-center gap-3 p-3">
          <div
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center border transition-all',
              open
                ? cn('bg-white shadow-sm', pal.border, pal.text)
                : 'bg-slate-50 border-slate-200 text-slate-400',
            )}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', !open && '-rotate-90')} />
          </div>

          <div className="flex-1 min-w-0">
            <div className={cn('font-semibold text-sm', open ? 'text-slate-900' : 'text-slate-700')}>
              Ch {chapterIndex + 1}. {chapter.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className={cn('font-medium', complete ? 'text-emerald-600' : 'text-amber-600')}>
                {configured}/{chapter.topics.length} topics
              </span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums">{totalH}h</span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums">{totalP} periods</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn('text-[10px] font-semibold tabular-nums', pal.bgSoft, pal.text, pal.border)}
          >
            {totalP}p
          </Badge>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2 bg-slate-50/40">
          {chapter.topics.length === 0 ? (
            <div className="text-xs text-slate-400 italic px-2 py-3">No topics yet — add one below.</div>
          ) : (
            <div className="space-y-0.5">
              {chapter.topics.map((t, i) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  periodMins={periodMins}
                  zebra={i % 2 === 1}
                  ringClass={pal.ring}
                  onChange={(h) => updateTopicHours(programId, t.id, h)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-slate-200/60">
            <InlineAddRow
              placeholder="+ Add topic"
              compact
              onAdd={(name) => addTopic(programId, subjectId, chapter.id, name)}
            />
            <BulkSetButton onApply={(h) => setChapterTopicsHours(programId, chapter.id, h)} />
          </div>
        </div>
      )}
    </div>
  );
};

const TopicRow: React.FC<{
  topic: { id: string; name: string; hours: number };
  periodMins: number;
  zebra: boolean;
  ringClass: string;
  onChange: (h: number) => void;
}> = ({ topic, periodMins, zebra, ringClass, onChange }) => {
  const periods = hoursToPeriods(topic.hours, periodMins);
  const set = topic.hours > 0;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2 py-1.5 rounded-md',
        zebra ? 'bg-white' : 'bg-transparent',
        'hover:bg-blue-50/40 transition-colors',
      )}
    >
      <div className="flex-1 text-sm text-slate-700 truncate">{topic.name}</div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <Input
          type="number"
          min={0}
          step={0.25}
          value={topic.hours || ''}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={cn(
            'h-8 w-20 text-right text-sm bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-offset-0',
            ringClass,
          )}
        />
        <span className="text-xs text-slate-400 w-4">h</span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 w-14 justify-end cursor-help">
            <Hash className="h-3 w-3 text-slate-400" />
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                periods > 0 ? 'text-slate-700' : 'text-slate-300',
              )}
            >
              {periods}p
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          {periods > 0
            ? `≈ ${periods} period${periods > 1 ? 's' : ''} of ${periodMins} min, rounded up from ${topic.hours} h.`
            : 'Enter hours to compute periods.'}
        </TooltipContent>
      </Tooltip>
      {set ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-dashed border-slate-300" />
      )}
    </div>
  );
};

const InlineAddRow: React.FC<{ placeholder: string; compact?: boolean; onAdd: (name: string) => void }> = ({
  placeholder,
  compact,
  onAdd,
}) => {
  const [v, setV] = useState('');
  const [active, setActive] = useState(false);
  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md border border-dashed border-indigo-200',
          compact ? '' : 'mt-1',
        )}
      >
        <Plus className="h-3.5 w-3.5" /> {placeholder.replace('+ ', '')}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && v.trim()) {
            onAdd(v.trim());
            setV('');
          } else if (e.key === 'Escape') {
            setActive(false);
            setV('');
          }
        }}
        placeholder={placeholder.replace('+ ', '')}
        className="h-8 text-sm bg-white max-w-xs"
      />
      <Button
        size="sm"
        className="h-8 bg-indigo-600 hover:bg-indigo-700"
        onClick={() => {
          if (v.trim()) {
            onAdd(v.trim());
            setV('');
          }
        }}
      >
        Add
      </Button>
      <Button size="sm" variant="ghost" className="h-8" onClick={() => { setActive(false); setV(''); }}>
        Cancel
      </Button>
    </div>
  );
};

const BulkSetButton: React.FC<{ onApply: (h: number) => void }> = ({ onApply }) => {
  const [v, setV] = useState('1');
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
      <Wand className="h-3.5 w-3.5 text-slate-400" />
      <span>Set all topics to</span>
      <Input
        type="number"
        min={0}
        step={0.25}
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="h-7 w-16 text-sm bg-white"
      />
      <span>h</span>
      <Button size="sm" variant="outline" className="h-7" onClick={() => onApply(Number(v) || 0)}>
        Apply
      </Button>
    </div>
  );
};

export default ProgramHoursPage;
