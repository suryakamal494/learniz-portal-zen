import React, { useState } from 'react'
import { ChevronRight, FileQuestion, Users2 } from 'lucide-react'
import { ChapterAssessmentRollup } from '@/data/mockSectionAssessments'

interface Props {
  rollups: ChapterAssessmentRollup[]
  onOpenChapterExams: (chapterId: string) => void
}

function toneFor(score: number | null) {
  if (score === null) return 'text-gray-400'
  if (score >= 70) return 'text-emerald-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-rose-700'
}

export function ChapterAssessmentMatrix({ rollups, onOpenChapterExams }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">What it shows</p>
        <h3 className="font-semibold text-gray-900 mt-0.5">Assessments by chapter</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          All {rollups.length} chapters visible at once. Click a row for topic breakdown, or open the exam list to see absentees.
        </p>
      </div>

      {/* Header row */}
      <div className="hidden md:grid grid-cols-[1fr_70px_90px_70px_90px_44px] gap-3 px-5 py-2 text-[11px] uppercase tracking-wide text-gray-500 font-semibold bg-gray-50 border-b border-gray-100">
        <span>Chapter</span>
        <span className="text-right">Tests</span>
        <span className="text-right">Attempts</span>
        <span className="text-right">Avg</span>
        <span className="text-right">Absentees</span>
        <span />
      </div>

      <ul className="divide-y divide-gray-100">
        {rollups.map((r) => {
          const isOpen = expanded === r.chapterId
          const zero = r.testCount === 0
          return (
            <li key={r.chapterId}>
              <button
                onClick={() => setExpanded(isOpen ? null : r.chapterId)}
                className="w-full grid grid-cols-[1fr_70px_90px_70px_90px_44px] gap-3 items-center px-5 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ChevronRight
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {r.order}. {r.chapterName}
                  </span>
                </div>
                <span
                  className={`text-right text-sm font-semibold tabular-nums ${
                    zero ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {zero ? '—' : r.testCount}
                </span>
                <span className="text-right text-sm text-gray-700 tabular-nums">
                  {zero ? '—' : r.attempts}
                </span>
                <span className={`text-right text-sm font-semibold tabular-nums ${toneFor(r.avgScore)}`}>
                  {r.avgScore === null ? '—' : `${r.avgScore}%`}
                </span>
                <span
                  className={`text-right text-sm tabular-nums ${
                    r.absenteeTotal > 0 ? 'text-rose-700 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {zero ? '—' : r.absenteeTotal}
                </span>
                <span />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 bg-gray-50/60 border-t border-gray-100">
                  {zero ? (
                    <div className="py-4 flex items-center gap-3 text-sm text-gray-600">
                      <FileQuestion className="h-4 w-4 text-gray-400" />
                      No assessments conducted for this chapter yet.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1fr_70px_70px_120px] gap-3 px-2 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                        <span>Topic</span>
                        <span className="text-right">Tests</span>
                        <span className="text-right">Avg</span>
                        <span className="text-right">Last conducted</span>
                      </div>
                      <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
                        {r.topics.map((t) => (
                          <li
                            key={t.topicId}
                            className="grid grid-cols-[1fr_70px_70px_120px] gap-3 px-3 py-2 items-center"
                          >
                            <span className="text-sm text-gray-800 truncate">{t.topicName}</span>
                            <span
                              className={`text-right text-sm tabular-nums ${
                                t.testCount === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'
                              }`}
                            >
                              {t.testCount === 0 ? '—' : t.testCount}
                            </span>
                            <span className={`text-right text-sm tabular-nums ${toneFor(t.avgScore)}`}>
                              {t.avgScore === null ? '—' : `${t.avgScore}%`}
                            </span>
                            <span className="text-right text-xs text-gray-500">
                              {t.lastDate
                                ? new Date(t.lastDate).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : '—'}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenChapterExams(r.chapterId)
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <Users2 className="h-4 w-4" />
                          View {r.testCount} assessment{r.testCount === 1 ? '' : 's'} & absentees
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
