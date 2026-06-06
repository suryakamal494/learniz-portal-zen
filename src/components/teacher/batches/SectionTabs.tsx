import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Batch, BatchStudent } from '@/types/batch'
import { mockBatchStudents } from '@/data/mockBatchStudents'
import { getInitials, metricTone } from './sectionTheme'
import { Users, ArrowRight } from 'lucide-react'

interface Props {
  batch: Batch
  attendancePct: number
  counts: { lessons: number; notes: number; assessments: number }
}

export function SectionTabs({ batch, attendancePct, counts }: Props) {
  const navigate = useNavigate()
  const students: BatchStudent[] = mockBatchStudents.slice(0, batch.currentStudents)

  return (
    <Tabs defaultValue="students" className="w-full">
      <TabsList className="bg-white border border-gray-200 rounded-xl p-1 h-auto w-full sm:w-auto overflow-x-auto">
        <TabsTrigger value="students" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-2">
          Students
        </TabsTrigger>
        <TabsTrigger value="reports" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-2">
          Reports
        </TabsTrigger>
        <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-2">
          Attendance
        </TabsTrigger>
      </TabsList>

      {/* Students */}
      <TabsContent value="students" className="mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{students.length} students enrolled</h3>
              <p className="text-xs text-gray-500">Quick roster for this section.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/teacher/batches/${batch.id}/students`)}
              className="text-sm"
            >
              View full roster
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
          {students.length === 0 ? (
            <EmptyRow icon={<Users className="h-5 w-5" />} text="No students enrolled yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.map((s, i) => {
                const tone = metricTone(s.performance)
                return (
                  <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500">Roll #{String(i + 1).padStart(2, '0')}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tone.bg} ${tone.text}`}>
                      {Math.round(s.performance)}%
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </TabsContent>

      {/* Reports */}
      <TabsContent value="reports" className="mt-4">
        <SummaryPanel
          title="Assessment performance for this section"
          headline={`${Math.max(40, 100 - Math.round(attendancePct / 2))}% average score`}
          meaning="A section-level summary of how students are performing across assigned assessments."
          ctaLabel="Open detailed reports"
          onCta={() => navigate('/teacher/reports/batch-reports')}
        />
      </TabsContent>

      {/* Attendance */}
      <TabsContent value="attendance" className="mt-4">
        <SummaryPanel
          title="Attendance for this section"
          headline={`${Math.round(attendancePct)}% present this month`}
          meaning={
            attendancePct >= 70
              ? 'Healthy attendance. Keep reinforcing the routine.'
              : attendancePct >= 40
              ? 'Moderate — a few students are slipping. Worth a check-in.'
              : 'Low attendance. Consider following up with families.'
          }
          ctaLabel="Open attendance"
          onCta={() => navigate('/teacher/reports/attendance')}
        />
      </TabsContent>

    </Tabs>
  )
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
      <span className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </span>
      {text}
    </div>
  )
}

function SummaryPanel({
  title,
  headline,
  meaning,
  ctaLabel,
  onCta,
}: {
  title: string
  headline: string
  meaning: string
  ctaLabel: string
  onCta: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">What it shows</p>
      <h3 className="mt-1 font-semibold text-gray-900">{title}</h3>

      <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs text-blue-700 font-medium">Headline</p>
        <p className="text-lg font-bold text-blue-900 mt-0.5">{headline}</p>
      </div>

      <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mt-4">What it means</p>
      <p className="text-sm text-gray-700 mt-1">{meaning}</p>

      <div className="mt-5">
        <Button onClick={onCta} className="bg-blue-600 hover:bg-blue-700 text-white">
          {ctaLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function ContentTile({
  icon,
  tint,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode
  tint: string
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className={`h-9 w-9 rounded-lg ${tint} flex items-center justify-center`}>{icon}</div>
      <p className="mt-3 text-sm text-gray-500">{label} assigned</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{count}</p>
      <p className="text-xs text-blue-700 mt-2 inline-flex items-center">
        Manage <ArrowRight className="h-3 w-3 ml-1" />
      </p>
    </button>
  )
}
