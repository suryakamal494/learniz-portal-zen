import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SharedCourse } from '@/types/course';
import { getSharedCourseStats } from '@/data/mockSharedCourses';
import { cn } from '@/lib/utils';

interface SharedCourseCardProps {
  course: SharedCourse;
  isSelected: boolean;
  onToggleSelect: (courseId: string) => void;
  onPreview: (course: SharedCourse) => void;
}

export function SharedCourseCard({
  course,
  isSelected,
  onToggleSelect,
  onPreview,
}: SharedCourseCardProps) {
  const stats = getSharedCourseStats(course);

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer',
        'hover:border-primary/50 hover:shadow-md',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card'
      )}
      onClick={() => onToggleSelect(course.id)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(course.id)}
          className="mt-1 h-5 w-5"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{course.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {course.className} • {stats.subjectCount} Subjects • {stats.chapterCount} Chapters
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(course);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Shared by: <span className="font-medium text-foreground">{course.sharedBy}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
