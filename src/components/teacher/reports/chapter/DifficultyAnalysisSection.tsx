import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyPerformance } from '@/types/chapterReport';
import { PerformanceBar } from './PerformanceBar';
import { InsightCard } from './InsightCard';
import { generateDifficultyInsight } from '@/utils/chapterAnalyticsUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DifficultyAnalysisSectionProps {
  difficulty: DifficultyPerformance;
  defaultOpen?: boolean;
}

export function DifficultyAnalysisSection({ difficulty, defaultOpen = true }: DifficultyAnalysisSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const insight = generateDifficultyInsight(difficulty);

  const difficultyLevels = [
    { key: 'easy', label: '🟢 Easy Questions', data: difficulty.easy },
    { key: 'medium', label: '🟡 Medium Questions', data: difficulty.medium },
    { key: 'hard', label: '🔴 Hard Questions', data: difficulty.hard },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-left">
                🎯 Difficulty Level Analysis
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
          <p className="text-sm text-muted-foreground text-left">
            How does class performance change with question difficulty?
          </p>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Difficulty Bars */}
            <div className="space-y-5">
              {difficultyLevels.map(({ key, label, data }) => (
                <div key={key} className="space-y-2">
                  <PerformanceBar
                    label={label}
                    value={data.accuracy}
                    category={data.category}
                    trend={data.trend}
                    skipPercentage={data.skipPercentage}
                  />
                </div>
              ))}
            </div>

            {/* Visual Comparison */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Quick Comparison</h4>
              <div className="flex items-end gap-4 h-32">
                {difficultyLevels.map(({ key, label, data }) => (
                  <div key={key} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        data.category === 'strong' ? 'bg-green-500' :
                        data.category === 'moderate' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${data.accuracy}%` }}
                    />
                    <div className="mt-2 text-center">
                      <div className="font-bold text-sm">{data.accuracy.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">{key}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <InsightCard type={insight.type} title={insight.title} message={insight.message} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
