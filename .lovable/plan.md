# Plan — Programs page: simpler status strip + inline lesson plan / material creation

## A. "Where you stand" strip cleanup

In `src/components/teacher/programs/StatusOverviewStrip.tsx`:

1. **Remove** the "Syllabus completed (%)" tile — teachers find percentages opaque.
2. **Remove** the "Chapters in progress" tile — a section only ever has one in-progress chapter at a time, so the number is meaningless.
3. **Replace** "Behind schedule: 4" with **"Periods behind: N"**, where N = total planned periods (1 period ≈ 1 planned hour, rounded) for all not-yet-done topics whose `plannedEndDate` is before today. Label reads e.g. `3 periods` (singular `1 period`).
4. **Keep** the "Last status update" tile unchanged.
5. Drop the trailing `Total: 31h taught of 214h planned` line (it duplicates the removed % tile).

Resulting strip = 2 tiles: **Periods behind** · **Last status update**. Use `grid-cols-1 sm:grid-cols-2` and keep the existing `MetricWithMeaning` "what it means / how it's calculated / next step" tooltip pattern.

In `src/utils/programSchedule.ts`, extend `getStatusOverview` to also return `periodsBehind: number` (sum of `plannedHours` of overdue, not-`done` topics, rounded). Leave the existing fields alone so nothing else breaks.

## B. Inline lesson plan creation (no page redirect)

Today, "Create lesson plan" navigates to `/teacher/lms/content/create`. Replace that with an inline dialog so teachers stay on the Programs page.

### B1. New component `CreateLessonPlanInlineModal.tsx`

A small Dialog with:
- **Read-only context chips** (auto-filled from the chapter the user clicked from): Institute · Class · Subject · Chapter. No dropdowns — these are already known.
- **Title input** (required, single field).
- **Create button** → calls `onCreate({ chapterId, title })` and closes.

It returns a new `ProgramLessonPlan` with:
- `id: 'lp-teacher-' + uuid`
- `summary: 'Created by you'`
- `contents: []` (blank — material added later)
- `status: 'not-started'`, `hoursPlanned/Spent: 0`
- A new `createdBy: 'teacher' | 'admin'` flag (added to `ProgramLessonPlan` in `src/types/program.ts`; existing plans treated as `'admin'`).

### B2. Wire into `BatchProgramsPage.tsx`

- Replace the existing `onCreateLessonPlan={() => navigate(...)}` with `setCreateModalChapterId(chapter.id)`.
- Render `<CreateLessonPlanInlineModal>` and on submit push the new plan into the same `addedLessonPlans[chapterId]` map already used by "Add from library".
- No routing change. No new page.

### B3. "Created by you" badge

In `src/components/teacher/programs/LessonPlanCard.tsx`, when `lessonPlan.createdBy === 'teacher'`, render a small pill next to the title: `Created by you` (indigo/blue tint). Admin-created plans show no pill (the default).

For teacher-created plans, also add an **Edit** icon button next to Preview that opens the same create-modal in "edit title" mode.

## C. Inline material creation inside the preview modal

Today `LessonPlanPreviewModal` only lists existing contents. Change it so the teacher can add material **without leaving the page**, using a two-state pattern inside the **same** dialog (no stacked dialogs — keeps it light).

### C1. Update `LessonPlanPreviewModal.tsx`

Add a local `view: 'list' | 'add'` state.

- **List view (default):**
  - Header keeps title + summary.
  - Add an **`+ Add material`** button at the top-right of the contents header (only shown when the plan is `createdBy === 'teacher'` — admin plans stay read-only; can be opened up later).
  - Lists existing `lessonPlan.contents` as today.

- **Add view (in-place, replaces list inside the same dialog body):**
  - Back arrow → returns to list.
  - Read-only context chips (Institute · Class · Subject · Chapter · Lesson plan) — same auto-fill pattern as B1.
  - **Title** input (required).
  - **Type** select: `pdf | video | ppt | note | html` (reuse `LessonPlanContentType`).
  - **File upload** (`<input type="file">`) OR **URL** input depending on type. For the mock data app, store the file name / URL in `content.url` and skip real upload.
  - **Save** → appends a new `LessonPlanContent` to the lesson plan's `contents`, switches `view` back to `'list'`, and surfaces a toast.

### C2. Where the new content lives

`BatchProgramsPage` owns lesson-plan state via `addedLessonPlans`. Lift a new `lessonPlanContents` override map: `Record<lessonPlanId, LessonPlanContent[]>`, merged into the computed `program` the same way `addedLessonPlans` is. `LessonPlanPreviewModal` receives an `onAddContent(lessonPlanId, content)` callback that updates this map.

## D. Why this stays uncluttered

- One inline dialog for "Create lesson plan" (title only — no filters, because the chapter context already disambiguates).
- One dialog for the lesson plan itself, with an internal `list ⇄ add` swap for adding material. Never two dialogs open at once.
- Admin plans remain read-only by default; teacher plans get the inline edit / add-material affordances. Visual badge keeps the two clearly distinguishable.
- No routing changes — everything happens on `/teacher/batches/:id/programs`.

## Files touched

- `src/utils/programSchedule.ts` — add `periodsBehind` to `getStatusOverview`.
- `src/components/teacher/programs/StatusOverviewStrip.tsx` — drop 2 tiles, swap "Behind schedule" → "Periods behind", drop totals footer.
- `src/types/program.ts` — add optional `createdBy?: 'admin' | 'teacher'` to `ProgramLessonPlan`.
- `src/components/teacher/programs/CreateLessonPlanInlineModal.tsx` — **new**.
- `src/components/teacher/programs/LessonPlanCard.tsx` — "Created by you" pill + Edit button for teacher plans.
- `src/components/teacher/programs/LessonPlanPreviewModal.tsx` — internal list/add view + `onAddContent` prop.
- `src/pages/teacher/batches/BatchProgramsPage.tsx` — wire create modal, edit modal, content overrides; remove `navigate('/teacher/lms/content/create')`.

No backend changes; everything stays in-memory like the current `addedLessonPlans` map.
