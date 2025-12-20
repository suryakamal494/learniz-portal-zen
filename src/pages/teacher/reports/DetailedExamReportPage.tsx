
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Users, BookOpen, Target, TrendingUp, Clock, Calendar, Award, BarChart3, Lightbulb } from 'lucide-react'
import { getDetailedExamReport } from '@/data/mockBatchReports'
import { StudentPerformanceMatrix } from '@/components/teacher/reports/StudentPerformanceMatrix'
import { QuestionAnalysisChart } from '@/components/teacher/reports/QuestionAnalysisChart'
import { TestInsightsReport } from '@/components/teacher/reports/TestInsightsReport'
import { format } from 'date-fns'

export default function DetailedExamReportPage() {
  const { batchId, examId } = useParams<{ batchId: string; examId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('detailed')

  const reportData = examId ? getDetailedExamReport(examId) : null

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher/reports/batch')}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </div>
          <Card className="shadow-lg">
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">Report Not Found</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    The exam report you're looking for doesn't exist or has been removed. Please check the URL and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { examReport, studentResults, questionAnalysis } = reportData

  // Calculate additional stats
  const totalMarks = questionAnalysis.length * 5 // Assuming 5 marks per question
  const avgMarks = (examReport.averagePerformance / 100) * totalMarks
  const passedStudents = studentResults.filter(s => s.passed).length

  const getPerformanceBadgeColor = (percentage: number) => {
    if (percentage >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-200"
    if (percentage >= 75) return "bg-blue-100 text-blue-800 border-blue-200"
    if (percentage >= 65) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 85) return "Excellent"
    if (percentage >= 75) return "Good"
    if (percentage >= 65) return "Average"
    return "Needs Improvement"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/reports/batch')}
                className="w-fit shadow-sm hover:shadow-md transition-all duration-200 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    {examReport.examTitle}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{examReport.batchName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(examReport.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getPerformanceBadgeColor(examReport.averagePerformance)} font-medium`}>
                    <Award className="h-3 w-3 mr-1" />
                    {getPerformanceLabel(examReport.averagePerformance)}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    Class Average: {examReport.averagePerformance.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white shadow-sm border">
            <TabsTrigger 
              value="detailed" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lightbulb className="h-4 w-4" />
              Test Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="mt-6 space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-800">Total Students</CardTitle>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Users className="h-4 w-4 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-blue-900">{examReport.totalStudents}</div>
                  <p className="text-xs text-blue-700">Participated</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-800">Questions</CardTitle>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <BookOpen className="h-4 w-4 text-purple-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-purple-900">{examReport.totalQuestions}</div>
                  <p className="text-xs text-purple-700">Total Items</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-amber-800">Total Marks</CardTitle>
                  <div className="p-2 bg-amber-200 rounded-lg">
                    <Target className="h-4 w-4 text-amber-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-amber-900">{totalMarks}</div>
                  <p className="text-xs text-amber-700">Maximum</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-800">Class Average</CardTitle>
                  <div className="p-2 bg-emerald-200 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-900">{examReport.averagePerformance.toFixed(1)}%</div>
                  <p className="text-xs text-emerald-700">Performance</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-cyan-800">Pass Rate</CardTitle>
                  <div className="p-2 bg-cyan-200 rounded-lg">
                    <Award className="h-4 w-4 text-cyan-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-cyan-900">{examReport.passPercentage.toFixed(1)}%</div>
                  <p className="text-xs text-cyan-700">{passedStudents}/{examReport.totalStudents} passed</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-rose-800">Avg. Score</CardTitle>
                  <div className="p-2 bg-rose-200 rounded-lg">
                    <Clock className="h-4 w-4 text-rose-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold text-rose-900">{avgMarks.toFixed(1)}</div>
                  <p className="text-xs text-rose-700">out of {totalMarks}</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Student Performance Matrix */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">Student Performance Matrix</CardTitle>
                      <p className="text-slate-600 mt-1">Individual question-wise performance analysis</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded shadow-sm"></div>
                        <span className="font-medium text-slate-700">Correct</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                        <span className="font-medium text-slate-700">Wrong</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-500 rounded shadow-sm"></div>
                        <span className="font-medium text-slate-700">Skipped</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <StudentPerformanceMatrix
                    studentResults={studentResults}
                    questionAnalysis={questionAnalysis}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Question Analysis */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Question Analysis</CardTitle>
                    <p className="text-slate-600 mt-1">Detailed breakdown of performance per question</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <QuestionAnalysisChart questionAnalysis={questionAnalysis} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <TestInsightsReport 
              questionAnalysis={questionAnalysis} 
              examReport={examReport} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
