
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Calendar, Clock, Trophy, Settings } from 'lucide-react'
import type { ExamFormData } from '@/types/exam'
import { useToast } from '@/hooks/use-toast'

const CreateExamPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    category: 'Subject Exam',
    duration: 60,
    marksPerQuestion: 4,
    totalMarks: 100,
    passPercentage: 40,
    negativeMark: 1,
    startDate: '',
    endDate: '',
    startTime: '',
    examType: 'No Section, No Timer'
  })
  
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (field: keyof ExamFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateExam = async () => {
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an exam title.",
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error", 
        description: "Please select start and end dates.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Exam Created Successfully",
        description: `"${formData.title}" has been created and is ready for configuration.`,
      })
      
      navigate('/teacher/exams')
    } catch (error) {
      toast({
        title: "Error Creating Exam",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
          <p className="text-gray-600 mt-1">
            Set up a new assessment with detailed configuration
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Assessment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assessment title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: 'Subject Exam' | 'Quiz' | 'LMS Exam') => 
                      handleInputChange('category', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Subject Exam">Subject Exam</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="LMS Exam">LMS Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Exam Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Exam Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marksPerQuestion" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Marks per Question
                  </Label>
                  <Input
                    id="marksPerQuestion"
                    type="number"
                    value={formData.marksPerQuestion}
                    onChange={(e) => handleInputChange('marksPerQuestion', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passPercentage">Pass Percentage (%)</Label>
                  <Input
                    id="passPercentage"
                    type="number"
                    value={formData.passPercentage}
                    onChange={(e) => handleInputChange('passPercentage', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="negativeMark">Negative Marking</Label>
                  <Input
                    id="negativeMark"
                    type="number"
                    step="0.25"
                    value={formData.negativeMark}
                    onChange={(e) => handleInputChange('negativeMark', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Exam Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Exam Type</h3>
              
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Structure</Label>
                <Select 
                  value={formData.examType} 
                  onValueChange={(value: 'No Section, No Timer' | 'Section with No Timer' | 'Section with Timer') => 
                    handleInputChange('examType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Section, No Timer">No Section, No Timer</SelectItem>
                    <SelectItem value="Section with No Timer">Section with No Timer</SelectItem>
                    <SelectItem value="Section with Timer">Section with Timer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/exams')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateExam}
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isCreating ? 'Creating Assessment...' : 'Create Assessment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateExamPage
