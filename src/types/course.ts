export interface CourseTopic {
  id: string;
  name: string;
  isSelected?: boolean;
}

export interface CourseChapter {
  id: string;
  name: string;
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
