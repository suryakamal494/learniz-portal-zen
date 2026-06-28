import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarRange, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScheduleConfig, WeekDay, AcademicWindow } from '@/types/instituteProgram';
import {
  addWindow,
  deleteWindow,
  ensureWindows,
  renameActiveWindow,
  switchActiveWindow,
  updateActiveWindowMeta,
} from '@/hooks/useInstitutePrograms';
import { toast } from '@/hooks/use-toast';

const DOW: { d: WeekDay; label: string }[] = [
  { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' },
  { d: 4, label: 'Thu' }, { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' }, { d: 0, label: 'Sun' },
];

function fmt(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function workingDayCount(start: string, end: string | undefined, days: WeekDay[]): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let n = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (days.includes(cur.getDay() as WeekDay)) n++;
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}

interface Props {
  config: ScheduleConfig;
  onChange: (c: ScheduleConfig) => void;
}

export const AcademicWindowSwitcher: React.FC<Props> = ({ config, onChange }) => {
  const ensured = config.windows && config.activeWindowId ? config : ensureWindows(config);
  // If we had to ensure, push it up so the rest of the page sees it.
  React.useEffect(() => {
    if (!config.windows || !config.activeWindowId) onChange(ensured);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const windows = ensured.windows ?? [];
  const activeId = ensured.activeWindowId;
  const active = windows.find((w) => w.id === activeId);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgMode, setDlgMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<{ label: string; startDate: string; endDate: string; workingDays: WeekDay[]; periodsPerDay: number }>({
    label: '',
    startDate: '',
    endDate: '',
    workingDays: [1, 2, 3, 4, 5, 6],
    periodsPerDay: 6,
  });

  const openAdd = () => {
    setDlgMode('add');
    setForm({
      label: `Window ${windows.length + 1}`,
      startDate: '',
      endDate: '',
      workingDays: active?.workingDays ?? [1, 2, 3, 4, 5, 6],
      periodsPerDay: active?.periodsPerDay ?? 6,
    });
    setDlgOpen(true);
  };

  const openEdit = () => {
    if (!active) return;
    setDlgMode('edit');
    setForm({
      label: active.label,
      startDate: active.startDate ?? '',
      endDate: active.endDate ?? '',
      workingDays: active.workingDays ?? [1, 2, 3, 4, 5, 6],
      periodsPerDay: active.periodsPerDay ?? 6,
    });
    setDlgOpen(true);
  };

  const toggleDay = (d: WeekDay) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(d)
        ? f.workingDays.filter((x) => x !== d)
        : [...f.workingDays, d].sort(),
    }));
  };

  const save = () => {
    if (!form.label.trim()) {
      toast({ title: 'Label required', variant: 'destructive' });
      return;
    }
    if (!form.startDate) {
      toast({ title: 'Start date required', variant: 'destructive' });
      return;
    }
    if (form.workingDays.length === 0) {
      toast({ title: 'Pick at least one working day', variant: 'destructive' });
      return;
    }
    if (dlgMode === 'add') {
      onChange(addWindow(ensured, {
        label: form.label.trim(),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        workingDays: form.workingDays,
        periodsPerDay: form.periodsPerDay,
      }));
      toast({ title: 'Window added', description: form.label.trim() });
    } else {
      let next = renameActiveWindow(ensured, form.label.trim());
      next = updateActiveWindowMeta(next, {
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        workingDays: form.workingDays,
        periodsPerDay: form.periodsPerDay,
      });
      onChange(next);
      toast({ title: 'Window updated' });
    }
    setDlgOpen(false);
  };

  const handleDelete = () => {
    if (!active) return;
    if (windows.length <= 1) {
      toast({ title: 'At least one window required', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete "${active.label}"? Its allocation, timetable and holidays will be lost.`)) return;
    onChange(deleteWindow(ensured, active.id));
    toast({ title: 'Window deleted' });
  };

  const handleSwitch = (id: string) => {
    if (id === activeId) return;
    onChange(switchActiveWindow(ensured, id));
  };

  const wdCount = active ? workingDayCount(active.startDate, active.endDate, active.workingDays) : 0;

  return (
    <>
      <Card className="border-blue-200/70 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 shadow-sm">
        <div className="p-3 sm:p-4 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wide">
              <CalendarRange className="h-4 w-4" />
              Academic Window
              <span className="text-[10px] font-normal text-slate-500 normal-case tracking-normal">
                · each window has its own allocation, weekly timetable & holidays
              </span>
            </div>
            <div className="flex items-center gap-1">
              {active && (
                <>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={openEdit}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  {windows.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-rose-600 hover:bg-rose-50" onClick={handleDelete}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  )}
                </>
              )}
              <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add window
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {windows.map((w) => {
              const isActive = w.id === activeId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSwitch(w.id)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg border text-left whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50',
                  )}
                >
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    {isActive && <Check className="h-3.5 w-3.5" />}
                    {w.label}
                  </span>
                  <span className={cn('text-[11px]', isActive ? 'text-blue-100' : 'text-slate-500')}>
                    {fmt(w.startDate)} – {fmt(w.endDate)}
                  </span>
                </button>
              );
            })}
          </div>

          {active && (
            <div className="text-[11px] text-slate-600 flex items-center gap-3 flex-wrap pt-1">
              <span><b className="text-slate-900">{wdCount}</b> working days</span>
              <span className="text-slate-300">·</span>
              <span><b className="text-slate-900">{active.periodsPerDay}</b> periods/day</span>
              <span className="text-slate-300">·</span>
              <span>{active.workingDays.map((d) => DOW.find((x) => x.d === d)?.label).filter(Boolean).join(' ')}</span>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dlgMode === 'add' ? 'Add academic window' : 'Edit academic window'}</DialogTitle>
            <DialogDescription>
              Each window stores its own allocation, weekly timetable and holidays. Other windows are unaffected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Term 1"
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">End date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Working days</Label>
              <div className="flex gap-1 flex-wrap mt-1">
                {DOW.map(({ d, label }) => {
                  const on = form.workingDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={cn(
                        'h-8 px-3 rounded-md text-xs font-medium border transition-all',
                        on
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs">Periods per day</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={form.periodsPerDay}
                onChange={(e) => setForm({ ...form, periodsPerDay: Math.max(1, Math.min(12, +e.target.value || 1)) })}
                className="h-9 w-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDlgOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={save}>
              <Check className="h-4 w-4 mr-1" /> {dlgMode === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
