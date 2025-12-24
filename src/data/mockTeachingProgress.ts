
import { TeacherScheduleClass } from '@/types/teacherSchedule';
import { 
  ScheduleTrackingStats, 
  BatchProgress, 
  ChapterProgress, 
  TeacherProgress 
} from '@/types/teachingProgress';

// Extended mock data with teaching status
export const mockTeacherScheduleWithStatus: TeacherScheduleClass[] = [
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
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Covered all topics as planned',
    markedAt: '2024-01-15T10:05:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z'
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
    status: 'completed',
    teachingStatus: 'partial',
    teachingNotes: 'Only revision done, new examples pending',
    markedAt: '2024-01-15T12:05:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-15T12:05:00Z'
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
    status: 'cancelled',
    teachingStatus: 'not-taken',
    teachingNotes: 'Faculty on medical leave',
    markedAt: '2024-01-16T14:00:00Z',
    markedBy: 'Admin',
    createdAt: '2024-01-11T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
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
  },
  {
    id: '7',
    date: '2024-01-19',
    time: '10:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Physics',
    topic: 'AC Circuits',
    faculty: 'Dr. Rajesh Kumar',
    assignments: {
      lmsAssigned: true,
      notesAssigned: true,
      liveQuizAssigned: false
    },
    status: 'completed',
    teachingStatus: 'completed',
    markedAt: '2024-01-19T11:05:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-19T11:05:00Z'
  },
  {
    id: '8',
    date: '2024-01-20',
    time: '02:00 PM',
    duration: '90 mins',
    class: 'Class 11',
    batch: 'Commerce B',
    subject: 'Mathematics',
    topic: 'Integration Basics',
    faculty: 'Prof. Priya Sharma',
    assignments: {
      lmsAssigned: true,
      notesAssigned: true,
      liveQuizAssigned: true
    },
    status: 'completed',
    teachingStatus: 'completed',
    markedAt: '2024-01-20T15:35:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-20T15:35:00Z'
  }
];

// Helper function to parse duration string to hours
export function parseDurationToHours(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]) / 60;
  }
  return 1; // default 1 hour
}

// Calculate overall stats
export function calculateScheduleStats(classes: TeacherScheduleClass[]): ScheduleTrackingStats {
  const stats: ScheduleTrackingStats = {
    totalClasses: classes.length,
    completedClasses: 0,
    partialClasses: 0,
    notTakenClasses: 0,
    pendingClasses: 0,
    totalScheduledHours: 0,
    completedHours: 0,
    partialHours: 0,
    missedHours: 0
  };

  classes.forEach(cls => {
    const hours = parseDurationToHours(cls.duration);
    stats.totalScheduledHours += hours;

    switch (cls.teachingStatus) {
      case 'completed':
        stats.completedClasses++;
        stats.completedHours += hours;
        break;
      case 'partial':
        stats.partialClasses++;
        stats.partialHours += hours;
        break;
      case 'not-taken':
        stats.notTakenClasses++;
        stats.missedHours += hours;
        break;
      case 'pending':
        stats.pendingClasses++;
        break;
    }
  });

  return stats;
}

// Calculate batch-wise progress
export function calculateBatchProgress(classes: TeacherScheduleClass[]): BatchProgress[] {
  const batchMap = new Map<string, BatchProgress>();

  classes.forEach(cls => {
    const key = `${cls.class}-${cls.batch}`;
    if (!batchMap.has(key)) {
      batchMap.set(key, {
        batchId: key,
        batchName: cls.batch,
        className: cls.class,
        plannedClasses: 0,
        completedClasses: 0,
        partialClasses: 0,
        notTakenClasses: 0,
        completionPercentage: 0,
        plannedHours: 0,
        completedHours: 0
      });
    }

    const batch = batchMap.get(key)!;
    const hours = parseDurationToHours(cls.duration);
    batch.plannedClasses++;
    batch.plannedHours += hours;

    switch (cls.teachingStatus) {
      case 'completed':
        batch.completedClasses++;
        batch.completedHours += hours;
        break;
      case 'partial':
        batch.partialClasses++;
        batch.completedHours += hours * 0.5; // Count partial as 50%
        break;
      case 'not-taken':
        batch.notTakenClasses++;
        break;
    }
  });

  return Array.from(batchMap.values()).map(batch => ({
    ...batch,
    completionPercentage: batch.plannedClasses > 0 
      ? Math.round((batch.completedClasses / batch.plannedClasses) * 100) 
      : 0
  }));
}

// Calculate chapter-wise progress
export function calculateChapterProgress(classes: TeacherScheduleClass[]): ChapterProgress[] {
  const chapterMap = new Map<string, ChapterProgress>();

  classes.forEach(cls => {
    const key = `${cls.subject}-${cls.topic}`;
    if (!chapterMap.has(key)) {
      chapterMap.set(key, {
        chapterId: key,
        chapterName: cls.topic,
        subject: cls.subject,
        sessionsPlanned: 0,
        sessionsCompleted: 0,
        sessionsPartial: 0,
        sessionsMissed: 0,
        hoursSpent: 0
      });
    }

    const chapter = chapterMap.get(key)!;
    const hours = parseDurationToHours(cls.duration);
    chapter.sessionsPlanned++;

    switch (cls.teachingStatus) {
      case 'completed':
        chapter.sessionsCompleted++;
        chapter.hoursSpent += hours;
        break;
      case 'partial':
        chapter.sessionsPartial++;
        chapter.hoursSpent += hours * 0.5;
        break;
      case 'not-taken':
        chapter.sessionsMissed++;
        break;
    }
  });

  return Array.from(chapterMap.values());
}

// Calculate teacher-wise progress
export function calculateTeacherProgress(classes: TeacherScheduleClass[]): TeacherProgress[] {
  const teacherMap = new Map<string, TeacherProgress>();

  classes.forEach(cls => {
    const key = cls.faculty;
    if (!teacherMap.has(key)) {
      teacherMap.set(key, {
        teacherId: key.replace(/\s+/g, '-').toLowerCase(),
        teacherName: key,
        assignedClasses: 0,
        completedClasses: 0,
        partialClasses: 0,
        notTakenClasses: 0,
        completionRate: 0
      });
    }

    const teacher = teacherMap.get(key)!;
    teacher.assignedClasses++;

    switch (cls.teachingStatus) {
      case 'completed':
        teacher.completedClasses++;
        break;
      case 'partial':
        teacher.partialClasses++;
        break;
      case 'not-taken':
        teacher.notTakenClasses++;
        break;
    }
  });

  return Array.from(teacherMap.values()).map(teacher => ({
    ...teacher,
    completionRate: teacher.assignedClasses > 0 
      ? Math.round((teacher.completedClasses / teacher.assignedClasses) * 100) 
      : 0
  }));
}
