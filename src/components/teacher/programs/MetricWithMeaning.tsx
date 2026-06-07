import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  /** The headline value (e.g. "36%", "6h 42m", "2 days"). */
  value: React.ReactNode;
  /** Small label shown under the value (e.g. "Syllabus completed"). */
  label: string;
  /** Concise sentence: what this number represents. */
  whatItMeans: string;
  /** Concise sentence: how it's computed. */
  howItsCalculated: string;
  /** Concise sentence: what the teacher should do next. */
  nextStep: string;
  /** Tailwind tint for the tile background, e.g. "bg-emerald-50 text-emerald-700". */
  tint?: string;
  className?: string;
}

/**
 * "Data WITH Understanding" metric tile. Hovering reveals
 * What it means → How it's calculated → What to do next.
 */
export function MetricWithMeaning({
  value,
  label,
  whatItMeans,
  howItsCalculated,
  nextStep,
  tint = 'bg-gray-50 text-gray-800',
  className = '',
}: Props) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`rounded-xl border border-gray-200 px-4 py-3 cursor-help transition-colors hover:border-gray-300 ${tint} ${className}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium opacity-80">{label}</p>
              <Info className="h-3.5 w-3.5 opacity-50 shrink-0" />
            </div>
            <p className="text-lg md:text-xl font-bold mt-1 leading-tight">{value}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-0 bg-white border border-gray-200 shadow-lg">
          <div className="p-3 space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">What it means</p>
              <p className="text-xs text-gray-700 mt-0.5">{whatItMeans}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">How it's calculated</p>
              <p className="text-xs text-gray-700 mt-0.5">{howItsCalculated}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">What to do next</p>
              <p className="text-xs text-gray-700 mt-0.5">{nextStep}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
