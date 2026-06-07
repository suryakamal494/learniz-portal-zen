import React from 'react'
import { Users } from 'lucide-react'
import { Batch } from '@/types/batch'
import { getInitials, getSectionPalette } from './sectionTheme'

interface Props {
  batch: Batch
  // Retained for backward compatibility; no longer displayed.
  attendancePct?: number
  assessmentCount?: number
}

export function SectionIdentityCard({ batch }: Props) {
  const palette = getSectionPalette(batch.id)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`h-1.5 ${palette.accent}`} />
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`h-14 w-14 rounded-2xl flex items-center justify-center font-semibold text-lg ${palette.avatarBg} ${palette.avatarText} ring-4 ${palette.ring}`}
          >
            {getInitials(batch.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{batch.name}</h2>
            <p className="text-sm text-gray-500 truncate">
              {batch.class} · {batch.course}
            </p>
          </div>
        </div>

        <div className="md:min-w-[180px]">
          <div className="rounded-xl border border-gray-100 px-4 py-2.5 bg-gray-50/60">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Users className="h-4 w-4" /> Students
            </div>
            <div className="text-lg font-bold mt-0.5 text-gray-900">
              {batch.currentStudents} students
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
