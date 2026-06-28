import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { setInstituteHolidays, useInstituteHolidays } from '@/hooks/useInstitutePrograms';
import { formatPretty, toISO } from '@/utils/calendarAutomation';
import { Holiday } from '@/types/instituteProgram';

const InstituteHolidaysPage: React.FC = () => {
  const holidays = useInstituteHolidays();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);
  const [name, setName] = useState('');
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const add = () => {
    if (dates.length === 0) return;
    const existing = new Set(holidays.map((h) => h.date));
    const trimmed = name.trim();
    const toAdd: Holiday[] = dates
      .map((d) => toISO(d))
      .filter((iso) => !existing.has(iso))
      .map((iso) => ({ date: iso, name: trimmed || undefined }));
    if (toAdd.length === 0) {
      toast({ title: 'Already added', description: 'Those dates are already in the list.' });
      return;
    }
    setInstituteHolidays([...holidays, ...toAdd]);
    setDates([]);
    setName('');
    setPickerOpen(false);
    toast({ title: 'Holidays added', description: `${toAdd.length} date(s) added institute-wide.` });
  };

  const remove = (date: string) => setInstituteHolidays(holidays.filter((h) => h.date !== date));

  const saveName = (date: string) => {
    setInstituteHolidays(
      holidays.map((h) => (h.date === date ? { ...h, name: editingName.trim() || undefined } : h)),
    );
    setEditingDate(null);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-3xl mx-auto p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/institute/programs" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Sections
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium">Holiday setup</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institute holidays</h1>
          <p className="text-sm text-slate-600 mt-1">
            Set once — applied automatically to every section. Individual sections can skip or add their own
            without changing this list.
          </p>
        </div>

        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">Add holiday dates</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-white sm:w-56 justify-start font-normal">
                      <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                      {dates.length === 0
                        ? 'Pick dates'
                        : dates.length === 1
                          ? formatPretty(toISO(dates[0]))
                          : `${dates.length} dates selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={dates}
                      onSelect={(d) => setDates(d ?? [])}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Description (optional, e.g. Diwali)"
                  className="bg-white flex-1"
                />
                <Button onClick={add} disabled={dates.length === 0} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Description is optional — you can fill it in later.
              </p>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-slate-500">
                Holidays ({holidays.length})
              </Label>
              {holidays.length === 0 ? (
                <p className="text-sm text-slate-400 italic mt-2">No institute holidays yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5 mt-2">
                  {holidays.map((h) => {
                    const isEditing = editingDate === h.date;
                    return (
                      <div
                        key={h.date}
                        className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
                      >
                        <span className="font-medium min-w-[10rem]">{formatPretty(h.date)}</span>
                        {isEditing ? (
                          <>
                            <Input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Description (optional)"
                              className="bg-white h-7 text-sm flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveName(h.date);
                                else if (e.key === 'Escape') setEditingDate(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => saveName(h.date)}
                              className="hover:bg-rose-200 rounded p-1"
                              aria-label="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDate(null)}
                              className="hover:bg-rose-200 rounded p-1"
                              aria-label="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={cn('flex-1 truncate', !h.name && 'text-rose-400 italic')}>
                              {h.name || 'No description'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDate(h.date);
                                setEditingName(h.name ?? '');
                              }}
                              className="hover:bg-rose-200 rounded p-1"
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(h.date)}
                              className="hover:bg-rose-200 rounded p-1"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstituteHolidaysPage;
