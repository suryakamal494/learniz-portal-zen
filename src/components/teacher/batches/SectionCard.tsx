import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, LayoutGrid } from 'lucide-react'
import { Batch } from '@/types/batch'
import { Button } from '@/components/ui/button'
import { getSectionPalette, getInitials } from './sectionTheme'

interface Props {
  batch: Batch
  onPrograms?: (batch: Batch) => void
  // Kept for backward compatibility with callers; no longer rendered.
  lessonCount?: number
  notesCount?: number
  assessmentCount?: number
  attendancePct?: number
}

export function SectionCard({ batch, onPrograms }: Props) {
  const navigate = useNavigate()
  const palette = getSectionPalette(batch.id)
  const initials = getInitials(batch.name)

  return (
    <div
      className={`group relative bg-white rounded-2xl border ${palette.border} shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      {/* Gradient header */}
      <div className={`relative h-24 ${palette.gradient} overflow-hidden`}>
        <Users
          className={`absolute -right-3 -top-3 h-28 w-28 ${palette.iconText} rotate-12 group-hover:rotate-6 transition-transform duration-500`}
          strokeWidth={1.25}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
      </div>

      {/* Avatar tile overlapping */}
      <div className="px-4 -mt-8 relative">
        <div
          className={`h-16 w-16 rounded-2xl ${palette.avatarBg} ${palette.avatarText} ring-4 ring-white shadow-md flex items-center justify-center font-bold text-lg tracking-wide transition-transform duration-300 group-hover:scale-105`}
        >
          {initials}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
        <div className={`text-[11px] font-semibold uppercase tracking-wider ${palette.chipText}`}>
          {batch.class}
        </div>

        <h3 className="mt-1.5 text-[17px] font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem]">
          {batch.name}
        </h3>

        <div className="mt-3 h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            title="Programs"
            onClick={() => onPrograms?.(batch)}
            className="h-9 px-3 text-[13px] font-medium text-gray-700 border-gray-200 hover:bg-gray-50 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 min-w-0"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Programs
          </Button>
          <Button
            title="Open section"
            onClick={() => navigate(`/teacher/batches/${batch.id}`)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 min-w-0"
          >
            Open section
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
