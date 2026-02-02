export interface CourseTopic {
  id: string;
  name: string;
  originalName?: string;           // Original name from source (for renamed topics)
  sourceSubjectId?: string;        // Which subject this came from
  isSelected?: boolean;
  hours?: number;                  // Teaching hours for this topic
}

// Computed types for hours display
export interface TopicWithHours extends CourseTopic {
  hours: number;
}

export interface ChapterHoursSummary {
  chapterId: string;
  chapterName: string;
  totalHours: number;
  topics: TopicWithHours[];
}

export interface SubjectHoursSummary {
  subjectId: string;
  subjectName: string;
  totalHours: number;
  chapters: ChapterHoursSummary[];
}

export interface CourseChapter {
  id: string;
  name: string;
  originalName?: string;           // Original name from source (for renamed chapters)
  sourceSubjectId?: string;        // Which subject this came from
  sourceSubjectName?: string;      // Source subject name for reference
  isSelected?: boolean;
  topics: CourseTopic[];
}

export interface CourseSubject {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
}

export interface CourseSubjectWithContent extends CourseSubject {
  isCustom?: boolean;              // Is this a custom-created subject?
  chapters: CourseChapter[];
}

export interface Course {
  id: string;
  serialNumber: number;
  title: string;
  className: string;
  programName: string;
  fee?: number;
  description?: string;
  image?: string;
  subjects: CourseSubjectWithContent[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormData {
  title: string;
  className: string;
  programName: string;
  fee: number;
  description: string;
  image?: string;
  subjects: CourseSubjectWithContent[];
}

// Available subject with all chapters and topics for selection
export interface AvailableSubject {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
  chapters: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
    }[];
  }[];
}

export interface ClassOption {
  id: string;
  name: string;
}

// Pre-made course from Super Admin (read-only)
export interface SharedCourse {
  id: string;
  name: string;
  description?: string;
  sharedBy: string;
  className: string;
  subjects: CourseSubjectWithContent[];
  createdAt: string;
}

// Updated form data to support both paths
export interface ProgramFormData {
  title: string;
  className: string;
  fee: number;
  description: string;
  image?: string;
  // Two exclusive content paths
  contentMode: 'existing' | 'custom' | null;
  selectedSharedCourses: SharedCourse[];
  customSubjects: CourseSubjectWithContent[];
}
