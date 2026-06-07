export type VoiceFilterField = 'subjectId' | 'chapterId' | 'batchId'

export interface VoiceRoute {
  id: string
  path: string
  label: string
  examples: string[]
  needsParam?: 'batchId'
  /** Filters this route understands as URL query params. */
  supportedFilters?: VoiceFilterField[]
}

export const voiceRoutes: VoiceRoute[] = [
  { id: 'dashboard', path: '/teacher', label: 'Teacher Dashboard', examples: ['home', 'dashboard', 'main page', 'go home'] },
  { id: 'schedule', path: '/teacher/classroom/schedule', label: 'Class Schedule', examples: ['schedule', 'my classes', 'timetable', 'today classes'] },
  { id: 'schedule.create', path: '/teacher/classroom/schedule/create', label: 'Schedule a Class', examples: ['schedule a class', 'create class', 'new class', 'add class'] },
  { id: 'liveAssessment', path: '/teacher/classroom/live-quizzes', label: 'Live Assessment', examples: ['live assessment', 'live quizzes', 'live test'] },
  { id: 'studyNotes', path: '/teacher/classroom/notes', label: 'Study Notes', examples: ['notes', 'study notes', 'open notes'] },
  { id: 'studyNotes.create', path: '/teacher/classroom/notes/create', label: 'Create Study Notes', examples: ['create note', 'new note', 'add study note'] },
  { id: 'messages', path: '/teacher/messages', label: 'Messages', examples: ['messages', 'inbox', 'open messages'] },
  { id: 'notifications', path: '/teacher/notifications', label: 'Notifications', examples: ['notifications', 'alerts'] },
  { id: 'questionBank', path: '/teacher/question-bank', label: 'Question Bank', examples: ['question bank', 'questions', 'open question bank'] },
  { id: 'questionBank.add', path: '/teacher/question-bank/add', label: 'Add to Question Bank', examples: ['add question', 'create question', 'new question'] },

  { id: 'reports', path: '/teacher/reports', label: 'Reports', examples: ['reports', 'show reports', 'analytics'] },
  { id: 'reports.attendance', path: '/teacher/reports/attendance', label: 'Attendance Reports', examples: ['attendance', 'attendance report', 'mark attendance', 'today attendance', 'physics attendance', 'chemistry attendance'], supportedFilters: ['batchId'] },
  { id: 'reports.section', path: '/teacher/reports/section', label: 'Section Reports', examples: ['batch reports', 'section reports', 'batch performance', 'how did section a do'], supportedFilters: ['batchId'] },
  { id: 'reports.chapter', path: '/teacher/reports/chapter-analytics', label: 'Chapter Analytics', examples: ['chapter analytics', 'kinematics report', 'physics chapter report', 'chapter performance'], supportedFilters: ['subjectId', 'chapterId'] },

  { id: 'batches', path: '/teacher/batches', label: 'My Sections', examples: ['batches', 'my sections', 'sections', 'classes list'] },
  { id: 'batches.add', path: '/teacher/batches/add', label: 'Add Section', examples: ['add batch', 'create batch', 'new batch', 'new section'] },
  { id: 'batch.open', path: '/teacher/batches/:batchId', label: 'Open a Section', examples: ['open section a', 'go to physics section', 'show chemistry batch'], needsParam: 'batchId' },
  { id: 'batch.programs', path: '/teacher/batches/:batchId/programs', label: 'Section Program', examples: ['program of section a', 'open program', 'show my program', 'open programs page', 'physics program', 'chemistry program', 'show curriculum'], needsParam: 'batchId', supportedFilters: ['subjectId'] },
  // Virtual route: same URL as batch.programs but the client deep-links to
  // today's focus subject + chapter (?subject=<slug>#chapter-<id>).
  { id: 'programs.current', path: '/teacher/batches/:batchId/programs', label: 'Currently Teaching', examples: ['what am i teaching now', 'what am i teaching today', 'currently teaching', 'current chapter', 'todays topic', 'today topic', 'this weeks lesson', 'this week topic', 'where do i stand in the program', 'where am i in the program', 'take me to the current chapter', 'jump to current chapter', 'show currently running', 'what is running now', 'open this weeks chapter', 'where i stand'], needsParam: 'batchId' },

  { id: 'assessments', path: '/teacher/exams', label: 'Assessments', examples: ['assessments', 'exams', 'tests', 'show assessments'] },
  { id: 'assessment.create', path: '/teacher/exams/create', label: 'Create Assessment', examples: ['create assessment', 'new assessment', 'create exam', 'new test'] },
  { id: 'assessment.ai', path: '/teacher/exams/ai-generator', label: 'AI Exam Generator', examples: ['ai exam generator', 'generate exam with ai', 'ai questions'] },
  { id: 'assessment.directory', path: '/teacher/exams/directory', label: 'Assessment Directory', examples: ['exam directory', 'assessment directory'] },
  { id: 'assessment.instructions', path: '/teacher/exams/instructions', label: 'Assessment Instructions', examples: ['instructions', 'exam instructions', 'assessment instructions'] },

  { id: 'lessons', path: '/teacher/lms', label: 'Lessons', examples: ['lessons', 'lms', 'open lessons'] },
  { id: 'lessons.content', path: '/teacher/lms/content', label: 'Lesson Content', examples: ['lesson content', 'lesson materials', 'materials'] },
  { id: 'lessons.content.create', path: '/teacher/lms/content/create', label: 'Create Lesson Content', examples: ['create lesson', 'add material', 'new lesson material'] },
  { id: 'lessons.library', path: '/teacher/lms/library', label: 'Content Library', examples: ['content library', 'library'] },
  { id: 'lessonPlans', path: '/teacher/lms/series', label: 'Lesson Plans', examples: ['lesson plans', 'series', 'physics lesson plans', 'chemistry lesson plans', 'kinematics lesson plan'], supportedFilters: ['subjectId', 'chapterId'] },
  { id: 'lessonPlans.create', path: '/teacher/lms/series/create', label: 'Create Lesson Plan', examples: ['create lesson plan', 'new lesson plan', 'new series'] },
  { id: 'lessons.directory', path: '/teacher/lms/directory', label: 'Lessons Directory', examples: ['lessons directory', 'lms directory'] },
  { id: 'lessons.aiPpt', path: '/teacher/lms/ai-ppt-generator', label: 'AI PPT Generator', examples: ['ai ppt', 'generate ppt', 'ai presentation'] },

  { id: 'courses', path: '/teacher/courses', label: 'Courses', examples: ['courses', 'course library', 'browse courses'] },
  { id: 'courses.create', path: '/teacher/courses/create', label: 'Create Course', examples: ['create course', 'new course', 'add course'] },

  { id: 'insights', path: '/institute', label: 'Academic Insights', examples: ['academic insights', 'institute', 'insights'] },
]
