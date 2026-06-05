
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Clock,
  Trophy,
  Users,
  BookOpen,
  Edit,
  Settings
} from 'lucide-react'
import { mockExamsData } from '@/data/mockExamsData'
import type { ExamData } from '@/types/exam'
import { useToast } from '@/hooks/use-toast'

const ExamsMainPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [exams, setExams] = useState<ExamData[]>(mockExamsData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateExam = () => {
    navigate('/teacher/exams/create')
  }

  const handleUpdateQuestions = (examId: string) => {
    navigate(`/teacher/exams/${examId}/update-questions`)
  }

  const handleUpdateBatches = (examId: string) => {
    navigate(`/teacher/exams/${examId}/update-batches`)
  }

  const handleEditExam = (examId: string) => {
    navigate(`/teacher/exams/${examId}/edit`)
  }

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'Practice Test':
        return 'bg-blue-100 text-blue-800'
      case 'Mock Test':
        return 'bg-purple-100 text-purple-800'
      case 'Final Exam':
        return 'bg-red-100 text-red-800'
      case 'Quiz':
        return 'bg-green-100 text-green-800'
      case 'Assessment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage all your assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateExam} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
          <Button 
            variant="outline"
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
          >
            ✨ AI Test Generator
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, exam) => sum + exam.totalMarks, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Marks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, exam) => sum + exam.batchCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Assigned Sections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? 'No assessments found matching your search.' : 'No assessments created yet.'}
                      </div>
                      {!searchTerm && (
                        <Button 
                          variant="outline" 
                          onClick={handleCreateExam}
                          className="mt-2"
                        >
                          Create Your First Assessment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.title}</div>
                          <div className="text-sm text-gray-500">
                            Created {new Date(exam.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{exam.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{exam.totalMarks}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getExamTypeColor(exam.examType)}>
                          {exam.examType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{exam.questionCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{exam.batchCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateQuestions(exam.id)}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Update Questions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateBatches(exam.id)}>
                              <Users className="h-4 w-4 mr-2" />
                              Update Sections
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditExam(exam.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExamsMainPage
