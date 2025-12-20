import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { TrendDirection } from '@/types/instituteAnalytics';
import { getTrendBgColor, getTrendLabel } from '@/utils/instituteAnalyticsUtils';

interface TrendBadgeProps {
  trend: TrendDirection;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  not_enough_data: HelpCircle,
};

export function TrendBadge({ trend, showLabel = true, size = 'md', className }: TrendBadgeProps) {
  const Icon = trendIcons[trend];
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      sizeClasses[size],
      getTrendBgColor(trend),
      className
    )}>
      <Icon className={iconSize[size]} />
      {showLabel && getTrendLabel(trend)}
    </span>
  );
}
