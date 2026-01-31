import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GrandTest {
  id: string;
  name: string;
  studentCount: number;
  accuracy: number;
  date: string;
}

interface RecentGrandTestsProps {
  tests: GrandTest[];
}

export const RecentGrandTests: React.FC<RecentGrandTestsProps> = ({ tests }) => {
  if (tests.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Grand Tests</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/institute/grand-tests" className="text-primary">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {tests.slice(0, 3).map((test) => (
          <Link
            key={test.id}
            to={`/institute/grand-tests/${test.id}`}
            className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium text-foreground">{test.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {test.studentCount} students
                </span>
                <span className="text-xs text-muted-foreground">{test.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                test.accuracy >= 70 
                  ? 'bg-green-50 text-green-700' 
                  : test.accuracy >= 50 
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
              }`}>
                {test.accuracy}%
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
