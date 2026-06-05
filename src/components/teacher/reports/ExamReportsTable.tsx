
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { BatchExamReport } from '@/types/batchReport'
import { format } from 'date-fns'

interface ExamReportsTableProps {
  reports: BatchExamReport[]
  onViewReport: (examId: string, batchId: string) => void
}

export function ExamReportsTable({ reports, onViewReport }: ExamReportsTableProps) {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (percentage >= 70) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Section Name</TableHead>
            <TableHead>Exam Title</TableHead>
            <TableHead>Average Performance</TableHead>
            <TableHead>Pass Percentage</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {format(new Date(report.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{report.batchName}</TableCell>
              <TableCell>{report.examTitle}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPercentage(report.averagePerformance)}</span>
                  {getPerformanceBadge(report.averagePerformance)}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{formatPercentage(report.passPercentage)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {report.totalStudents} students
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport(report.examId, report.batchId)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
