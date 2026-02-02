import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SharedCourseCard } from './SharedCourseCard';
import { SharedCoursePreviewModal } from './SharedCoursePreviewModal';
import { SharedCourse } from '@/types/course';
import { mockSharedCourses, getSharedCourseStats } from '@/data/mockSharedCourses';

interface SharedCoursesSelectorProps {
  selectedCourses: SharedCourse[];
  onSelectionChange: (courses: SharedCourse[]) => void;
}

export function SharedCoursesSelector({
  selectedCourses,
  onSelectionChange,
}: SharedCoursesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewCourse, setPreviewCourse] = useState<SharedCourse | null>(null);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return mockSharedCourses;
    const query = searchQuery.toLowerCase();
    return mockSharedCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.className.toLowerCase().includes(query) ||
        course.sharedBy.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedIds = useMemo(
    () => new Set(selectedCourses.map((c) => c.id)),
    [selectedCourses]
  );

  const handleToggleSelect = (courseId: string) => {
    if (selectedIds.has(courseId)) {
      onSelectionChange(selectedCourses.filter((c) => c.id !== courseId));
    } else {
      const course = mockSharedCourses.find((c) => c.id === courseId);
      if (course) {
        onSelectionChange([...selectedCourses, course]);
      }
    }
  };

  const handlePreview = (course: SharedCourse) => {
    setPreviewCourse(course);
  };

  // Calculate total stats for selected courses
  const totalStats = useMemo(() => {
    let subjects = 0;
    let chapters = 0;
    let topics = 0;

    selectedCourses.forEach((course) => {
      const stats = getSharedCourseStats(course);
      subjects += stats.subjectCount;
      chapters += stats.chapterCount;
      topics += stats.topicCount;
    });

    return { subjects, chapters, topics };
  }, [selectedCourses]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-medium text-foreground">Available Courses from Super Admin</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select one or more courses to include in your program
          </p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1"
        style={{ minHeight: '200px', maxHeight: '400px' }}
      >
        {filteredCourses.map((course) => (
          <SharedCourseCard
            key={course.id}
            course={course}
            isSelected={selectedIds.has(course.id)}
            onToggleSelect={handleToggleSelect}
            onPreview={handlePreview}
          />
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground text-sm">
            No courses found matching your search.
          </div>
        )}
      </div>

      {selectedCourses.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Selected:</span>{' '}
            {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} •{' '}
            {totalStats.subjects} subjects • {totalStats.chapters} chapters
          </p>
        </div>
      )}

      <SharedCoursePreviewModal
        course={previewCourse}
        open={!!previewCourse}
        onOpenChange={(open) => !open && setPreviewCourse(null)}
      />
    </div>
  );
}
