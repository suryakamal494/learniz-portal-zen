
import React from 'react';
import { Clock, Calendar, Users, Book, MoreVertical, ExternalLink, BookOpen, FileText, Zap, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TeacherScheduleClass } from '@/types/teacherSchedule';
import { TeachingStatus } from '@/types/teachingProgress';
import { TeachingStatusCell } from './TeachingStatusCell';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TeacherMobileScheduleCardProps {
  data: TeacherScheduleClass[];
  onTeachingStatusChange?: (classId: string, status: TeachingStatus, notes?: string) => void;
}

export function TeacherMobileScheduleCard({ data, onTeachingStatusChange }: TeacherMobileScheduleCardProps) {
  const navigate = useNavigate();

  const handleAssignmentClick = (type: string, classItem: TeacherScheduleClass) => {
    navigate(`/teacher/classroom/schedule/assign/${classItem.id}`);
  };

  const handleEditClick = (classItem: TeacherScheduleClass) => {
    navigate(`/teacher/classroom/schedule/edit/${classItem.id}`);
  };

  const handleDeleteClick = (classItem: TeacherScheduleClass) => {
    toast.success(`Delete clicked for ${classItem.topic}`);
  };

  const handleTeachingStatusChange = (classId: string, status: TeachingStatus, notes?: string) => {
    if (onTeachingStatusChange) {
      onTeachingStatusChange(classId, status, notes);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: 'secondary' as const },
      completed: { variant: 'default' as const },
      cancelled: { variant: 'destructive' as const }
    };
    
    const config = variants[status as keyof typeof variants] || variants.scheduled;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="lg:hidden space-y-4">
      {data.map((classItem) => (
        <Card key={classItem.id} className="bg-card border border-border">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">{classItem.subject}</h3>
                <p className="text-sm text-muted-foreground">{classItem.topic}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(classItem.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleEditClick(classItem)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Schedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(classItem)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{format(new Date(classItem.date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{classItem.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                <Book className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{classItem.class}</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{classItem.batch}</span>
              </div>
            </div>

            {/* Faculty */}
            <div className="mb-4 p-3 bg-muted/30 rounded border">
              <p className="text-sm text-muted-foreground mb-1">Faculty: <span className="text-foreground font-medium">{classItem.faculty}</span></p>
              <p className="text-sm text-muted-foreground">Duration: <span className="text-foreground font-medium">{classItem.duration}</span></p>
            </div>

            {/* Teaching Status */}
            <div className="mb-4 p-3 bg-primary/5 rounded border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Teaching Status</span>
                <TeachingStatusCell
                  status={classItem.teachingStatus}
                  notes={classItem.teachingNotes}
                  topic={classItem.topic}
                  classId={classItem.id}
                  onStatusChange={handleTeachingStatusChange}
                />
              </div>
            </div>

            {/* Assignment Buttons */}
            <div className="flex flex-wrap gap-2">
              {classItem.assignments.urlView && (
                <Button
                  onClick={() => handleAssignmentClick('URL View', classItem)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              <Button
                onClick={() => handleAssignmentClick('LMS', classItem)}
                variant={classItem.assignments.lmsAssigned ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                LMS
              </Button>
              <Button
                onClick={() => handleAssignmentClick('Notes', classItem)}
                variant={classItem.assignments.notesAssigned ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                Notes
              </Button>
              <Button
                onClick={() => handleAssignmentClick('Quiz', classItem)}
                variant={classItem.assignments.liveQuizAssigned ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
