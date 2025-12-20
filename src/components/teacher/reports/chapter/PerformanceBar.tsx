import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { PerformanceCategory, TrendDirection } from '@/types/chapterReport';

interface PerformanceBarProps {
  label: string;
  value: number;
  category: PerformanceCategory;
  trend?: TrendDirection;
  showTrend?: boolean;
  skipPercentage?: number;
  className?: string;
}

const categoryColors = {
  strong: 'bg-green-500',
  moderate: 'bg-amber-500',
  weak: 'bg-red-500',
};

const categoryBgColors = {
  strong: 'bg-green-100',
  moderate: 'bg-amber-100',
  weak: 'bg-red-100',
};

const categoryTextColors = {
  strong: 'text-green-700',
  moderate: 'text-amber-700',
  weak: 'text-red-700',
};

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  not_enough_data: HelpCircle,
};

const trendColors = {
  improving: 'text-green-600',
  declining: 'text-red-600',
  stable: 'text-blue-600',
  not_enough_data: 'text-muted-foreground',
};

export function PerformanceBar({ 
  label, 
  value, 
  category, 
  trend, 
  showTrend = true,
  skipPercentage,
  className 
}: PerformanceBarProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{label}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
            categoryBgColors[category],
            categoryTextColors[category]
          )}>
            {category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{value.toFixed(1)}%</span>
          {showTrend && TrendIcon && (
            <TrendIcon className={cn('h-4 w-4', trendColors[trend!])} />
          )}
        </div>
      </div>
      
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            categoryColors[category]
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      
      {skipPercentage !== undefined && skipPercentage > 0 && (
        <p className="text-xs text-muted-foreground">
          Skip rate: {skipPercentage.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
