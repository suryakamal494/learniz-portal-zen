import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, ClipboardList, CalendarPlus, CheckSquare, BookOpenCheck } from 'lucide-react'

interface Props {
  batchId: string
}

export function SectionQuickActions({ batchId }: Props) {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Programs',
      icon: BookOpenCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => navigate(`/teacher/batches/${batchId}/programs`),
    },
    {
      label: 'Assign Lesson Plan',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      onClick: () => navigate(`/teacher/batches/${batchId}/assign-lms`),
    },
    {
      label: 'Assign Study Notes',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => navigate(`/teacher/batches/${batchId}/assign-notes`),
    },
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
    {
      label: 'Mark Attendance',
      icon: CheckSquare,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      onClick: () => navigate(`/teacher/reports/attendance?batchId=${batchId}`),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all px-4 py-4 text-left flex flex-col items-start gap-2 min-h-[96px]"
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
