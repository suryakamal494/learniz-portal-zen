
import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserX,
  Save,
  X,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { useToast } from '@/hooks/use-toast'
import { mockStudents, getStudentsAssignedToBatch, getAvailableClasses, updateBatchAssignments } from '@/data/mockStudents'
import { mockBatches } from '@/data/mockBatches'
import { Student, StudentFilters, StudentSelectionState } from '@/types/student'

export default function ViewStudentsPage() {
  const navigate = useNavigate()
  const { batchId } = useParams<{ batchId: string }>()
  const { toast } = useToast()
  
  // Find the current batch
  const currentBatch = mockBatches.find(batch => section.id === batchId)
  
  // State management
  const [filters, setFilters] = useState<StudentFilters>({ search: '', class: 'all' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize selection state
  const [selectionState, setSelectionState] = useState<StudentSelectionState>(() => {
    const assignedStudents = new Set(getStudentsAssignedToBatch(batchId || ''))
    return {
      originalAssignments: assignedStudents,
      currentSelections: new Set(assignedStudents),
      pendingAdditions: new Set(),
      pendingRemovals: new Set()
    }
  })

  // Filter and paginate students
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          student.rollNumber.toLowerCase().includes(filters.search.toLowerCase())
      const matchesClass = filters.class === 'all' || student.class === filters.class
      return matchesSearch && matchesClass
    })
  }, [filters])

  const totalPages = Math.ceil(filteredStudents.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize)

  // Update pending changes when selections change
  useEffect(() => {
    const pendingAdditions = new Set<string>()
    const pendingRemovals = new Set<string>()

    selectionState.currentSelections.forEach(studentId => {
      if (!selectionState.originalAssignments.has(studentId)) {
        pendingAdditions.add(studentId)
      }
    })

    selectionState.originalAssignments.forEach(studentId => {
      if (!selectionState.currentSelections.has(studentId)) {
        pendingRemovals.add(studentId)
      }
    })

    setSelectionState(prev => ({
      ...prev,
      pendingAdditions,
      pendingRemovals
    }))
  }, [selectionState.currentSelections, selectionState.originalAssignments])

  // Handle individual student selection
  const handleStudentToggle = (studentId: string, checked: boolean) => {
    setSelectionState(prev => {
      const newSelections = new Set(prev.currentSelections)
      if (checked) {
        newSelections.add(studentId)
      } else {
        newSelections.delete(studentId)
      }
      return { ...prev, currentSelections: newSelections }
    })
  }

  // Handle bulk selection for current page
  const handleBulkToggle = (action: 'all' | 'none' | 'assigned') => {
    setSelectionState(prev => {
      const newSelections = new Set(prev.currentSelections)
      
      paginatedStudents.forEach(student => {
        if (action === 'all') {
          newSelections.add(student.id)
        } else if (action === 'none') {
          newSelections.delete(student.id)
        } else if (action === 'assigned') {
          if (prev.originalAssignments.has(student.id)) {
            newSelections.add(student.id)
          } else {
            newSelections.delete(student.id)
          }
        }
      })
      
      return { ...prev, currentSelections: newSelections }
    })
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const finalStudentIds = Array.from(selectionState.currentSelections)
      await updateBatchAssignments(batchId || '', finalStudentIds)
      
      // Update original assignments to match current selections
      setSelectionState(prev => ({
        ...prev,
        originalAssignments: new Set(prev.currentSelections),
        pendingAdditions: new Set(),
        pendingRemovals: new Set()
      }))
      
      toast({
        title: "Success",
        description: `Student assignments updated successfully for ${currentBatch?.name || 'section'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student assignments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset changes
  const handleReset = () => {
    setSelectionState(prev => ({
      ...prev,
      currentSelections: new Set(prev.originalAssignments),
      pendingAdditions: new Set(),
      pendingRemovals: new Set()
    }))
  }

  const hasChanges = selectionState.pendingAdditions.size > 0 || selectionState.pendingRemovals.size > 0

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Manage Students
              </h1>
              <p className="text-gray-600 mt-1">
                {currentBatch?.name || 'Section'} - {selectionState.currentSelections.size} students assigned
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or roll number..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.class}
              onValueChange={(value) => setFilters(prev => ({ ...prev, class: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {getAvailableClasses().map(className => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filters.search || filters.class !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ search: '', class: 'all' })}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions & Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkToggle('all')}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkToggle('none')}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Select None
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkToggle('assigned')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Reset to Assigned
            </Button>
          </div>
          
          {hasChanges && (
            <div className="flex items-center gap-2">
              {selectionState.pendingAdditions.size > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <UserCheck className="h-3 w-3 mr-1" />
                  +{selectionState.pendingAdditions.size}
                </Badge>
              )}
              {selectionState.pendingRemovals.size > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <UserX className="h-3 w-3 mr-1" />
                  -{selectionState.pendingRemovals.size}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Student Name</TableHead>
                <TableHead className="font-semibold">Roll Number</TableHead>
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="font-semibold text-center">Current Status</TableHead>
                <TableHead className="font-semibold text-center">Assign to Section</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => {
                const isOriginallyAssigned = selectionState.originalAssignments.has(student.id)
                const isCurrentlySelected = selectionState.currentSelections.has(student.id)
                const isPendingAddition = selectionState.pendingAdditions.has(student.id)
                const isPendingRemoval = selectionState.pendingRemovals.has(student.id)
                
                return (
                  <TableRow 
                    key={student.id} 
                    className={`hover:bg-gray-50 ${
                      isPendingAddition ? 'bg-green-50' : 
                      isPendingRemoval ? 'bg-red-50' : 
                      isOriginallyAssigned ? 'bg-blue-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{student.rollNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.class}</div>
                        {student.section && (
                          <div className="text-sm text-gray-500">Section {student.section}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isOriginallyAssigned ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Not Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isCurrentlySelected}
                        onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                        className="h-5 w-5"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

        {/* Fixed Save Button */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50 flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
