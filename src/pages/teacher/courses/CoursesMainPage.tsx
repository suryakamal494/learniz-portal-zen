import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2,
  ArrowUpDown,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CoursePreviewModal } from '@/components/teacher/courses/CoursePreviewModal';
import { ConfigureHoursModal } from '@/components/teacher/courses/ConfigureHoursModal';
import { mockCourses } from '@/data/mockCourses';
import { Course } from '@/types/course';
import { toast } from 'sonner';

const tabs = [
  { id: 'courses', label: 'Courses' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'topics', label: 'Topics' },
];

export default function CoursesMainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [hoursConfigCourse, setHoursConfigCourse] = useState<Course | null>(null);
  const [showHoursModal, setShowHoursModal] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (course: Course) => {
    setPreviewCourse(course);
    setShowPreviewModal(true);
  };

  const handleEdit = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleDeleteConfirm = (course: Course) => {
    setDeleteConfirmCourse(course);
  };

  const handleDelete = () => {
    if (deleteConfirmCourse) {
      setCourses((prev) => prev.filter((c) => c.id !== deleteConfirmCourse.id));
      toast.success(`Course "${deleteConfirmCourse.title}" deleted successfully`);
      setDeleteConfirmCourse(null);
    }
  };

  const handleAddCourse = () => {
    navigate('/teacher/courses/create');
  };

  const handleConfigureHours = (course: Course) => {
    setHoursConfigCourse(course);
    setShowHoursModal(true);
  };

  const handleSaveHours = (updatedCourse: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    );
  };

  // Get subject count for display
  const getSubjectCount = (course: Course) => {
    return course.subjects.length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link to="/teacher" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">Courses</span>
        </nav>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 ${
                activeTab === tab.id 
                  ? 'bg-foreground text-background hover:bg-foreground/90' 
                  : 'hover:bg-muted'
              }`}
            >
              {activeTab === tab.id && (
                <span className="w-2 h-2 rounded-full bg-background mr-2" />
              )}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide">
              Courses
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage courses and academic content
            </p>
          </div>
          <Button 
            onClick={handleAddCourse}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            CREATE PROGRAM
          </Button>
        </div>

        {/* Courses Table Card */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Courses</span>
                <span className="text-muted-foreground text-sm">
                  ({filteredCourses.length} courses)
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="w-20">
                      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 font-semibold text-xs uppercase text-muted-foreground hover:text-foreground">
                        S.NO
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-32">
                      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 font-semibold text-xs uppercase text-muted-foreground hover:text-foreground">
                        CLASS
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-40">
                      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 font-semibold text-xs uppercase text-muted-foreground hover:text-foreground">
                        PROGRAM NAME
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 font-semibold text-xs uppercase text-muted-foreground hover:text-foreground">
                        SUBJECTS
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-16 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {course.serialNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {course.className}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {course.programName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {course.subjects.map((subject) => (
                            <Badge
                              key={subject.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md border-l-4 border-l-blue-400 px-2.5 py-1 font-medium text-xs whitespace-nowrap"
                            >
                              {subject.name} - {subject.institute}
                              {subject.isOwner && ' (Owner)'}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handlePreview(course)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConfigureHours(course)}>
                              <Clock className="h-4 w-4 mr-2" />
                              Configure Hours
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(course.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteConfirm(course)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCourses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No courses found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <CoursePreviewModal
        course={previewCourse}
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
      />

      {/* Configure Hours Modal */}
      <ConfigureHoursModal
        course={hoursConfigCourse}
        open={showHoursModal}
        onOpenChange={setShowHoursModal}
        onSave={handleSaveHours}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmCourse} onOpenChange={(open) => !open && setDeleteConfirmCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmCourse?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
