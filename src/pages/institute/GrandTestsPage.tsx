import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Users, BookOpen, TrendingUp, ChevronRight, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockGrandTests } from '@/data/mockGrandTests';
import { GrandTest, TestType } from '@/types/grandTest';

const testTypeLabels: Record<TestType, string> = {
  'half-yearly': 'Half-Yearly',
  'annual': 'Annual',
  'term': 'Term',
  'quarterly': 'Quarterly'
};

const testTypeColors: Record<TestType, string> = {
  'half-yearly': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'annual': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'term': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'quarterly': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
};

const statusColors = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  scheduled: 'bg-muted text-muted-foreground'
};

function getPriorityLabel(accuracy: number): { label: string; className: string } {
  if (accuracy >= 70) return { label: 'Healthy', className: 'text-green-600 dark:text-green-400' };
  if (accuracy >= 40) return { label: 'Needs Attention', className: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Critical', className: 'text-red-600 dark:text-red-400' };
}

export default function GrandTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTests = mockGrandTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || test.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const completedTests = mockGrandTests.filter(t => t.status === 'completed');
  const avgAccuracy = completedTests.length > 0 
    ? completedTests.reduce((sum, t) => sum + t.overallAccuracy, 0) / completedTests.length 
    : 0;

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
            Multi-subject periodic assessments for long-term learning evaluation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGrandTests.length}</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedTests.reduce((sum, t) => sum + t.totalStudents, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTests.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="term">Term</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tests found matching your criteria</p>
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
  const priority = test.status === 'completed' ? getPriorityLabel(test.overallAccuracy) : null;
  const formattedDate = new Date(test.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={testTypeColors[test.type]}>
                {testTypeLabels[test.type]}
              </Badge>
              <Badge variant="secondary" className={statusColors[test.status]}>
                {test.status === 'in_progress' ? 'In Progress' : test.status.charAt(0).toUpperCase() + test.status.slice(1)}
              </Badge>
              {priority && (
                <span className={`text-xs font-medium ${priority.className}`}>
                  {priority.label}
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold">{test.name}</h3>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {test.totalStudents} students
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {test.totalQuestions} questions
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {test.subjects.map((subject, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-muted"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {test.status === 'completed' && (
              <div className="text-right">
                <p className="text-2xl font-bold">{test.overallAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Overall Accuracy</p>
              </div>
            )}
            
            {test.status === 'completed' ? (
              <Link to={`/institute/grand-tests/${test.id}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                {test.status === 'scheduled' ? 'Scheduled' : 'In Progress'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
