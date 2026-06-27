import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarOff,
  CalendarRange,
  Clock,
  GraduationCap,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitutePrograms } from '@/hooks/useInstitutePrograms';
import { subjectPalette } from '@/lib/subjectColors';
import { cn } from '@/lib/utils';

/** Soft accent gradient drawn from each program's subject colors. */
function gradientFor(colors: string[]): string {
  const map: Record<string, string> = {
    blue: '59, 130, 246',
    emerald: '16, 185, 129',
    violet: '139, 92, 246',
    rose: '244, 63, 94',
    amber: '245, 158, 11',
    cyan: '6, 182, 212',
  };
  const stops = colors.slice(0, 3).map((c, i) => {
    const rgb = map[c] ?? map.blue;
    const positions = ['12% 18%', '88% 22%', '60% 92%'];
    const alpha = [0.22, 0.18, 0.14];
    return `radial-gradient(circle at ${positions[i] ?? '50% 50%'}, rgba(${rgb}, ${alpha[i] ?? 0.15}), transparent 55%)`;
  });
  return stops.join(', ');
}

const ProgramsListPage: React.FC = () => {
  const navigate = useNavigate();
  const programs = useInstitutePrograms();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  const classes = useMemo(
    () => Array.from(new Set(programs.map((p) => p.className))).sort(),
    [programs],
  );

  const filtered = programs.filter(
    (p) =>
      (classFilter === 'all' || p.className === classFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <CalendarRange className="h-3.5 w-3.5" />
              Programs &amp; Calendar Automation
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Programs</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Allocate class periods per subject, build the weekly timetable, then auto-generate the academic
              calendar that powers the teacher schedule.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/institute/programs/holidays')}
            >
              <CalendarOff className="h-4 w-4" /> Holiday setup
            </Button>
            <Button className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700" disabled title="Coming soon">
              <Plus className="h-4 w-4" /> New Program
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search programs..."
                className="pl-9 bg-white"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <p className="text-slate-500">No programs match your filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const colors = p.subjects.map((s) => s.color);
              const bgGradient = gradientFor(colors);
              const goSchedule = () => navigate(`/institute/programs/${p.id}/schedule`);

              return (
                <Card
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={goSchedule}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goSchedule()}
                  className="group relative cursor-pointer overflow-hidden border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                >
                  {/* Aurora background */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundImage: bgGradient }}
                  />

                  {/* Subject color rail */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                    {p.subjects.map((s) => {
                      const pal = subjectPalette(s.color);
                      return <div key={s.id} className={cn('flex-1', pal.bg)} />;
                    })}
                  </div>

                  <CardContent className="relative p-6 space-y-5">
                    {/* Class badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                        <GraduationCap className="h-3 w-3 text-slate-500" />
                        {p.className}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Users className="h-3 w-3" />
                        {p.sections.length === 1 ? `Section ${p.sections[0]}` : `Sections ${p.sections.join(', ')}`}
                      </span>
                    </div>

                    {/* Program name */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl leading-snug tracking-tight">
                        {p.name}
                      </h3>
                    </div>

                    {/* Subject chips — the primary identity */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.subjects.map((s) => {
                        const pal = subjectPalette(s.color);
                        return (
                          <span
                            key={s.id}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-white/85 backdrop-blur',
                              pal.text,
                              pal.border,
                            )}
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full', pal.dot)} />
                            {s.name}
                          </span>
                        );
                      })}
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        className="gap-1.5 h-8 bg-slate-900 hover:bg-slate-800 text-white shadow-sm group-hover:bg-indigo-600 group-hover:shadow-md transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          goSchedule();
                        }}
                      >
                        Setup &amp; Allocation
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/institute/programs/${p.id}/preview`);
                        }}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline"
                      >
                        View curriculum →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsListPage;
