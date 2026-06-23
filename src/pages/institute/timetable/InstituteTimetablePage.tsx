import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Filter } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const InstituteTimetablePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Institute Timetable
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan and review the master weekly schedule across classes and sections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Class / Section
          </Button>
          <Button size="sm">This Week</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border bg-muted/40 p-2 text-left w-20">Period</th>
                  {days.map((d) => (
                    <th key={d} className="border bg-muted/40 p-2 text-left">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p}>
                    <td className="border p-2 font-medium text-muted-foreground">{p}</td>
                    {days.map((d) => (
                      <td key={d} className="border p-2 h-16 text-muted-foreground/60 text-xs">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Next: hook this grid to subjects, teachers, and rooms so the institute can publish a single source of truth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteTimetablePage;
