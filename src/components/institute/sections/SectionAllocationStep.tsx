import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Layers, Plus, Trash2, Users, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Section } from '@/types/section';
import {
  addTrack, removeTrack, setTrackAllotment, setTrackFaculty,
} from '@/hooks/useSection';
import { useFaculty } from '@/hooks/useInstitutePrograms';
import { computeSectionCapacity, totalAllocated } from '@/utils/sectionUtils';
import { sectionPalette, trackPattern } from '@/lib/sectionColors';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  onBack: () => void;
  onNext: () => void;
}

export const SectionAllocationStep: React.FC<Props> = ({ section, onBack, onNext }) => {
  const faculty = useFaculty();
  const win = section.windows[section.windows.length - 1];
  const cap = useMemo(() => computeSectionCapacity(section.config, win), [section.config, win]);
  const allocated = totalAllocated(section);
  const remaining = cap.totalPeriods - allocated;
  const overBy = Math.max(0, allocated - cap.totalPeriods);
  const pct = cap.totalPeriods === 0 ? 0 : Math.min(100, Math.round((allocated / cap.totalPeriods) * 100));

  const facultyById = useMemo(() => Object.fromEntries(faculty.map((f) => [f.id, f])), [faculty]);

  // Program switcher state — only ONE program is edited at a time
  const [activeProgramId, setActiveProgramId] = useState<string>(section.programs[0]?.id ?? '');
  const [pulseId, setPulseId] = useState<string | null>(null);
  useEffect(() => {
    // self-heal if the active program is removed
    if (!section.programs.find((p) => p.id === activeProgramId)) {
      setActiveProgramId(section.programs[0]?.id ?? '');
    }
  }, [section.programs, activeProgramId]);

  const activeProgram = section.programs.find((p) => p.id === activeProgramId) ?? section.programs[0];
  const multiProgram = section.programs.length > 1;

  const programTotals = useMemo(
    () => Object.fromEntries(
      section.programs.map((p) => [
        p.id,
        p.subjects.reduce((sum, su) => sum + su.tracks.reduce((s, t) => s + (t.allottedPeriods || 0), 0), 0),
      ]),
    ),
    [section.programs],
  );

  const activeStats = useMemo(() => {
    if (!activeProgram) return { subjects: 0, tracks: 0, allocated: 0 };
    const subjects = activeProgram.subjects.length;
    const tracks = activeProgram.subjects.reduce((s, su) => s + su.tracks.length, 0);
    return { subjects, tracks, allocated: programTotals[activeProgram.id] ?? 0 };
  }, [activeProgram, programTotals]);

  const blocker = overBy > 0
    ? `${overBy} periods over budget — reduce allocations`
    : allocated === 0
      ? 'Allocate at least one track before continuing'
      : null;

  const switchProgram = (id: string) => {
    if (id === activeProgramId) return;
    setActiveProgramId(id);
    setPulseId(id);
    window.setTimeout(() => setPulseId((cur) => (cur === id ? null : cur)), 650);
  };

  return (
    <div className="space-y-4">
      {/* Budget strip — shared across all programs in this section */}
      <Card className={cn(
        'border shadow-sm',
        overBy > 0
          ? 'border-rose-300 bg-gradient-to-r from-rose-50 to-white'
          : remaining === 0
            ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-white'
            : 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-white',
      )}>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BudgetCell label="Budget" value={cap.totalPeriods} />
            <BudgetCell label="Allocated" value={allocated} />
            <BudgetCell
              label={overBy > 0 ? 'Over' : 'Remaining'}
              value={overBy > 0 ? overBy : remaining}
              tone={overBy > 0 ? 'rose' : remaining === 0 ? 'emerald' : 'amber'}
            />
            <BudgetCell label="Working days" value={cap.workingDays} />
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
            <div
              className={cn(
                'h-full transition-all',
                overBy > 0 ? 'bg-rose-500' : remaining === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {multiProgram && (
            <p className="text-[11px] text-slate-600">
              Budget is shared across all <strong>{section.programs.length} programs</strong> in this section.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Program switcher — only the active program is edited below */}
      {section.programs.length > 0 && (
        <Card className="border-indigo-200 shadow-sm bg-gradient-to-r from-indigo-50/60 via-white to-blue-50/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-700">Programs</span>
              <span className="text-[11px] text-slate-500">· each program manages its own tracks & periods within the shared section budget</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.programs.map((p) => {
                const isActive = p.id === activeProgram?.id;
                const isPulsing = pulseId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => switchProgram(p.id)}
                    title={`${p.name} · ${programTotals[p.id]} periods`}
                    className={cn(
                      'group flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all',
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50',
                      isPulsing && 'ring-4 ring-amber-300/60',
                    )}
                  >
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <div className="flex flex-col leading-tight">
                      <span className={cn('text-xs font-bold', isActive ? 'text-white' : 'text-slate-900')}>{p.code}</span>
                      <span className={cn('text-[10px] truncate max-w-[140px]', isActive ? 'text-indigo-100' : 'text-slate-500')}>
                        {p.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums',
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700',
                      )}
                    >
                      {programTotals[p.id]}p
                    </span>
                  </button>
                );
              })}
            </div>
            {activeProgram && (
              <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong className="text-slate-900">{activeProgram.code}</strong> active</span>
                <span className="text-slate-300">·</span>
                <span>{activeStats.subjects} subjects</span>
                <span className="text-slate-300">·</span>
                <span>{activeStats.tracks} tracks</span>
                <span className="text-slate-300">·</span>
                <span><strong className="text-slate-900 tabular-nums">{activeStats.allocated}</strong> periods allocated</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active program — single block, no accordion stacking */}
      {activeProgram && (
        <ProgramAllocationBlock
          key={activeProgram.id}
          section={section}
          program={activeProgram}
          facultyById={facultyById as never}
          facultyPool={section.facultyPool}
          facultyList={faculty}
        />
      )}

      {multiProgram && (
        <p className="text-[11px] text-slate-500 text-center">
          {section.programs.length - 1} more program{section.programs.length - 1 === 1 ? '' : 's'} hidden — switch above to edit
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {blocker && <span className="text-xs text-rose-600 font-medium">{blocker}</span>}
          <Button
            onClick={onNext}
            disabled={!!blocker}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300"
          >
            Continue to Timetable <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProgramAllocationBlock: React.FC<{
  section: Section;
  program: Section['programs'][number];
  facultyById: Record<string, { id: string; name: string }>;
  facultyPool: string[];
  facultyList: { id: string; name: string }[];
}> = ({ section, program, facultyPool, facultyList }) => {
  const programTotal = program.subjects.reduce(
    (sum, su) => sum + su.tracks.reduce((s, t) => s + (t.allottedPeriods || 0), 0),
    0,
  );

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-900 text-white hover:bg-slate-900 text-[10px] font-bold">{program.code}</Badge>
          <span className="text-sm font-semibold text-slate-900">{program.name}</span>
          <span className="text-[11px] text-slate-500">· allot periods to each subject</span>
        </div>
        <div className="text-xs text-slate-600 tabular-nums font-medium">{programTotal} periods</div>
      </div>
      <CardContent className="p-3 space-y-2">
        {program.subjects.map((su) => (
          <SubjectRow
            key={su.id}
            section={section}
            programId={program.id}
            subject={su}
            facultyPool={facultyPool}
            facultyList={facultyList}
          />
        ))}
      </CardContent>
    </Card>
  );
};

const SubjectRow: React.FC<{
  section: Section;
  programId: string;
  subject: Section['programs'][number]['subjects'][number];
  facultyPool: string[];
  facultyList: { id: string; name: string }[];
}> = ({ section, programId, subject, facultyPool, facultyList }) => {
  const pal = sectionPalette(subject.color);
  const total = subject.tracks.reduce((s, t) => s + (t.allottedPeriods || 0), 0);

  return (
    <div className={cn('rounded-xl border overflow-hidden', pal.border)}>
      <div className={cn('px-4 py-2.5 flex items-center justify-between bg-gradient-to-r', pal.headerGradient)}>
        <div className="flex items-center gap-2 text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          <span className="text-sm font-bold">{subject.name}</span>
        </div>
        <div className="text-xs text-white/90 font-semibold tabular-nums">{total} periods</div>
      </div>
      <div className="p-3 space-y-2 bg-white">
        {subject.tracks.map((tr, tIdx) => (
          <div key={tr.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span
              className={cn('h-9 w-9 rounded-lg shrink-0 grid place-items-center text-white font-bold text-xs', pal.solid)}
              style={trackPattern(tIdx)}
            >
              {tr.name}
            </span>
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
              <Select
                value={tr.facultyId}
                onValueChange={(v) => setTrackFaculty(section.id, programId, subject.id, tr.id, v)}
              >
                <SelectTrigger className="h-9 text-xs bg-white">
                  <SelectValue placeholder="Pick faculty" />
                </SelectTrigger>
                <SelectContent>
                  {facultyPool.map((fid) => {
                    const f = facultyList.find((x) => x.id === fid);
                    if (!f) return null;
                    return (
                      <SelectItem key={fid} value={fid} className="text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {f.name.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '')}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={tr.allottedPeriods || ''}
                  placeholder="0"
                  onChange={(e) => setTrackAllotment(section.id, programId, subject.id, tr.id, Number(e.target.value) || 0)}
                  className="h-9 text-xs text-right pr-12 font-mono tabular-nums bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">periods</span>
              </div>
            </div>
            {subject.tracks.length > 1 && (
              <button
                onClick={() => removeTrack(section.id, programId, subject.id, tr.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                aria-label="Remove track"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <AddTrackButton
          onAdd={(name, facultyId) => {
            addTrack(section.id, programId, subject.id, name, facultyId);
            toast.success(`Track ${name} added to ${subject.name}`);
          }}
          facultyPool={facultyPool}
          facultyList={facultyList}
          defaultName={`T${subject.tracks.length + 1}`}
        />
      </div>
    </div>
  );
};

const AddTrackButton: React.FC<{
  onAdd: (name: string, facultyId: string) => void;
  facultyPool: string[];
  facultyList: { id: string; name: string }[];
  defaultName: string;
}> = ({ onAdd, facultyPool, facultyList, defaultName }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [facultyId, setFacultyId] = useState(facultyPool[0] ?? '');

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setName(defaultName); setFacultyId(facultyPool[0] ?? ''); } }}>
      <DialogTrigger asChild>
        <button className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all">
          <Plus className="h-3.5 w-3.5" /> Add parallel track
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add parallel track</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Track name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="T2" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Faculty</div>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger><SelectValue placeholder="Pick faculty" /></SelectTrigger>
              <SelectContent>
                {facultyPool.map((fid) => {
                  const f = facultyList.find((x) => x.id === fid);
                  if (!f) return null;
                  return <SelectItem key={fid} value={fid}>{f.name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => { onAdd(name || 'T?', facultyId); setOpen(false); }}
            disabled={!name.trim() || !facultyId}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Add track
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BudgetCell: React.FC<{ label: string; value: number; tone?: 'rose' | 'emerald' | 'amber' }> = ({ label, value, tone }) => (
  <div className="rounded-lg bg-white/80 border border-white px-3 py-2">
    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{label}</div>
    <div className={cn(
      'text-xl font-bold tabular-nums mt-0.5',
      tone === 'rose' && 'text-rose-700',
      tone === 'emerald' && 'text-emerald-700',
      tone === 'amber' && 'text-amber-700',
      !tone && 'text-slate-900',
    )}>{value.toLocaleString()}</div>
  </div>
);
