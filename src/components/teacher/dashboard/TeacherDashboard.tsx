
import { TeacherDashboardHeader } from "./TeacherDashboardHeader"
import { ModernTeacherStats } from "./ModernTeacherStats"
import { ModernQuickActions } from "./ModernQuickActions"
import { ModernUpcomingClasses } from "./ModernUpcomingClasses"
import { ModernBatchReports } from "./ModernBatchReports"
import { ModernAttendanceToday } from "./ModernAttendanceToday"
import { RecentActivity } from "./RecentActivity"

export function TeacherDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <TeacherDashboardHeader />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Optimized Top Section - Quick Actions and Stats in a more compact layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-up stagger-1">
            {/* Quick Actions - Compact Version */}
            <div className="xl:col-span-2">
              <ModernQuickActions />
            </div>
            
            {/* Stats - More compact grid */}
            <div className="xl:col-span-1">
              <div className="grid grid-cols-2 gap-3">
                <ModernTeacherStats />
              </div>
            </div>
          </div>
          
          {/* Today's Schedule */}
          <div className="animate-slide-up stagger-2">
            <ModernUpcomingClasses />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Section Reports */}
              <div className="animate-slide-up stagger-3">
                <ModernBatchReports />
              </div>
              
              {/* Today's Attendance */}
              <div className="animate-slide-up stagger-4">
                <ModernAttendanceToday />
              </div>
            </div>
            
            <div className="xl:col-span-1 animate-slide-up stagger-5">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
