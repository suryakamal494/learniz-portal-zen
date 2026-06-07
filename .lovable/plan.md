# Programs page — restructure + year-long seed

## New page flow (top → bottom)
1. **Breadcrumb + header** (unchanged)
2. **This week** — the single topic scheduled for the current week, with chapter context, dates, planned hours, and quick `Mark in progress` / `Mark done`. Replaces "Today's focus".
3. **Where you stand** — % completed, chapters in progress, behind schedule, last status update (unchanged).
4. **Chapters & lesson plans** — full year-long list with filter chips. No "Today" pill at the bottom.

## Changes by area

### 1. Mock data — full academic year for Class 12 · Section A
Rewrite `src/data/mockPrograms.ts` for `batchId: '1'`:
- **Physics** — 14 chapters (Electrostatics, Current Electricity, Magnetic Effects, EMI, AC, EM Waves, Ray Optics, Wave Optics, Dual Nature, Atoms, Nuclei, Semiconductors, Communication, Revision).
- **Chemistry** — 14 chapters (Solid State, Solutions, Electrochemistry, Chemical Kinetics, Surface Chemistry, Metallurgy, p-Block, d & f Block, Coordination, Haloalkanes, Alcohols & Ethers, Aldehydes/Ketones/Acids, Amines, Biomolecules).
- Schedule **Jun 2026 → Apr 2027**, each chapter 4–7 days, 4–6 topics each. Gaps for Dussehra (early Oct), Diwali (early Nov), winter break (late Dec), pre-board (Feb). Total ~120–130 topics per subject.
- Seed `status` so that the chapter overlapping today (Sun Jun 7, 2026) has 1–2 topics `in-progress`, earlier chapters mostly `done` with a few `not-started` (drives "behind schedule"), later chapters `not-started`.
- Lesson plans: pool of ~12 reusable LP definitions (Concept intro, Worked examples, Numericals drill, Derivation walkthrough, Quick quiz, Recap & doubts, etc.). Each chapter picks 3–5 from the pool; topics reference 1–2 LP ids via `lessonPlanIds`. Helper builder keeps the file compact.
- Keep existing `Program / ProgramChapter / ProgramTopic / ProgramLessonPlan` shape — no type changes.

### 2. Replace "Today's focus" with "This week"
- Delete usage of `TodayFocusCard` from `BatchProgramsPage.tsx`. Keep the component file for now (unused, safe to delete later).
- New `src/components/teacher/programs/ThisWeekCard.tsx`:
  - Computes the **single topic** whose `[plannedStartDate, plannedEndDate]` overlaps the current ISO week (Mon–Sun). If multiple, pick the one with the earliest end. If none, fall back to the next upcoming topic with a "Starts in Nd" hint, or the most recent in-progress topic.
  - Renders: subject · chapter breadcrumb chip, topic title, planned hours, date range, status pill (On track / Behind Nd / Ahead Nd) computed from `plannedEndDate` vs today, and `Mark in progress` / `Mark done` buttons wired to `handleTopicStatus`.
  - "Jump to chapter" link that scrolls to `#chapter-<id>` and opens its accordion.

### 3. Chapter % breakdown popover
- In `ProgramChapterAccordion.tsx`, wrap the `%` badge in the chapter header in a Radix `Popover` (click, not hover — works on mobile too).
- Popover content (compact, ~280px):
  - **What this means**: "X of Y topics done · Z hours taught of W planned".
  - Mini bar: topics done / in-progress / not-started counts with color dots.
  - Hours line: `6h 30m taught of 18h planned` with a thin progress bar.
  - Schedule delta: "Behind 3 days" / "On track" / "Ahead 2 days" derived from `getScheduleDeltaForChapter`.
  - Last taught date (from latest topic `lastUpdatedAt`).
- Stop propagation so clicking the % doesn't toggle the accordion.

### 4. Remove the bottom "Today" anchor
- Delete the `TodayAnchor` render + `anchorIndex` computation from `ChapterListSection` in `BatchProgramsPage.tsx`. The current chapter is already surfaced by the new "This week" card; the anchor only confused things at the page tail.
- Keep `TodayAnchor.tsx` file unused for now (safe later cleanup).

### 5. Small polish
- Sort chapters strictly by `plannedStartDate`.
- Default-open the chapter that contains the "This week" topic; collapse the rest.
- Update the "Total: 6h 30m taught of 18h planned" line under `StatusOverviewStrip` to reflect the new totals from the year-long seed.
- Stale-status alert keeps working but its "Update now" button now scrolls to `#this-week`.

## Files touched
- `src/data/mockPrograms.ts` — full rewrite with year-long Physics + Chemistry seed.
- `src/components/teacher/programs/ThisWeekCard.tsx` — **new**.
- `src/pages/teacher/batches/BatchProgramsPage.tsx` — swap card, remove Today anchor, adjust default-open chapter, retarget "Update now" scroll.
- `src/components/teacher/programs/ProgramChapterAccordion.tsx` — add Popover on the % badge.
- (Unused, left in place for now: `TodayFocusCard.tsx`, `TodayAnchor.tsx`.)

## Out of scope
- No backend / schema changes.
- No edits to LessonPlan card, preview modal, subject tabs, or filter chips.
- "Today's focus" on the teacher dashboard is untouched.
