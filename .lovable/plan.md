## Goal
Add two action buttons at the bottom of every chapter's lesson-plan list in the Batch Programs page:
1. **Create lesson plan** — navigates to the existing content-creation page.
2. **Add** — opens an inline library modal so the teacher can pick existing content and attach it to the chapter.

## Why
Teachers currently see only the pre-built lesson plans inside a chapter. They need a way to inject their own material — either by creating brand-new content or by pulling from the existing Material Library.

## Files to change

### 1. `src/components/teacher/programs/ProgramChapterAccordion.tsx`
- Add two optional callback props: `onCreateLessonPlan?` and `onAddFromLibrary?`.
- At the bottom of the lesson-plans list (after the last `LessonPlanCard` or the empty-state message) render a right-aligned row with two small buttons:
  - **"Create lesson plan"** — primary/outline style, calls `onCreateLessonPlan`.
  - **"Add"** — outline style, calls `onAddFromLibrary`.
- Keep styling consistent with the rest of the card: subtle borders, small text, no large padding.

### 2. `src/pages/teacher/batches/BatchProgramsPage.tsx`
- Add local state to track which chapter has the "Add" modal open (`addModalChapterId: string | null`).
- Add local state to store lesson plans that were "added" from the library (`addedLessonPlans: Record<string, ProgramLessonPlan[]>` keyed by `chapterId`).
- Merge `addedLessonPlans` into the computed `program` object (similar to how `statusOverrides` is merged) so the new plans appear in the accordion.
- Pass the two new callbacks into `ChapterListSection`, and from there into each `ProgramChapterAccordion`.
- `onCreateLessonPlan` → `navigate('/teacher/lms/content/create')`.
- `onAddFromLibrary` → set `addModalChapterId`.
- Render `<AddLessonPlanModal />` at the page level, controlled by `addModalChapterId`.

### 3. New file: `src/components/teacher/programs/AddLessonPlanModal.tsx`
- A `Dialog` (shadcn/ui) that shows a searchable list of items from `mockLMSContent`.
- Each row shows: content title, type badge, subject, chapter, topic.
- Multi-select via checkboxes.
- "Add selected" button converts each selected `LMSContentItem` into a `ProgramLessonPlan` (minimal mapping: title, hoursPlanned = 1, status = 'not-started', empty contents array) and calls an `onAdd` callback with the list.
- Cancel / close buttons.
- Empty state when no items match the search.

## Data flow diagram
````text
BatchProgramsPage
  ├─ ChapterListSection
  │   └─ ProgramChapterAccordion (per chapter)
  │        └─ [Buttons] Create lesson plan  |  Add
  │
  └─ AddLessonPlanModal (controlled by addModalChapterId)
       └─ picks from mockLMSContent → returns ProgramLessonPlan[]
            → BatchProgramsPage appends to addedLessonPlans[chapterId]
````

## Edge cases handled
- Chapter has zero lesson plans: buttons still appear below the "No lesson plans yet" empty message.
- Teacher closes modal without selecting anything: no state change.
- Added plans are merged into the computed program so chapter %, topic counts, and schedule pills update automatically.
- Buttons are hidden when `onCreateLessonPlan` / `onAddFromLibrary` are not provided (backward-compatible).

## No backend changes
Everything is client-side using existing mock data and local React state.