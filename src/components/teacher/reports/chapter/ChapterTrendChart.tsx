import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendDataPoint } from '@/types/chapterReport';
import { InsightCard } from './InsightCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChapterTrendChartProps {
  trendData: TrendDataPoint[];
  trend: 'improving' | 'declining' | 'stable' | 'not_enough_data';
  defaultOpen?: boolean;
}

export function ChapterTrendChart({ trendData, trend, defaultOpen = true }: ChapterTrendChartProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  // Calculate trend details
  const firstAccuracy = trendData[0]?.accuracy || 0;
  const lastAccuracy = trendData[trendData.length - 1]?.accuracy || 0;
  const change = lastAccuracy - firstAccuracy;

  const getInsight = () => {
    if (trendData.length < 2) {
      return {
        type: 'info' as const,
        title: 'Not Enough Data Yet',
        message: 'We need at least 2 tests to show how the class is progressing over time. Keep testing to see the trend!'
      };
    }
    
    if (trend === 'improving') {
      return {
        type: 'success' as const,
        title: 'Great Progress!',
        message: `Class accuracy improved from ${firstAccuracy.toFixed(0)}% to ${lastAccuracy.toFixed(0)}% (+${change.toFixed(0)}%). Your teaching methods are working well!`
      };
    }
    
    if (trend === 'declining') {
      return {
        type: 'warning' as const,
        title: 'Attention Needed',
        message: `Class accuracy dropped from ${firstAccuracy.toFixed(0)}% to ${lastAccuracy.toFixed(0)}% (${change.toFixed(0)}%). Consider reviewing recent concepts and identifying where students are getting confused.`
      };
    }
    
    return {
      type: 'info' as const,
      title: 'Stable Performance',
      message: `Class accuracy has remained around ${lastAccuracy.toFixed(0)}% across tests. Performance is consistent but consider pushing for improvement.`
    };
  };

  const insight = getInsight();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-left">
                📈 Chapter Trend Over Time
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
          <p className="text-sm text-muted-foreground text-left">
            How has class understanding of this chapter changed across tests?
          </p>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {trendData.length >= 2 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="testName" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                      labelStyle={{ fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Strong (70%)', position: 'right', fontSize: 10 }} />
                    <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Moderate (40%)', position: 'right', fontSize: 10 }} />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  Need at least 2 tests to show trend chart
                </p>
              </div>
            )}
            
            <InsightCard type={insight.type} title={insight.title} message={insight.message} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
