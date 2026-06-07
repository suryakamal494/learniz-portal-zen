import React from 'react';
import { ListChecks } from 'lucide-react';
import { Program } from '@/types/program';
import { getStatusOverview, getStaleStatusInfo, explainPct } from '@/utils/programSchedule';
import { MetricWithMeaning } from './MetricWithMeaning';

interface Props {
  program: Program;
}

function formatHrs(h: number): string {
  if (h <= 0) return '0h';
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (whole === 0) return `${m}m`;
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
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

  const completedTint =
    ov.completionPct >= 70
      ? 'bg-emerald-50 text-emerald-900 border-emerald-100'
      : ov.completionPct >= 40
      ? 'bg-amber-50 text-amber-900 border-amber-100'
      : 'bg-rose-50 text-rose-900 border-rose-100';

  const behindTint =
    ov.chaptersBehind > 0 ? 'bg-rose-50 text-rose-900 border-rose-100' : 'bg-gray-50 text-gray-800 border-gray-100';

  const updateTint =
    stale.isStale ? 'bg-amber-50 text-amber-900 border-amber-100' : 'bg-emerald-50 text-emerald-900 border-emerald-100';

  return (
    <div id="progress" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
          <ListChecks className="h-5 w-5 text-emerald-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Where you stand</h2>
          <p className="text-xs text-gray-500 mt-0.5">Hover any tile to see what the number means and what to do next.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricWithMeaning
          value={`${ov.completionPct}%`}
          label="Syllabus completed"
          tint={completedTint}
          whatItMeans={`You've taught roughly ${ov.completionPct}% of the assigned syllabus for this section.`}
          howItsCalculated={explainPct(ov.spentHrs, ov.plannedHrs)}
          nextStep={
            ov.completionPct >= 70
              ? 'Keep your current pace and start planning revision sessions.'
              : ov.completionPct >= 40
              ? 'Pick up the pace this week to stay on schedule.'
              : 'Prioritise the next few sessions to catch up.'
          }
        />

        <MetricWithMeaning
          value={ov.chaptersInProgress}
          label="Chapters in progress"
          whatItMeans="Chapters with at least one topic you've started but not finished."
          howItsCalculated="Counted by scanning every chapter for topics marked 'in progress'."
          nextStep={
            ov.chaptersInProgress === 0
              ? 'Start the next chapter in your schedule when you finish today\'s focus.'
              : 'Finish open topics before opening new chapters to avoid fragmentation.'
          }
        />

        <MetricWithMeaning
          value={ov.chaptersBehind}
          label="Behind schedule"
          tint={behindTint}
          whatItMeans={
            ov.chaptersBehind === 0
              ? 'No chapters are running past their planned end date.'
              : `${ov.chaptersBehind} chapter${ov.chaptersBehind === 1 ? '' : 's'} ${ov.chaptersBehind === 1 ? 'is' : 'are'} past the date the institute scheduled.`
          }
          howItsCalculated="A chapter is 'behind' if today is past the planned end date of its earliest unfinished topic."
          nextStep={
            ov.chaptersBehind === 0
              ? 'You\'re on track — keep marking topics as you teach them.'
              : 'Review the chapters list below — red pills show which ones to catch up on first.'
          }
        />

        <MetricWithMeaning
          value={relativeDays(stale.daysSinceLastUpdate)}
          label="Last status update"
          tint={updateTint}
          whatItMeans={
            stale.daysSinceLastUpdate === null
              ? 'You haven\'t marked any topic yet.'
              : `It's been ${stale.daysSinceLastUpdate} day${stale.daysSinceLastUpdate === 1 ? '' : 's'} since you last updated a topic's status.`
          }
          howItsCalculated="Based on the most recent topic you marked 'in progress' or 'done'."
          nextStep={
            stale.isStale
              ? 'Mark today\'s topic so your schedule and behind-schedule counts stay accurate.'
              : 'Keep marking topics as you teach them — your view stays accurate.'
          }
        />
      </div>

      <p className="mt-3 text-[11px] text-gray-500">
        Total: {formatHrs(ov.spentHrs)} taught of {formatHrs(ov.plannedHrs)} planned.
      </p>
    </div>
  );
}
