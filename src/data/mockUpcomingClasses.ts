
export interface UpcomingClass {
  id: string
  time: string
  date: string
  batch: string
  class: string
  topic: string
  subject: string
  streamingLink?: string
  hasAnimations: boolean
  hasFacultyNotes: boolean
  hasLiveQuiz: boolean
  isLive: boolean
  duration: string
  studentsCount: number
  status?: 'scheduled' | 'cancelled'
}

// Build today's date and a HH:MM window offset from "now" so the
// dashboard shows every streaming edge case (Upcoming, Start early,
// Start/Live, Missed, No-link, Cancelled) without needing real data.
const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

function window(offsetStartMin: number, durationMin: number): string {
  const s = new Date(today.getTime() + offsetStartMin * 60_000)
  const e = new Date(s.getTime() + durationMin * 60_000)
  return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`
}

export const mockUpcomingClasses: UpcomingClass[] = [
  {
    // LIVE NOW → "Start" (within class window, link available)
    id: "1",
    time: window(-10, 60),
    date: dateStr,
    batch: "JEE Advanced 2025",
    class: "Class 12",
    topic: "Calculus - Applications of Derivatives",
    subject: "Mathematics",
    streamingLink: "https://meet.google.com/abc-defg-hij",
    hasAnimations: true,
    hasFacultyNotes: false,
    hasLiveQuiz: true,
    isLive: true,
    duration: "60 min",
    studentsCount: 45,
  },
  {
    // STARTS SOON → "Start early" (within 15 min pre-window)
    id: "2",
    time: window(10, 75),
    date: dateStr,
    batch: "NEET 2025",
    class: "Class 12",
    topic: "Chemical Bonding and Molecular Structure",
    subject: "Chemistry",
    streamingLink: "https://meet.google.com/xyz-uvwx-yz",
    hasAnimations: false,
    hasFacultyNotes: true,
    hasLiveQuiz: false,
    isLive: false,
    duration: "75 min",
    studentsCount: 38,
  },
  {
    // FAR FUTURE → "Upcoming" (more than 15 min away)
    id: "3",
    time: window(120, 60),
    date: dateStr,
    batch: "Foundation Course",
    class: "Class 11",
    topic: "Electromagnetic Induction",
    subject: "Physics",
    streamingLink: "https://meet.google.com/foo-bar-baz",
    hasAnimations: false,
    hasFacultyNotes: false,
    hasLiveQuiz: true,
    isLive: false,
    duration: "60 min",
    studentsCount: 52,
  },
  {
    // PAST, never started → "Missed"
    id: "4",
    time: window(-180, 60),
    date: dateStr,
    batch: "JEE Main 2025",
    class: "Class 12",
    topic: "Coordination Compounds",
    subject: "Chemistry",
    streamingLink: "https://meet.google.com/def-ghi-jkl",
    hasAnimations: true,
    hasFacultyNotes: true,
    hasLiveQuiz: false,
    isLive: false,
    duration: "60 min",
    studentsCount: 41,
  },
  {
    // LIVE WINDOW, but no link → "No link"
    id: "5",
    time: window(-5, 60),
    date: dateStr,
    batch: "NEET Biology",
    class: "Class 12",
    topic: "Genetics and Evolution",
    subject: "Biology",
    hasAnimations: false,
    hasFacultyNotes: true,
    hasLiveQuiz: true,
    isLive: false,
    duration: "60 min",
    studentsCount: 33,
  },
  {
    // CANCELLED row
    id: "6",
    time: window(30, 60),
    date: dateStr,
    batch: "JEE Crash Batch",
    class: "Class 12",
    topic: "Thermodynamics Revision",
    subject: "Physics",
    streamingLink: "https://meet.google.com/zzz-yyy-xxx",
    hasAnimations: true,
    hasFacultyNotes: true,
    hasLiveQuiz: false,
    isLive: false,
    duration: "60 min",
    studentsCount: 28,
    status: 'cancelled',
  },
]
