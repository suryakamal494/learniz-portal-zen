import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudentChapterPerformance } from '@/types/studentReport';
import { 
  BarChart3, 
  Brain,
  Zap,
  Lightbulb,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterAnalysisSummaryProps {
  chapter: StudentChapterPerformance;
}

export const ChapterAnalysisSummary: React.FC<ChapterAnalysisSummaryProps> = ({ chapter }) => {
  const { difficultyAnalysis, cognitiveAnalysis } = chapter;

  if (!difficultyAnalysis && !cognitiveAnalysis) {
    return null;
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getCognitiveIcon = (type: string) => {
    switch (type) {
      case 'memory': return <Brain className="h-3.5 w-3.5" />;
      case 'conceptual': return <Lightbulb className="h-3.5 w-3.5" />;
      case 'logical': return <Target className="h-3.5 w-3.5" />;
      case 'analytical': return <Zap className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {/* Difficulty Analysis */}
      {difficultyAnalysis && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
          <CardContent className="p-3">
            <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Difficulty Analysis
            </h5>
            <div className="space-y-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => {
                const data = difficultyAnalysis[level];
                return (
                  <div key={level} className="flex items-center gap-2">
                    <span className="text-xs w-14 flex items-center gap-1">
                      {getDifficultyIcon(level)}
                      <span className="capitalize">{level}</span>
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", getProgressColor(data.accuracy))}
                        style={{ width: `${data.accuracy}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-medium w-10 text-right", getAccuracyColor(data.accuracy))}>
                      {data.accuracy.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Quick insight */}
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-xs text-muted-foreground">
                {difficultyAnalysis.hard.accuracy < 40 
                  ? '⚠️ Needs practice on hard questions'
                  : difficultyAnalysis.hard.accuracy >= 60
                  ? '✨ Handling difficult questions well'
                  : '📈 Room for improvement on hard questions'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cognitive Analysis */}
      {cognitiveAnalysis && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50/50 border-violet-200">
          <CardContent className="p-3">
            <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Cognitive Skills
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {(['memory', 'conceptual', 'logical', 'analytical'] as const).map((type) => {
                const data = cognitiveAnalysis[type];
                return (
                  <div key={type} className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      {getCognitiveIcon(type)}
                      <span className="capitalize truncate">{type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", getProgressColor(data.accuracy))}
                          style={{ width: `${data.accuracy}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-medium", getAccuracyColor(data.accuracy))}>
                        {data.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Quick insight */}
            <div className="mt-2 pt-2 border-t border-violet-200">
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const types = Object.entries(cognitiveAnalysis);
                  const weakest = types.reduce((a, b) => a[1].accuracy < b[1].accuracy ? a : b);
                  const strongest = types.reduce((a, b) => a[1].accuracy > b[1].accuracy ? a : b);
                  return `💪 Best: ${strongest[0]} • 📚 Focus: ${weakest[0]}`;
                })()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
