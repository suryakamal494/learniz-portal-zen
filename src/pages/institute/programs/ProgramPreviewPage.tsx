import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInstituteProgram } from '@/hooks/useInstitutePrograms';
import { chapterHours, hoursToPeriods, rollupProgram, rollupSubject } from '@/utils/calendarAutomation';
import { subjectPalette } from '@/lib/subjectColors';
import { cn } from '@/lib/utils';

const ProgramPreviewPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const program = useInstituteProgram(programId);
  if (!program) return <div className="p-10 text-slate-500">Program not found.</div>;
  const periodMins = program.schedule?.periodLengthMins ?? 40;
  const roll = rollupProgram(program, periodMins);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Programs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium">{program.name}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Curriculum preview</span>
        </div>

        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                <Eye className="h-3.5 w-3.5" /> Read-only preview
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
              <div className="text-sm text-slate-600 mt-1">
                {program.subjects.length} subjects · {roll.totalTopics} topics · {roll.hours}h · {roll.periods} periods
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </CardContent>
        </Card>

        {program.subjects.map((s) => {
          const sRoll = rollupSubject(s, periodMins);
          const pal = subjectPalette(s.color);
          return (
            <Card key={s.id} className="border-slate-200/70 shadow-sm overflow-hidden">
              <div className={cn('flex items-center gap-3 p-4 border-b', pal.bgSoft)}>
                <span className={cn('h-2.5 w-2.5 rounded-full', pal.dot)} />
                <h2 className={cn('font-semibold flex-1', pal.text)}>{s.name}</h2>
                <Badge variant="outline" className={cn(pal.bgSoft, pal.text, pal.border)}>
                  {sRoll.hours}h · {sRoll.periods}p
                </Badge>
              </div>
              <div className="divide-y divide-slate-100">
                {s.chapters.map((c, ci) => (
                  <div key={c.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-800 text-sm">
                        Ch {ci + 1}. {c.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {chapterHours(c)}h ·{' '}
                        {c.topics.reduce((a, t) => a + hoursToPeriods(t.hours, periodMins), 0)} periods
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-400 text-left">
                          <th className="font-medium py-1">Topic</th>
                          <th className="font-medium py-1 w-20 text-right">Hours</th>
                          <th className="font-medium py-1 w-20 text-right">Periods</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.topics.map((t) => (
                          <tr key={t.id} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700">{t.name}</td>
                            <td className="py-1.5 text-right tabular-nums text-slate-700">
                              {t.hours > 0 ? `${t.hours}h` : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-slate-700">
                              {hoursToPeriods(t.hours, periodMins) || <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramPreviewPage;
