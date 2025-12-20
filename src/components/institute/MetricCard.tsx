import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, HelpCircle, LucideIcon } from 'lucide-react';
import { TrendDirection, PerformanceStatus } from '@/types/instituteAnalytics';
import { 
  getPerformanceStatus, 
  getPerformanceBgColor, 
  getTrendColor,
  getTrendLabel 
} from '@/utils/instituteAnalyticsUtils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendDirection;
  icon?: LucideIcon;
  iconColor?: string;
  showPerformanceStatus?: boolean;
  accuracy?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  not_enough_data: HelpCircle,
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-primary',
  showPerformanceStatus = false,
  accuracy,
  className,
  size = 'md',
}: MetricCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;
  const status = accuracy !== undefined ? getPerformanceStatus(accuracy) : undefined;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn(
      'bg-card rounded-lg border shadow-sm',
      sizeClasses[size],
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
      </div>
      
      <div className="flex items-end gap-2">
        <span className={cn('font-bold', valueSizeClasses[size])}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        
        {trend && TrendIcon && (
          <div className={cn('flex items-center gap-1 mb-1', getTrendColor(trend))}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{getTrendLabel(trend)}</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      
      {showPerformanceStatus && status && (
        <span className={cn(
          'inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
          getPerformanceBgColor(status)
        )}>
          {status}
        </span>
      )}
    </div>
  );
}
