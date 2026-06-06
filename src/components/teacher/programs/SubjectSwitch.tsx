import React from 'react';
import { ProgramSubject } from '@/types/program';
import { toneForPct } from '@/utils/programProgress';

interface SubjectOption extends ProgramSubject {
  completionPct: number;
}

interface Props {
  subjects: SubjectOption[];
  activeSubjectId: string;
  onChange: (id: string) => void;
}

/**
 * Labelled segmented subject switch. Only render when there are 2+ subjects;
 * call sites should guard. Each pill carries its own % so the teacher can
 * decide which subject to inspect before clicking.
 */
export function SubjectSwitch({ subjects, activeSubjectId, onChange }: Props) {
  if (subjects.length <= 1) return null;

  return (
    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl px-3 py-2.5 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide pl-1">
        Subject:
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {subjects.map((s) => {
          const isActive = s.id === activeSubjectId;
          const tone = toneForPct(s.completionPct);
          const pctTint = isActive
            ? 'bg-white/20 text-white'
            : tone === 'green'
            ? 'bg-emerald-100 text-emerald-700'
            : tone === 'amber'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-rose-100 text-rose-700';
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              aria-pressed={isActive}
              className={`group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              <span>{s.name}</span>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${pctTint}`}>
                {s.completionPct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
