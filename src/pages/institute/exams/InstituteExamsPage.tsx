import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipboardList, Plus, CalendarClock, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Upcoming', value: 6, hint: 'Next 14 days', icon: CalendarClock, tone: 'bg-blue-50 text-blue-700' },
  { label: 'Ongoing', value: 2, hint: 'Active windows', icon: TrendingUp, tone: 'bg-amber-50 text-amber-700' },
  { label: 'Completed', value: 18, hint: 'This term', icon: FileText, tone: 'bg-emerald-50 text-emerald-700' },
];

const InstituteExamsPage: React.FC = () => {
  const [tab, setTab] = useState('schedule');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Exam Module
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan exam cycles, manage question papers, and publish results — institute-wide.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Exam Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-md ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.hint}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manage</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="papers">Question Papers</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="pt-4 text-sm text-muted-foreground">
              Build exam cycles, assign classes, and lock the calendar. Schedule list will appear here.
            </TabsContent>
            <TabsContent value="papers" className="pt-4 text-sm text-muted-foreground">
              Approve question papers from teachers, attach blueprints, and version-control drafts.
            </TabsContent>
            <TabsContent value="results" className="pt-4 text-sm text-muted-foreground">
              Track entry progress, moderation, and publish institute-wide result sheets.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteExamsPage;
