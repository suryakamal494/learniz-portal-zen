
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  BookOpen, 
  FileText, 
  BarChart3, 
  MoreVertical,
  Users,
  Copy,
  FileSpreadsheet,
  Download,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { mockBatches } from '@/data/mockBatches'
import { Batch } from '@/types/batch'

export default function BatchListingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredBatches = useMemo(() => {
    return mockBatches.filter(batch =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.course.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const totalPages = Math.ceil(filteredBatches.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedBatches = filteredBatches.slice(startIndex, startIndex + pageSize)

  const handleExport = (type: string) => {
    console.log(`Exporting as ${type}`)
    // Future implementation for export functionality
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Batches</h1>
            <p className="text-gray-600 mt-1">Manage and organize your student batches</p>
          </div>
          <Button 
            onClick={() => navigate('/teacher/batches/add')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('copy')}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('print')}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Class & Course</TableHead>
                <TableHead className="font-semibold">Students</TableHead>
                <TableHead className="font-semibold text-center">Assign Lessons</TableHead>
                <TableHead className="font-semibold text-center">Assign Study Notes</TableHead>
                <TableHead className="font-semibold text-center">Exam Report</TableHead>
                <TableHead className="font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBatches.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{batch.name}</div>
                      <div className="text-sm text-gray-500">Created {batch.createdAt}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{batch.class}</div>
                      <div className="text-sm text-gray-500">{batch.course}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{batch.currentStudents}/{batch.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/teacher/batches/${batch.id}/assign-lms`)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/teacher/batches/${batch.id}/assign-notes`)}
                      className="h-8 w-8 p-0 hover:bg-green-50"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/teacher/batches/${batch.id}/exam-report`)}
                      className="h-8 w-8 p-0 hover:bg-purple-50"
                    >
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/teacher/batches/${batch.id}/students`)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Students
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={filteredBatches.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
