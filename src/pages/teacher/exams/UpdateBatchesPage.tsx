import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, CheckCircle } from 'lucide-react'
import { mockExamsData } from '@/data/mockExamsData'
import { mockBatches } from '@/data/mockBatches'
import { useToast } from '@/hooks/use-toast'

const UpdateBatchesPage: React.FC = () => {
  const navigate = useNavigate()
  const { examId } = useParams()
  const { toast } = useToast()
  
  const [assignType, setAssignType] = useState<'all' | 'specific'>('all')
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const exam = mockExamsData.find(e => e.id === examId)
  const availableBatches = mockBatches.filter(batch => batch.status === 'active')

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    )
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const assignedBatches = assignType === 'all' ? availableBatches.length : selectedBatches.length
    
    toast({
      title: "Sections Updated Successfully",
      description: `Exam "${exam?.title}" has been assigned to ${assignedBatches} section(es).`,
    })
    
    setIsUpdating(false)
    navigate('/teacher/exams')
  }

  const getSelectedBatchNames = () => {
    return availableBatches
      .filter(batch => selectedBatches.includes(batch.id))
      .map(batch => batch.name)
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Exam not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/teacher/exams')}
            className="mt-4"
          >
            Back to Exams
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/teacher/exams')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Sections</h1>
          <p className="text-gray-600 mt-1">
            Assign exam to sections
          </p>
        </div>
      </div>

      {/* Exam Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Exam Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-semibold text-lg">{exam.title}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Duration: {exam.duration} minutes</span>
              <span>Total Marks: {exam.totalMarks}</span>
              <span>Questions: {exam.questionCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Section Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assign To Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to</label>
            <Select value={assignType} onValueChange={(value: 'all' | 'specific') => setAssignType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="specific">Specific Sections</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specific Batches Selection */}
          {assignType === 'specific' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Sections</label>
                <p className="text-xs text-muted-foreground">
                  Choose one or more sections to assign this exam to
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {availableBatches.length > 0 ? (
                  availableBatches.map((batch) => (
                    <div key={batch.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={batch.id}
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={() => handleBatchToggle(batch.id)}
                      />
                      <label 
                        htmlFor={batch.id} 
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.class} • {batch.currentStudents}/{batch.capacity} students
                          </p>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No active sections available
                  </p>
                )}
              </div>

              {/* Selected Batches Summary */}
              {selectedBatches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Selected Batches ({selectedBatches.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedBatchNames().map((name, index) => (
                      <Badge key={index} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Assignment Summary</p>
                <p className="text-sm text-blue-700 mt-1">
                  {assignType === 'all' 
                    ? `This exam will be assigned to all ${availableBatches.length} active sections.`
                    : selectedBatches.length > 0
                    ? `This exam will be assigned to ${selectedBatches.length} selected section(es).`
                    : 'Please select at least one section to proceed.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <Button 
            onClick={handleUpdate}
            disabled={isUpdating || (assignType === 'specific' && selectedBatches.length === 0)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-primary focus:ring-offset-2 font-semibold"
          >
            {isUpdating ? 'Updating...' : 'Update Section Assignment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default UpdateBatchesPage
