import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Percent, ArrowRight, BookOpen, FileText, ClipboardList } from 'lucide-react'
import { Batch } from '@/types/batch'
import { Button } from '@/components/ui/button'
import { getSectionPalette, metricTone } from './sectionTheme'

interface Props {
  batch: Batch
  lessonCount?: number
  notesCount?: number
  assessmentCount?: number
  attendancePct?: number
}

const KNOWN_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Maths', 'Biology', 'Botany', 'Zoology', 'English']

function deriveSubject(batch: Batch): string {
  const haystack = `${batch.name} ${batch.course}`
  const hit = KNOWN_SUBJECTS.find(s => haystack.toLowerCase().includes(s.toLowerCase()))
  if (hit) return hit === 'Maths' ? 'Mathematics' : hit
  // Fallback: first word of course
  return batch.course?.split(/\s+/)[0] || 'General'
}

export function SectionCard({
  batch,
  lessonCount = 0,
  notesCount = 0,
  assessmentCount = 0,
  attendancePct = 0,
}: Props) {
  const navigate = useNavigate()
  const palette = getSectionPalette(batch.id)
  const tone = metricTone(attendancePct)
  const subject = deriveSubject(batch)

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className={`h-1 ${palette.accent}`} />
      <div className="p-4 flex-1 flex flex-col">
        <span className={`inline-flex self-start items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${palette.chipBg} ${palette.chipText}`}>
          {batch.class} · {subject}
        </span>

        <h3 className="mt-2 text-base font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem]">
          {batch.name}
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-gray-100 px-2.5 py-1.5">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Users className="h-3 w-3" /> Students
            </div>
            <div className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">
              {batch.currentStudents}/{batch.capacity}
            </div>
          </div>
          <div className="rounded-md border border-gray-100 px-2.5 py-1.5">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Percent className="h-3 w-3" /> Attendance
            </div>
            <div className={`text-sm font-semibold leading-tight mt-0.5 ${tone.text}`}>
              {Math.round(attendancePct)}%
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3 text-blue-600" /> {lessonCount} Lessons</span>
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-emerald-600" /> {notesCount} Notes</span>
          <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3 text-purple-600" /> {assessmentCount} Assess.</span>
        </div>

        <Button
          onClick={() => navigate(`/teacher/batches/${batch.id}`)}
          className="mt-auto pt-0 h-9 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          style={{ marginTop: 'auto' }}
        >
          <span className="mt-3 sr-only" />
          Open section
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
