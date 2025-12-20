import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceStatus, TrendDirection } from '@/types/instituteAnalytics';
import {
  getPerformanceStatus,
  getPerformanceBarColor,
  getPerformanceBgColor,
  getTrendIcon,
  getTrendColor,
} from '@/utils/instituteAnalyticsUtils';

interface PerformanceBarCardProps {
  label: string;
  value: number;
  maxValue?: number;
  trend?: TrendDirection;
  showStatus?: boolean;
  subtitle?: string;
  className?: string;
}

export function PerformanceBarCard({
  label,
  value,
  maxValue = 100,
  trend,
  showStatus = true,
  subtitle,
  className,
}: PerformanceBarCardProps) {
  const status = getPerformanceStatus(value);
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{label}</span>
          {showStatus && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
              getPerformanceBgColor(status)
            )}>
              {status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{value.toFixed(1)}%</span>
          {trend && (
            <span className={cn('text-sm', getTrendColor(trend))}>
              {getTrendIcon(trend)}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            getPerformanceBarColor(status)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
