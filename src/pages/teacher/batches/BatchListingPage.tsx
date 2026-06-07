import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockBatches } from '@/data/mockBatches'
import { SectionCard } from '@/components/teacher/batches/SectionCard'

export default function BatchListingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return mockBatches
    return mockBatches.filter(
      b =>
        b.name.toLowerCase().includes(q) ||
        b.class.toLowerCase().includes(q) ||
        b.course.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Lightweight derived counts so cards feel meaningful (UI-only mock).
  const deriveCounts = (id: string) => {
    const n = parseInt(id, 10) || 1
    return {
      lessons: ((n * 3) % 5) + 1,
      notes: ((n * 7) % 6) + 1,
      assessments: ((n * 2) % 4) + 1,
      attendancePct: 55 + ((n * 11) % 40),
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-5">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Sections</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Open a section to manage its students, lessons, notes, assessments and attendance.
            </p>
          </div>
          <Button
            onClick={() => navigate('/teacher/batches/add')}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Create Section
          </Button>
        </div>

        {/* Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sections by name, class or course..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white"
            />
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-3 h-9">
            <LayoutGrid className="h-3.5 w-3.5 text-gray-400" />
            {filteredBatches.length} sections
          </div>
        </div>

        {/* Grid */}
        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-700 font-medium">No sections match your search</p>
            <p className="text-gray-500 text-sm mt-1">Try a different name, class or course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBatches.map(batch => (
              <SectionCard
                key={batch.id}
                batch={batch}
                onPrograms={b => {
                  // Placeholder — destination to be defined.
                  console.log('Programs clicked for', b.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


