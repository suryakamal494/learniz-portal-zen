## Goal
Make the Programs → Schedule flow demo-ready with comprehensive mock data across Step 1, Step 2 and Step 3; fix the Step 3 toolbar so it's a Timetable view with **Week** and **Month** layouts only; and replace the truncated "Previously covered up to" line in Step 1 with a per-chapter coverage inset.

## Step 1 (Setup) — richer coverage panel + mock

**Current problem**
The "Previously covered up to" card shows a single one-liner per subject (`Up to Chapter X → Topic Y`). It truncates and gives no sense of what *remains* in the active chapter.

**Fix**
Replace the one-liner with a per-subject **chapter coverage inset**:

```
Physics                          Electrostatics — Ch 1
●●●●○   4 / 5 topics covered    ✓ Coulomb's Law · ✓ Gauss · ✓ Potential · ✓ Capacitance
                                 ↳ Dielectrics & Polarisation pending
Last class: Fri, 11 Apr 2025
```

For each subject we render:
- Subject name + color dot
- The **active chapter** name (chapter of the last covered topic)
- A small progress bar `covered / total` for that chapter's topics
- An ordered list of topic chips: covered ones get `✓` + muted, the pending ones get a dotted outline + "pending"
- "Last class: <date>" footer

**Mock data extension** (`src/data/mockInstitutePrograms.ts`)
Replace the current 7 one-slot seeds with realistic prior-coverage seeds. For each prog-1 subject, seed slots so the last covered topic falls *in the middle* of a chapter — that's how the inset shows a meaningful covered/pending split:

| Subject  | Active chapter (ch idx) | Covered up to topic idx | Last class date |
|----------|------------------------|-------------------------|-----------------|
| Physics  | Electrostatics (0)     | 3 (Capacitance)         | 2025-04-11 |
| Chemistry| Solid State (0)        | 2 (Imperfections)       | 2025-04-12 |
| Maths    | Relations & Functions (0) | 2 (Composition & Inverse) | 2025-04-10 |
| Biology  | Reproduction in Org. (0) | 1 (Sexual Reproduction) | 2025-04-09 |
| English  | Flamingo — Prose (0)   | 1 (Lost Spring)         | 2025-04-11 |
| Hindi    | आरोह — काव्य (0)        | 0 (बच्चन)               | 2025-04-12 |
| Social   | Politics since Indep. (0) | 1 (Era of One-Party Dominance) | 2025-04-10 |

This is exactly what's already seeded, just with topic indices tuned so the visible "pending" list per chapter is non-empty.

## Step 2 (Weekly timetable) — fill every week

**Current state**
Only W1 is seeded (`PCM_WEEKLY_TIMETABLE` covers `2025-04-14`). W2…W~30 are empty.

**Fix**
At module init in `mockInstitutePrograms.ts`, after the W1 template is built, **clone the W1 pattern into every week** between the start date and computed `endDate` (using `addDays(weekStart, 7)` until end of academic window). All 30+ weeks will show the green ✓ "filled" chip, so the chip strip looks fully populated.

## Step 3 (Preview) — full schedule + Timetable / Week / Month layouts

**Toolbar simplification**
- Remove `Slots Allocated` and `Subjects` stat cards.
- Remove the `Timetable · Month · Week · List` segmented control.
- Replace with **Layout: [ Week ] [ Month ]** segmented control. No Day, no List.
- Keep **Regenerate** button on the right.
- Keep the subject legend dots row below the toolbar.

**Week layout (default)** — the current `Step3TimetableView`: Periods × Mon–Sat grid for **one** active week, with the W1…Wn sticky chip strip on top to navigate weeks. Already implemented; no behaviour change.

**Month layout (new)** — `Step3TimetableMonthView`:
- Header: `‹ April 2025 ›` month nav + "Today" button.
- Calendar grid: 7-day × 4–6 row month grid, Sun–Sat.
- Each day cell stacks **mini subject chips** (one per scheduled period, colored, showing `P{n} · Subject` or `P{n} · Subj — Topic` if room). Holidays render as a single muted "Holiday" chip.
- Click a day → opens a side popover with the day's full period list (period, time, subject, chapter → topic, faculty), with the same edit affordances as Week layout (chapter / topic / faculty editable, subject + time read-only).
- Same `min-w-[900px]` + horizontal scroll guard the Week layout has.

**Mock data**
At module init in `mockInstitutePrograms.ts`, run `generateFromTimetable(prog-1, configWithEffectiveHolidays(prog-1.schedule, []), priorSlots)` and assign `prog-1.generatedSlots = [...priorSlots, ...out.slots]`. This pre-populates every cell of every week so:
- Week layout cells are fully filled
- Month layout cells are populated
- Week chip strip W1…Wn renders chips for the whole window

`prog-2` / `prog-3` stay unseeded so the empty-state path remains demoable on those programs.

## Sticky top bar bleed (carried over from prior turn — confirmed still present)
`src/components/institute/InstituteLayout.tsx`:
- Header gets `bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm`.
- Wrap `<Outlet />` in a `bg-background` div so each route paints its own opaque base under the sticky header.

## Files to touch
- `src/data/mockInstitutePrograms.ts` — extend coverage seeds (already shaped right; just verify), clone W1 timetable into all weeks, auto-run `generateFromTimetable` to fill `prog-1.generatedSlots`.
- `src/pages/institute/programs/ProgramSchedulePage.tsx`
  - `CoverageList` → rewrite as `CoverageInsetList` rendering the chapter inset described above
  - `CalendarStep` → drop stat cards + Timetable/Month/Week/List switcher; add `Layout: [Week] [Month]` switcher; drop `MonthView`/`WeekView`/`ListView` legacy components and imports
  - Add new `Step3TimetableMonthView` component
- `src/components/institute/InstituteLayout.tsx` — opaque sticky header.

## Out of scope
- No changes to `calendarAutomation.ts` business logic.
- No changes to `prog-2` / `prog-3` mock data.
- Day view, List view, drag-to-move, exporting, the Setup wizard structure, or teacher panel.
