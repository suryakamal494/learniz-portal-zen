## Change

In `WeeklyTimetableBuilder.tsx`, filter the merged palette so a track only appears when its allocated periods > 0.

- Inside `allocationOptions` `pushFromSlice`, after the existing `tr.enabled !== false` filter, compute the effective target (`slice.trackTargetPeriods[tr.id] ?? tr.allottedPeriods ?? slice.subjectTargetPeriods[s.id] ?? 0`) and skip the track when target is 0.
- Applies uniformly to every sub-program (CBSE, JEE Mains, single-program). So if CBSE Biology has 0 periods it disappears from the palette; if JEE Mains English has 5 it appears.
- No change to cell rendering — already-painted cells (rare edge case) keep showing.
- No change to data model or sub-program switcher.

File: `src/components/institute/programs/WeeklyTimetableBuilder.tsx`.
