
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, Edit, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockInstructions } from '@/data/mockInstructions'
import InstructionPreviewModal from '@/components/teacher/exams/InstructionPreviewModal'
import type { Instruction } from '@/types/instruction'

export default function InstructionsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  
  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    instruction: Instruction | null
  }>({
    isOpen: false,
    instruction: null
  })

  const handleCreateInstruction = () => {
    navigate('/teacher/exams/instructions/create')
  }

  const handleEditInstruction = (instructionId: string) => {
    navigate(`/teacher/exams/instructions/${instructionId}/edit`)
  }

  const handlePreviewInstruction = (instruction: Instruction) => {
    setPreviewModal({
      isOpen: true,
      instruction
    })
  }

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      instruction: null
    })
  }

  const handleEditFromPreview = (instructionId: string) => {
    handleClosePreview()
    handleEditInstruction(instructionId)
  }

  // Filtering logic
  const filteredInstructions = mockInstructions.filter(instruction => {
    const searchRegex = new RegExp(searchTerm, 'i')
    const subjectMatch = selectedSubject === 'all' ? true : instruction.subject === selectedSubject
    const typeMatch = selectedType === 'all' ? true : instruction.type === selectedType
    const searchMatch = searchTerm ? searchRegex.test(instruction.title) || searchRegex.test(instruction.content) : true

    return subjectMatch && typeMatch && searchMatch
  })

  // Render methods
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam Instructions</h1>
          <p className="text-muted-foreground">Manage exam instructions and guidelines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/teacher/exams')}>
            Back to Assessment
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90" onClick={handleCreateInstruction}>
            <Plus className="h-4 w-4 mr-2" />
            Create Instruction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instructions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="subject-specific">Subject Specific</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructions.map((instruction) => (
          <Card key={instruction.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-blue-500" />
                <Badge variant={instruction.type === 'general' ? 'default' : 'secondary'}>
                  {instruction.type === 'general' ? 'General' : 'Subject Specific'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{instruction.title}</CardTitle>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{instruction.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {instruction.content.substring(0, 100)}...
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Updated: {new Date(instruction.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handlePreviewInstruction(instruction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEditInstruction(instruction.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InstructionPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        instruction={previewModal.instruction}
        onEdit={handleEditFromPreview}
      />
    </div>
  )
}
