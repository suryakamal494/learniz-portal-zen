import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockChapterSummaries, mockBatchesForFilter, mockSubjectsForFilter } from '@/data/mockChapterReports';
import { getTrendIcon, getCategoryBadgeColor } from '@/utils/chapterAnalyticsUtils';
import { Search, BookOpen, TrendingUp, Users } from 'lucide-react';

export default function ChapterAnalyticsListPage() {
  const navigate = useNavigate();
  const [batchFilter, setBatchFilter] = useState('section-10a');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredChapters = mockChapterSummaries.filter(ch => {
    if (subjectFilter !== 'all' && ch.subjectId !== subjectFilter) return false;
    if (search && !ch.chapterName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Chapter Analytics</h1>
        <p className="text-muted-foreground">Deep insights into how your class understands each chapter</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            {mockBatchesForFilter.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {mockSubjectsForFilter.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter) => (
          <Card 
            key={chapter.chapterId} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/teacher/reports/chapter-analytics/${chapter.chapterId}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{chapter.chapterName}</h3>
                  <p className="text-sm text-muted-foreground">{chapter.subjectName}</p>
                </div>
                <Badge className={getCategoryBadgeColor(chapter.category)}>
                  {chapter.category}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl font-bold text-primary">{chapter.accuracy.toFixed(0)}%</div>
                <span className="text-lg">{getTrendIcon(chapter.trend)}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> {chapter.topicsCount} topics
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {chapter.studentsCount} students
                </span>
              </div>

              <Button variant="outline" className="w-full mt-3">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No chapters found matching your filters.
        </div>
      )}
    </div>
  );
}
