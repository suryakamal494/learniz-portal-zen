import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Search, 
  Users,
  SortAsc,
  SortDesc,
  ArrowLeft,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getSectionStudents, getClassGroups } from '@/data/mockStudentReports';
import { StudentOverview } from '@/types/studentReport';
import { StudentCard } from '@/components/institute/student/StudentCard';

const SectionStudentsPage: React.FC = () => {
  const { classId, sectionId } = useParams<{ classId: string; sectionId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'roll'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterPerformance, setFilterPerformance] = useState<'all' | 'above_average' | 'average' | 'below_average'>('all');

  const students = useMemo(() => {
    if (!classId || !sectionId) return [];
    return getSectionStudents(classId, sectionId);
  }, [classId, sectionId]);

  const classGroups = useMemo(() => getClassGroups(), []);
  const currentClass = classGroups.find(c => c.classId === classId);
  const currentSection = currentClass?.sections.find(s => s.sectionId === sectionId);

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.rollNumber.toLowerCase().includes(query)
      );
    }

    // Filter by performance
    if (filterPerformance !== 'all') {
      result = result.filter(s => s.performanceStatus === filterPerformance);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'accuracy':
          comparison = a.overallAccuracy - b.overallAccuracy;
          break;
        case 'roll':
          comparison = a.rollNumber.localeCompare(b.rollNumber);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, sortBy, sortOrder, filterPerformance]);

  const stats = useMemo(() => {
    const above = students.filter(s => s.performanceStatus === 'above_average').length;
    const below = students.filter(s => s.performanceStatus === 'below_average').length;
    const average = students.filter(s => s.performanceStatus === 'average').length;
    const avgAccuracy = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.overallAccuracy, 0) / students.length * 10) / 10
      : 0;
    
    return { above, below, average, avgAccuracy, total: students.length };
  }, [students]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (!classId || !sectionId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid class or section
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/institute" className="hover:text-foreground transition-colors">
              Institute
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/institute/students" className="hover:text-foreground transition-colors">
              Student Reports
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">
              {currentClass?.className} - Section {sectionId}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                {currentClass?.className} - Section {sectionId}
              </h1>
              <p className="text-muted-foreground mt-1">
                {stats.total} students • {stats.avgAccuracy}% average accuracy
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/institute/students">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Classes
              </Link>
            </Button>
          </div>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card 
            className={`cursor-pointer transition-all ${filterPerformance === 'all' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterPerformance('all')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">All Students</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all bg-green-50 border-green-200 ${filterPerformance === 'above_average' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setFilterPerformance('above_average')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                {stats.above}
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-sm text-green-700">Above Average</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all bg-amber-50 border-amber-200 ${filterPerformance === 'average' ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => setFilterPerformance('average')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.average}</div>
              <div className="text-sm text-amber-700">At Average</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all bg-red-50 border-red-200 ${filterPerformance === 'below_average' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setFilterPerformance('below_average')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                {stats.below}
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="text-sm text-red-700">Below Average</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
              <SelectTrigger className="w-[140px] h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roll">Roll Number</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="accuracy">Accuracy</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-11 w-11"
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedStudents.map((student) => (
            <StudentCard 
              key={student.studentId}
              student={student}
              classId={classId}
              sectionId={sectionId}
            />
          ))}
        </div>

        {filteredAndSortedStudents.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              {searchQuery || filterPerformance !== 'all'
                ? 'No students match your filters'
                : 'No students found in this section'
              }
            </div>
          </Card>
        )}

        {/* Results count */}
        {filteredAndSortedStudents.length > 0 && filteredAndSortedStudents.length !== stats.total && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {filteredAndSortedStudents.length} of {stats.total} students
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionStudentsPage;
