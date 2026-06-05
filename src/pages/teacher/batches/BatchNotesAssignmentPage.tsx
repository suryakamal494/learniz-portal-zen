import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search, 
  Download,
  FileText,
  Copy,
  FileSpreadsheet,
  Printer,
  Plus,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { mockNotesData } from '@/data/mockNotesAssignments'
import { NotesAssignmentItem } from '@/types/batch'

export default function BatchNotesAssignmentPage() {
  const navigate = useNavigate()
  const { batchId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Convert mockNotesData to the expected format
  const mockNotesAssignments = mockNotesData.flatMap(subject => 
    subject.chapters.flatMap(chapter => 
      chapter.notes.map(note => ({
        id: note.id,
        title: note.title,
        institute: 'Sample Institute', // You can modify this as needed
        fileSize: note.fileSize,
        uploadDate: note.uploadedAt,
        isAssigned: false, // You can modify this based on your logic
        notesFor: {
          type: 'Chapter Notes',
          subject: subject.subjectName,
          chapter: chapter.title,
          topic: chapter.description
        }
      }))
    )
  )

  const filteredNotes = useMemo(() => {
    return mockNotesAssignments.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institute.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notesFor.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notesFor.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notesFor.topic.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSearch
    })
  }, [searchQuery])

  const totalPages = Math.ceil(filteredNotes.length / pageSize)
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
    if (selectedItems.size === paginatedNotes.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(paginatedNotes.map(item => item.id)))
    }
  }

  const handleAssignSelected = () => {
    console.log('Assigning notes:', Array.from(selectedItems))
    // Future: API call to assign selected notes to batch
    navigate('/teacher/batches')
  }

  const handleExport = (type: string) => {
    console.log(`Exporting as ${type}`)
    // Future: Implement export functionality
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Add LMS Notes To Class 6 Disha
              </h1>
              <p className="text-gray-600 mt-1">Select and assign notes to your section</p>
            </div>
          </div>
          <Button className="bg-blue-900 hover:bg-blue-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create LMS Notes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Export Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('copy')}
                  className="text-sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  className="text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="text-sm"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('print')}
                  className="text-sm"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 lg:flex-initial lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Selection Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === paginatedNotes.length && paginatedNotes.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({selectedItems.size} of {paginatedNotes.length})
                </Label>
              </div>
              <Button
                onClick={handleAssignSelected}
                disabled={selectedItems.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign Selected ({selectedItems.size})
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16"></TableHead>
                    <TableHead>Institute</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Notes For</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotes.map((note) => (
                    <TableRow key={note.id} className={note.isAssigned ? 'opacity-60' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(note.id)}
                          onCheckedChange={() => handleItemSelect(note.id)}
                          disabled={note.isAssigned}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {note.institute}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{note.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {note.fileSize}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Uploaded: {new Date(note.uploadDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Type:</span> {note.notesFor.type}</p>
                          <p><span className="text-gray-600">Subject:</span> {note.notesFor.subject}</p>
                          <p><span className="text-gray-600">Chapter:</span> {note.notesFor.chapter}</p>
                          <p><span className="text-gray-600">Topic:</span> {note.notesFor.topic}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {note.isAssigned ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Checkbox
                            checked={selectedItems.has(note.id)}
                            onCheckedChange={() => handleItemSelect(note.id)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria to find more notes.
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredNotes.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={filteredNotes.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
