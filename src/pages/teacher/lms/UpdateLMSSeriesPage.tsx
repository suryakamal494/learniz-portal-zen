
import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { mockLMSSeries } from '@/data/mockLMSSeries'
import { mockLMSContent } from '@/data/mockLMSContent'
import { LMSContentItem } from '@/types/lmsContent'
import { ContentFiltersPanel } from '@/components/teacher/lms/update/ContentFiltersPanel'
import { ContentTable } from '@/components/teacher/lms/update/ContentTable'
import { SelectedItemsPanel } from '@/components/teacher/lms/update/SelectedItemsPanel'
import { ContentPreviewModal } from '@/components/teacher/lms/update/ContentPreviewModal'

export interface ContentFilters {
  subject: string
  chapter: string
  topic: string
  category: string
  questionBankType: string
}

const UpdateLMSSeriesPage = () => {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  
  // Find the series being updated
  const series = mockLMSSeries.find(s => s.id === seriesId)
  
  // State management
  const [filters, setFilters] = useState<ContentFilters>({
    subject: series?.subject || '',
    chapter: series?.chapter || '',
    topic: series?.topic || '',
    category: '',
    questionBankType: ''
  })
  
  const [selectedItems, setSelectedItems] = useState<LMSContentItem[]>([])
  const [previewItem, setPreviewItem] = useState<LMSContentItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter available content based on selected filters
  const filteredContent = useMemo(() => {
    return mockLMSContent.filter(content => {
      if (filters.subject && content.subject !== filters.subject) return false
      if (filters.chapter && content.chapter !== filters.chapter) return false
      if (filters.topic && content.topic !== filters.topic) return false
      // Add more filter logic as needed for category and questionBankType
      return true
    })
  }, [filters])

  // Get selected item IDs for quick lookup
  const selectedItemIds = useMemo(() => 
    new Set(selectedItems.map(item => item.id)), [selectedItems]
  )

  const handleFilterChange = (key: keyof ContentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset dependent filters when parent changes
      ...(key === 'subject' && { chapter: '', topic: '' }),
      ...(key === 'chapter' && { topic: '' })
    }))
  }

  const handleAddItem = (item: LMSContentItem) => {
    if (!selectedItemIds.has(item.id)) {
      setSelectedItems(prev => [...prev, item])
      toast.success(`Added "${item.title}" to series`)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId))
    toast.success('Item removed from series')
  }

  const handleRemoveAll = () => {
    setSelectedItems([])
    toast.success('All items removed from series')
  }

  const handlePreview = (item: LMSContentItem) => {
    setPreviewItem(item)
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Series "${series?.title}" updated successfully!`)
      navigate('/teacher/lms/series')
    } catch (error) {
      toast.error('Failed to update series. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (selectedItems.length > 0) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/teacher/lms/series')
      }
    } else {
      navigate('/teacher/lms/series')
    }
  }

  if (!series) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Series Not Found</h2>
          <p className="text-gray-600 mb-6">The series you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teacher/lms/series')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Series
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Update Series: {series.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {series.subject} • {series.chapter} • {series.topic}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedItems.length} items selected
          </span>
          <Button
            onClick={() => navigate('/teacher/lms/content')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            + Create Lesson Material
          </Button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Filters and Content */}
        <div className="lg:col-span-3 space-y-6">
          <ContentFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            series={series}
          />
          
          <ContentTable
            content={filteredContent}
            selectedItemIds={selectedItemIds}
            onAddItem={handleAddItem}
            onPreview={handlePreview}
          />
        </div>

        {/* Right Panel - Selected Items */}
        <div className="lg:col-span-2">
          <SelectedItemsPanel
            selectedItems={selectedItems}
            onRemoveItem={handleRemoveItem}
            onRemoveAll={handleRemoveAll}
            onUpdate={handleUpdate}
            onPreview={handlePreview}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <ContentPreviewModal
          item={previewItem}
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  )
}

export default UpdateLMSSeriesPage
