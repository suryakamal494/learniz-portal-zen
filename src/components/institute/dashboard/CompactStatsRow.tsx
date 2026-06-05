import React from 'react';
import { GraduationCap, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  iconBg: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconBg, iconColor }) => (
  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-sm">
    <div className={cn("p-2.5 rounded-lg", iconBg)}>
      <div className={iconColor}>{icon}</div>
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

interface CompactStatsRowProps {
  batches: number;
  students: number;
  exams: number;
}

export const CompactStatsRow: React.FC<CompactStatsRowProps> = ({ batches, students, exams }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard
        icon={<GraduationCap className="h-5 w-5" />}
        value={batches}
        label="Active Sections"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
      <StatCard
        icon={<Users className="h-5 w-5" />}
        value={students}
        label="Total Students"
        iconBg="bg-green-50"
        iconColor="text-green-600"
      />
      <StatCard
        icon={<FileText className="h-5 w-5" />}
        value={exams}
        label="Active Exams"
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />
    </div>
  );
};
