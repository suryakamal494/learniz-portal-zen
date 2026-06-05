
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { Users, Eye } from "lucide-react"
import { mockTeacherScheduleClasses } from "@/data/mockTeacherSchedule"
import { format, isToday, parseISO } from "date-fns"

// Mock attendance data based on completed classes
const generateAttendanceData = () => {
  const completedClasses = mockTeacherScheduleClasses.filter(cls => 
    cls.status === 'completed' || (isToday(parseISO(cls.date)) && Math.random() > 0.5)
  )
  
  return completedClasses.map(cls => ({
    id: cls.id,
    classTitle: cls.topic,
    batch: cls.batch,
    class: cls.class,
    date: cls.date,
    time: cls.time,
    totalStudents: Math.floor(Math.random() * 15) + 20, // 20-35 students
    presentStudents: Math.floor(Math.random() * 10) + 25, // 25-35 present
  })).slice(0, 4) // Latest 4 records
}

export function AttendanceToday() {
  const navigate = useNavigate()
  const attendanceData = generateAttendanceData()
  
  const getAttendanceColor = (present: number, total: number) => {
    const percentage = (present / total) * 100
    if (percentage >= 90) return "bg-success/10 text-success border-success/20"
    if (percentage >= 75) return "bg-warning/10 text-warning border-warning/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  const handleViewAttendance = (classId: string) => {
    navigate(`/teacher/reports/attendance/${classId}`)
  }

  return (
    <Card className="border-border/50 shadow-premium backdrop-blur-sm bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Today's Attendance</CardTitle>
            <p className="text-body-sm text-muted-foreground">Class attendance records</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/reports/attendance')}>
          View all
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {attendanceData.map((record, index) => (
          <div 
            key={record.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-all duration-300 group animate-fade-in cursor-pointer border border-border/30"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleViewAttendance(record.id)}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                {record.classTitle}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {record.batch} • {record.class}
              </p>
              <p className="text-xs text-muted-foreground">
                {record.time} • {format(parseISO(record.date), 'MMM dd')}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <Badge 
                variant="secondary" 
                className={getAttendanceColor(record.presentStudents, record.totalStudents)}
              >
                {record.presentStudents}/{record.totalStudents}
              </Badge>
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation()
                handleViewAttendance(record.id)
              }}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
        
        {attendanceData.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No attendance records for today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
