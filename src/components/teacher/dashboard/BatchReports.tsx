
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { FileBarChart, Eye } from "lucide-react"
import { mockBatchExamReports } from "@/data/mockBatchReports"
import { format, parseISO } from "date-fns"

export function BatchReports() {
  const navigate = useNavigate()
  
  // Get latest 4 batch reports
  const latestReports = mockBatchExamReports
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  const handleViewReport = (examId: string) => {
    navigate(`/teacher/reports/batch/${examId}`)
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 85) return "bg-success/10 text-success border-success/20"
    if (percentage >= 70) return "bg-warning/10 text-warning border-warning/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  return (
    <Card className="border-border/50 shadow-premium backdrop-blur-sm bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Section Reports</CardTitle>
            <p className="text-body-sm text-muted-foreground">Latest exam performance</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/reports/batch')}>
          View all
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {latestReports.map((report, index) => (
          <div 
            key={report.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-all duration-300 group animate-fade-in cursor-pointer border border-border/30"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleViewReport(report.examId)}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                {report.examTitle}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {report.batchName} • {format(parseISO(report.date), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {report.totalStudents} students
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <Badge 
                variant="secondary" 
                className={getPerformanceColor(report.averagePerformance)}
              >
                {report.averagePerformance}%
              </Badge>
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation()
                handleViewReport(report.examId)
              }}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
        
        {latestReports.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileBarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No section reports available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
