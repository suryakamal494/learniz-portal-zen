export interface CourseSubject {
  id: string;
  name: string;
  institute: string;
  isOwner: boolean;
}

export interface Course {
  id: string;
  serialNumber: number;
  className: string;
  programName: string;
  subjects: CourseSubject[];
  createdAt: string;
  updatedAt: string;
}
