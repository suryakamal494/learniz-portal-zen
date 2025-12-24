
import React from 'react';
import { Calendar, Clock, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleTrackingStats } from '@/types/teachingProgress';

interface ScheduleOverviewCardsProps {
  stats: ScheduleTrackingStats;
}

export function ScheduleOverviewCards({ stats }: ScheduleOverviewCardsProps) {
  const completionRate = stats.totalClasses > 0 
    ? Math.round((stats.completedClasses / stats.totalClasses) * 100) 
    : 0;

  const cards = [
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      subtitle: 'Scheduled',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Completed',
      value: stats.completedClasses,
      subtitle: `${completionRate}% completion`,
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Partially Done',
      value: stats.partialClasses,
      subtitle: 'Need follow-up',
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Not Taken',
      value: stats.notTakenClasses,
      subtitle: 'Missed classes',
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Total Hours',
      value: stats.totalScheduledHours.toFixed(1),
      subtitle: 'Scheduled',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Hours Completed',
      value: stats.completedHours.toFixed(1),
      subtitle: `${stats.missedHours.toFixed(1)}h missed`,
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
