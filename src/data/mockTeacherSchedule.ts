
import { TeacherScheduleClass } from '@/types/teacherSchedule';

export const mockTeacherScheduleClasses: TeacherScheduleClass[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Physics',
    topic: 'Electromagnetic Induction',
    faculty: 'Dr. Rajesh Kumar',
    assignments: {
      urlView: 'https://example.com/physics-induction',
      lmsAssigned: true,
      notesAssigned: true,
      liveQuizAssigned: false
    },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z'
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '10:30 AM',
    duration: '90 mins',
    class: 'Class 11',
    batch: 'Commerce B',
    subject: 'Mathematics',
    topic: 'Differential Calculus',
    faculty: 'Prof. Priya Sharma',
    assignments: {
      urlView: 'https://example.com/math-calculus',
      lmsAssigned: true,
      notesAssigned: false,
      liveQuizAssigned: true
    },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-14T11:20:00Z'
  },
  {
    id: '3',
    date: '2024-01-16',
    time: '02:00 PM',
    duration: '45 mins',
    class: 'Class 10',
    batch: 'General A',
    subject: 'Chemistry',
    topic: 'Organic Compounds',
    faculty: 'Dr. Anjali Verma',
    assignments: {
      lmsAssigned: false,
      notesAssigned: true,
      liveQuizAssigned: false
    },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-11T14:00:00Z',
    updatedAt: '2024-01-13T16:45:00Z'
  },
  {
    id: '4',
    date: '2024-01-17',
    time: '11:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science B',
    subject: 'Biology',
    topic: 'Genetics and Evolution',
    faculty: 'Dr. Suresh Nair',
    assignments: {
      urlView: 'https://example.com/biology-genetics',
      lmsAssigned: true,
      notesAssigned: true,
      liveQuizAssigned: true
    },
    status: 'completed',
    teachingStatus: 'completed',
    markedAt: '2024-01-17T12:00:00Z',
    markedBy: 'Dr. Suresh Nair',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-17T12:00:00Z'
  },
  {
    id: '5',
    date: '2024-01-18',
    time: '09:30 AM',
    duration: '75 mins',
    class: 'Class 11',
    batch: 'Science C',
    subject: 'Physics',
    topic: 'Wave Optics',
    faculty: 'Dr. Rajesh Kumar',
    assignments: {
      lmsAssigned: false,
      notesAssigned: false,
      liveQuizAssigned: false
    },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-12T13:00:00Z',
    updatedAt: '2024-01-15T10:15:00Z'
  },
  {
    id: '6',
    date: '2024-01-19',
    time: '03:30 PM',
    duration: '50 mins',
    class: 'Class 10',
    batch: 'General B',
    subject: 'English',
    topic: 'Poetry Analysis',
    faculty: 'Ms. Kavita Joshi',
    assignments: {
      urlView: 'https://example.com/english-poetry',
      lmsAssigned: true,
      notesAssigned: true,
      liveQuizAssigned: false
    },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-09T11:45:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }
];

// Helper functions for filtering
export const getUniqueClasses = (): string[] => {
  return Array.from(new Set(mockTeacherScheduleClasses.map(cls => cls.class))).sort();
};

export const getUniqueBatches = (): string[] => {
  return Array.from(new Set(mockTeacherScheduleClasses.map(cls => cls.batch))).sort();
};

export const getUniqueSubjects = (): string[] => {
  return Array.from(new Set(mockTeacherScheduleClasses.map(cls => cls.subject))).sort();
};
