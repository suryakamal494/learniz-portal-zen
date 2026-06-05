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

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className={`h-1.5 ${palette.accent}`} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${palette.chipBg} ${palette.chipText}`}>
            {batch.class} · {batch.course}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-gray-900 leading-tight">{batch.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">ID #{batch.id.padStart(3, '0')}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Users className="h-3 w-3" /> Students
            </div>
            <div className="text-sm font-semibold text-gray-900 mt-0.5">
              {batch.currentStudents}/{batch.capacity}
            </div>
          </div>
          <div className={`rounded-lg border border-gray-100 px-3 py-2`}>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Percent className="h-3 w-3" /> Attendance
            </div>
            <div className={`text-sm font-semibold mt-0.5 ${tone.text}`}>
              {Math.round(attendancePct)}%
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3 text-blue-600" /> {lessonCount} Lessons</span>
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3 text-emerald-600" /> {notesCount} Notes</span>
          <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3 text-purple-600" /> {assessmentCount} Assess.</span>
        </div>

        <Button
          onClick={() => navigate(`/teacher/batches/${batch.id}`)}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Open section
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
