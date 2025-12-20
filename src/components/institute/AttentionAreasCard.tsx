import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttentionArea } from '@/types/instituteAnalytics';
import { getAttentionPriorityColor, formatPercentage } from '@/utils/instituteAnalyticsUtils';

interface AttentionAreasCardProps {
  areas: AttentionArea[];
  onAreaClick?: (area: AttentionArea) => void;
  className?: string;
}

export function AttentionAreasCard({ areas, onAreaClick, className }: AttentionAreasCardProps) {
  if (areas.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Areas Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No critical areas identified. Keep up the good work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Areas Needing Attention
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These areas require immediate focus based on performance data
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {areas.map((area) => (
          <div
            key={`${area.type}-${area.id}`}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
              getAttentionPriorityColor(area.priority)
            )}
            onClick={() => onAreaClick?.(area)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">{area.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-background/50 capitalize">
                  {area.type}
                </span>
              </div>
              <p className="text-xs opacity-80">{area.reason}</p>
            </div>
            <div className="flex items-center gap-3 ml-3">
              <div className="text-right">
                <p className="font-bold text-sm">{formatPercentage(area.accuracy)}</p>
                <p className="text-xs opacity-70">{area.context}</p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
