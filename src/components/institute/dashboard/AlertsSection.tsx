import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLRReport } from '@/types/clrReport';

interface AlertsSectionProps {
  criticalReports: CLRReport[];
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ criticalReports }) => {
  if (criticalReports.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-foreground">All Systems Healthy</h2>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 text-sm">
            No classrooms require immediate attention. All learning metrics are within healthy ranges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Immediate Attention Required
          </h2>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {criticalReports.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/institute/learning-response" className="text-primary">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {criticalReports.slice(0, 3).map((report) => {
          const latestAccuracy = report.accuracyTrend[report.accuracyTrend.length - 1] || 0;
          
          return (
            <Link
              key={report.id}
              to="/institute/learning-response"
              className="block p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {report.chapter}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report.className} • {report.batchName} • {report.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {latestAccuracy}% accuracy
                    </span>
                  </div>
                  <span className="text-xs text-red-600">declining trend</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
