// Time-aware streaming state for today's schedule.
// Derives Upcoming / StartEarly / Start / Ongoing / Ended / Missed / Cancelled
// from a class's date+time+duration and a teacher-recorded startedAt timestamp.

export type StreamingState =
  | { kind: 'start' }
  | { kind: 'ongoing'; endsInMs: number }
  | { kind: 'overrun' }
  | { kind: 'ended'; endedEarly: boolean; durationMs: number }
  | { kind: 'cancelled' }
  | { kind: 'noLink' };

export interface StreamingInputClass {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  time: string;            // e.g. '09:00 AM' or '10:00 - 10:45'
  duration?: string;       // e.g. '60 mins'
  status?: string;         // 'cancelled' -> cancelled
  assignments?: { urlView?: string };
}

const EARLY_WINDOW_MS = 15 * 60 * 1000;     // 15 min before start
const OVERRUN_GRACE_MS = 10 * 60 * 1000;    // 10 min after end
const MIN_PER_HOUR = 60;

function parseDuration(d?: string): number {
  if (!d) return 45 * 60 * 1000;
  const n = parseInt(d, 10);
  if (Number.isNaN(n)) return 45 * 60 * 1000;
  if (/hour|hr/i.test(d)) return n * MIN_PER_HOUR * 60 * 1000;
  return n * 60 * 1000;
}

// Returns [startDate, endDate] for the class on its given date.
export function parseClassWindow(cls: StreamingInputClass): [Date, Date] | null {
  const { date, time } = cls;
  if (!date || !time) return null;

  // Range form: '10:00 - 10:45' (24h)
  const range = time.match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/);
  if (range) {
    const start = new Date(`${date}T${range[1].padStart(2, '0')}:${range[2]}:00`);
    const end = new Date(`${date}T${range[3].padStart(2, '0')}:${range[4]}:00`);
    return [start, end];
  }

  // Single form: '09:00 AM' / '02:30 PM' / '14:30'
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3]?.toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  const start = new Date(
    `${date}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
  );
  const end = new Date(start.getTime() + parseDuration(cls.duration));
  return [start, end];
}

export function formatRelative(ms: number): string {
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return 'less than a minute';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function getStreamingState(
  cls: StreamingInputClass,
  now: Date,
  startedAt?: number | null,
  endedAt?: number | null,
): StreamingState {
  if (cls.status === 'cancelled') return { kind: 'cancelled' };

  const window = parseClassWindow(cls);
  if (!window) {
    return cls.assignments?.urlView ? { kind: 'start' } : { kind: 'noLink' };
  }
  const [start, end] = window;
  const t = now.getTime();
  const hasLink = !!cls.assignments?.urlView;

  // Teacher explicitly ended
  if (endedAt) {
    return {
      kind: 'ended',
      endedEarly: endedAt < end.getTime(),
      durationMs: endedAt - (startedAt ?? start.getTime()),
    };
  }

  // Teacher started -> ongoing / overrun
  if (startedAt) {
    if (t <= end.getTime()) return { kind: 'ongoing', endsInMs: end.getTime() - t };
    if (t <= end.getTime() + OVERRUN_GRACE_MS) return { kind: 'ongoing', endsInMs: 0 };
    return { kind: 'overrun' };
  }

  // Not started yet — always allow Start (no "Upcoming" gating)
  if (t <= end.getTime()) {
    if (!hasLink) return { kind: 'noLink' };
    return { kind: 'start' };
  }
  // Past end, never started — fall back to a neutral ended state.
  return { kind: 'ended', endedEarly: false, durationMs: end.getTime() - start.getTime() };
}
