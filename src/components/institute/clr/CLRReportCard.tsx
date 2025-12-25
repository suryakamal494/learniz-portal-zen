import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CLRReport, CLRSignal } from '@/types/clrReport';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  BookOpen,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

interface CLRReportCardProps {
  report: CLRReport;
  onViewDetails: (report: CLRReport) => void;
}

const getSignalConfig = (signal: CLRSignal) => {
  switch (signal) {
    case 'healthy':
      return {
        label: 'Healthy',
        icon: CheckCircle2,
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        badgeBorder: 'border-green-200',
        cardBorder: 'border-l-green-500'
      };
    case 'needs-attention':
      return {
        label: 'Needs Attention',
        icon: AlertTriangle,
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-200',
        cardBorder: 'border-l-amber-500'
      };
    case 'immediate-review':
      return {
        label: 'Immediate Review',
        icon: AlertCircle,
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200',
        cardBorder: 'border-l-red-500'
      };
  }
};

const getTrendIcon = (isImproving: boolean, trend: number[]) => {
  if (trend.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
  
  const first = trend[0];
  const last = trend[trend.length - 1];
  
  if (last > first + 5) {
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  } else if (last < first - 5) {
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  }
  return <Minus className="h-4 w-4 text-amber-600" />;
};

const AccuracyTrendVisual: React.FC<{ trend: number[] }> = ({ trend }) => {
  const maxValue = Math.max(...trend, 100);
  
  return (
    <div className="flex items-end gap-1 h-8">
      {trend.map((value, index) => (
        <div
          key={index}
          className="flex-1 min-w-[8px] max-w-[16px] rounded-t transition-all"
          style={{
            height: `${(value / maxValue) * 100}%`,
            backgroundColor: value >= 60 
              ? 'hsl(142.1 76.2% 36.3%)' 
              : value >= 40 
                ? 'hsl(45.4 93.4% 47.5%)' 
                : 'hsl(0 84.2% 60.2%)'
          }}
          title={`Session ${index + 1}: ${value}%`}
        />
      ))}
    </div>
  );
};

const EngagementRing: React.FC<{ value: number }> = ({ value }) => {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 80) return 'stroke-green-500';
    if (value >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };
  
  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          className={getColor()}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold">{value}%</span>
      </div>
    </div>
  );
};

export const CLRReportCard: React.FC<CLRReportCardProps> = ({ report, onViewDetails }) => {
  const signalConfig = getSignalConfig(report.signal);
  const SignalIcon = signalConfig.icon;

  return (
    <Card className={`border-l-4 ${signalConfig.cardBorder} transition-shadow hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-primary/5">
                {report.className}
              </Badge>
              <Badge variant="outline">
                {report.batchName}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mt-2 line-clamp-1">
              {report.subject}: {report.chapter}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{report.teacher}</span>
            </div>
          </div>
          
          <Badge 
            className={`${signalConfig.badgeBg} ${signalConfig.badgeText} ${signalConfig.badgeBorder} border shrink-0`}
          >
            <SignalIcon className="h-3.5 w-3.5 mr-1" />
            {signalConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Accuracy Trend */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Accuracy Trend</span>
              {getTrendIcon(report.isAccuracyImproving, report.accuracyTrend)}
            </div>
            <AccuracyTrendVisual trend={report.accuracyTrend} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{report.accuracyTrend[0]}%</span>
              <span>{report.accuracyTrend[report.accuracyTrend.length - 1]}%</span>
            </div>
          </div>
          
          {/* Engagement */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Avg Engagement</span>
              <p className="text-sm font-medium">
                {report.avgEngagement >= 80 
                  ? 'Healthy' 
                  : report.avgEngagement >= 60 
                    ? 'Partial' 
                    : 'Low'}
              </p>
              <p className="text-xs text-muted-foreground">
                {report.sessionsCount} sessions
              </p>
            </div>
            <EngagementRing value={report.avgEngagement} />
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-primary"
          onClick={() => onViewDetails(report)}
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
