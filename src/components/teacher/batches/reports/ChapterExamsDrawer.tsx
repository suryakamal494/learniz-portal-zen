import React, { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronDown, ChevronRight, UserX, BellRing } from 'lucide-react'
import { SectionExam } from '@/data/mockSectionAssessments'
import { mockBatchStudents } from '@/data/mockBatchStudents'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  chapterName: string
  exams: SectionExam[]
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function ChapterExamsDrawer({ open, onOpenChange, chapterName, exams }: Props) {
  const [expandedExam, setExpandedExam] = useState<string | null>(null)
  const { toast } = useToast()

  const studentById = new Map(mockBatchStudents.map((s) => [s.id, s]))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">
            Assessments — <span className="text-gray-600 font-normal">{chapterName}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {exams.length === 0 ? (
            <div className="text-sm text-gray-500 py-10 text-center">
              No assessments conducted for this chapter yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {exams.map((ex) => {
                const isOpen = expandedExam === ex.id
                const absentees = ex.absentStudentIds
                  .map((id) => studentById.get(id))
                  .filter(Boolean)
                return (
                  <li
                    key={ex.id}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedExam(isOpen ? null : ex.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ex.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ex.topicName} · {fmtDate(ex.date)} · Avg {ex.avgScore}%
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          absentees.length === 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <UserX className="h-3 w-3" />
                        {absentees.length === 0 ? 'All present' : `Absent ${absentees.length}`}
                      </span>
                      {absentees.length > 0 &&
                        (isOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        ))}
                    </button>

                    {isOpen && absentees.length > 0 && (
                      <div className="border-t border-gray-100 bg-rose-50/30 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-600">
                            Absent students
                          </p>
                          <button
                            onClick={() =>
                              toast({
                                title: 'Reminder sent',
                                description: `${absentees.length} students notified about ${ex.title}.`,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50"
                          >
                            <BellRing className="h-3.5 w-3.5" />
                            Notify all
                          </button>
                        </div>
                        <ul className="space-y-1.5">
                          {absentees.map((s) => (
                            <li
                              key={s!.id}
                              className="flex items-center gap-2 text-sm text-gray-800"
                            >
                              <span className="h-7 w-7 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center justify-center">
                                {s!.name
                                  .split(' ')
                                  .map((p) => p[0])
                                  .slice(0, 2)
                                  .join('')}
                              </span>
                              <span className="flex-1 truncate">{s!.name}</span>
                              <span className="text-xs text-gray-500">{s!.rollNumber}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
