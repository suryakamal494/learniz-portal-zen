
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BatchProgress } from '@/types/teachingProgress';

interface BatchProgressTableProps {
  batchProgress: BatchProgress[];
}

export function BatchProgressTable({ batchProgress }: BatchProgressTableProps) {
  // Group by class
  const groupedByClass = batchProgress.reduce((acc, batch) => {
    if (!acc[batch.className]) {
      acc[batch.className] = [];
    }
    acc[batch.className].push(batch);
    return acc;
  }, {} as Record<string, BatchProgress[]>);

  const [openClasses, setOpenClasses] = React.useState<Set<string>>(new Set(Object.keys(groupedByClass)));

  const toggleClass = (className: string) => {
    setOpenClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Batch-wise Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByClass).map(([className, batches]) => {
          const isOpen = openClasses.has(className);
          const totalClasses = batches.reduce((sum, b) => sum + b.plannedClasses, 0);
          const completedClasses = batches.reduce((sum, b) => sum + b.completedClasses, 0);
          const classCompletion = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

          return (
            <Collapsible key={className} open={isOpen} onOpenChange={() => toggleClass(className)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-medium text-foreground">{className}</span>
                    <Badge variant="secondary">{batches.length} batches</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {completedClasses}/{totalClasses} classes
                    </div>
                    <Badge 
                      variant="outline" 
                      className={classCompletion >= 80 ? 'text-green-600' : classCompletion >= 50 ? 'text-amber-600' : 'text-red-600'}
                    >
                      {classCompletion}%
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-8">
                  {batches.map(batch => (
                    <div 
                      key={batch.batchId} 
                      className="p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-foreground">{batch.batchName}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.plannedHours.toFixed(1)}h planned • {batch.completedHours.toFixed(1)}h done
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600 bg-green-500/10">
                            {batch.completedClasses} done
                          </Badge>
                          {batch.partialClasses > 0 && (
                            <Badge variant="outline" className="text-amber-600 bg-amber-500/10">
                              {batch.partialClasses} partial
                            </Badge>
                          )}
                          {batch.notTakenClasses > 0 && (
                            <Badge variant="outline" className="text-red-600 bg-red-500/10">
                              {batch.notTakenClasses} missed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={batch.completionPercentage} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium text-foreground w-12 text-right">
                          {batch.completionPercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
