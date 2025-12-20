import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockChapterAnalytics } from '@/data/mockChapterReports';
import { ChapterOverviewCard } from '@/components/teacher/reports/chapter/ChapterOverviewCard';
import { ChapterTrendChart } from '@/components/teacher/reports/chapter/ChapterTrendChart';
import { TopicPerformanceSection } from '@/components/teacher/reports/chapter/TopicPerformanceSection';
import { DifficultyAnalysisSection } from '@/components/teacher/reports/chapter/DifficultyAnalysisSection';
import { QuestionTypeSection } from '@/components/teacher/reports/chapter/QuestionTypeSection';
import { StudentPerformanceSection } from '@/components/teacher/reports/chapter/StudentPerformanceSection';
import { StudentGroupingSection } from '@/components/teacher/reports/chapter/StudentGroupingSection';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ChapterAnalyticsPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const analytics = mockChapterAnalytics.find(ch => ch.chapterId === chapterId);

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p>Chapter not found</p>
        <Button onClick={() => navigate('/teacher/reports/chapter-analytics')}>Go Back</Button>
      </div>
    );
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Exporting ${analytics.chapterName} report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/reports/chapter-analytics')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{analytics.chapterName}</h1>
            <p className="text-sm text-muted-foreground">
              {analytics.subjectName} • {analytics.batchName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      {/* All 7 Sections */}
      <ChapterOverviewCard analytics={analytics} />
      <ChapterTrendChart trendData={analytics.overallMetrics.trendData} trend={analytics.overallMetrics.trend} />
      <TopicPerformanceSection topics={analytics.topicPerformance} />
      <DifficultyAnalysisSection difficulty={analytics.difficultyPerformance} />
      <QuestionTypeSection questionTypes={analytics.questionTypePerformance} />
      <StudentPerformanceSection students={analytics.studentPerformance} classAverage={analytics.overallMetrics.accuracy} />
      <StudentGroupingSection analytics={analytics} />
    </div>
  );
}
