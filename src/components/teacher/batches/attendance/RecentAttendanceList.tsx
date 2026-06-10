import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarPlus, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRecentAttendance } from '@/data/mockSectionAttendance'
import { mockBatchStudents } from '@/data/mockBatchStudents'

interface Props {
  batchId: string
}

export function RecentAttendanceList({ batchId }: Props) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const days = getRecentAttendance(batchId, 5)
  const studentById = new Map(mockBatchStudents.map((s) => [s.id, s]))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Recent attendance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 5 days · click a day to see who was absent</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/teacher/attendance/mark?batchId=${batchId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <CalendarPlus className="h-4 w-4 mr-1.5" />
            Mark attendance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/reports/attendance')}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {days.map((d) => {
          const present = d.totalStudents - d.absentStudentIds.length
          const pct = d.isHoliday ? 0 : Math.round((present / d.totalStudents) * 10)
          const isOpen = expanded === d.date
          const canExpand = !d.isHoliday && d.absentStudentIds.length > 0

          return (
            <li key={d.date}>
              <button
                onClick={() => canExpand && setExpanded(isOpen ? null : d.date)}
                disabled={!canExpand}
                className={`w-full px-5 py-3 flex items-center gap-4 text-left ${
                  canExpand ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="text-sm font-medium text-gray-900 w-28 shrink-0">{d.label}</span>

                {d.isHoliday ? (
                  <span className="flex-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center w-fit">
                    Holiday
                  </span>
                ) : (
                  <>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < pct ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="flex-1 text-sm text-gray-700 tabular-nums">
                      {present} / {d.totalStudents} present
                    </span>
                    <span
                      className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                        d.absentStudentIds.length === 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {d.absentStudentIds.length === 0
                        ? 'All present'
                        : `${d.absentStudentIds.length} absent`}
                    </span>
                    {canExpand &&
                      (isOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      ))}
                  </>
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 bg-rose-50/30 border-t border-gray-100">
                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-600 pt-3 mb-2">
                    Absent students
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {d.absentStudentIds.map((id) => {
                      const s = studentById.get(id)
                      if (!s) return null
                      return (
                        <li key={id} className="flex items-center gap-2 text-sm text-gray-800">
                          <span className="h-7 w-7 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center justify-center">
                            {s.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </span>
                          <span className="flex-1 truncate">{s.name}</span>
                          <span className="text-xs text-gray-500">{s.rollNumber}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
