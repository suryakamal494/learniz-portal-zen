import React from 'react';
import { CalendarClock } from 'lucide-react';

function todayHuman(d = new Date()): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function TodayAnchor() {
  return (
    <div className="flex items-center gap-3 py-1" aria-label="Today divider">
      <div className="flex-1 h-px bg-blue-200" />
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        <CalendarClock className="h-3.5 w-3.5" />
        Today · {todayHuman()}
      </span>
      <div className="flex-1 h-px bg-blue-200" />
    </div>
  );
}
