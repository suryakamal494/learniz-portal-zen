import React from 'react';
import { CalendarDays, Clock, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CapacityStripProps {
  workingDays: number;
  periodsAvailable: number;
  allocated?: number;
  /** When provided, shows the remaining counter with a progress bar. */
  showRemaining?: boolean;
  /** Compact one-row variant (used in Step 1 preview). */
  compact?: boolean;
  className?: string;
}

/** Top-of-page banner that surfaces "how many class slots Setup gave us"
 *  and (in Step 2) how many of those are still to be allocated. */
export const CapacityStrip: React.FC<CapacityStripProps> = ({
  workingDays,
  periodsAvailable,
  allocated = 0,
  showRemaining = false,
  compact = false,
  className,
}) => {
  const remaining = Math.max(0, periodsAvailable - allocated);
  const overBy = Math.max(0, allocated - periodsAvailable);
  const pct = periodsAvailable === 0 ? 0 : Math.min(100, Math.round((allocated / periodsAvailable) * 100));
  const isComplete = showRemaining && allocated === periodsAvailable && periodsAvailable > 0;
  const isOver = overBy > 0;

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white/80 backdrop-blur px-3 py-2 text-xs',
          className,
        )}
      >
        <div className="inline-flex items-center gap-1.5 text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-semibold tabular-nums">{workingDays}</span>
          <span className="text-slate-500">working days</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="inline-flex items-center gap-1.5 text-slate-700">
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          <span className="font-semibold tabular-nums">{periodsAvailable.toLocaleString()}</span>
          <span className="text-slate-500">periods available</span>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'border shadow-sm sticky top-2 z-20',
        isOver
          ? 'border-rose-300 bg-gradient-to-br from-rose-50 via-white to-white'
          : isComplete
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-white'
            : 'border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50/30',
        className,
      )}
    >
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Cell
            icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
            label="Working days"
            value={workingDays.toLocaleString()}
          />
          <Cell
            icon={<Clock className="h-4 w-4 text-indigo-600" />}
            label="Periods available"
            value={periodsAvailable.toLocaleString()}
          />
          {showRemaining && (
            <>
              <Cell
                icon={<Layers className="h-4 w-4 text-slate-600" />}
                label="Allocated"
                value={`${allocated.toLocaleString()} / ${periodsAvailable.toLocaleString()}`}
              />
              <Cell
                icon={
                  isOver ? (
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  ) : isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Layers className="h-4 w-4 text-amber-600" />
                  )
                }
                label={isOver ? 'Over budget' : 'Remaining'}
                value={(isOver ? overBy : remaining).toLocaleString()}
                tone={isOver ? 'rose' : isComplete ? 'emerald' : 'amber'}
              />
            </>
          )}
        </div>

        {showRemaining && (
          <div className="space-y-1">
            <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isOver
                    ? 'bg-rose-500'
                    : isComplete
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-blue-500',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 tabular-nums">{pct}% allocated</span>
              {isComplete ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> All periods allotted — ready for the timetable
                </span>
              ) : isOver ? (
                <span className="text-rose-700 font-semibold">
                  {overBy.toLocaleString()} periods over the budget — reduce allocations
                </span>
              ) : (
                <span className="text-slate-500">
                  {remaining.toLocaleString()} more period{remaining === 1 ? '' : 's'} to assign
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Cell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'rose' | 'emerald' | 'amber';
}> = ({ icon, label, value, tone }) => (
  <div className="rounded-lg bg-white/70 border border-white/80 px-3 py-2 min-w-0">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    <div
      className={cn(
        'text-lg sm:text-xl font-bold tabular-nums mt-0.5',
        tone === 'rose' && 'text-rose-700',
        tone === 'emerald' && 'text-emerald-700',
        tone === 'amber' && 'text-amber-700',
        !tone && 'text-slate-900',
      )}
    >
      {value}
    </div>
  </div>
);
