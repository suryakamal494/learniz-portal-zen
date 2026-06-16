import type { ChapterTest } from '@/types/program';
import { generateMockQuestions, SUBJECT_OPTIONS } from './mockAIGenerator';
import type { GeneratedQuestion } from '@/types/aiExamGenerator';

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TEST_TITLE_TEMPLATES = [
  'Foundations Quick Check',
  'Concept Reinforcement Set',
  'Application & Problem Solving',
  'Mixed Practice Drill',
  'Tricky Questions Roundup',
  'Speed Test',
  'Revision Sprint',
  'Mastery Challenge',
];

const cache = new Map<string, ChapterTest[]>();
const questionCache = new Map<string, GeneratedQuestion[]>();

export function getChapterTests(chapterId: string): ChapterTest[] {
  if (cache.has(chapterId)) return cache.get(chapterId)!;
  const rand = seeded(hash(chapterId));
  const count = 5 + Math.floor(rand() * 6); // 5..10
  const out: ChapterTest[] = [];
  for (let i = 0; i < count; i++) {
    const qCount = 5 + Math.floor(rand() * 16); // 5..20
    const marksPerQ = 1 + Math.floor(rand() * 3); // 1..3
    out.push({
      id: `${chapterId}-test-${i + 1}`,
      chapterId,
      title: `${TEST_TITLE_TEMPLATES[i % TEST_TITLE_TEMPLATES.length]} ${i + 1}`,
      source: 'admin',
      questionCount: qCount,
      durationMinutes: qCount, // ~1 min/Q
      totalMarks: qCount * marksPerQ,
      enabledForStudents: true,
      sharedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    });
  }
  cache.set(chapterId, out);
  return out;
}

/** Build a deterministic preview question set for a test. */
export function getQuestionsForTest(test: ChapterTest): GeneratedQuestion[] {
  if (questionCache.has(test.id)) return questionCache.get(test.id)!;
  const subj = SUBJECT_OPTIONS[hash(test.id) % SUBJECT_OPTIONS.length];
  const chap = subj.chapters[hash(test.id + 'c') % subj.chapters.length];
  const qs = generateMockQuestions(
    {
      subject: subj.id,
      chapter: chap.id,
      topics: chap.topics,
      numberOfQuestions: test.questionCount,
      difficulties: ['easy', 'medium', 'hard'],
      questionType: 'single',
      categories: ['Conceptual', 'Formulae'],
      customInstructions: '',
    },
    test.id,
    Math.max(1, Math.round(test.totalMarks / test.questionCount)),
    test.questionCount,
  );
  questionCache.set(test.id, qs);
  return qs;
}
