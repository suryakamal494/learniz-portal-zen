
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BookOpen, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { mockTeacherScheduleClasses } from '@/data/mockTeacherSchedule';
import { mockLMSSeries } from '@/data/mockLMSSeries';
import { mockNotesData } from '@/data/mockNotesAssignments';
// Mock live quiz data for teacher schedule
const mockLiveQuizData = [
  { id: '1', title: 'Math Quick Quiz', subject: 'Mathematics', duration: '15 mins' },
  { id: '2', title: 'Physics Quiz', subject: 'Physics', duration: '20 mins' },
  { id: '3', title: 'Chemistry Quiz', subject: 'Chemistry', duration: '15 mins' }
];

export default function AssignLMSNotesPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [selectedLMSSeries, setSelectedLMSSeries] = useState('');
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Find the schedule class by ID
    const foundClass = mockTeacherScheduleClasses.find(cls => cls.id === scheduleId);
    if (foundClass) {
      setClassData(foundClass);
    }
  }, [scheduleId]);

  const handleUpdate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Assignments updated successfully!');
      setIsLoading(false);
      navigate('/teacher/schedule');
    }, 1000);
  };

  if (!classData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">Class not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/teacher/schedule')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign LMS and Notes</h1>
          <p className="text-muted-foreground">Home {'>'} Online Classes {'>'} Assign LMS and Notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Details - Read Only */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Class Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={classData.subject}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={classData.subject}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Input
                    id="batch"
                    value={classData.batch}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={classData.topic}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Selectors */}
        <div className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LMS Series Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="lms-series">LMS Series</Label>
                <Select value={selectedLMSSeries} onValueChange={setSelectedLMSSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LMS Series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None Selected</SelectItem>
                    {mockLMSSeries.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        {series.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* LMS Notes Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="lms-notes">LMS Notes</Label>
                <Select value={selectedNotes} onValueChange={setSelectedNotes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Notes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None Selected</SelectItem>
                    {mockNotesData.map((noteData) =>
                      noteData.chapters.map((chapter) =>
                        chapter.notes.map((note) => (
                          <SelectItem key={note.id} value={note.id}>
                            {note.title}
                          </SelectItem>
                        ))
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Live Quiz Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="live-quiz">Live Quiz</Label>
                <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Live Quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None Selected</SelectItem>
                    {mockLiveQuizData.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'UPDATE'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
