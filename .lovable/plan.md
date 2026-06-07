# Programs page cleanup + entry-point fixes

## 1. Remove "Currently running" card
Delete `<ThisWeekCard />` from `BatchProgramsPage.tsx`. "Where you stand" already answers the "where am I" question, and the highlighted chapter (below) shows what's running. Leave `ThisWeekCard.tsx` file in place (unused, safe to delete later). The stale-status alert's "Update now" button retargets to scroll to the highlighted chapter (`#chapter-<id>`) instead of `#this-week`.

## 2. Highlight the ongoing chapter
In `ChapterListSection` (inside `BatchProgramsPage.tsx`), identify the "current" chapter = the one containing the topic returned by `getTodayFocus(program)` (already computed). For that chapter card in `ProgramChapterAccordion`:
- Add a thicker blue ring + light blue tint on the header (`ring-2 ring-blue-400 bg-blue-50/40`).
- Add a small "Currently teaching" pill next to the chapter title.
- Default-open this chapter (already done) and auto-scroll to it on mount.

## 3. Simplify the lesson plan card
Rewrite `LessonPlanCard.tsx` to show **only**:
- Lesson plan title
- `Preview` button

Remove: status badge (Completed / In progress / Not started), summary text, "Contents: 1 PPT · 1 Video · 1 Note" line, and the "Used in: <topic>" chips. The card becomes a single row with title left, Preview right.

## 4. Keep topic → lesson plan linking, drop the inline chips inside topic rows
Inside the topic list in `ProgramChapterAccordion`, **remove** the "Lesson plans" chip strip under each topic (the `linkedLps` block). The lesson-plan list below the topics already covers it; user explicitly asked to remove that tag. Topic row keeps: status icon, name, dates, planned hours, Start/Mark done/Reopen actions.

(Validation note in chat: the alternative — nesting lesson plans inside each topic — duplicates LP cards when one LP supports two topics and bloats the chapter card vertically. Recommendation is to keep the flat "Topics" list followed by a single "Lesson plans" list, just stripped down per §3.)

## 5. Educators on the chapter
`ProgramChapter` has no `educators` field. Add an optional `educators?: Array<{ id: string; name: string; avatarColor?: string }>` to `ProgramChapter` in `src/types/program.ts`, seed 1–2 educators per chapter in `mockPrograms.ts` (rotate from a small pool: "Ms. Anika Rao", "Mr. Vivek Menon", "Dr. Suresh Iyer", etc.), and render them as small avatar+name chips in the chapter header row (below the date range).

## 6. Anchor list start at the "middle of the chapter"
Currently the chapter list is sorted by `plannedStartDate` ascending from June. With ~28 chapters that pushes the ongoing chapter far down. Change `ChapterListSection` so the list still renders all chapters in order, but on mount it **scrolls to the currently-teaching chapter** (uses the same focus chapter id, `requestAnimationFrame` + `scrollIntoView({ block: 'start' })`). This preserves chronological order while landing the teacher at "where I am" — matching the "starting point = middle of chapter" ask.

## 7. Section workspace page (`/teacher/batches/:id`)
In `SectionWorkspacePage.tsx`:
- Remove the `<SectionProgramsSummary />` block entirely (per screenshot 2). Quick actions already exposes Programs.
- Quick actions' Programs tile already navigates to `/teacher/batches/<id>/programs` — no change needed.

## 8. My Sections card Programs button (`/teacher/batches`)
In `BatchListingPage.tsx`, change the `onPrograms` handler from the placeholder `console.log` to `navigate(\`/teacher/batches/${b.id}/programs\`)` so the Programs button on each section card opens the Programs page directly.

## 9. Programs page also keeps its own Programs entry
The Programs page itself doesn't need a "Programs" quick action (it's already there). No change.

## Files touched
- `src/pages/teacher/batches/BatchProgramsPage.tsx` — remove ThisWeekCard, add highlight + auto-scroll, retarget stale alert button.
- `src/components/teacher/programs/ProgramChapterAccordion.tsx` — accept `isCurrent` prop, add ring + "Currently teaching" pill, render `educators` chips, remove inline topic→LP chip strip.
- `src/components/teacher/programs/LessonPlanCard.tsx` — strip down to title + Preview only.
- `src/types/program.ts` — add `educators` to `ProgramChapter`.
- `src/data/mockPrograms.ts` — seed `educators` on each chapter.
- `src/pages/teacher/batches/SectionWorkspacePage.tsx` — remove `SectionProgramsSummary` usage.
- `src/pages/teacher/batches/BatchListingPage.tsx` — wire `onPrograms` to navigate.

## Out of scope
- "Where you stand" strip stays as-is.
- Chapter `%` popover stays as-is.
- Filter chips stay as-is.
- `SectionProgramsSummary.tsx` file left in repo, unused.
