import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockBatches } from '@/data/mockBatches'
import { SectionIdentityCard } from '@/components/teacher/batches/SectionIdentityCard'
import { SectionQuickActions } from '@/components/teacher/batches/SectionQuickActions'
import { SectionTabs } from '@/components/teacher/batches/SectionTabs'
import { SectionProgramsSummary } from '@/components/teacher/batches/SectionProgramsSummary'

export default function SectionWorkspacePage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const batch = mockBatches.find(b => b.id === batchId)

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-700 font-medium">Section not found</p>
          <Button onClick={() => navigate('/teacher/batches')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            Back to My Sections
          </Button>
        </div>
      </div>
    )
  }

  const n = parseInt(batch.id, 10) || 1
  const counts = {
    lessons: ((n * 3) % 5) + 1,
    notes: ((n * 7) % 6) + 1,
    assessments: ((n * 2) % 4) + 1,
  }
  const attendancePct = 55 + ((n * 11) % 40)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/teacher/batches')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-700 hover:bg-white hover:border-gray-200 border border-transparent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            My Sections
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium truncate">{batch.name}</span>
        </div>

        <SectionIdentityCard
          batch={batch}
          attendancePct={attendancePct}
          assessmentCount={counts.assessments}
        />

        <SectionProgramsSummary batchId={batch.id} />

        <SectionTabs batch={batch} attendancePct={attendancePct} counts={counts} />

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Other quick actions</h3>
          <SectionQuickActions batchId={batch.id} />
        </div>
      </div>
    </div>
  )
}
