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
import { SubjectChapterSelector } from '@/components/teacher/courses/SubjectChapterSelector';
import { availableClasses, availableSubjects } from '@/data/mockCourseContent';
import { CourseSubjectWithContent, CourseFormData } from '@/types/course';
import { toast } from 'sonner';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    className: '',
    programName: '',
    fee: 0,
    description: '',
    subjects: [],
  });

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

    // Check if at least one topic is selected
    const hasSelectedTopics = formData.subjects.some((subject) =>
      subject.chapters.some((chapter) => chapter.topics.some((topic) => topic.isSelected))
    );

    // For custom subjects, all topics are pre-selected when added
    const hasCustomSubjectsWithTopics = formData.subjects.some((subject) =>
      subject.isCustom && subject.chapters.some((ch) => ch.topics.length > 0)
    );

    if (!hasSelectedTopics && !hasCustomSubjectsWithTopics) {
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
      programName: formData.title, // Use title as program name
      subjects: cleanedSubjects,
    };

    console.log('Creating course:', courseData);
    toast.success('Course created successfully!');
    navigate('/teacher/courses');
  };

  const handleCancel = () => {
    navigate('/teacher/courses');
  };

  // Calculate summary stats
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
          <span className="text-foreground font-medium">Create</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Course</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up a new course with detailed configuration
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
          <Button onClick={handleSubmit}>Create Course</Button>
        </div>
      </div>
    </div>
  );
}
