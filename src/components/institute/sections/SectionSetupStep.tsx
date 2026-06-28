import React, { useMemo } from 'react';
import { ArrowRight, CalendarDays, Check, Clock, Coffee, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/types/section';
import { WeekDay } from '@/types/instituteProgram';
import {
  setSectionName, setActiveWindow, setSectionConfig, setSectionFacultyPool,
} from '@/hooks/useSection';
import { useFaculty } from '@/hooks/useInstitutePrograms';
import { computeSectionCapacity } from '@/utils/sectionUtils';
import { cn } from '@/lib/utils';

const DOW: { d: WeekDay; label: string }[] = [
  { d: 1, label: 'M' }, { d: 2, label: 'T' }, { d: 3, label: 'W' },
  { d: 4, label: 'T' }, { d: 5, label: 'F' }, { d: 6, label: 'S' }, { d: 0, label: 'S' },
];

interface Props {
  section: Section;
  onNext: () => void;
}

export const SectionSetupStep: React.FC<Props> = ({ section, onNext }) => {
  const faculty = useFaculty();
  const win = section.windows[section.windows.length - 1];
  const cap = useMemo(() => computeSectionCapacity(section.config, win), [section.config, win]);

  const toggleDay = (d: WeekDay) => {
    const next = section.config.workingDays.includes(d)
      ? section.config.workingDays.filter((x) => x !== d)
      : [...section.config.workingDays, d].sort();
    setSectionConfig(section.id, { ...section.config, workingDays: next as WeekDay[] });
  };

  const toggleFaculty = (id: string) => {
    const pool = section.facultyPool.includes(id)
      ? section.facultyPool.filter((x) => x !== id)
      : [...section.facultyPool, id];
    setSectionFacultyPool(section.id, pool);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
      {/* ── FORM ─────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5 space-y-5">
          <Field label="Section name">
            <Input
              value={section.name}
              onChange={(e) => setSectionName(section.id, e.target.value)}
              className="text-base font-semibold"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Academic start">
              <Input
                type="date"
                value={win.startDate}
                onChange={(e) => setActiveWindow(section.id, e.target.value, win.endDate)}
              />
            </Field>
            <Field label="Academic end">
              <Input
                type="date"
                value={win.endDate}
                onChange={(e) => setActiveWindow(section.id, win.startDate, e.target.value)}
              />
            </Field>
          </div>

          <Field label="Working days" hint="Pick which weekdays run classes">
            <div className="flex gap-1.5">
              {DOW.map(({ d, label }) => {
                const on = section.config.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'h-10 w-10 rounded-lg text-sm font-semibold border-2 transition-all',
                      on
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Periods / day">
              <Input
                type="number"
                min={1}
                max={12}
                value={section.config.periodsPerDay}
                onChange={(e) => setSectionConfig(section.id, {
                  ...section.config,
                  periodsPerDay: Math.max(1, Number(e.target.value) || 1),
                })}
              />
            </Field>
            <Field label="Period length">
              <div className="relative">
                <Input
                  type="number"
                  min={15}
                  max={120}
                  value={section.config.periodLengthMins}
                  onChange={(e) => setSectionConfig(section.id, {
                    ...section.config,
                    periodLengthMins: Math.max(15, Number(e.target.value) || 50),
                  })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
              </div>
            </Field>
            <Field label="Day starts">
              <Input
                type="time"
                value={section.config.dayStartTime}
                onChange={(e) => setSectionConfig(section.id, {
                  ...section.config,
                  dayStartTime: e.target.value,
                })}
              />
            </Field>
          </div>

          <Field label="Faculty pool" hint={`${section.facultyPool.length} selected from ${faculty.length}`}>
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-2 rounded-lg bg-slate-50 border border-slate-200">
              {faculty.map((f) => {
                const on = section.facultyPool.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFaculty(f.id)}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-all',
                      on
                        ? 'bg-white border border-indigo-300 text-indigo-900 shadow-sm font-medium'
                        : 'border border-transparent text-slate-600 hover:bg-white',
                    )}
                  >
                    <span className={cn('h-4 w-4 rounded grid place-items-center text-[10px]', on ? 'bg-indigo-600 text-white' : 'bg-slate-300/40')}>
                      {on && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <Users className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{f.name.replace(/^(Ms\.|Mr\.|Dr\.|Mrs\.)\s+/i, '')}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-700 inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> Auto-saved
            </span>
            <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── CAPACITY PANEL ──────────────────────────────── */}
      <div className="space-y-3 xl:sticky xl:top-2 self-start">
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50/40 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold">Section capacity</div>
            <div className="grid grid-cols-2 gap-2">
              <Metric icon={<CalendarDays className="h-3.5 w-3.5 text-blue-600" />} label="Working days" value={cap.workingDays} />
              <Metric icon={<Clock className="h-3.5 w-3.5 text-indigo-600" />} label="Periods/day" value={section.config.periodsPerDay} />
            </div>
            <div className="rounded-xl bg-white border border-indigo-200 p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total budget</div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
                {cap.totalPeriods.toLocaleString()}<span className="text-base font-normal text-slate-500"> periods</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Shared across all programs in this section
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Programs in this section</div>
            <div className="space-y-1.5">
              {section.programs.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold">{p.code}</Badge>
                    <span className="text-slate-700">{p.name}</span>
                  </div>
                  <span className="text-slate-500">{p.subjects.length} subj</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
              <Coffee className="h-3 w-3" /> Breaks
            </div>
            <div className="space-y-1.5">
              {section.config.breaks.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{b.name}</span>
                  <span className="text-slate-500 tabular-nums">after P{b.afterPeriod} · {b.durationMins}m</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
    </div>
    {children}
  </div>
);

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
  <div className="rounded-lg bg-white border border-white/80 px-3 py-2">
    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
      {icon}<span>{label}</span>
    </div>
    <div className="text-xl font-bold tabular-nums text-slate-900 mt-0.5">{value}</div>
  </div>
);
