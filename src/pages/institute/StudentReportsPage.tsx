import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  User,
  X
} from 'lucide-react';
import { getClassGroups, searchStudents } from '@/data/mockStudentReports';
import { ClassGroup, StudentOverview } from '@/types/studentReport';
import { cn } from '@/lib/utils';

const StudentReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<StudentOverview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const classGroups = useMemo(() => getClassGroups(), []);

  // Debounced global search
  useEffect(() => {
    const query = searchQuery.trim();
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const results = searchStudents(query);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleStudentSelect = (student: StudentOverview) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/institute/students/${student.classId}/${student.sectionId}/${student.studentId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

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

  const getPerformanceBadge = (status: string) => {
    switch (status) {
      case 'above_average':
        return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Above Avg</Badge>;
      case 'below_average':
        return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Below Avg</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Average</Badge>;
    }
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

        {/* Global Student Search */}
        <div className="mb-6" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
              className="pl-10 pr-10 h-11"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-1">
                      Found {searchResults.length} student{searchResults.length > 1 ? 's' : ''}
                    </div>
                    {searchResults.map((student) => (
                      <button
                        key={student.studentId}
                        onClick={() => handleStudentSelect(student)}
                        className="w-full px-3 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b last:border-0"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">
                              {student.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({student.rollNumber})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              {student.class} - Section {student.section}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className={cn("text-sm font-medium", getAccuracyColor(student.overallAccuracy))}>
                              {student.overallAccuracy}%
                            </span>
                            {getPerformanceBadge(student.performanceStatus)}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No students found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Class List */}
        <div className="space-y-4">
          {classGroups.map((classGroup) => {
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

        {classGroups.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              No classes available
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentReportsPage;
