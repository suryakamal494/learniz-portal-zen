import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock, Layers, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSection } from '@/hooks/useSection';
import { useInstituteHolidays } from '@/hooks/useInstitutePrograms';
import { SectionSetupStep } from '@/components/institute/sections/SectionSetupStep';
import { SectionAllocationStep } from '@/components/institute/sections/SectionAllocationStep';
import { SectionTimetableStep } from '@/components/institute/sections/SectionTimetableStep';
import { SectionPreviewStep } from '@/components/institute/sections/SectionPreviewStep';
import { computeSectionCapacity, formatRange, totalAllocated } from '@/utils/sectionUtils';
import { cn } from '@/lib/utils';

type Step = 'setup' | 'allocation' | 'timetable' | 'preview';

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'setup',      label: 'Setup',             icon: CalendarDays },
  { id: 'allocation', label: 'Period Allocation', icon: Layers },
  { id: 'timetable',  label: 'Weekly Timetable',  icon: Clock },
  { id: 'preview',    label: 'Preview',           icon: Sparkles },
];

const SectionSchedulePage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = useSection(sectionId);
  const instituteHolidays = useInstituteHolidays();
  const [step, setStep] = useState<Step>('setup');

  const cap = useMemo(() => {
    if (!section) return null;
    return computeSectionCapacity(section.config, section.windows[section.windows.length - 1], instituteHolidays);
  }, [section, instituteHolidays]);

  if (!section) {
    return (
      <div className="p-10 text-center text-slate-500">
        Section not found.{' '}
        <Link to="/institute/programs" className="text-indigo-600 underline">Back</Link>
      </div>
    );
  }

  const allocated = totalAllocated(section);
  const pct = cap && cap.totalPeriods > 0 ? Math.min(100, Math.round((allocated / cap.totalPeriods) * 100)) : 0;
  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const win = section.windows[section.windows.length - 1];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Programs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium truncate">{section.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Schedule</span>
        </div>

        {/* Header chrome — section title + sticky stepper + budget */}
        <Card className="border-slate-200 shadow-sm overflow-hidden sticky top-0 z-30">
          <div className="px-4 md:px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">{section.className}</div>
                <div className="text-base md:text-lg font-bold truncate">{section.name}</div>
              </div>
              <Badge className="bg-white/15 hover:bg-white/15 text-white text-[11px] tabular-nums">
                {formatRange(win)}
              </Badge>
            </div>
          </div>

          {/* Stepper */}
          <CardContent className="p-2.5 bg-white">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = s.id === step;
                const done = i < stepIdx;
                return (
                  <React.Fragment key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : done
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-slate-500 hover:bg-slate-100',
                      )}
                    >
                      <span
                        className={cn(
                          'h-5 w-5 rounded-full grid place-items-center text-[10px]',
                          active ? 'bg-white/20' : done ? 'bg-emerald-100' : 'bg-slate-100',
                        )}
                      >
                        {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </span>
                      <Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </button>
                    {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200 min-w-[0.5rem]" />}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>

          {/* Budget strip — visible from step 2 onward */}
          {step !== 'setup' && cap && (
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50/60 to-blue-50/40 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <Metric label="Budget" value={cap.totalPeriods} />
                <span className="text-slate-300">·</span>
                <Metric label="Allocated" value={allocated} />
                <span className="text-slate-300">·</span>
                <Metric
                  label={allocated > cap.totalPeriods ? 'Over' : 'Remaining'}
                  value={Math.abs(cap.totalPeriods - allocated)}
                  tone={allocated > cap.totalPeriods ? 'rose' : allocated === cap.totalPeriods ? 'emerald' : 'amber'}
                />
                <div className="flex-1 min-w-[120px] h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={cn(
                      'h-full transition-all',
                      allocated > cap.totalPeriods ? 'bg-rose-500' :
                      allocated === cap.totalPeriods ? 'bg-emerald-500' :
                      'bg-gradient-to-r from-indigo-500 to-blue-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 tabular-nums">{pct}%</span>
              </div>
            </div>
          )}
        </Card>

        {/* Step body */}
        <div>
          {step === 'setup' && <SectionSetupStep section={section} onNext={() => setStep('allocation')} />}
          {step === 'allocation' && (
            <SectionAllocationStep section={section} onBack={() => setStep('setup')} onNext={() => setStep('timetable')} />
          )}
          {step === 'timetable' && (
            <SectionTimetableStep section={section} onBack={() => setStep('allocation')} onNext={() => setStep('preview')} />
          )}
          {step === 'preview' && (
            <SectionPreviewStep section={section} onBack={() => setStep('timetable')} />
          )}
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: number; tone?: 'rose' | 'emerald' | 'amber' }> = ({ label, value, tone }) => (
  <div className="inline-flex items-baseline gap-1.5">
    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
    <span className={cn(
      'text-sm font-bold tabular-nums',
      tone === 'rose' && 'text-rose-700',
      tone === 'emerald' && 'text-emerald-700',
      tone === 'amber' && 'text-amber-700',
      !tone && 'text-slate-900',
    )}>{value.toLocaleString()}</span>
  </div>
);

export default SectionSchedulePage;
