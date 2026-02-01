import { Course } from '@/types/course';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    serialNumber: 1,
    className: 'Class 10',
    programName: 'Test course 1',
    subjects: [
      { id: 'sub-1', name: 'Biology', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-2', name: 'Chemistry', institute: 'LearnEazy Inst', isOwner: true },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'course-2',
    serialNumber: 2,
    className: 'Class 6',
    programName: 'Disha 2',
    subjects: [
      { id: 'sub-3', name: 'Biology', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-4', name: 'Chemistry', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-5', name: 'Mathematics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-6', name: 'Physics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-7', name: 'Reasoning & Aptitude', institute: 'LearnEazy Inst', isOwner: false },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
  },
  {
    id: 'course-3',
    serialNumber: 3,
    className: 'Class 10',
    programName: 'Disha 1',
    subjects: [
      { id: 'sub-8', name: 'Physics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-9', name: 'Mathematics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-10', name: 'Chemistry', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-11', name: 'Reasoning & Aptitude', institute: 'LearnEazy Inst', isOwner: false },
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
  },
  {
    id: 'course-4',
    serialNumber: 4,
    className: 'Class 10',
    programName: 'Tejas',
    subjects: [
      { id: 'sub-12', name: 'Biology', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-13', name: 'Chemistry', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-14', name: 'Physics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-15', name: 'Mathematics', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-16', name: 'English', institute: 'LearnEazy Inst', isOwner: true },
      { id: 'sub-17', name: 'Reasoning & Aptitude', institute: 'LearnEazy Inst', isOwner: false },
      { id: 'sub-18', name: 'Telugu', institute: 'LearnEazy Inst', isOwner: true },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
  },
];
