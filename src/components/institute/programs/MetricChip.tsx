import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MetricChipProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tooltip?: string;
  accent?: 'blue' | 'emerald' | 'violet' | 'amber' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

const ACCENT: Record<NonNullable<MetricChipProps['accent']>, { bg: string; text: string; border: string; dot: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-900',    border: 'border-blue-200/70',    dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200/70', dot: 'bg-emerald-500' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-900',  border: 'border-violet-200/70',  dot: 'bg-violet-500' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-900',   border: 'border-amber-200/70',   dot: 'bg-amber-500' },
  slate:   { bg: 'bg-slate-50',   text: 'text-slate-900',   border: 'border-slate-200',      dot: 'bg-slate-400' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-900',  border: 'border-indigo-200/70',  dot: 'bg-indigo-500' },
};

export const MetricChip: React.FC<MetricChipProps> = ({
  label,
  value,
  sub,
  tooltip,
  accent = 'slate',
  size = 'md',
  className,
}) => {
  const a = ACCENT[accent];
  const body = (
    <div
      className={cn(
        'rounded-xl border flex flex-col gap-0.5 transition-colors',
        a.bg,
        a.border,
        size === 'md' ? 'px-3 py-2.5' : 'px-2.5 py-1.5',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('h-1.5 w-1.5 rounded-full', a.dot)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {tooltip && (
          <HelpCircle className="h-3 w-3 text-slate-400 ml-0.5" aria-hidden />
        )}
      </div>
      <div className={cn('font-bold tabular-nums leading-tight', a.text, size === 'md' ? 'text-lg' : 'text-sm')}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-500 leading-tight">{sub}</div>}
    </div>
  );

  if (!tooltip) return body;
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-left focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-xl">
            {body}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricChip;
