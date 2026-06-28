import React, { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Sparkles, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section, SubjectStatus, subjectStatusKey } from '@/types/section';
import { setSubjectStatus } from '@/hooks/useSection';
import { sectionPalette, trackPattern } from '@/lib/sectionColors';
import { useFaculty } from '@/hooks/useInstitutePrograms';
import { WEEKDAY_LABELS, listWeekStarts, placedByTrack, totalAllocated } from '@/utils/sectionUtils';
import { cn } from '@/lib/utils';

interface Props {
  section: Section;
  onBack: () => void;
}

export const SectionPreviewStep: React.FC<Props> = ({ section, onBack }) => {
  const faculty = useFaculty();
  const facultyById = useMemo(() => Object.fromEntries(faculty.map((f) => [f.id, f])), [faculty]);
  const weekStarts = listWeekStarts(section.windows[section.windows.length - 1]);
  const placed = placedByTrack(section);

  return (
    <div className="space-y-4">
      {/* Subject status rail */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">Subject lifecycle</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {section.programs.flatMap((p) =>
              p.subjects.map((su) => (
                <SubjectStatusRow
                  key={`${p.id}-${su.id}`}
                  programId={p.id}
                  programCode={p.code}
                  subject={su}
                  status={section.subjectStatus[subjectStatusKey(p.id, su.id)] ?? 'draft'}
                  onStatusChange={(st) => setSubjectStatus(section.id, p.id, su.id, st)}
                />
              )),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coverage summary */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Allocation coverage</div>
            <div className="text-xs text-slate-600 tabular-nums">
              {section.cells.length} cells placed · {totalAllocated(section)} periods allotted
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {section.programs.flatMap((p) =>
              p.subjects.flatMap((su) =>
                su.tracks.map((tr, tIdx) => {
                  const pal = sectionPalette(su.color);
                  const ptarget = tr.allottedPeriods || 0;
                  const pplaced = placed[tr.id] ?? 0;
                  const pct = ptarget === 0 ? 0 : Math.min(100, Math.round((pplaced / ptarget) * 100));
                  return (
                    <div key={tr.id} className={cn('rounded-xl border p-3 flex items-center gap-3', pal.border, pal.surface)}>
                      <span
                        className={cn('h-10 w-10 rounded-lg shrink-0 grid place-items-center text-white font-bold text-xs', pal.solid)}
                        style={trackPattern(tIdx)}
                      >
                        {tr.name}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={cn('text-xs font-semibold', pal.text)}>
                          {p.code} · {su.name}
                        </div>
                        <div className="text-[10px] text-slate-600 mb-1">
                          {facultyById[tr.facultyId]?.name?.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '') ?? 'no faculty'}
                        </div>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={cn('h-full', pal.solid)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-bold tabular-nums text-slate-800">
                        {pplaced}/{ptarget}
                      </div>
                    </div>
                  );
                }),
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick mini-grid (first week preview) */}
      {weekStarts[0] && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Week 1 timetable preview
              </div>
            </div>
            <MiniGrid section={section} weekStart={weekStarts[0]} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
        </Button>
      </div>
    </div>
  );
};

const SubjectStatusRow: React.FC<{
  programId: string;
  programCode: string;
  subject: Section['programs'][number]['subjects'][number];
  status: SubjectStatus;
  onStatusChange: (s: SubjectStatus) => void;
}> = ({ programCode, subject, status, onStatusChange }) => {
  const pal = sectionPalette(subject.color);
  const next = status === 'draft' ? 'locked' : status === 'locked' ? 'published' : 'draft';
  const nextLabel = status === 'draft' ? 'Lock' : status === 'locked' ? 'Publish' : 'Unlock';
  const Icon = status === 'draft' ? Unlock : status === 'locked' ? Lock : CheckCircle2;
  const tone =
    status === 'draft' ? 'bg-slate-100 text-slate-700' :
    status === 'locked' ? 'bg-amber-100 text-amber-800' :
    'bg-emerald-100 text-emerald-800';

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn('h-7 w-7 rounded-md grid place-items-center text-white text-[10px] font-bold', pal.solid)}>
          {subject.name[0]}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900 truncate">{programCode} · {subject.name}</div>
          <Badge className={cn('text-[9px] mt-0.5 hover:bg-current', tone)}>
            <Icon className="h-2.5 w-2.5 mr-0.5" />
            {status}
          </Badge>
        </div>
      </div>
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onStatusChange(next)}>
        {nextLabel}
      </Button>
    </div>
  );
};

const MiniGrid: React.FC<{ section: Section; weekStart: string }> = ({ section, weekStart }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[520px]">
        <thead>
          <tr>
            <th className="w-12 border-b border-slate-200 bg-slate-50 px-1 py-1 text-[9px] font-bold text-slate-500">P</th>
            {section.config.workingDays.map((d) => (
              <th key={d} className="border-b border-slate-200 bg-slate-50 px-1 py-1 text-[10px] font-semibold text-slate-700">
                {WEEKDAY_LABELS.find((w) => w.d === d)?.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: section.config.periodsPerDay }).map((_, p) => (
            <tr key={p}>
              <td className="border-b border-slate-100 px-1 py-1 text-center text-[10px] font-bold text-slate-700">P{p + 1}</td>
              {section.config.workingDays.map((d) => {
                const cell = section.cells.find((c) =>
                  c.weekStartDate === weekStart && c.weekday === d && c.periodIndex === p,
                );
                if (!cell) {
                  return <td key={d} className="border-b border-slate-100 p-0.5"><div className="h-8 rounded bg-slate-50" /></td>;
                }
                const prog = section.programs.find((pg) => pg.id === cell.allocation.programId);
                const sub = prog?.subjects.find((s) => s.id === cell.allocation.subjectId);
                if (!sub || !prog) return <td key={d} />;
                const pal = sectionPalette(sub.color);
                const tr = sub.tracks.find((t) => t.id === cell.allocation.trackId);
                const tIdx = sub.tracks.findIndex((t) => t.id === cell.allocation.trackId);
                return (
                  <td key={d} className="border-b border-slate-100 p-0.5">
                    <div
                      className={cn('h-8 rounded text-white text-[9px] font-bold flex items-center justify-center', pal.solid)}
                      style={trackPattern(tIdx)}
                      title={`${prog.code} · ${sub.name} · ${tr?.name}`}
                    >
                      {prog.code[0]}·{sub.name.slice(0, 3)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
