import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { ContentModeSelector } from '@/components/teacher/courses/ContentModeSelector';
import { SharedCoursesSelector } from '@/components/teacher/courses/SharedCoursesSelector';
import { SubjectChapterSelector } from '@/components/teacher/courses/SubjectChapterSelector';
import { availableClasses, availableSubjects } from '@/data/mockCourseContent';
import { getSharedCourseStats } from '@/data/mockSharedCourses';
import { CourseSubjectWithContent, ProgramFormData, SharedCourse } from '@/types/course';
import { toast } from 'sonner';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    className: '',
    fee: 0,
    description: '',
    contentMode: null,
    selectedSharedCourses: [],
    customSubjects: [],
  });

  const handleInputChange = (field: keyof ProgramFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContentModeChange = (mode: 'existing' | 'custom') => {
    setFormData((prev) => ({ ...prev, contentMode: mode }));
  };

  const handleSharedCoursesChange = (courses: SharedCourse[]) => {
    setFormData((prev) => ({ ...prev, selectedSharedCourses: courses }));
  };

  const handleCustomSubjectsChange = (subjects: CourseSubjectWithContent[]) => {
    setFormData((prev) => ({ ...prev, customSubjects: subjects }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Please enter a program title');
      return false;
    }
    if (!formData.className) {
      toast.error('Please select a class');
      return false;
    }
    if (!formData.contentMode) {
      toast.error('Please select a content mode');
      return false;
    }

    if (formData.contentMode === 'existing') {
      if (formData.selectedSharedCourses.length === 0) {
        toast.error('Please select at least one course');
        return false;
      }
    } else {
      if (formData.customSubjects.length === 0) {
        toast.error('Please select at least one subject');
        return false;
      }

      // Check if at least one topic is selected
      const hasSelectedTopics = formData.customSubjects.some((subject) =>
        subject.chapters.some((chapter) => chapter.topics.some((topic) => topic.isSelected))
      );

      // For custom subjects, all topics are pre-selected when added
      const hasCustomSubjectsWithTopics = formData.customSubjects.some((subject) =>
        subject.isCustom && subject.chapters.some((ch) => ch.topics.length > 0)
      );

      if (!hasSelectedTopics && !hasCustomSubjectsWithTopics) {
        toast.error('Please select at least one topic from the subjects');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    let programData;

    if (formData.contentMode === 'existing') {
      programData = {
        title: formData.title,
        className: formData.className,
        programName: formData.title,
        fee: formData.fee,
        description: formData.description,
        contentMode: 'existing',
        courses: formData.selectedSharedCourses,
      };
    } else {
      // Filter out chapters and topics that aren't selected
      const cleanedSubjects = formData.customSubjects
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

      programData = {
        title: formData.title,
        className: formData.className,
        programName: formData.title,
        fee: formData.fee,
        description: formData.description,
        contentMode: 'custom',
        subjects: cleanedSubjects,
      };
    }

    console.log('Creating program:', programData);
    toast.success('Program created successfully!');
    navigate('/teacher/courses');
  };

  const handleCancel = () => {
    navigate('/teacher/courses');
  };

  // Calculate summary stats based on content mode
  const getTotalStats = () => {
    if (formData.contentMode === 'existing') {
      let courses = formData.selectedSharedCourses.length;
      let subjects = 0;
      let chapters = 0;
      let topics = 0;

      formData.selectedSharedCourses.forEach((course) => {
        const stats = getSharedCourseStats(course);
        subjects += stats.subjectCount;
        chapters += stats.chapterCount;
        topics += stats.topicCount;
      });

      return { courses, subjects, chapters, topics };
    } else {
      let subjects = formData.customSubjects.length;
      let chapters = 0;
      let topics = 0;

      formData.customSubjects.forEach((s) => {
        s.chapters.forEach((ch) => {
          if (ch.topics.some((t) => t.isSelected)) chapters++;
          topics += ch.topics.filter((t) => t.isSelected).length;
        });
      });

      return { courses: 0, subjects, chapters, topics };
    }
  };

  const stats = getTotalStats();

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
            Programs
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">Create</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Program</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up a new program with courses and content
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
                  placeholder="Enter Program Name"
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
                <Label htmlFor="fee">Fee For Program</Label>
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
                placeholder="Enter program description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Content Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📚 Course Content
              {(stats.subjects > 0 || stats.courses > 0) && (
                <span className="text-sm font-normal text-muted-foreground ml-auto">
                  {formData.contentMode === 'existing'
                    ? `${stats.courses} courses • ${stats.subjects} subjects • ${stats.chapters} chapters`
                    : `${stats.subjects} subjects • ${stats.chapters} chapters • ${stats.topics} topics`}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ContentModeSelector
              mode={formData.contentMode}
              onModeChange={handleContentModeChange}
            />

            {formData.contentMode && (
              <div className="pt-4 border-t">
                {formData.contentMode === 'existing' ? (
                  <SharedCoursesSelector
                    selectedCourses={formData.selectedSharedCourses}
                    onSelectionChange={handleSharedCoursesChange}
                  />
                ) : (
                  <SubjectChapterSelector
                    availableSubjects={availableSubjects}
                    selectedSubjects={formData.customSubjects}
                    onSelectionChange={handleCustomSubjectsChange}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Program</Button>
        </div>
      </div>
    </div>
  );
}
