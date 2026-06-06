# Streaming Button — Time-Aware States

Right now the Streaming column always shows a green **START** button regardless of the class time. We'll make it react to the actual class window and the teacher's action.

## Streaming states

For a class with window `[start, end]` (e.g. 10:00–10:45) and "now":

| Condition | Button / Label | Style |
|---|---|---|
| now < start − 15 min | `Upcoming` (disabled) with countdown tooltip "Starts in 1h 20m" | muted/outline, no Play icon |
| start − 15 min ≤ now < start | `Start Early` (enabled) | outline-success, Play icon |
| start ≤ now ≤ end AND not started | `Start` (enabled, pulsing dot) | solid success |
| Teacher clicked Start AND now ≤ end | `● Ongoing` badge + `Join` link | success badge, animated dot |
| Teacher clicked Start AND now > end | `Ended` badge + `Recording` link (if URL) | muted badge |
| now > end AND never started | `Missed` badge | destructive/muted |
| Class cancelled (flag) | `Cancelled` badge | muted, strikethrough time |

A live timer (1 min tick) re-evaluates state so the row transitions automatically without a refresh.

## Edge cases worth handling

1. **Back-to-back classes** — if a new class starts while another is Ongoing, show a small warning chip "Previous class still live" on the new row.
2. **Overrun** — teacher started but didn't end; after `end + 10 min` auto-flip Ongoing → `Ended (overrun)` and surface an "End class" action.
3. **Early end** — teacher manually ends before `end`; show `Ended early` with actual duration.
4. **No streaming URL configured** — disable Start, show tooltip "Add meeting link in Schedule".
5. **Cancelled / Holiday** — skip Start entirely.
6. **Timezone / device clock skew** — compute against a single source (ISO date + IST offset from mock data) to avoid flicker.
7. **Page left open overnight** — date rollover should drop yesterday's rows.
8. **Multiple tabs** — Ongoing state persisted in `localStorage` keyed by classId so refresh/another tab reflects it (mock-side for now).
9. **Permission** — only the assigned teacher sees Start; others see `View` (out of scope if single-teacher portal, just noting).

## Technical notes

- New helper `src/lib/streamingStatus.ts` exporting `getStreamingState(classItem, now, startedAt?)` returning a discriminated union.
- New component `src/components/teacher/dashboard/StreamingCell.tsx` that renders the right control per state and accepts `onStart` / `onEnd`.
- `TodaysClasses.tsx`:
  - Add `useEffect` with `setInterval(60_000)` ticking a `now` state.
  - Persist `startedAt` per classId in `localStorage` (`streaming:<classId>`).
  - Replace the inline Start `<Button>` in both desktop and mobile views with `<StreamingCell />`.
- Parse `classItem.time` (format like "10:00 - 10:45") into start/end Date objects using the row's `date`.
- Keep all styling in existing semantic tokens (`success`, `muted`, `destructive`).

No backend / data-model changes; everything is derived from existing `time` + `date` fields plus local started-at state.
