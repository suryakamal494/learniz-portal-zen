import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Users, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  GraduationCap,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { getClassGroups } from '@/data/mockStudentReports';
import { ClassGroup } from '@/types/studentReport';
import { cn } from '@/lib/utils';

const StudentReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  
  const classGroups = useMemo(() => getClassGroups(), []);

  const toggleClass = (classId: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }
      return next;
    });
  };

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classGroups;
    
    const query = searchQuery.toLowerCase();
    return classGroups.filter(cls => 
      cls.className.toLowerCase().includes(query) ||
      cls.sections.some(s => s.sectionName.toLowerCase().includes(query))
    );
  }, [classGroups, searchQuery]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-50 border-green-200';
    if (accuracy >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/institute" className="hover:text-foreground transition-colors">
              Institute
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Student Reports</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Student Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Individual student performance for Parent-Teacher Meetings
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by class or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {classGroups.length}
              </div>
              <div className="text-sm text-muted-foreground">Classes</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {classGroups.reduce((sum, c) => sum + c.sections.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {classGroups.reduce((sum, c) => sum + c.totalStudents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Students</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  classGroups.reduce((sum, c) => 
                    sum + c.sections.reduce((s, sec) => s + sec.averageAccuracy, 0) / c.sections.length, 0
                  ) / classGroups.length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Class List */}
        <div className="space-y-4">
          {filteredClasses.map((classGroup) => {
            const isExpanded = expandedClasses.has(classGroup.classId);
            
            return (
              <Card key={classGroup.classId} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleClass(classGroup.classId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{classGroup.className}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {classGroup.sections.length} sections • {classGroup.totalStudents} students
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="hidden sm:flex">
                            {Math.round(
                              classGroup.sections.reduce((s, sec) => s + sec.averageAccuracy, 0) / classGroup.sections.length
                            )}% avg
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {classGroup.sections.map((section) => (
                          <Link 
                            key={section.sectionId}
                            to={`/institute/students/${classGroup.classId}/${section.sectionId}`}
                          >
                            <Card className={cn(
                              "hover:shadow-md transition-all cursor-pointer border",
                              getAccuracyBg(section.averageAccuracy)
                            )}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold">{section.sectionName}</span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {section.studentCount} students
                                  </span>
                                  <span className={cn("font-medium flex items-center gap-1", getAccuracyColor(section.averageAccuracy))}>
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {section.averageAccuracy}%
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              No classes found matching "{searchQuery}"
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentReportsPage;
