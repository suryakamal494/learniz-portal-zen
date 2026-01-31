import React from 'react';
import { DashboardHeader } from '@/components/institute/dashboard/DashboardHeader';
import { CompactStatsRow } from '@/components/institute/dashboard/CompactStatsRow';
import { QuickActionsGrid } from '@/components/institute/dashboard/QuickActionsGrid';
import { AlertsSection } from '@/components/institute/dashboard/AlertsSection';
import { RecentGrandTests } from '@/components/institute/dashboard/RecentGrandTests';
import { mockCLRReports, getReportsBySignal } from '@/data/mockCLRData';
import { mockGrandTests } from '@/data/mockGrandTests';

const InstituteDashboardPage: React.FC = () => {
  // Get critical CLR reports (immediate review required)
  const criticalReports = getReportsBySignal(mockCLRReports, 'immediate-review');
  
  // Get recent grand tests - transform to dashboard format using correct property names
  const recentTests = mockGrandTests
    .filter(test => test.status === 'completed')
    .slice(0, 3)
    .map(test => ({
      id: test.id,
      name: test.name,
      studentCount: test.totalStudents,
      accuracy: test.overallAccuracy,
      date: test.date,
    }));

  // Mock stats - in production these would come from API
  const stats = {
    batches: 26,
    students: 1069,
    exams: 126,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader />
      
      <CompactStatsRow 
        batches={stats.batches}
        students={stats.students}
        exams={stats.exams}
      />
      
      <QuickActionsGrid />
      
      <AlertsSection criticalReports={criticalReports} />
      
      <RecentGrandTests tests={recentTests} />
    </div>
  );
};

export default InstituteDashboardPage;
