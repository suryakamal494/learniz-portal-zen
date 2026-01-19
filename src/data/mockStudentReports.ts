import {
  StudentOverview,
  StudentReport,
  StudentSubjectPerformance,
  StudentChapterPerformance,
  StudentTestResult,
  StudentGrandTestResult,
  ClassGroup,
  ClassSection,
  ChapterTestType,
  getPerformanceStatus,
  getBand,
  getTrend
} from '@/types/studentReport';

// Subject configurations with colors
const subjectConfigs = [
  { id: 'physics', name: 'Physics', color: 'blue' },
  { id: 'chemistry', name: 'Chemistry', color: 'purple' },
  { id: 'mathematics', name: 'Mathematics', color: 'green' },
  { id: 'biology', name: 'Biology', color: 'emerald' },
  { id: 'english', name: 'English', color: 'orange' },
  { id: 'social', name: 'Social Studies', color: 'amber' },
];

// Chapters by subject
const chaptersBySubject: Record<string, string[]> = {
  physics: [
    'Newton\'s Laws of Motion',
    'Work, Energy & Power',
    'Gravitation',
    'Wave Optics',
    'Electromagnetic Induction'
  ],
  chemistry: [
    'Atomic Structure',
    'Chemical Bonding',
    'Electrochemistry',
    'Organic Compounds',
    'Thermodynamics'
  ],
  mathematics: [
    'Differential Calculus',
    'Integration',
    'Matrices & Determinants',
    'Probability',
    'Coordinate Geometry'
  ],
  biology: [
    'Cell Biology',
    'Genetics',
    'Human Physiology',
    'Plant Physiology',
    'Ecology'
  ],
  english: [
    'Poetry Analysis',
    'Prose Comprehension',
    'Grammar & Usage',
    'Essay Writing',
    'Literature Studies'
  ],
  social: [
    'Indian History',
    'World Geography',
    'Civics & Governance',
    'Economics Basics',
    'Current Affairs'
  ]
};

// Student name pools
const firstNames = [
  'Aarav', 'Aditi', 'Arjun', 'Ananya', 'Vivaan', 'Ishita', 'Reyansh', 'Diya',
  'Krishna', 'Saanvi', 'Vihaan', 'Aisha', 'Atharv', 'Myra', 'Dhruv', 'Ira',
  'Kabir', 'Kiara', 'Rudra', 'Anvi', 'Arnav', 'Pari', 'Shaurya', 'Aanya',
  'Ayaan', 'Navya', 'Darsh', 'Riya', 'Krish', 'Siya', 'Laksh', 'Avni',
  'Om', 'Tara', 'Harsh', 'Nisha', 'Yash', 'Shreya', 'Dev', 'Priya'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair',
  'Iyer', 'Menon', 'Joshi', 'Rao', 'Pillai', 'Agarwal', 'Mehta', 'Shah',
  'Desai', 'Banerjee', 'Chakraborty', 'Das'
];

// Utility functions
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

const randomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - randomInRange(1, daysAgo));
  return date.toISOString().split('T')[0];
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Generate test results for a chapter
const generateTestResults = (
  chapterId: string,
  testType: ChapterTestType,
  count: number,
  baseAccuracy: number
): StudentTestResult[] => {
  const tests: StudentTestResult[] = [];
  const typeNames = {
    live_assessment: ['Quiz', 'Test', 'Assessment', 'Practice Test'],
    lms_quiz: ['LMS Quiz', 'Online Test', 'Self Assessment', 'Practice Quiz'],
    assignment: ['Assignment', 'Homework', 'Worksheet', 'Practice Set']
  };
  
  for (let i = 0; i < count; i++) {
    const totalQuestions = randomInRange(10, 25);
    const accuracyVariation = randomFloat(-15, 15);
    const accuracy = Math.max(20, Math.min(100, baseAccuracy + accuracyVariation));
    const correct = Math.round((accuracy / 100) * totalQuestions);
    const remaining = totalQuestions - correct;
    const wrong = randomInRange(Math.floor(remaining * 0.6), remaining);
    const skipped = remaining - wrong;
    const classAvgVariation = randomFloat(-10, 10);
    
    tests.push({
      testId: `${chapterId}-${testType}-${i + 1}`,
      testName: `${typeNames[testType][i % typeNames[testType].length]} ${i + 1}`,
      testType,
      testDate: randomDate(90 - (i * 15)),
      totalQuestions,
      correct,
      wrong,
      skipped,
      accuracy,
      timeTaken: `${randomInRange(15, 45)} min`,
      classAverage: Math.max(30, Math.min(90, accuracy + classAvgVariation)),
      rank: randomInRange(1, 45),
      totalStudents: 45
    });
  }
  
  return tests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
};

// Generate chapter performance
const generateChapterPerformance = (
  subjectId: string,
  chapterName: string,
  index: number,
  baseAccuracy: number
): StudentChapterPerformance => {
  const chapterId = `${subjectId}-ch-${index}`;
  const chapterBaseAccuracy = baseAccuracy + randomFloat(-10, 10);
  
  const liveAssessments = generateTestResults(chapterId, 'live_assessment', randomInRange(2, 4), chapterBaseAccuracy);
  const lmsQuizzes = generateTestResults(chapterId, 'lms_quiz', randomInRange(2, 3), chapterBaseAccuracy);
  const assignments = generateTestResults(chapterId, 'assignment', randomInRange(1, 3), chapterBaseAccuracy);
  
  const allTests = [...liveAssessments, ...lmsQuizzes, ...assignments];
  const overallAccuracy = allTests.length > 0 
    ? Math.round(allTests.reduce((sum, t) => sum + t.accuracy, 0) / allTests.length * 10) / 10
    : 0;
  const classAverage = overallAccuracy + randomFloat(-8, 8);
  
  return {
    chapterId,
    chapterName,
    overallAccuracy,
    totalTests: allTests.length,
    testsAttempted: allTests.length,
    classAverage: Math.round(classAverage * 10) / 10,
    comparisonWithClass: Math.round((overallAccuracy - classAverage) * 10) / 10,
    trend: getTrend(allTests),
    testsByType: {
      liveAssessments,
      lmsQuizzes,
      assignments
    }
  };
};

// Generate subject performance
const generateSubjectPerformance = (
  subjectConfig: typeof subjectConfigs[0],
  baseAccuracy: number
): StudentSubjectPerformance => {
  const chapters = chaptersBySubject[subjectConfig.id] || [];
  const subjectBaseAccuracy = baseAccuracy + randomFloat(-8, 8);
  
  const chapterPerformances = chapters.map((chapterName, index) => 
    generateChapterPerformance(subjectConfig.id, chapterName, index, subjectBaseAccuracy)
  );
  
  const allTests = chapterPerformances.reduce((sum, ch) => sum + ch.testsAttempted, 0);
  const overallAccuracy = chapterPerformances.length > 0
    ? Math.round(chapterPerformances.reduce((sum, ch) => sum + ch.overallAccuracy, 0) / chapterPerformances.length * 10) / 10
    : 0;
  
  return {
    subjectId: subjectConfig.id,
    subjectName: subjectConfig.name,
    subjectColor: subjectConfig.color,
    overallAccuracy,
    classAverage: overallAccuracy + randomFloat(-6, 6),
    chapters: chapterPerformances,
    testsTotal: allTests,
    testsAttempted: allTests
  };
};

// Generate grand test results
const generateGrandTests = (baseAccuracy: number): StudentGrandTestResult[] => {
  const grandTestTypes: Array<{ name: string; type: 'half-yearly' | 'annual' | 'term' | 'quarterly' }> = [
    { name: 'Annual Examination 2024', type: 'annual' },
    { name: 'Half-Yearly Examination 2024', type: 'half-yearly' },
    { name: 'Term 2 Assessment', type: 'term' },
    { name: 'Quarterly Test 2', type: 'quarterly' },
  ];
  
  return grandTestTypes.map((gt, index) => {
    const totalQuestions = gt.type === 'annual' ? 200 : gt.type === 'half-yearly' ? 150 : 100;
    const accuracyVariation = randomFloat(-12, 12);
    const accuracy = Math.max(25, Math.min(95, baseAccuracy + accuracyVariation));
    const correct = Math.round((accuracy / 100) * totalQuestions);
    const remaining = totalQuestions - correct;
    const wrong = randomInRange(Math.floor(remaining * 0.5), remaining);
    const skipped = remaining - wrong;
    
    const subjectWise = subjectConfigs.slice(0, 4).map(subject => {
      const subjectQuestions = Math.floor(totalQuestions / 4);
      const subjectAccuracy = accuracy + randomFloat(-10, 10);
      const subjectCorrect = Math.round((subjectAccuracy / 100) * subjectQuestions);
      const subjectRemaining = subjectQuestions - subjectCorrect;
      const subjectWrong = randomInRange(Math.floor(subjectRemaining * 0.5), subjectRemaining);
      const subjectSkipped = subjectRemaining - subjectWrong;
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        accuracy: Math.round(subjectAccuracy * 10) / 10,
        correct: subjectCorrect,
        wrong: subjectWrong,
        skipped: subjectSkipped,
        totalQuestions: subjectQuestions
      };
    });
    
    return {
      testId: `grand-test-${index + 1}`,
      testName: gt.name,
      testType: gt.type,
      testDate: randomDate(30 + (index * 60)),
      totalQuestions,
      correct,
      wrong,
      skipped,
      accuracy: Math.round(accuracy * 10) / 10,
      rank: randomInRange(1, 245),
      totalStudents: 245,
      band: getBand(accuracy),
      subjectWise
    };
  });
};

// Generate a single student
const generateStudent = (
  classId: string,
  className: string,
  section: string,
  index: number
): StudentReport => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const rollNumber = `${className.replace('Class ', '')}${section}${String(index + 1).padStart(2, '0')}`;
  
  // Base accuracy varies by student (some are high performers, some low)
  const baseAccuracy = randomFloat(45, 92);
  const classAverage = 68.5; // Fixed class average for comparison
  
  const subjects = subjectConfigs.map(config => generateSubjectPerformance(config, baseAccuracy));
  const overallAccuracy = Math.round(subjects.reduce((sum, s) => sum + s.overallAccuracy, 0) / subjects.length * 10) / 10;
  const testsAttempted = subjects.reduce((sum, s) => sum + s.testsAttempted, 0);
  
  const student: StudentOverview = {
    studentId: `student-${classId}-${section}-${index}`,
    name,
    rollNumber,
    class: className,
    section,
    classId,
    sectionId: section,
    overallAccuracy,
    classAverage,
    performanceStatus: getPerformanceStatus(overallAccuracy, classAverage),
    subjectsCount: subjects.length,
    testsAttempted,
    lastActive: randomDate(7)
  };
  
  return {
    student,
    subjects,
    grandTests: generateGrandTests(baseAccuracy)
  };
};

// Generate all students for all classes
const generateAllStudents = (): Map<string, StudentReport[]> => {
  const studentsMap = new Map<string, StudentReport[]>();
  
  const classes = [
    { id: 'class-9', name: 'Class 9' },
    { id: 'class-10', name: 'Class 10' },
    { id: 'class-11', name: 'Class 11' },
    { id: 'class-12', name: 'Class 12' }
  ];
  
  const sections = ['A', 'B', 'C'];
  
  classes.forEach(cls => {
    sections.forEach(section => {
      const key = `${cls.id}-${section}`;
      const studentCount = randomInRange(12, 18);
      const students: StudentReport[] = [];
      
      for (let i = 0; i < studentCount; i++) {
        students.push(generateStudent(cls.id, cls.name, section, i));
      }
      
      // Sort by roll number
      students.sort((a, b) => a.student.rollNumber.localeCompare(b.student.rollNumber));
      studentsMap.set(key, students);
    });
  });
  
  return studentsMap;
};

// Pre-generate all student data
const allStudentsData = generateAllStudents();

// Export functions to get data
export const getClassGroups = (): ClassGroup[] => {
  const classes = [
    { id: 'class-9', name: 'Class 9' },
    { id: 'class-10', name: 'Class 10' },
    { id: 'class-11', name: 'Class 11' },
    { id: 'class-12', name: 'Class 12' }
  ];
  
  const sections = ['A', 'B', 'C'];
  
  return classes.map(cls => {
    const classsSections: ClassSection[] = sections.map(section => {
      const key = `${cls.id}-${section}`;
      const students = allStudentsData.get(key) || [];
      const avgAccuracy = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.student.overallAccuracy, 0) / students.length * 10) / 10
        : 0;
      
      return {
        sectionId: section,
        sectionName: `Section ${section}`,
        studentCount: students.length,
        averageAccuracy: avgAccuracy
      };
    });
    
    return {
      classId: cls.id,
      className: cls.name,
      sections: classsSections,
      totalStudents: classsSections.reduce((sum, s) => sum + s.studentCount, 0)
    };
  });
};

export const getSectionStudents = (classId: string, sectionId: string): StudentOverview[] => {
  const key = `${classId}-${sectionId}`;
  const students = allStudentsData.get(key) || [];
  return students.map(s => s.student);
};

export const getStudentReport = (classId: string, sectionId: string, studentId: string): StudentReport | null => {
  const key = `${classId}-${sectionId}`;
  const students = allStudentsData.get(key) || [];
  return students.find(s => s.student.studentId === studentId) || null;
};

export const searchStudents = (query: string): StudentOverview[] => {
  const results: StudentOverview[] = [];
  const lowerQuery = query.toLowerCase();
  
  allStudentsData.forEach((students) => {
    students.forEach(s => {
      if (
        s.student.name.toLowerCase().includes(lowerQuery) ||
        s.student.rollNumber.toLowerCase().includes(lowerQuery)
      ) {
        results.push(s.student);
      }
    });
  });
  
  return results.slice(0, 20); // Limit results
};

// Export for direct access if needed
export { allStudentsData };
