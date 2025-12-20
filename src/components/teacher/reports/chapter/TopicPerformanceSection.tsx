import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopicPerformance } from '@/types/chapterReport';
import { PerformanceBar } from './PerformanceBar';
import { InsightCard } from './InsightCard';
import { generateTopicInsight } from '@/utils/chapterAnalyticsUtils';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface TopicPerformanceSectionProps {
  topics: TopicPerformance[];
  defaultOpen?: boolean;
}

export function TopicPerformanceSection({ topics, defaultOpen = true }: TopicPerformanceSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [expandedTopic, setExpandedTopic] = React.useState<string | null>(null);
  
  const insight = generateTopicInsight(topics);
  
  // Sort topics by accuracy (weakest first for attention)
  const sortedTopics = [...topics].sort((a, b) => a.metrics.accuracy - b.metrics.accuracy);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-left">
                📚 Topic-Wise Performance
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
          <p className="text-sm text-muted-foreground text-left">
            How well do students understand each topic within this chapter?
          </p>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Topic List */}
            <div className="space-y-4">
              {sortedTopics.map((topic) => (
                <div key={topic.topicId} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedTopic(expandedTopic === topic.topicId ? null : topic.topicId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <PerformanceBar
                        label={topic.topicName}
                        value={topic.metrics.accuracy}
                        category={topic.metrics.category}
                        trend={topic.metrics.trend}
                        skipPercentage={topic.metrics.skipPercentage}
                      />
                    </div>
                    <ChevronRight className={cn(
                      'h-5 w-5 ml-2 transition-transform',
                      expandedTopic === topic.topicId && 'rotate-90'
                    )} />
                  </button>
                  
                  {expandedTopic === topic.topicId && (
                    <div className="px-4 pb-4 space-y-3 border-t bg-muted/30">
                      <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-background rounded p-2 text-center">
                          <div className="font-bold text-green-600">{topic.metrics.correct}</div>
                          <div className="text-xs text-muted-foreground">Correct</div>
                        </div>
                        <div className="bg-background rounded p-2 text-center">
                          <div className="font-bold text-red-600">{topic.metrics.wrong}</div>
                          <div className="text-xs text-muted-foreground">Wrong</div>
                        </div>
                        <div className="bg-background rounded p-2 text-center">
                          <div className="font-bold text-amber-600">{topic.metrics.skipped}</div>
                          <div className="text-xs text-muted-foreground">Skipped</div>
                        </div>
                        <div className="bg-background rounded p-2 text-center">
                          <div className="font-bold">{topic.questionCount}</div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                      </div>
                      
                      {/* Trend Data */}
                      {topic.metrics.trendData.length > 1 && (
                        <div className="text-sm">
                          <div className="font-medium mb-1">Performance History:</div>
                          <div className="flex flex-wrap gap-2">
                            {topic.metrics.trendData.map((point, i) => (
                              <span key={i} className="bg-background px-2 py-1 rounded text-xs">
                                {point.testName}: {point.accuracy.toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <InsightCard type={insight.type} title={insight.title} message={insight.message} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
