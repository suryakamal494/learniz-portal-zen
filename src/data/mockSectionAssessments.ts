import { getProgramByBatchId } from './mockPrograms'
import { mockBatchStudents } from './mockBatchStudents'

export interface SectionExam {
  id: string
  title: string
  chapterId: string
  topicId: string
  topicName: string
  date: string // ISO
  totalStudents: number
  absentStudentIds: string[]
  avgScore: number // 0-100
}

export interface TopicRollup {
  topicId: string
  topicName: string
  testCount: number
  avgScore: number | null
  lastDate: string | null
}

export interface ChapterAssessmentRollup {
  chapterId: string
  chapterName: string
  order: number
  testCount: number
  attempts: number
  avgScore: number | null
  absenteeTotal: number
  topics: TopicRollup[]
}

// Deterministic PRNG so numbers are stable per batch
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function daysAgoISO(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const SAMPLE_TOPIC_NAMES = [
  'Introduction',
  'Core Concepts',
  'Worked Examples',
  'Problem Solving',
  'Advanced Applications',
  'Recap & Practice',
]

function getChaptersForBatch(batchId: string) {
  const program = getProgramByBatchId(batchId)
  if (!program) return []
  const chapters: { id: string; name: string; order: number; topics: { id: string; name: string }[] }[] = []
  program.subjects.forEach((sub) => {
    sub.chapters.forEach((ch) => {
      const topics =
        ch.topics && ch.topics.length > 0
          ? ch.topics.map((t) => ({ id: t.id, name: t.name }))
          : SAMPLE_TOPIC_NAMES.slice(0, 3).map((n, i) => ({
              id: `${ch.id}-t${i + 1}`,
              name: n,
            }))
      chapters.push({ id: ch.id, name: ch.name, order: ch.order, topics })
    })
  })
  return chapters
}

export function getSectionAssessments(batchId: string): {
  rollups: ChapterAssessmentRollup[]
  examsByChapter: Record<string, SectionExam[]>
} {
  const n = parseInt(batchId, 10) || 1
  const rand = seeded(n * 7919)
  const chapters = getChaptersForBatch(batchId)
  const totalStudents = Math.max(mockBatchStudents.length, 30)
  const studentIds = mockBatchStudents.map((s) => s.id)

  const examsByChapter: Record<string, SectionExam[]> = {}
  const rollups: ChapterAssessmentRollup[] = []

  chapters.forEach((ch, idx) => {
    // Some chapters intentionally have 0 tests so the gap is visible
    const baseCount = Math.floor(rand() * 6) // 0..5
    const exams: SectionExam[] = []

    for (let i = 0; i < baseCount; i++) {
      const topic = ch.topics[Math.floor(rand() * ch.topics.length)]
      const absentCount = Math.floor(rand() * 6)
      const absentIds: string[] = []
      const pool = [...studentIds]
      for (let a = 0; a < absentCount && pool.length; a++) {
        const k = Math.floor(rand() * pool.length)
        absentIds.push(pool.splice(k, 1)[0])
      }
      exams.push({
        id: `${ch.id}-ex${i + 1}`,
        title: `${topic.name} — Test ${i + 1}`,
        chapterId: ch.id,
        topicId: topic.id,
        topicName: topic.name,
        date: daysAgoISO(idx * 3 + i * 2 + 1),
        totalStudents,
        absentStudentIds: absentIds,
        avgScore: 40 + Math.floor(rand() * 50),
      })
    }
    examsByChapter[ch.id] = exams

    const topicRollups: TopicRollup[] = ch.topics.map((t) => {
      const tExams = exams.filter((e) => e.topicId === t.id)
      const avg =
        tExams.length === 0
          ? null
          : Math.round(tExams.reduce((s, e) => s + e.avgScore, 0) / tExams.length)
      const lastDate =
        tExams.length === 0
          ? null
          : tExams.map((e) => e.date).sort().slice(-1)[0]
      return {
        topicId: t.id,
        topicName: t.name,
        testCount: tExams.length,
        avgScore: avg,
        lastDate,
      }
    })

    const attempts = exams.reduce((s, e) => s + (e.totalStudents - e.absentStudentIds.length), 0)
    const avgScore =
      exams.length === 0
        ? null
        : Math.round(exams.reduce((s, e) => s + e.avgScore, 0) / exams.length)
    const absenteeTotal = exams.reduce((s, e) => s + e.absentStudentIds.length, 0)

    rollups.push({
      chapterId: ch.id,
      chapterName: ch.name,
      order: ch.order,
      testCount: exams.length,
      attempts,
      avgScore,
      absenteeTotal,
      topics: topicRollups,
    })
  })

  return { rollups, examsByChapter }
}
