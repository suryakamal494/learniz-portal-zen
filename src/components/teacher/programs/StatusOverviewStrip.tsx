import React from 'react';
import { ListChecks } from 'lucide-react';
import { Program } from '@/types/program';
import { getStatusOverview, getStaleStatusInfo } from '@/utils/programSchedule';
import { MetricWithMeaning } from './MetricWithMeaning';

interface Props {
  program: Program;
}

function relativeDays(days: number | null): string {
  if (days === null) return 'Never';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function StatusOverviewStrip({ program }: Props) {
  const ov = getStatusOverview(program);
  const stale = getStaleStatusInfo(program);

  const behindTint =
    ov.periodsBehind > 0
      ? 'bg-rose-50 text-rose-900 border-rose-100'
      : 'bg-emerald-50 text-emerald-900 border-emerald-100';

  const updateTint = stale.isStale
    ? 'bg-amber-50 text-amber-900 border-amber-100'
    : 'bg-emerald-50 text-emerald-900 border-emerald-100';

  const periodsLabel = `${ov.periodsBehind} ${ov.periodsBehind === 1 ? 'period' : 'periods'}`;

  return (
    <div id="progress" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
          <ListChecks className="h-5 w-5 text-emerald-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Where you stand</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Hover any tile to see what the number means and what to do next.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricWithMeaning
          value={periodsLabel}
          label="Periods behind"
          tint={behindTint}
          whatItMeans={
            ov.periodsBehind === 0
              ? "You're on schedule — no overdue topics."
              : `You have ${periodsLabel} worth of topics that were scheduled to be done by today but aren't marked complete.`
          }
          howItsCalculated="Sum of planned hours for every topic whose planned end date has already passed and isn't marked done. 1 hour ≈ 1 class period."
          nextStep={
            ov.periodsBehind === 0
              ? 'Keep marking topics as you teach them to stay accurate.'
              : 'Open the chapters with red pills below and catch up on the overdue topics first.'
          }
        />

        <MetricWithMeaning
          value={relativeDays(stale.daysSinceLastUpdate)}
          label="Last status update"
          tint={updateTint}
          whatItMeans={
            stale.daysSinceLastUpdate === null
              ? "You haven't marked any topic yet."
              : `It's been ${stale.daysSinceLastUpdate} day${stale.daysSinceLastUpdate === 1 ? '' : 's'} since you last updated a topic's status.`
          }
          howItsCalculated="Based on the most recent topic you marked 'in progress' or 'done'."
          nextStep={
            stale.isStale
              ? "Mark today's topic so your periods-behind count stays accurate."
              : 'Keep marking topics as you teach them — your view stays accurate.'
          }
        />
      </div>
    </div>
  );
}
