import React from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle, AlertTriangle, Target } from 'lucide-react';

interface InsightCardProps {
  type: 'info' | 'success' | 'warning' | 'action';
  title: string;
  message: string;
  className?: string;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  action: Target,
};

const styleMap = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  action: 'bg-purple-50 border-purple-200 text-purple-800',
};

const iconColorMap = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  action: 'text-purple-500',
};

export function InsightCard({ type, title, message, className }: InsightCardProps) {
  const Icon = iconMap[type];

  return (
    <div className={cn(
      'rounded-lg border p-4 flex gap-3',
      styleMap[type],
      className
    )}>
      <div className={cn('flex-shrink-0 mt-0.5', iconColorMap[type])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
