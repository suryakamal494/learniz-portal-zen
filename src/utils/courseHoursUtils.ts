import { CourseChapter, CourseSubjectWithContent, Course } from '@/types/course';

/**
 * Calculate total hours for a chapter (sum of topic hours)
 */
export function getChapterHours(chapter: CourseChapter): number {
  return chapter.topics.reduce((sum, topic) => sum + (topic.hours || 0), 0);
}

/**
 * Calculate total hours for a subject (sum of chapter hours)
 */
export function getSubjectHours(subject: CourseSubjectWithContent): number {
  return subject.chapters.reduce((sum, ch) => sum + getChapterHours(ch), 0);
}

/**
 * Calculate total hours for a course (sum of subject hours)
 */
export function getCourseHours(course: Course): number {
  return course.subjects.reduce((sum, s) => sum + getSubjectHours(s), 0);
}

/**
 * Format hours display (e.g., "2.5 hrs" or "2 hrs")
 */
export function formatHours(hours: number): string {
  if (hours === 0) return '0 hrs';
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

/**
 * Calculate total topics count in a course
 */
export function getTotalTopicsCount(course: Course): number {
  return course.subjects.reduce((sum, subject) => 
    sum + subject.chapters.reduce((chSum, chapter) => 
      chSum + chapter.topics.length, 0
    ), 0
  );
}

/**
 * Calculate total chapters count in a course
 */
export function getTotalChaptersCount(course: Course): number {
  return course.subjects.reduce((sum, subject) => 
    sum + subject.chapters.length, 0
  );
}
