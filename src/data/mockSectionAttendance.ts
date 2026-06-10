import { mockBatchStudents } from './mockBatchStudents'

export interface AttendanceDay {
  date: string // ISO YYYY-MM-DD
  label: string // "Mon 9 Jun"
  isHoliday: boolean
  totalStudents: number
  absentStudentIds: string[]
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function fmt(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getRecentAttendance(batchId: string, days = 5): AttendanceDay[] {
  const n = parseInt(batchId, 10) || 1
  const rand = seeded(n * 6151)
  const totalStudents = Math.max(mockBatchStudents.length, 30)
  const ids = mockBatchStudents.map((s) => s.id)
  const result: AttendanceDay[] = []

  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const isSunday = d.getDay() === 0
    if (isSunday) {
      result.push({
        date: d.toISOString().slice(0, 10),
        label: fmt(d),
        isHoliday: true,
        totalStudents,
        absentStudentIds: [],
      })
      continue
    }
    const absentCount = Math.floor(rand() * 9)
    const pool = [...ids]
    const absent: string[] = []
    for (let a = 0; a < absentCount && pool.length; a++) {
      const k = Math.floor(rand() * pool.length)
      absent.push(pool.splice(k, 1)[0])
    }
    result.push({
      date: d.toISOString().slice(0, 10),
      label: fmt(d),
      isHoliday: false,
      totalStudents,
      absentStudentIds: absent,
    })
  }
  return result
}
