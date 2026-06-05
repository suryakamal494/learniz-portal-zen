import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Users, Video, Play } from "lucide-react"
import { mockUpcomingClasses } from "@/data/mockUpcomingClasses"
import { TeachingStatusCell } from "@/components/teacher/schedule/TeachingStatusCell"
import { TeachingStatus } from "@/types/teachingProgress"

export function ModernUpcomingClasses() {
  const [classStatuses, setClassStatuses] = useState<Record<string, { status: TeachingStatus; notes?: string }>>({})

  const handleStreamingClick = (link: string) => {
    window.open(link, '_blank')
  }

  const handleAssignClick = (type: string, classId: string) => {
    console.log(`Assign ${type} for class ${classId}`)
    // Navigation logic will be implemented based on requirements
  }

  const handleTeachingStatusChange = (classId: string, status: TeachingStatus, notes?: string) => {
    setClassStatuses(prev => ({
      ...prev,
      [classId]: { status, notes }
    }))
  }

  const getTeachingStatus = (classId: string): TeachingStatus => {
    return classStatuses[classId]?.status || 'pending'
  }

  const getTeachingNotes = (classId: string): string | undefined => {
    return classStatuses[classId]?.notes
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      Mathematics: "bg-blue-100 text-blue-800 border-blue-200",
      Physics: "bg-purple-100 text-purple-800 border-purple-200", 
      Chemistry: "bg-green-100 text-green-800 border-green-200",
      Biology: "bg-orange-100 text-orange-800 border-orange-200"
    }
    return colors[subject as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-600/20 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Today's Schedule
            </CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {mockUpcomingClasses.length} Classes
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold text-slate-700 w-24">Time</TableHead>
                <TableHead className="font-semibold text-slate-700">Section</TableHead>
                <TableHead className="font-semibold text-slate-700">Class</TableHead>
                <TableHead className="font-semibold text-slate-700">Topic</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Teaching Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Streaming</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Animations</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Study Notes</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Live Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUpcomingClasses.map((classItem, index) => (
                <TableRow 
                  key={classItem.id} 
                  className={`hover:bg-slate-50/50 transition-colors animate-fade-in ${classItem.isLive ? 'bg-green-50/30' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-900">{classItem.time}</span>
                      </div>
                      {classItem.isLive && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-600 font-medium">LIVE</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{classItem.section}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getSubjectColor(classItem.subject)}`}>
                          {classItem.subject}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="h-3 w-3" />
                          <span>{classItem.studentsCount}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium text-slate-700">{classItem.class}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium text-slate-900 truncate">{classItem.topic}</div>
                      <div className="text-sm text-slate-500">{classItem.duration}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <TeachingStatusCell
                      status={getTeachingStatus(classItem.id)}
                      notes={getTeachingNotes(classItem.id)}
                      topic={classItem.topic}
                      classId={classItem.id}
                      onStatusChange={handleTeachingStatusChange}
                    />
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {classItem.streamingLink ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => handleStreamingClick(classItem.streamingLink!)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        START
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-sm">Not available</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {classItem.hasAnimations ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Video className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-0 h-auto font-medium"
                        onClick={() => handleAssignClick('animations', classItem.id)}
                      >
                        Assign
                      </Button>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {classItem.hasFacultyNotes ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Calendar className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-0 h-auto font-medium"
                        onClick={() => handleAssignClick('faculty-notes', classItem.id)}
                      >
                        Assign
                      </Button>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {classItem.hasLiveQuiz ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <Play className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-0 h-auto font-medium"
                        onClick={() => handleAssignClick('live-quiz', classItem.id)}
                      >
                        Assign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
