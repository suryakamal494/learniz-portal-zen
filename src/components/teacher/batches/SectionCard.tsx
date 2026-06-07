import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Batch } from '@/types/batch'
import { Button } from '@/components/ui/button'
import { getSectionPalette } from './sectionTheme'

interface Props {
  batch: Batch
  // Kept for backward compatibility with callers; no longer rendered.
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
  return batch.course?.split(/\s+/)[0] || 'General'
}

export function SectionCard({ batch }: Props) {
  const navigate = useNavigate()
  const palette = getSectionPalette(batch.id)
  const subject = deriveSubject(batch)

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className={`h-1 ${palette.accent}`} />
      <div className="p-5 flex-1 flex flex-col">
        <span className={`inline-flex self-start items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${palette.chipBg} ${palette.chipText}`}>
          {batch.class} · {subject}
        </span>

        <h3 className="mt-3 text-base font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem]">
          {batch.name}
        </h3>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => navigate(`/teacher/batches/${batch.id}`)}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium inline-flex items-center gap-1.5"
          >
            Open section
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
