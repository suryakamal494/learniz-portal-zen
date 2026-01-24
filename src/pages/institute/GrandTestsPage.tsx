import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockGrandTests } from '@/data/mockGrandTests';
import { GrandTest } from '@/types/grandTest';
import { cn } from '@/lib/utils';

export default function GrandTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = mockGrandTests.filter(test => {
    return test.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Grand Tests
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-subject periodic assessments
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      <div className="space-y-3">
        {filteredTests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTests.map((test) => (
            <GrandTestCard key={test.id} test={test} />
          ))
        )}
      </div>
    </div>
  );
}

function GrandTestCard({ test }: { test: GrandTest }) {
  const getStatusStyles = () => {
    switch (test.status) {
      case 'completed':
        return {
          card: 'border-green-200 bg-gradient-to-r from-green-50/50 to-transparent',
          icon: 'bg-green-100 text-green-600',
          badge: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'scheduled':
        return {
          card: 'border-amber-200 bg-gradient-to-r from-amber-50/50 to-transparent',
          icon: 'bg-amber-100 text-amber-600',
          badge: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'in_progress':
        return {
          card: 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      default:
        return {
          card: 'border-gray-200',
          icon: 'bg-gray-100 text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card className={cn("hover:shadow-md transition-shadow border", styles.card)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2 rounded-lg shrink-0", styles.icon)}>
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{test.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {test.totalStudents} students
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {test.status !== 'completed' && (
              <Badge variant="outline" className={cn("text-xs capitalize", styles.badge)}>
                {test.status === 'scheduled' ? 'Scheduled' : 'In Progress'}
              </Badge>
            )}
            {test.status === 'completed' ? (
              <Link to={`/institute/grand-tests/${test.id}`}>
                <Button variant="default" size="sm" className="gap-1 shrink-0 bg-green-600 hover:bg-green-700">
                  View Results
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="shrink-0">
                {test.status === 'scheduled' ? 'Upcoming' : 'Live'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
