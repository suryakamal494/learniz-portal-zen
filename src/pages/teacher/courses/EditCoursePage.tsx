import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubjectChapterSelector } from '@/components/teacher/courses/SubjectChapterSelector';
import { availableClasses, availableSubjects } from '@/data/mockCourseContent';
import { mockCourses } from '@/data/mockCourses';
import { CourseSubjectWithContent, CourseFormData, Course } from '@/types/course';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    className: '',
    programName: '',
    fee: 0,
    description: '',
    subjects: [],
  });

  useEffect(() => {
    // Simulate loading course data
    const loadCourse = () => {
      const foundCourse = mockCourses.find((c) => c.id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
        
        // Merge existing course subjects with available subjects structure
        const mergedSubjects: CourseSubjectWithContent[] = foundCourse.subjects.map((courseSubject) => {
          // Find the full subject data from available subjects
          const fullSubject = availableSubjects.find(
            (as) => as.name.toLowerCase() === courseSubject.name.toLowerCase()
          );

          if (fullSubject) {
            // Map the full structure, marking selected items based on course data
            return {
              id: courseSubject.id,
              name: courseSubject.name,
              institute: courseSubject.institute,
              isOwner: courseSubject.isOwner,
              chapters: fullSubject.chapters.map((availableChapter) => {
                const courseChapter = courseSubject.chapters.find(
                  (cc) => cc.name === availableChapter.name
                );
                
                return {
                  id: availableChapter.id,
                  name: availableChapter.name,
                  isSelected: !!courseChapter,
                  topics: availableChapter.topics.map((availableTopic) => {
                    const courseTopic = courseChapter?.topics.find(
                      (ct) => ct.name === availableTopic.name
                    );
                    return {
                      id: availableTopic.id,
                      name: availableTopic.name,
                      isSelected: !!courseTopic,
                    };
                  }),
                };
              }),
            };
          }

          // Fallback to course subject structure if not found
          return courseSubject;
        });

        setFormData({
          title: foundCourse.title,
          className: foundCourse.className,
          programName: foundCourse.programName,
          fee: foundCourse.fee || 0,
          description: foundCourse.description || '',
          subjects: mergedSubjects,
        });
      }
      setIsLoading(false);
    };

    setTimeout(loadCourse, 300);
  }, [courseId]);

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubjectsChange = (subjects: CourseSubjectWithContent[]) => {
    setFormData((prev) => ({ ...prev, subjects }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return false;
    }
    if (!formData.className) {
      toast.error('Please select a class');
      return false;
    }
    if (formData.subjects.length === 0) {
      toast.error('Please select at least one subject');
      return false;
    }

    const hasSelectedTopics = formData.subjects.some((subject) =>
      subject.chapters.some((chapter) => chapter.topics.some((topic) => topic.isSelected))
    );

    if (!hasSelectedTopics) {
      toast.error('Please select at least one topic from the subjects');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Filter out chapters and topics that aren't selected
    const cleanedSubjects = formData.subjects
      .map((subject) => ({
        ...subject,
        chapters: subject.chapters
          .filter((chapter) => chapter.topics.some((t) => t.isSelected))
          .map((chapter) => ({
            ...chapter,
            topics: chapter.topics.filter((t) => t.isSelected),
          })),
      }))
      .filter((subject) => subject.chapters.length > 0);

    const courseData = {
      ...formData,
      subjects: cleanedSubjects,
    };

    console.log('Updating course:', courseData);
    toast.success('Course updated successfully!');
    navigate('/teacher/courses');
  };

  const handleCancel = () => {
    navigate('/teacher/courses');
  };

  const getTotalStats = () => {
    let subjects = formData.subjects.length;
    let chapters = 0;
    let topics = 0;

    formData.subjects.forEach((s) => {
      s.chapters.forEach((ch) => {
        if (ch.topics.some((t) => t.isSelected)) chapters++;
        topics += ch.topics.filter((t) => t.isSelected).length;
      });
    });

    return { subjects, chapters, topics };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Course not found</h2>
          <p className="text-muted-foreground mt-2">
            The course you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={() => navigate('/teacher/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link to="/teacher" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/teacher/courses" className="hover:text-foreground transition-colors">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">Edit</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update course configuration and content
          </p>
        </div>

        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📋 Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter Course Name"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">
                  Class <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.className}
                  onValueChange={(value) => handleInputChange('className', value)}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Fee For Course</Label>
                <Input
                  id="fee"
                  type="number"
                  placeholder="1000"
                  value={formData.fee || ''}
                  onChange={(e) => handleInputChange('fee', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-muted-foreground">No file chosen</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter course description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject & Content Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📚 Subject & Content Selection
              {stats.topics > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-auto">
                  {stats.subjects} subjects • {stats.chapters} chapters • {stats.topics} topics
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectChapterSelector
              availableSubjects={availableSubjects}
              selectedSubjects={formData.subjects}
              onSelectionChange={handleSubjectsChange}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
