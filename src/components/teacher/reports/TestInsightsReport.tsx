import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquareText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Flag
} from 'lucide-react'
import { QuestionAnalysis, BatchExamReport } from '@/types/batchReport'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TestInsightsReportProps {
  questionAnalysis: QuestionAnalysis[]
  examReport: BatchExamReport
}

export function TestInsightsReport({ questionAnalysis, examReport }: TestInsightsReportProps) {
  const totalStudents = examReport.totalStudents

  // Calculate strengths (≥80% correct)
  const strengths = questionAnalysis.filter(q => q.correctPercentage >= 80)

  // Calculate weaknesses (<40% correct)
  const weaknesses = questionAnalysis.filter(q => q.correctPercentage < 40)

  // Calculate flagged questions ((wrong + skipped) / total > 60%)
  const flaggedQuestions = questionAnalysis.filter(q => {
    const struggleRatio = (q.wrongCount + q.skippedCount) / q.totalStudents
    return struggleRatio > 0.6
  })

  // Distribution buckets
  const highAccuracy = questionAnalysis.filter(q => q.correctPercentage >= 80)
  const mediumAccuracy = questionAnalysis.filter(q => q.correctPercentage >= 40 && q.correctPercentage < 80)
  const lowAccuracy = questionAnalysis.filter(q => q.correctPercentage < 40)

  // Generate plain English summary
  const generateSummary = () => {
    const avgPerformance = examReport.averagePerformance
    let performanceLevel = 'moderate'
    if (avgPerformance >= 80) performanceLevel = 'excellent'
    else if (avgPerformance >= 60) performanceLevel = 'good'
    else if (avgPerformance < 40) performanceLevel = 'poor'

    const bestQuestions = questionAnalysis
      .filter(q => q.correctPercentage >= 80)
      .slice(0, 2)
      .map(q => `Q${q.questionNumber}`)

    const worstQuestions = questionAnalysis
      .filter(q => q.correctPercentage < 50)
      .sort((a, b) => a.correctPercentage - b.correctPercentage)
      .slice(0, 2)
      .map(q => `Q${q.questionNumber}`)

    const passRate = examReport.passPercentage

    let summary = `The class performance in this test was ${performanceLevel} (${avgPerformance.toFixed(1)}% average). `
    
    if (bestQuestions.length > 0) {
      summary += `Students answered ${bestQuestions.join(' and ')} well`
      if (worstQuestions.length > 0) {
        summary += `, but struggled with ${worstQuestions.join(' and ')}`
      }
      summary += '. '
    } else if (worstQuestions.length > 0) {
      summary += `Students struggled with ${worstQuestions.join(' and ')}. `
    }

    summary += `${passRate.toFixed(0)}% of students passed the assessment.`

    return summary
  }

  const isFlagged = (q: QuestionAnalysis) => {
    return (q.wrongCount + q.skippedCount) / q.totalStudents > 0.6
  }

  const getAccuracyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 bg-emerald-50'
    if (percentage >= 40) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Plain English Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageSquareText className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">Test Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed text-base">
            {generateSummary()}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="shadow-lg border-0 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-emerald-800">Strengths</CardTitle>
                <p className="text-sm text-emerald-600">Questions with ≥80% accuracy</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map(q => (
                  <div key={q.questionId} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-slate-800">Question {q.questionNumber}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {q.correctPercentage.toFixed(0)}% correct
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-emerald-600/70">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No questions with ≥80% accuracy</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="shadow-lg border-0 border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-red-800">Weaknesses</CardTitle>
                <p className="text-sm text-red-600">Questions with &lt;40% accuracy</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.map(q => (
                  <div key={q.questionId} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-slate-800">Question {q.questionNumber}</span>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      {q.correctPercentage.toFixed(0)}% correct
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-red-600/70">
                <XCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No questions with &lt;40% accuracy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flagged Questions */}
      <Card className="shadow-lg border-0 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-amber-800">Flagged Questions</CardTitle>
              <p className="text-sm text-amber-600">Questions where &gt;60% students struggled (wrong + skipped)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {flaggedQuestions.length > 0 ? (
            <div className="space-y-3">
              {flaggedQuestions.map(q => {
                const struggleCount = q.wrongCount + q.skippedCount
                const strugglePercent = ((struggleCount / q.totalStudents) * 100).toFixed(0)
                return (
                  <div key={q.questionId} className="p-4 bg-white/60 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Flag className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold text-slate-800">Question {q.questionNumber}</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        {struggleCount}/{q.totalStudents} struggled ({strugglePercent}%)
                      </Badge>
                    </div>
                    <p className="text-sm text-amber-700 ml-8">
                      Only {q.correctCount} out of {q.totalStudents} students answered correctly.
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-amber-600/70">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No flagged questions - students performed well across all questions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question-Level Performance Summary Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Question Performance Summary</CardTitle>
              <p className="text-sm text-slate-600">Detailed breakdown of each question</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Question</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Correct
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Wrong
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MinusCircle className="h-4 w-4 text-amber-500" />
                      Skipped
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Accuracy</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Flagged?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionAnalysis.map(q => (
                  <TableRow key={q.questionId} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">Q{q.questionNumber}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {q.correctCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-medium">
                        {q.wrongCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {q.skippedCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getAccuracyColor(q.correctPercentage)} font-semibold`}>
                        {q.correctPercentage.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {isFlagged(q) ? (
                        <Flag className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">Accuracy Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* High Accuracy */}
            <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-emerald-700">High Accuracy (≥80%)</span>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    {highAccuracy.length} questions
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {highAccuracy.length > 0 
                    ? highAccuracy.map(q => `Q${q.questionNumber}`).join(', ')
                    : 'None'}
                </p>
              </div>
            </div>

            {/* Medium Accuracy */}
            <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <MinusCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-amber-700">Medium Accuracy (40–79%)</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    {mediumAccuracy.length} questions
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {mediumAccuracy.length > 0 
                    ? mediumAccuracy.map(q => `Q${q.questionNumber}`).join(', ')
                    : 'None'}
                </p>
              </div>
            </div>

            {/* Low Accuracy */}
            <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
              <div className="p-2 bg-red-100 rounded-lg shrink-0">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-red-700">Low Accuracy (&lt;40%)</span>
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {lowAccuracy.length} questions
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {lowAccuracy.length > 0 
                    ? lowAccuracy.map(q => `Q${q.questionNumber}`).join(', ')
                    : 'None'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
