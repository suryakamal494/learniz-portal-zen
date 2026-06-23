import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Timer,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitutePrograms } from '@/hooks/useInstitutePrograms';
import { rollupProgram } from '@/utils/calendarAutomation';

const ProgramsListPage: React.FC = () => {
  const navigate = useNavigate();
  const programs = useInstitutePrograms();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  const classes = useMemo(() => Array.from(new Set(programs.map((p) => p.className))).sort(), [programs]);

  const filtered = programs.filter(
    (p) =>
      (classFilter === 'all' || p.className === classFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-medium text-blue-600 uppercase tracking-wider">
              <CalendarRange className="h-3.5 w-3.5" />
              Programs &amp; Calendar Automation
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Programs</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Capture teaching hours per topic, then generate the full academic calendar in one click — the same plan
              powers the teacher schedule and (later) student LMS access.
            </p>
          </div>
          <Button className="gap-2 shadow-sm" disabled title="Coming soon">
            <Plus className="h-4 w-4" /> New Program
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const periodMins = p.schedule?.periodLengthMins ?? 40;
              const roll = rollupProgram(p, periodMins);
              const ready = p.hoursFinalised;
              const scheduled = (p.generatedSlots?.length ?? 0) > 0;
              return (
                <Card
                  key={p.id}
                  className="group border-slate-200/70 shadow-sm hover:shadow-md hover:border-blue-300/60 transition-all duration-200 overflow-hidden"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{p.className}</span>
                          <span className="text-slate-300">•</span>
                          <span>Sections {p.sections.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Fee</div>
                        <div className="font-semibold text-slate-700">₹{p.fee.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Subjects strip */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.subjects.map((s) => (
                        <Badge key={s.id} variant="secondary" className="font-normal">
                          {s.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Progress strip */}
                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Topics</div>
                        <div className="text-base font-semibold text-slate-800">
                          {roll.topicsConfigured}<span className="text-slate-400">/{roll.totalTopics}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Hours</div>
                        <div className="text-base font-semibold text-slate-800">{roll.hours}h</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Periods</div>
                        <div className="text-base font-semibold text-slate-800">{roll.periods}</div>
                      </div>
                    </div>

                    {/* Status pills */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={
                          ready
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {ready ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {ready ? 'Hours finalised' : 'Hours pending'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          scheduled
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }
                      >
                        <Timer className="h-3 w-3 mr-1" />
                        {scheduled ? `${p.generatedSlots!.length} slots scheduled` : 'Not scheduled'}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-w-[7rem]"
                        onClick={() => navigate(`/institute/programs/${p.id}/hours`)}
                      >
                        Teaching Hours
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => navigate(`/institute/programs/${p.id}/preview`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 min-w-[7rem] gap-1"
                        disabled={!ready}
                        onClick={() => navigate(`/institute/programs/${p.id}/schedule`)}
                      >
                        Schedule <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
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
