import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CalendarPlus } from 'lucide-react'

interface Props {
  batchId: string
}

export function SectionQuickActions({ batchId }: Props) {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Assign Assessment',
      icon: ClipboardList,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      onClick: () => navigate(`/teacher/exams?batchId=${batchId}`),
    },
    {
      label: 'Schedule Class',
      icon: CalendarPlus,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      onClick: () => navigate(`/teacher/schedule/create?batchId=${batchId}`),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 max-w-md">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all px-4 py-3 text-left flex items-center gap-3"
        >
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.bg}`}>
            <a.icon className={`h-4 w-4 ${a.color}`} />
          </span>
          <span className="text-sm font-medium text-gray-900 leading-snug">{a.label}</span>
        </button>
      ))}
    </div>
  )
}
