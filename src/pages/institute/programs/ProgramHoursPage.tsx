import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  Info,
  Lock,
  Plus,
  Sparkles,
  Unlock,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ProgramHoursPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  const navigate = useNavigate();

  const [periodMins, setPeriodMins] = useState<number>(program?.schedule?.periodLengthMins ?? 40);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    program?.subjects.forEach((s) => (init[s.id] = true));
    return init;
  });

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

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-5">
        {/* Breadcrumb header */}
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
          {/* LEFT: tree */}
          <div className="space-y-5">
            {/* Period length card */}
            <Card className="border-slate-200/70 shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Step 1 — Set hours per topic
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Enter teaching hours per topic. Chapter and subject totals roll up automatically; we convert hours →
                    periods using the period length below.
                  </p>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                      Period length (min)
                    </label>
                    <Input
                      type="number"
                      min={15}
                      max={120}
                      value={periodMins}
                      onChange={(e) => setPeriodMins(Math.max(15, Math.min(120, Number(e.target.value) || 40)))}
                      onBlur={() =>
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
                            periodLengthMins: periodMins,
                          },
                        }))
                      }
                      className="w-24 bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects */}
            {program.subjects.map((s) => {
              const sRoll = rollupSubject(s, periodMins);
              const pal = subjectPalette(s.color);
              const isOpen = expanded[s.id];
              return (
                <Card key={s.id} className={cn('border-slate-200/70 shadow-sm overflow-hidden')}>
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }))}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={cn('w-1 self-stretch rounded-full', pal.bg)} />
                    <ChevronDown
                      className={cn('h-4 w-4 text-slate-400 transition-transform', !isOpen && '-rotate-90')}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.chapters.length} chapters · {sRoll.topicsConfigured}/{sRoll.topics} topics configured
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Hours</div>
                        <div className="font-semibold text-slate-800">{sRoll.hours}h</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Periods</div>
                        <div className="font-semibold text-slate-800">{sRoll.periods}</div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-3">
                      {s.chapters.map((c, ci) => (
                        <ChapterBlock
                          key={c.id}
                          programId={program.id}
                          subjectId={s.id}
                          chapter={c}
                          chapterIndex={ci}
                          periodMins={periodMins}
                          color={s.color}
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
            <Card className="border-slate-200/70 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{roll.hours} hrs</div>
                  <div className="text-sm text-slate-600">≈ {roll.periods} periods of {periodMins} min</div>
                </div>

                <Progress
                  value={roll.totalTopics === 0 ? 0 : (roll.topicsConfigured / roll.totalTopics) * 100}
                  className="h-2"
                />
                <div className="text-xs text-slate-500">
                  {roll.topicsConfigured}/{roll.totalTopics} topics configured
                </div>

                <Separator />

                <div className="space-y-2">
                  {roll.subjects.map((s) => {
                    const pal = subjectPalette(s.color);
                    return (
                      <div key={s.subjectId} className="flex items-center gap-2 text-sm">
                        <span className={cn('h-2 w-2 rounded-full', pal.dot)} />
                        <span className="flex-1 truncate text-slate-700">{s.subjectName}</span>
                        <span className="text-slate-500 text-xs">{s.hours}h · {s.periods}p</span>
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
                  className="w-full gap-2"
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
}> = ({ programId, subjectId, chapter, chapterIndex, periodMins, color }) => {
  const [open, setOpen] = useState(chapterIndex === 0);
  const totalH = chapterHours(chapter);
  const totalP = chapter.topics.reduce((a, t) => a + hoursToPeriods(t.hours, periodMins), 0);
  const configured = chapter.topics.filter((t) => t.hours > 0).length;
  const pal = subjectPalette(color);

  return (
    <div className="rounded-xl bg-white border border-slate-200/70 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
      >
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', !open && '-rotate-90')} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-800 text-sm">
            Ch {chapterIndex + 1}. {chapter.name}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {configured}/{chapter.topics.length} topics · {totalH}h · {totalP} periods
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[10px]', pal.bgSoft, pal.text, pal.border)}>
          {totalP}p
        </Badge>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-3 space-y-2">
          {chapter.topics.length === 0 ? (
            <div className="text-xs text-slate-400 italic px-2 py-1">No topics yet — add one below.</div>
          ) : (
            chapter.topics.map((t) => (
              <TopicRow
                key={t.id}
                topic={t}
                periodMins={periodMins}
                onChange={(h) => updateTopicHours(programId, t.id, h)}
              />
            ))
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
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
  onChange: (h: number) => void;
}> = ({ topic, periodMins, onChange }) => {
  const periods = hoursToPeriods(topic.hours, periodMins);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
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
          className="h-8 w-20 text-right text-sm bg-white"
        />
        <span className="text-xs text-slate-400 w-6">h</span>
      </div>
      <div className="flex items-center gap-1 w-16 justify-end">
        <Hash className="h-3 w-3 text-slate-400" />
        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            periods > 0 ? 'text-slate-700' : 'text-slate-300',
          )}
        >
          {periods}p
        </span>
      </div>
      {topic.hours > 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
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
          'inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded',
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
        className="h-8"
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
