
import { TeacherScheduleClass } from '@/types/teacherSchedule';
import { 
  ScheduleTrackingStats, 
  BatchProgress, 
  ChapterProgress, 
  TeacherProgress,
  ClassProgressEnhanced,
  TeacherProgressEnhanced,
  BatchProgressEnhanced,
  SubjectProgress,
  ChapterWithTeachers,
  TeacherClassBatchProgress,
  TeacherSubjectProgress,
  TeacherChapterProgress,
  ChapterTeacherBreakdown,
  TeachingSessionNote
} from '@/types/teachingProgress';

// Extended mock data with teaching status - MORE DATA for better hierarchy
export const mockTeacherScheduleWithStatus: TeacherScheduleClass[] = [
  // Class 12, Science A - Physics
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
    assignments: { urlView: '', lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Covered all topics as planned. Students showed good understanding of electromagnetic induction principles.',
    markedAt: '2024-01-15T10:05:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z'
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
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Introduced AC circuit concepts and phasor diagrams. Students found impedance calculations challenging.',
    markedAt: '2024-01-19T11:05:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-19T11:05:00Z'
  },
  {
    id: '9',
    date: '2024-01-22',
    time: '09:00 AM',
    duration: '90 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Physics',
    topic: 'Electromagnetic Induction',
    faculty: 'Dr. Rajesh Kumar',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Completed numerical problems on Faraday law. Need more practice on Lenz law applications in next class.',
    markedAt: '2024-01-22T10:35:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T10:35:00Z'
  },
  // Class 12, Science A - Chemistry
  {
    id: '10',
    date: '2024-01-16',
    time: '11:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    faculty: 'Dr. Anjali Verma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: true },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Galvanic cell concepts explained with practical examples. Students participated actively.',
    markedAt: '2024-01-16T12:05:00Z',
    markedBy: 'Dr. Anjali Verma',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-16T12:05:00Z'
  },
  {
    id: '11',
    date: '2024-01-18',
    time: '11:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    faculty: 'Dr. Anjali Verma',
    assignments: { lmsAssigned: true, notesAssigned: false, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'partial',
    teachingNotes: 'Half portion covered, remaining in next class',
    markedAt: '2024-01-18T12:05:00Z',
    markedBy: 'Dr. Anjali Verma',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-18T12:05:00Z'
  },
  {
    id: '12',
    date: '2024-01-20',
    time: '11:00 AM',
    duration: '45 mins',
    class: 'Class 12',
    batch: 'Science A',
    subject: 'Chemistry',
    topic: 'Chemical Kinetics',
    faculty: 'Dr. Anjali Verma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Rate laws and order of reaction covered. Will start Arrhenius equation in next session.',
    markedAt: '2024-01-20T11:50:00Z',
    markedBy: 'Dr. Anjali Verma',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-20T11:50:00Z'
  },
  // Class 12, Science B - Biology
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
    assignments: { urlView: '', lmsAssigned: true, notesAssigned: true, liveQuizAssigned: true },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Mendel laws explained with Punnett squares. Students enjoyed the genetics problem-solving session.',
    markedAt: '2024-01-17T12:00:00Z',
    markedBy: 'Dr. Suresh Nair',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-17T12:00:00Z'
  },
  {
    id: '13',
    date: '2024-01-19',
    time: '11:00 AM',
    duration: '75 mins',
    class: 'Class 12',
    batch: 'Science B',
    subject: 'Biology',
    topic: 'Genetics and Evolution',
    faculty: 'Dr. Suresh Nair',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'DNA replication model demonstrated. Students grasped semi-conservative replication well.',
    markedAt: '2024-01-19T12:20:00Z',
    markedBy: 'Dr. Suresh Nair',
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-19T12:20:00Z'
  },
  {
    id: '14',
    date: '2024-01-22',
    time: '11:00 AM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science B',
    subject: 'Biology',
    topic: 'Biotechnology',
    faculty: 'Dr. Suresh Nair',
    assignments: { lmsAssigned: false, notesAssigned: true, liveQuizAssigned: false },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  // Class 12, Science B - Physics (shared teacher)
  {
    id: '15',
    date: '2024-01-18',
    time: '02:00 PM',
    duration: '60 mins',
    class: 'Class 12',
    batch: 'Science B',
    subject: 'Physics',
    topic: 'Electromagnetic Induction',
    faculty: 'Dr. Rajesh Kumar',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'EMI fundamentals covered for Science B batch. Good class participation.',
    markedAt: '2024-01-18T15:05:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-18T15:05:00Z'
  },
  // Class 11, Commerce B - Mathematics
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
    assignments: { urlView: '', lmsAssigned: true, notesAssigned: false, liveQuizAssigned: true },
    status: 'completed',
    teachingStatus: 'partial',
    teachingNotes: 'Only revision done, new examples pending',
    markedAt: '2024-01-15T12:05:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-15T12:05:00Z'
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
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: true },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Students grasped fundamental theorem of integration well. Extra practice problems assigned.',
    markedAt: '2024-01-20T15:35:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-20T15:35:00Z'
  },
  {
    id: '16',
    date: '2024-01-22',
    time: '10:30 AM',
    duration: '60 mins',
    class: 'Class 11',
    batch: 'Commerce B',
    subject: 'Mathematics',
    topic: 'Differential Calculus',
    faculty: 'Prof. Priya Sharma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Chain rule and product rule problems completed. Students are ready for applications.',
    markedAt: '2024-01-22T11:35:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-22T11:35:00Z'
  },
  // Class 11, Commerce B - Accountancy (another teacher, same chapter)
  {
    id: '17',
    date: '2024-01-17',
    time: '02:00 PM',
    duration: '60 mins',
    class: 'Class 11',
    batch: 'Commerce B',
    subject: 'Accountancy',
    topic: 'Financial Statements',
    faculty: 'Mr. Arun Patel',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Balance sheet format explained with practical company examples. Students need more practice.',
    markedAt: '2024-01-17T15:05:00Z',
    markedBy: 'Mr. Arun Patel',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-17T15:05:00Z'
  },
  {
    id: '18',
    date: '2024-01-19',
    time: '02:00 PM',
    duration: '45 mins',
    class: 'Class 11',
    batch: 'Commerce B',
    subject: 'Accountancy',
    topic: 'Financial Statements',
    faculty: 'Mr. Arun Patel',
    assignments: { lmsAssigned: false, notesAssigned: true, liveQuizAssigned: false },
    status: 'cancelled',
    teachingStatus: 'not-taken',
    teachingNotes: 'Power outage in building',
    markedAt: '2024-01-19T14:00:00Z',
    markedBy: 'Admin',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z'
  },
  // Class 11, Science C - Physics
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
    assignments: { lmsAssigned: false, notesAssigned: false, liveQuizAssigned: false },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-12T13:00:00Z',
    updatedAt: '2024-01-15T10:15:00Z'
  },
  {
    id: '19',
    date: '2024-01-20',
    time: '09:30 AM',
    duration: '60 mins',
    class: 'Class 11',
    batch: 'Science C',
    subject: 'Physics',
    topic: 'Wave Optics',
    faculty: 'Dr. Rajesh Kumar',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Interference patterns demonstrated with laser setup. Lab session was very effective.',
    markedAt: '2024-01-20T10:35:00Z',
    markedBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-14T13:00:00Z',
    updatedAt: '2024-01-20T10:35:00Z'
  },
  // Class 10, General A - Chemistry
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
    assignments: { lmsAssigned: false, notesAssigned: true, liveQuizAssigned: false },
    status: 'cancelled',
    teachingStatus: 'not-taken',
    teachingNotes: 'Faculty on medical leave',
    markedAt: '2024-01-16T14:00:00Z',
    markedBy: 'Admin',
    createdAt: '2024-01-11T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
  },
  {
    id: '20',
    date: '2024-01-18',
    time: '02:00 PM',
    duration: '45 mins',
    class: 'Class 10',
    batch: 'General A',
    subject: 'Chemistry',
    topic: 'Organic Compounds',
    faculty: 'Dr. Anjali Verma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'IUPAC nomenclature covered. Students practiced naming various organic compounds.',
    markedAt: '2024-01-18T14:50:00Z',
    markedBy: 'Dr. Anjali Verma',
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-18T14:50:00Z'
  },
  {
    id: '21',
    date: '2024-01-20',
    time: '02:00 PM',
    duration: '60 mins',
    class: 'Class 10',
    batch: 'General A',
    subject: 'Chemistry',
    topic: 'Acids and Bases',
    faculty: 'Dr. Anjali Verma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: true },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'pH calculations and indicators explained. Conducted litmus paper experiment.',
    markedAt: '2024-01-20T15:05:00Z',
    markedBy: 'Dr. Anjali Verma',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-20T15:05:00Z'
  },
  // Class 10, General A - Mathematics (another teacher for same chapter)
  {
    id: '22',
    date: '2024-01-17',
    time: '10:00 AM',
    duration: '60 mins',
    class: 'Class 10',
    batch: 'General A',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    faculty: 'Prof. Priya Sharma',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Quadratic formula derivation completed. Students understood completing the square method.',
    markedAt: '2024-01-17T11:05:00Z',
    markedBy: 'Prof. Priya Sharma',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-17T11:05:00Z'
  },
  {
    id: '23',
    date: '2024-01-19',
    time: '10:00 AM',
    duration: '45 mins',
    class: 'Class 10',
    batch: 'General A',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    faculty: 'Mr. Vikram Singh',
    assignments: { lmsAssigned: true, notesAssigned: false, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'partial',
    teachingNotes: 'Substitute class, covered revision only',
    markedAt: '2024-01-19T10:50:00Z',
    markedBy: 'Mr. Vikram Singh',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-19T10:50:00Z'
  },
  // Class 10, General B - English
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
    assignments: { urlView: '', lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-09T11:45:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '24',
    date: '2024-01-21',
    time: '03:30 PM',
    duration: '50 mins',
    class: 'Class 10',
    batch: 'General B',
    subject: 'English',
    topic: 'Poetry Analysis',
    faculty: 'Ms. Kavita Joshi',
    assignments: { lmsAssigned: true, notesAssigned: true, liveQuizAssigned: false },
    status: 'completed',
    teachingStatus: 'completed',
    teachingNotes: 'Excellent class discussion on metaphors and imagery. Students analyzed poems enthusiastically.',
    markedAt: '2024-01-21T16:25:00Z',
    markedBy: 'Ms. Kavita Joshi',
    createdAt: '2024-01-14T11:45:00Z',
    updatedAt: '2024-01-21T16:25:00Z'
  },
  {
    id: '25',
    date: '2024-01-23',
    time: '03:30 PM',
    duration: '45 mins',
    class: 'Class 10',
    batch: 'General B',
    subject: 'English',
    topic: 'Short Stories',
    faculty: 'Ms. Kavita Joshi',
    assignments: { lmsAssigned: false, notesAssigned: true, liveQuizAssigned: false },
    status: 'scheduled',
    teachingStatus: 'pending',
    createdAt: '2024-01-16T11:45:00Z',
    updatedAt: '2024-01-16T11:45:00Z'
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

// Calculate batch-wise progress (legacy)
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
        batch.completedHours += hours * 0.5;
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

// Calculate chapter-wise progress (legacy)
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

// Calculate teacher-wise progress (legacy)
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

// ============ NEW HIERARCHICAL CALCULATION FUNCTIONS ============

// Calculate Class → Batch → Subject → Chapter → Teacher hierarchy
export function calculateClassBatchSubjectProgress(classes: TeacherScheduleClass[]): ClassProgressEnhanced[] {
  const classMap = new Map<string, ClassProgressEnhanced>();

  classes.forEach(cls => {
    const hours = parseDurationToHours(cls.duration);
    const completedHours = cls.teachingStatus === 'completed' ? hours : 
                           cls.teachingStatus === 'partial' ? hours * 0.5 : 0;

    // Get or create class
    if (!classMap.has(cls.class)) {
      classMap.set(cls.class, {
        classId: cls.class.replace(/\s+/g, '-').toLowerCase(),
        className: cls.class,
        totalHours: 0,
        completedHours: 0,
        batches: []
      });
    }
    const classData = classMap.get(cls.class)!;
    classData.totalHours += hours;
    classData.completedHours += completedHours;

    // Find or create batch
    let batch = classData.batches.find(b => b.batchName === cls.batch);
    if (!batch) {
      batch = {
        batchId: `${cls.class}-${cls.batch}`.replace(/\s+/g, '-').toLowerCase(),
        batchName: cls.batch,
        className: cls.class,
        totalHours: 0,
        completedHours: 0,
        sessionsPlanned: 0,
        sessionsCompleted: 0,
        subjects: []
      };
      classData.batches.push(batch);
    }
    batch.totalHours += hours;
    batch.completedHours += completedHours;
    batch.sessionsPlanned++;
    if (cls.teachingStatus === 'completed') batch.sessionsCompleted++;

    // Find or create subject
    let subject = batch.subjects.find(s => s.subjectName === cls.subject);
    if (!subject) {
      subject = {
        subjectId: `${cls.batch}-${cls.subject}`.replace(/\s+/g, '-').toLowerCase(),
        subjectName: cls.subject,
        totalHours: 0,
        completedHours: 0,
        sessionsPlanned: 0,
        sessionsCompleted: 0,
        chapters: []
      };
      batch.subjects.push(subject);
    }
    subject.totalHours += hours;
    subject.completedHours += completedHours;
    subject.sessionsPlanned++;
    if (cls.teachingStatus === 'completed') subject.sessionsCompleted++;

    // Find or create chapter
    let chapter = subject.chapters.find(c => c.chapterName === cls.topic);
    if (!chapter) {
      chapter = {
        chapterId: `${cls.subject}-${cls.topic}`.replace(/\s+/g, '-').toLowerCase(),
        chapterName: cls.topic,
        totalHours: 0,
        completedHours: 0,
        sessionsPlanned: 0,
        sessionsCompleted: 0,
        sessionsPartial: 0,
        sessionsMissed: 0,
        teachers: [],
        sessionNotes: []
      };
      subject.chapters.push(chapter);
    }
    chapter.totalHours += hours;
    chapter.completedHours += completedHours;
    chapter.sessionsPlanned++;
    if (cls.teachingStatus === 'completed') chapter.sessionsCompleted++;
    else if (cls.teachingStatus === 'partial') chapter.sessionsPartial++;
    else if (cls.teachingStatus === 'not-taken') chapter.sessionsMissed++;

    // Collect session notes if present
    if (cls.teachingNotes) {
      chapter.sessionNotes.push({
        sessionId: cls.id,
        date: cls.date,
        time: cls.time,
        teacherName: cls.faculty,
        status: cls.teachingStatus,
        notes: cls.teachingNotes,
        markedAt: cls.markedAt || cls.updatedAt
      });
    }

    // Find or create teacher within chapter
    let teacher = chapter.teachers.find(t => t.teacherName === cls.faculty);
    if (!teacher) {
      teacher = {
        teacherId: cls.faculty.replace(/\s+/g, '-').toLowerCase(),
        teacherName: cls.faculty,
        hoursSpent: 0,
        sessionsCompleted: 0,
        sessionsPartial: 0,
        sessionsMissed: 0
      };
      chapter.teachers.push(teacher);
    }
    teacher.hoursSpent += completedHours;
    if (cls.teachingStatus === 'completed') teacher.sessionsCompleted++;
    else if (cls.teachingStatus === 'partial') teacher.sessionsPartial++;
    else if (cls.teachingStatus === 'not-taken') teacher.sessionsMissed++;
  });

  return Array.from(classMap.values()).sort((a, b) => a.className.localeCompare(b.className));
}

// Calculate Teacher → Class/Batch → Subject → Chapter hierarchy
export function calculateTeacherClassProgress(classes: TeacherScheduleClass[]): TeacherProgressEnhanced[] {
  const teacherMap = new Map<string, TeacherProgressEnhanced>();

  classes.forEach(cls => {
    const hours = parseDurationToHours(cls.duration);
    const completedHours = cls.teachingStatus === 'completed' ? hours : 
                           cls.teachingStatus === 'partial' ? hours * 0.5 : 0;

    // Get or create teacher
    if (!teacherMap.has(cls.faculty)) {
      teacherMap.set(cls.faculty, {
        teacherId: cls.faculty.replace(/\s+/g, '-').toLowerCase(),
        teacherName: cls.faculty,
        totalHours: hours,
        completedHours: completedHours,
        sessionsCompleted: cls.teachingStatus === 'completed' ? 1 : 0,
        sessionsPartial: cls.teachingStatus === 'partial' ? 1 : 0,
        sessionsMissed: cls.teachingStatus === 'not-taken' ? 1 : 0,
        classBatches: []
      });
    } else {
      const teacher = teacherMap.get(cls.faculty)!;
      teacher.totalHours += hours;
      teacher.completedHours += completedHours;
      if (cls.teachingStatus === 'completed') teacher.sessionsCompleted++;
      else if (cls.teachingStatus === 'partial') teacher.sessionsPartial++;
      else if (cls.teachingStatus === 'not-taken') teacher.sessionsMissed++;
    }
    const teacher = teacherMap.get(cls.faculty)!;

    // Find or create class/batch combo
    const classBatchKey = `${cls.class}-${cls.batch}`;
    let classBatch = teacher.classBatches.find(cb => `${cb.className}-${cb.batchName}` === classBatchKey);
    if (!classBatch) {
      classBatch = {
        classId: cls.class.replace(/\s+/g, '-').toLowerCase(),
        className: cls.class,
        batchId: classBatchKey.replace(/\s+/g, '-').toLowerCase(),
        batchName: cls.batch,
        hoursSpent: 0,
        subjects: []
      };
      teacher.classBatches.push(classBatch);
    }
    classBatch.hoursSpent += completedHours;

    // Find or create subject
    let subject = classBatch.subjects.find(s => s.subjectName === cls.subject);
    if (!subject) {
      subject = {
        subjectId: `${classBatchKey}-${cls.subject}`.replace(/\s+/g, '-').toLowerCase(),
        subjectName: cls.subject,
        hoursSpent: 0,
        chapters: []
      };
      classBatch.subjects.push(subject);
    }
    subject.hoursSpent += completedHours;

    // Find or create chapter
    let chapter = subject.chapters.find(c => c.chapterName === cls.topic);
    if (!chapter) {
      chapter = {
        chapterId: `${cls.subject}-${cls.topic}`.replace(/\s+/g, '-').toLowerCase(),
        chapterName: cls.topic,
        hoursSpent: 0,
        sessionsCompleted: 0,
        sessionsPartial: 0,
        sessionsMissed: 0,
        sessionNotes: []
      };
      subject.chapters.push(chapter);
    }
    chapter.hoursSpent += completedHours;
    if (cls.teachingStatus === 'completed') chapter.sessionsCompleted++;
    else if (cls.teachingStatus === 'partial') chapter.sessionsPartial++;
    else if (cls.teachingStatus === 'not-taken') chapter.sessionsMissed++;

    // Collect session notes if present
    if (cls.teachingNotes) {
      chapter.sessionNotes.push({
        sessionId: cls.id,
        date: cls.date,
        time: cls.time,
        teacherName: cls.faculty,
        status: cls.teachingStatus,
        notes: cls.teachingNotes,
        markedAt: cls.markedAt || cls.updatedAt
      });
    }
  });

  return Array.from(teacherMap.values()).sort((a, b) => b.completedHours - a.completedHours);
}
