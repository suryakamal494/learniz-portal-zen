import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, ChevronRight, Columns2, Layers, Sparkles, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useScheduleWorkspace } from '@/hooks/useScheduleWorkspace';
import { TimetableWorkspaceTab } from '@/components/institute/workspace/TimetableWorkspaceTab';
import { DayScheduleTab } from '@/components/institute/workspace/DayScheduleTab';
import { AcademicScheduleTab } from '@/components/institute/workspace/AcademicScheduleTab';
import { DevNote } from '@/components/dev/DevNote';
import { formatRange } from '@/utils/sectionUtils';
import { cn } from '@/lib/utils';

const MIN_COMPARE_WIDTH = 1200;

const ScheduleWorkspacePage: React.FC = () => {
  const {
    sections, section, window, tab,
    setSectionId, setWindowId, setTab,
    compareOn, setCompareOn,
    compareSectionId, setCompareSectionId,
  } = useScheduleWorkspace();

  const isDayTab = tab === 'day';

  const [viewportOK, setViewportOK] = useState(
    typeof globalThis.window !== 'undefined'
      ? globalThis.window.innerWidth >= MIN_COMPARE_WIDTH
      : true,
  );
  useEffect(() => {
    const on = () => setViewportOK(globalThis.window.innerWidth >= MIN_COMPARE_WIDTH);
    globalThis.window.addEventListener('resize', on);
    return () => globalThis.window.removeEventListener('resize', on);
  }, []);

  const compareSection = compareOn
    ? sections.find((s) => s.id === compareSectionId && s.id !== section?.id)
      ?? sections.find((s) => s.id !== section?.id)
    : undefined;
  const compareWindow = compareSection?.windows[compareSection.windows.length - 1];
  const compareActive = compareOn && viewportOK && !!compareSection && !!compareWindow;

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Sections
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium">Schedule Workspace</span>
          <DevNote title="Only published windows show up here">
            <p>The Section and Academic Window pickers are filtered to windows whose Period Allocation has been <b>published</b>.</p>
            <p>Draft windows stay hidden until someone hits <i>Publish window</i> on the Section → Period Allocation page.</p>
            <p>Un-publishing a window from Period Allocation removes it from these pickers immediately.</p>
          </DevNote>
        </div>

        {sections.length === 0 && (
          <Card className="border-amber-300 bg-amber-50/60">
            <CardContent className="p-6 text-sm text-amber-900 flex items-start gap-3">
              <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-900">No published academic windows yet</div>
                <p className="text-xs text-amber-800 mt-1">
                  Open any section → Setup &amp; Allocation, complete Period Allocation, then hit
                  <b> Publish window</b> at the bottom of that page. Published windows appear here automatically.
                </p>
                <Link
                  to="/institute/programs"
                  className="inline-block mt-3 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline"
                >
                  Go to Sections →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Toolbar */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {!isDayTab && (
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Section
                  </div>
                  <Select value={section?.id ?? ''} onValueChange={setSectionId}>
                    <SelectTrigger className="w-64 h-9 mt-1">
                      <SelectValue placeholder="Pick a section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="text-xs text-slate-500 mr-2">{s.className}</span>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Academic Window
                </div>
                <Select
                  value={window?.id ?? ''}
                  onValueChange={setWindowId}
                  disabled={!section}
                >
                  <SelectTrigger className="w-72 h-9 mt-1">
                    <SelectValue placeholder="Window" />
                  </SelectTrigger>
                  <SelectContent>
                    {section?.windows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{w.label ?? formatRange(w)}</span>
                          <Badge
                            className={cn(
                              'text-[9px] px-1.5 py-0',
                              (w.status ?? 'draft') === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100',
                            )}
                          >
                            {w.status ?? 'draft'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isDayTab && section && (
                <div className="flex items-end gap-2 pb-0.5">
                  <Badge
                    variant="outline"
                    className="text-[11px] gap-1 pl-2 pr-1 py-0.5 border-amber-300 bg-amber-50 text-amber-800"
                  >
                    Focus · {section.name}
                    <button
                      onClick={() => setSectionId('')}
                      className="ml-1 rounded hover:bg-amber-100 p-0.5"
                      aria-label="Clear focus"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}

              <div className="flex-1" />

              {!isDayTab && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={compareOn ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCompareOn(!compareOn)}
                    className={compareOn ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  >
                    <Columns2 className="h-3.5 w-3.5 mr-1" />
                    {compareOn ? 'Exit compare' : 'Compare sections'}
                  </Button>
                  <DevNote title="Compare mode">
                    <p>Read-only side-by-side of two sections' timetables. Available only ≥{MIN_COMPARE_WIDTH}px.</p>
                    <p>The right pane strips density (single-letter track chips, hides faculty line) so both grids fit.</p>
                    <p>Editing/publishing are disabled while compare is on — exit compare to make changes.</p>
                  </DevNote>
                </div>
              )}
            </div>

            {!isDayTab && compareOn && !viewportOK && (
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Compare mode needs at least {MIN_COMPARE_WIDTH}px of viewport width. Widen the window or exit compare.
              </div>
            )}

            {compareActive && (
              <div className="mt-3 flex items-center gap-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Compare with
                </div>
                <Select
                  value={compareSection?.id ?? ''}
                  onValueChange={setCompareSectionId}
                >
                  <SelectTrigger className="w-64 h-8 text-xs">
                    <SelectValue placeholder="Second section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections
                      .filter((s) => s.id !== section?.id)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="text-xs text-slate-500 mr-2">{s.className}</span>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-[10px]">read-only</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'timetable' | 'day' | 'schedule')}>
          <TabsList className="h-11 p-1 bg-slate-100 border border-slate-200 rounded-lg gap-1">
            <TabsTrigger
              value="timetable"
              className="flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-indigo-400/40 hover:text-slate-800"
            >
              <Layers className="h-4 w-4" /> Weekly Timetable
            </TabsTrigger>
            <TabsTrigger
              value="day"
              className="flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-amber-400/40 hover:text-slate-800"
            >
              <CalendarDays className="h-4 w-4" /> Day Timetable
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-emerald-400/40 hover:text-slate-800"
            >
              <Sparkles className="h-4 w-4" /> Academic Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timetable" className="mt-4 space-y-3">
            {!section || !window ? (
              <Card className="border-slate-200">
                <CardContent className="p-10 text-center text-slate-500 text-sm">
                  Pick a section and academic window above to begin.
                </CardContent>
              </Card>
            ) : compareActive ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    A · {section.name}
                  </div>
                  <TimetableWorkspaceTab section={section} window={window} readOnly />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    B · {compareSection!.name}
                  </div>
                  <TimetableWorkspaceTab section={compareSection!} window={compareWindow!} readOnly />
                </div>
              </div>
            ) : (
              <TimetableWorkspaceTab section={section} window={window} />
            )}
          </TabsContent>

          <TabsContent value="day" className="mt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <DevNote title="Day Timetable — window-scoped">
                <p>Rows are every section in the institute; columns are periods for one weekday of one week
                inside the selected <b>Academic Window</b>. Section picker is intentionally hidden here —
                this view spans all sections.</p>
                <p>All edits write into the same underlying cell store used by Weekly Timetable, so
                switching tabs shows them immediately for the matching (section, window).</p>
                <p><b>Publish</b> stays exclusive to Weekly Timetable (per-section, per-window). Day view
                only offers <i>Save as Draft</i>.</p>
              </DevNote>
            </div>
            <DayScheduleTab sections={sections} focusSectionId={section?.id} />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            {!section || !window ? (
              <Card className="border-slate-200">
                <CardContent className="p-10 text-center text-slate-500 text-sm">
                  Pick a section and academic window above to begin.
                </CardContent>
              </Card>
            ) : compareActive ? (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md p-4">
                Compare mode is for timetables only — switch back to the Weekly Timetable tab, or exit compare
                to view the Academic Schedule.
              </div>
            ) : (
              <AcademicScheduleTab
                section={section}
                window={window}
                onJumpToTimetable={() => setTab('timetable')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScheduleWorkspacePage;
