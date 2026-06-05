import React from 'react'
import { Users, Percent, ClipboardList } from 'lucide-react'
import { Batch } from '@/types/batch'
import { getInitials, getSectionPalette, metricTone } from './sectionTheme'

interface Props {
  batch: Batch
  attendancePct: number
  assessmentCount: number
}

export function SectionIdentityCard({ batch, attendancePct, assessmentCount }: Props) {
  const palette = getSectionPalette(batch.id)
  const tone = metricTone(attendancePct)
  const fillPct = Math.round((batch.currentStudents / batch.capacity) * 100)

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
              {batch.class} · {batch.course} · ID #{batch.id.padStart(3, '0')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 md:min-w-[420px]">
          <KPI
            icon={<Users className="h-4 w-4" />}
            label="Students"
            value={`${batch.currentStudents}/${batch.capacity}`}
            sub={`${fillPct}% filled`}
          />
          <KPI
            icon={<Percent className="h-4 w-4" />}
            label="Attendance"
            value={`${Math.round(attendancePct)}%`}
            sub={tone.label}
            valueClass={tone.text}
          />
          <KPI
            icon={<ClipboardList className="h-4 w-4" />}
            label="Assessments"
            value={`${assessmentCount}`}
            sub={assessmentCount === 0 ? 'None assigned' : 'Assigned'}
          />
        </div>
      </div>
    </div>
  )
}

function KPI({
  icon,
  label,
  value,
  sub,
  valueClass = 'text-gray-900',
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2.5 bg-gray-50/60">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        {icon} {label}
      </div>
      <div className={`text-lg font-bold mt-0.5 ${valueClass}`}>{value}</div>
      <div className="text-[11px] text-gray-500">{sub}</div>
    </div>
  )
}
