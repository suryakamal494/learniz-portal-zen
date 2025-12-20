import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionTypePerformance } from '@/types/chapterReport';
import { PerformanceBar } from './PerformanceBar';
import { InsightCard } from './InsightCard';
import { generateQuestionTypeInsight } from '@/utils/chapterAnalyticsUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuestionTypeSectionProps {
  questionTypes: QuestionTypePerformance;
  defaultOpen?: boolean;
}

export function QuestionTypeSection({ questionTypes, defaultOpen = true }: QuestionTypeSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const insight = generateQuestionTypeInsight(questionTypes);

  const types = [
    { 
      key: 'memory', 
      label: '🧠 Memory (Recall)', 
      description: 'Remembering facts, definitions, formulas',
      data: questionTypes.memory 
    },
    { 
      key: 'conceptual', 
      label: '💡 Conceptual (Understanding)', 
      description: 'Understanding principles and concepts',
      data: questionTypes.conceptual 
    },
    { 
      key: 'logical', 
      label: '🔗 Logical (Reasoning)', 
      description: 'Applying logic and reasoning',
      data: questionTypes.logical 
    },
    { 
      key: 'analytical', 
      label: '🔬 Analytical (Problem-Solving)', 
      description: 'Breaking down complex problems',
      data: questionTypes.analytical 
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-left">
                🧩 Question Type Analysis
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
          <p className="text-sm text-muted-foreground text-left">
            What kind of thinking skills are students strong or weak in?
          </p>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Type Bars */}
            <div className="space-y-5">
              {types.map(({ key, label, description, data }) => (
                <div key={key} className="space-y-1">
                  <PerformanceBar
                    label={label}
                    value={data.accuracy}
                    category={data.category}
                    trend={data.trend}
                    skipPercentage={data.skipPercentage}
                  />
                  <p className="text-xs text-muted-foreground pl-1">{description}</p>
                </div>
              ))}
            </div>

            {/* Skill Radar Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Thinking Skills Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                {types.map(({ key, label, data }) => (
                  <div 
                    key={key} 
                    className={`p-3 rounded-lg border-2 ${
                      data.category === 'strong' ? 'border-green-200 bg-green-50' :
                      data.category === 'moderate' ? 'border-amber-200 bg-amber-50' : 
                      'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="text-sm font-medium">{label.split(' ')[0]} {label.split(' ')[1]}</div>
                    <div className={`text-lg font-bold ${
                      data.category === 'strong' ? 'text-green-700' :
                      data.category === 'moderate' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {data.accuracy.toFixed(0)}%
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
