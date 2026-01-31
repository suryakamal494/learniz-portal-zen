import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Activity, Clock, Users, GraduationCap, BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  route: string;
  bgColor: string;
  iconColor: string;
}

const quickActions: QuickAction[] = [
  {
    icon: Calendar,
    title: 'Academic Schedule',
    subtitle: 'Manage class timings',
    route: '/institute/schedule-tracking',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Activity,
    title: 'Learning Response',
    subtitle: 'Monitor engagement',
    route: '/institute/learning-response',
    bgColor: 'bg-green-50 hover:bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Clock,
    title: 'Schedule Tracking',
    subtitle: 'Track progress',
    route: '/institute/schedule-tracking',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Users,
    title: 'Students',
    subtitle: 'View student reports',
    route: '/institute/students',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: GraduationCap,
    title: 'Teachers',
    subtitle: 'Teacher performance',
    route: '/institute/teachers',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    icon: BookOpen,
    title: 'Classes',
    subtitle: 'Class overview',
    route: '/institute/classes',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
];

export const QuickActionsGrid: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Quick Actions & Intelligence</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.route}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border border-border/50",
              "transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
              action.bgColor
            )}
          >
            <div className={cn("p-3 rounded-xl mb-3", "bg-white/60")}>
              <action.icon className={cn("h-6 w-6", action.iconColor)} />
            </div>
            <p className="text-sm font-medium text-foreground text-center">{action.title}</p>
            <p className="text-xs text-muted-foreground text-center mt-0.5">{action.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
