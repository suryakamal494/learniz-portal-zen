
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, BarChart3, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"

const batchReports = [
  {
    id: "1",
    examTitle: "Physics Chapter Test - Mechanics",
    batchName: "JEE Advanced 2025",
    date: "2024-08-12",
    averageScore: 76.5,
    totalStudents: 45,
    completedStudents: 42
  },
  {
    id: "2", 
    examTitle: "Chemistry Unit Test - Organic",
    batchName: "NEET 2025",
    date: "2024-08-11",
    averageScore: 82.3,
    totalStudents: 38,
    completedStudents: 35
  },
  {
    id: "3",
    examTitle: "Mathematics Weekly Assessment",
    batchName: "Foundation Course",
    date: "2024-08-10", 
    averageScore: 68.7,
    totalStudents: 52,
    completedStudents: 48
  }
]

export function ModernBatchReports() {
  const navigate = useNavigate()

  const getSubjectColor = (examTitle: string) => {
    if (examTitle.toLowerCase().includes('physics')) {
      return "text-blue-600 hover:text-blue-700"
    }
    if (examTitle.toLowerCase().includes('chemistry')) {
      return "text-emerald-600 hover:text-emerald-700"
    }
    if (examTitle.toLowerCase().includes('mathematics')) {
      return "text-purple-600 hover:text-purple-700"
    }
    return "text-indigo-600 hover:text-indigo-700"
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (score >= 70) return "bg-blue-100 text-blue-700 border-blue-200"
    if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

  const handleViewReport = (reportId: string) => {
    navigate(`/teacher/reports/batch/batch-${reportId}/exam/exam-${reportId}`)
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recent Section Reports
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/teacher/reports/batch')}
            className="hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {batchReports.map((report, index) => (
            <Card 
              key={report.id}
              className="border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group animate-fade-in hover:border-slate-300"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleViewReport(report.id)}
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className={`font-semibold transition-colors leading-tight text-lg ${getSubjectColor(report.examTitle)}`}>
                        {report.examTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700">{report.batchName}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-blue-50 shrink-0 border-blue-200 text-blue-600 hover:text-blue-700 hover:border-blue-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Average Score:</span>
                      <Badge className={`${getPerformanceColor(report.averageScore)} font-semibold`}>
                        {report.averageScore.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Students:</span>
                      <span className="text-sm text-slate-600 font-medium">
                        {report.completedStudents}/{report.totalStudents} completed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
