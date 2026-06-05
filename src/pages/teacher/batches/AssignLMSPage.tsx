
import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  Clock,
  Check,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { mockLMSAssignments } from '@/data/mockLMSAssignments'
import { LMSAssignmentItem } from '@/types/batch'

export default function AssignLMSPage() {
  const navigate = useNavigate()
  const { batchId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filteredAssignments = useMemo(() => {
    return mockLMSAssignments.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.subject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject
      const matchesType = selectedType === 'all' || item.type === selectedType
      
      return matchesSearch && matchesSubject && matchesType
    })
  }, [searchQuery, selectedSubject, selectedType])

  const totalPages = Math.ceil(filteredAssignments.length / pageSize)
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const subjects = Array.from(new Set(mockLMSAssignments.map(item => item.subject)))
  const types = Array.from(new Set(mockLMSAssignments.map(item => item.type)))

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'video-playlist':
        return <PlayCircle className="h-4 w-4" />
      case 'pdf':
      case 'reading':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
      case 'video-playlist':
        return 'bg-red-100 text-red-800'
      case 'pdf':
      case 'reading':
        return 'bg-blue-100 text-blue-800'
      case 'quiz':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedAssignments.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(paginatedAssignments.map(item => item.id)))
    }
  }

  const handleAssignSelected = () => {
    console.log('Assigning items:', Array.from(selectedItems))
    // Future: API call to assign selected items to batch
    navigate('/teacher/batches')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedItems(new Set()) // Clear selections when changing pages
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    setSelectedItems(new Set()) // Clear selections when changing page size
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/teacher/batches')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assign Lesson Material</h1>
              <p className="text-gray-600 mt-1">Select and assign learning materials to your section</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search lesson materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('-', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {paginatedAssignments.length} of {filteredAssignments.length} items</span>
            <span>•</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex items-center gap-4">
            <Checkbox
              id="select-all"
              checked={selectedItems.size === paginatedAssignments.length && paginatedAssignments.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All on Page ({selectedItems.size} selected)
            </Label>
            <Button
              onClick={handleAssignSelected}
              disabled={selectedItems.size === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedItems.size})
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {paginatedAssignments.map((item) => (
            <Card key={item.id} className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedItems.has(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            } ${item.isAssigned ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleItemSelect(item.id)}
                      disabled={item.isAssigned}
                    />
                    <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  {item.isAssigned && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Assigned
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.subject}
                    </Badge>
                    <Badge className={getTypeColor(item.type)}>
                      {item.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {item.description}
                </p>
                {item.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{item.duration}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more content.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredAssignments.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            totalItems={filteredAssignments.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  )
}
