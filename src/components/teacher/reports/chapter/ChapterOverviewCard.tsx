import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChapterAnalytics } from '@/types/chapterReport';
import { InsightCard } from './InsightCard';
import { 
  generateChapterOverviewInsight, 
  getTrendIcon, 
  getTrendLabel,
  getTrendColor,
  getCategoryBadgeColor
} from '@/utils/chapterAnalyticsUtils';
import { TrendingUp, TrendingDown, Minus, Users, FileText, Calendar } from 'lucide-react';

interface ChapterOverviewCardProps {
  analytics: ChapterAnalytics;
}

export function ChapterOverviewCard({ analytics }: ChapterOverviewCardProps) {
  const { overallMetrics, totalQuestions, totalStudents, testsContributing, lastUpdated } = analytics;
  const insight = generateChapterOverviewInsight(overallMetrics, totalStudents);

  const TrendIcon = overallMetrics.trend === 'improving' ? TrendingUp : 
                    overallMetrics.trend === 'declining' ? TrendingDown : Minus;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Chapter Overview
          </CardTitle>
          <Badge className={getCategoryBadgeColor(overallMetrics.category)}>
            {overallMetrics.category.charAt(0).toUpperCase() + overallMetrics.category.slice(1)} Performance
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          How well is your class understanding this chapter overall?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Accuracy */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {overallMetrics.accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Class Accuracy</div>
          </div>
          
          {/* Engagement */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {overallMetrics.engagement.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Engagement</div>
          </div>
          
          {/* Skip Rate */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {overallMetrics.skipPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Skip Rate</div>
          </div>
          
          {/* Trend */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold flex items-center justify-center gap-1 ${getTrendColor(overallMetrics.trend)}`}>
              <TrendIcon className="h-6 w-6" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">{getTrendLabel(overallMetrics.trend)}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalStudents} students</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{totalQuestions} questions from {testsContributing} tests</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Insight */}
        <InsightCard 
          type={insight.type} 
          title={insight.title} 
          message={insight.message} 
        />
      </CardContent>
    </Card>
  );
}
