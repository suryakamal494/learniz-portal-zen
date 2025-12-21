import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, Users, BookOpen, TrendingUp, 
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getGrandTestById } from '@/data/mockGrandTests';
import { GrandTestSubject, GrandTestChapter, GrandTestStudent, PriorityLevel } from '@/types/grandTest';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const priorityConfig: Record<PriorityLevel, { label: string; className: string; bgClass: string; icon: React.ReactNode }> = {
  healthy: { 
    label: 'Healthy', 
    className: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />
  },
  needs_attention: { 
    label: 'Needs Attention', 
    className: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
  },
  critical: { 
    label: 'Critical', 
    className: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="h-4 w-4 text-red-500" />
  }
};

const bandConfig = {
  high: { label: 'High Performer', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  at_risk: { label: 'At Risk', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};

export default function GrandTestDetailPage() {
  const { testId } = useParams();
  const test = getGrandTestById(testId || '');

  if (!test) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/institute/grand-tests" className="flex items-center gap-2 text-primary mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Grand Tests
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
            <p className="text-muted-foreground">
              The requested grand test could not be found or has not been completed yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = new Date(test.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pieData = [
    { name: 'Correct', value: test.correct, color: '#10B981' },
    { name: 'Wrong', value: test.wrong, color: '#EF4444' },
    { name: 'Skipped', value: test.skipped, color: '#94A3B8' }
  ];

  const subjectChartData = test.subjectPerformance.map(s => ({
    name: s.name,
    accuracy: s.accuracy,
    engagement: s.engagement
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link to="/institute/grand-tests" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Grand Tests
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{test.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
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
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Accuracy */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-4xl font-bold text-primary">{test.overallAccuracy.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall Accuracy</p>
              <p className="text-xs mt-2">
                <span className={priorityConfig[test.overallAccuracy >= 70 ? 'healthy' : test.overallAccuracy >= 40 ? 'needs_attention' : 'critical'].className}>
                  {priorityConfig[test.overallAccuracy >= 70 ? 'healthy' : test.overallAccuracy >= 40 ? 'needs_attention' : 'critical'].label}
                </span>
              </p>
            </div>

            {/* Engagement */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-4xl font-bold">{test.overallEngagement.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Engagement Rate</p>
              <p className="text-xs text-muted-foreground mt-2">Questions attempted</p>
            </div>

            {/* Pie Chart */}
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Correct</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Wrong</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Skipped</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" />
                <Bar dataKey="engagement" fill="#10B981" name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed analysis */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
          <TabsTrigger value="chapters">Chapter Breakdown</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
        </TabsList>

        {/* Subject Analysis Tab */}
        <TabsContent value="subjects" className="space-y-4">
          {test.subjectPerformance.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </TabsContent>

        {/* Chapter Breakdown Tab */}
        <TabsContent value="chapters" className="space-y-4">
          {test.subjectPerformance.map((subject) => (
            <SubjectChaptersCard key={subject.id} subject={subject} />
          ))}
        </TabsContent>

        {/* Student Performance Tab */}
        <TabsContent value="students">
          <StudentPerformanceSection students={test.studentPerformance} />
        </TabsContent>
      </Tabs>

      {/* Action Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Academic Action Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Signals */}
          <div>
            <h4 className="font-medium mb-2">Subject Focus Areas</h4>
            <div className="space-y-2">
              {test.subjectPerformance
                .filter(s => s.accuracy < 70)
                .map(subject => (
                  <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {priorityConfig[subject.priorityLevel].icon}
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject.accuracy.toFixed(1)}% accuracy • {subject.priorityLevel === 'critical' ? 'Immediate reinforcement required' : 'Revision recommended'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={priorityConfig[subject.priorityLevel].bgClass}>
                      {priorityConfig[subject.priorityLevel].label}
                    </Badge>
                  </div>
                ))}
              {test.subjectPerformance.filter(s => s.accuracy < 70).length === 0 && (
                <p className="text-sm text-muted-foreground">All subjects are performing well!</p>
              )}
            </div>
          </div>

          {/* Chapter Signals */}
          <div>
            <h4 className="font-medium mb-2">Chapters Needing Attention</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {test.subjectPerformance.flatMap(s => 
                s.chapters.filter(c => c.accuracy < 60).map(chapter => (
                  <div key={chapter.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{chapter.name}</p>
                      <p className="text-xs text-muted-foreground">{s.name}</p>
                    </div>
                    <span className={`text-sm font-medium ${priorityConfig[chapter.priorityLevel].className}`}>
                      {chapter.accuracy.toFixed(1)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Signals */}
          <div>
            <h4 className="font-medium mb-2">Students Needing Support</h4>
            <div className="flex flex-wrap gap-2">
              {test.studentPerformance
                .filter(s => s.band === 'at_risk')
                .map(student => (
                  <Badge key={student.id} variant="secondary" className={bandConfig.at_risk.className}>
                    {student.name} ({student.accuracy.toFixed(1)}%)
                  </Badge>
                ))}
              {test.studentPerformance.filter(s => s.band === 'at_risk').length === 0 && (
                <p className="text-sm text-muted-foreground">No students at risk!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubjectCard({ subject }: { subject: GrandTestSubject }) {
  const config = priorityConfig[subject.priorityLevel];
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <h3 className="font-semibold">{subject.name}</h3>
              <p className="text-sm text-muted-foreground">
                {subject.totalQuestions} questions • {subject.chapters.length} chapters
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-bold">{subject.accuracy.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{subject.engagement.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${config.bgClass}`}>
              {config.icon}
              <span className={`text-xs font-medium ${config.className}`}>{config.label}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Correct: {subject.correct}</span>
            <span>Wrong: {subject.wrong}</span>
            <span>Skipped: {subject.skipped}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-green-500" 
              style={{ width: `${(subject.correct / (subject.correct + subject.wrong + subject.skipped)) * 100}%` }} 
            />
            <div 
              className="bg-red-500" 
              style={{ width: `${(subject.wrong / (subject.correct + subject.wrong + subject.skipped)) * 100}%` }} 
            />
            <div 
              className="bg-slate-400" 
              style={{ width: `${(subject.skipped / (subject.correct + subject.wrong + subject.skipped)) * 100}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectChaptersCard({ subject }: { subject: GrandTestSubject }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                <CardTitle className="text-base">{subject.name}</CardTitle>
                <Badge variant="secondary">{subject.chapters.length} chapters</Badge>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {subject.chapters.map((chapter) => (
                <ChapterRow key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ChapterRow({ chapter }: { chapter: GrandTestChapter }) {
  const config = priorityConfig[chapter.priorityLevel];
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-medium">{chapter.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-600 dark:text-green-400">✓ {chapter.correct}</span>
          <span className="text-red-600 dark:text-red-400">✗ {chapter.wrong}</span>
          <span className="text-muted-foreground">○ {chapter.skipped}</span>
        </div>
        <div className="min-w-20 text-right">
          <span className={`font-bold ${config.className}`}>{chapter.accuracy.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function StudentPerformanceSection({ students }: { students: GrandTestStudent[] }) {
  const bandCounts = {
    high: students.filter(s => s.band === 'high').length,
    medium: students.filter(s => s.band === 'medium').length,
    at_risk: students.filter(s => s.band === 'at_risk').length
  };

  return (
    <div className="space-y-4">
      {/* Band Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bandCounts.high}</p>
              <p className="text-xs text-muted-foreground">High Performers (≥75%)</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{bandCounts.medium}</p>
              <p className="text-xs text-muted-foreground">Medium (40-74%)</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{bandCounts.at_risk}</p>
              <p className="text-xs text-muted-foreground">At Risk (&lt;40%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Individual Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRow({ student }: { student: GrandTestStudent }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = bandConfig[student.band];
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-muted-foreground">Roll No: {student.rollNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold">{student.accuracy.toFixed(1)}%</p>
                <Badge variant="secondary" className={config.className}>
                  {config.label}
                </Badge>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="font-medium text-green-600 dark:text-green-400">{student.correct}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Wrong</p>
                <p className="font-medium text-red-600 dark:text-red-400">{student.wrong}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skipped</p>
                <p className="font-medium text-muted-foreground">{student.skipped}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-medium">{student.totalQuestions}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Subject-wise Breakdown</p>
              {student.subjectWise.map((subj, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{subj.subjectName}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={subj.accuracy} className="w-24 h-2" />
                    <span className="min-w-12 text-right font-medium">{subj.accuracy.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
