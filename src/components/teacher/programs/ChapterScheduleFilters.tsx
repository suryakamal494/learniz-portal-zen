import React from 'react';
import { Filter } from 'lucide-react';

export type ChapterFilter = 'all' | 'behind' | 'in-progress' | 'upcoming' | 'done';

interface Props {
  value: ChapterFilter;
  onChange: (next: ChapterFilter) => void;
  counts: Record<ChapterFilter, number>;
}

const OPTIONS: Array<{ key: ChapterFilter; label: string; tint: string; active: string }> = [
  { key: 'all', label: 'All', tint: 'bg-gray-100 text-gray-700 hover:bg-gray-200', active: 'bg-gray-900 text-white hover:bg-gray-900' },
  { key: 'behind', label: 'Behind', tint: 'bg-rose-50 text-rose-700 hover:bg-rose-100', active: 'bg-rose-600 text-white hover:bg-rose-600' },
  { key: 'in-progress', label: 'In progress', tint: 'bg-amber-50 text-amber-700 hover:bg-amber-100', active: 'bg-amber-600 text-white hover:bg-amber-600' },
  { key: 'upcoming', label: 'Upcoming', tint: 'bg-blue-50 text-blue-700 hover:bg-blue-100', active: 'bg-blue-600 text-white hover:bg-blue-600' },
  { key: 'done', label: 'Done', tint: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'bg-emerald-600 text-white hover:bg-emerald-600' },
];

export function ChapterScheduleFilters({ value, onChange, counts }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <Filter className="h-3.5 w-3.5" />
        Filter
      </span>
      {OPTIONS.map((o) => {
        const active = value === o.key;
        const count = counts[o.key];
        const disabled = !active && count === 0;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            disabled={disabled}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              active ? o.active : o.tint
            }`}
          >
            {o.label}
            <span className={`ml-1.5 text-[10px] font-semibold ${active ? 'opacity-90' : 'opacity-70'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
