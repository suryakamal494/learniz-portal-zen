import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  ArrowLeft, 
  User, 
  BookOpen, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  FileText
} from 'lucide-react';
import { getStudentReport, getClassGroups } from '@/data/mockStudentReports';
import { SubjectAccordion } from '@/components/institute/student/SubjectAccordion';
import { GrandTestCard } from '@/components/institute/student/GrandTestCard';
import { cn } from '@/lib/utils';

const StudentDetailPage: React.FC = () => {
  const { classId, sectionId, studentId } = useParams<{ 
    classId: string; 
    sectionId: string; 
    studentId: string;
  }>();

  const studentReport = useMemo(() => {
    if (!classId || !sectionId || !studentId) return null;
    return getStudentReport(classId, sectionId, studentId);
  }, [classId, sectionId, studentId]);

  const classGroups = useMemo(() => getClassGroups(), []);
  const currentClass = classGroups.find(c => c.classId === classId);

  if (!studentReport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Student not found</p>
          <Button asChild className="mt-4">
            <Link to="/institute/students">Back to Students</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const { student, subjects, grandTests } = studentReport;

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'above_average': return 'text-green-600 bg-green-50 border-green-200';
      case 'below_average': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'above_average': return <TrendingUp className="h-4 w-4" />;
      case 'below_average': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatLastActive = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
          <Link to="/institute" className="hover:text-foreground">Institute</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/institute/students" className="hover:text-foreground">Students</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/institute/students/${classId}/${sectionId}`} className="hover:text-foreground">
            {currentClass?.className} - {sectionId}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{student.name}</span>
        </div>

        {/* Back Button */}
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to={`/institute/students/${classId}/${sectionId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Section
          </Link>
        </Button>

        {/* Student Header Card */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <p className="text-muted-foreground">
                  Roll: {student.rollNumber} • {student.class} - Section {student.section}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline">{student.subjectsCount} subjects</Badge>
                  <Badge variant="outline">{student.testsAttempted} tests</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatLastActive(student.lastActive)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-5 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Performance</span>
                <Badge className={cn("flex items-center gap-1", getPerformanceColor(student.performanceStatus))}>
                  {getPerformanceIcon(student.performanceStatus)}
                  {student.overallAccuracy > student.classAverage 
                    ? `+${(student.overallAccuracy - student.classAverage).toFixed(1)}% above avg`
                    : student.overallAccuracy < student.classAverage
                    ? `${(student.overallAccuracy - student.classAverage).toFixed(1)}% below avg`
                    : 'At average'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", getProgressColor(student.overallAccuracy))}
                    style={{ width: `${student.overallAccuracy}%` }}
                  />
                </div>
                <span className="text-xl font-bold">{student.overallAccuracy}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Class average: {student.classAverage}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Subjects & Grand Tests */}
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="w-full justify-start mb-4 h-auto p-1.5 bg-muted/60 gap-2">
            <TabsTrigger 
              value="subjects" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Subjects
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 data-[state=active]:bg-blue-400 data-[state=active]:text-white">
                {subjects.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="grandtests" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Trophy className="h-4 w-4" />
              Grand Tests
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 data-[state=active]:bg-amber-400 data-[state=active]:text-white">
                {grandTests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <SubjectAccordion subjects={subjects} />
          </TabsContent>

          <TabsContent value="grandtests">
            <div className="space-y-3">
              {grandTests.map((gt, idx) => (
                <GrandTestCard key={gt.testId} grandTest={gt} defaultOpen={idx === 0} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetailPage;
