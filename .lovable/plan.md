# Chapter Tests + Tabbed Chapter View

## Requirements (captured)

1. **New "Tests" concept per chapter** — Super admin shares a set of tests to each chapter (e.g. 5–10 tests). Teachers can conduct these during teaching. Currently not surfaced anywhere in the programs page.

2. **Reorganize expanded chapter view into 3 tabs** so the page doesn't grow lengthy:
   - **Schedule** (rename of current "Topics")
   - **Lesson plans** (existing list + existing "Add from library" / "Create lesson plan" / "Add study notes" actions stay inside this tab)
   - **Tests** (new)

3. **Tests tab contents:**
   - List of all chapter tests (admin-shared + teacher-added) with title, question count, marks/duration, source badge (Admin / My library / Created), status (Enabled / Disabled).
   - Two top-right actions: **Add from library** and **Create test**.
     - "Create test" → routes directly to the AI-generated test page (`/teacher/exams/ai-generate`) with chapter context prefilled where possible.
     - "Add from library" → opens a picker (modal) of teacher's own test library, scoped to this chapter's subject.
   - Per-test row actions:
     - **Preview** → opens a modal listing the questions in that test (read-only).
     - **Disable / Enable** toggle → disabled tests are hidden from students. Default = Enabled. Disabled rows are visually muted with an "Off for students" pill.

## UX approach (keep it compact)

- Replace the current vertical stack (Topics block + Lesson plans block) with a slim tab bar inside the chapter panel.
- Tab bar sits right under the chapter header; only the active tab's content renders, so expanded height stays similar to a single section today.
- Default active tab = **Lesson plans** (most common action). Each tab shows a count chip: `Schedule (5) · Lesson plans (3) · Tests (8)`.
- Chapter header keeps the same meta row but adds a small "X tests" indicator next to "Y lesson plans" so teachers see test coverage without expanding.
- Disabled tests still appear in the teacher's list (greyed, with Enable button) — they are only hidden from students.

```text
┌─ Chapter 4: Quadratic Equations ─────────── On track · 72% ─┐
│ [ Schedule (5) ] [ Lesson plans (3) ] [ Tests (8) ]         │
│ ───────────────────────────────────────────────────────────  │
│  (active tab content only)                                   │
└──────────────────────────────────────────────────────────────┘
```

Tests tab layout:

```text
Tests · 8 shared by admin, 2 added by you
                          [ + Add from library ]  [ + Create test ]
──────────────────────────────────────────────────────────────
● Coulomb's Law — Basics        20 Q · 20 m   [Admin]   Preview  Disable
● Field Lines Quick Check        10 Q · 10 m   [Admin]   Preview  Disable
○ Practice Set 1 (disabled)      15 Q · 15 m   [Mine]    Preview  Enable
...
```

## Technical plan

### Types — `src/types/program.ts`
Add:
```ts
export type ChapterTestSource = 'admin' | 'library' | 'created';
export interface ChapterTest {
  id: string;
  chapterId: string;
  title: string;
  source: ChapterTestSource;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  enabledForStudents: boolean;   // default true
  sharedAt: string;              // ISO
  questionIds?: string[];        // for preview
}
```

### Mock data — `src/data/mockChapterTests.ts` (new)
- Deterministic seeded list per `chapterId` (5–10 admin-shared tests). Mirrors the seeding style in `mockSectionAssessments.ts`.
- Reuse `generateMockQuestions` from `mockAIGenerator.ts` to back the preview modal.
- Export `getChapterTests(chapterId)` returning `ChapterTest[]`.

### Components — new files
1. `src/components/teacher/programs/ChapterTestsTab.tsx`
   - Renders the test list + top "Add from library" / "Create test" buttons.
   - Handles enable/disable locally via callback up to parent (state lives in `BatchProgramsPage`).
   - "Create test" → `navigate('/teacher/exams/ai-generate?chapterId=...&subjectId=...')`.
   - "Add from library" → opens `AddTestFromLibraryModal`.

2. `src/components/teacher/programs/ChapterTestPreviewModal.tsx`
   - shadcn `Dialog`. Shows test header (title, Q count, duration, marks) and a scrollable list of questions with options and the correct answer highlighted (teacher view only).

3. `src/components/teacher/programs/AddTestFromLibraryModal.tsx`
   - Simple `Dialog` with a search box and checkbox list pulled from a small mock library scoped to the chapter's subject. Confirm adds the picked tests as `source: 'library'`.

### Components — modified
1. `src/components/teacher/programs/ProgramChapterAccordion.tsx`
   - Inside the expanded panel, replace the current two stacked sections with a `Tabs` component (shadcn) containing three tabs: **Schedule**, **Lesson plans**, **Tests**.
   - Move the existing Topics list into the **Schedule** tab unchanged (just relabelled).
   - Move existing lesson-plan toolbar + list into the **Lesson plans** tab unchanged.
   - Add **Tests** tab rendering `<ChapterTestsTab />`.
   - Header meta row: add `· N tests` next to lesson-plan count.
   - New props: `tests: ChapterTest[]`, `onToggleTestEnabled(testId)`, `onPreviewTest(testId)`, `onAddTestFromLibrary(chapterId)`, `onCreateTest(chapterId)`.

2. `src/pages/teacher/batches/BatchProgramsPage.tsx`
   - Add `chapterTests` state keyed by `chapterId` (initialised from `getChapterTests`).
   - Wire toggle / add-from-library handlers (local state only).
   - Wire `onCreateTest` → `navigate('/teacher/exams/ai-generate?chapterId=...&subjectId=...&batchId=...')`.
   - Mount `ChapterTestPreviewModal` controlled by `previewTestId` state.

3. `src/pages/teacher/exams/AIExamGeneratorPage.tsx` (light touch only)
   - Read `chapterId` / `subjectId` / `batchId` from query params and prefill the AI config form if present. No structural changes.

### Out of scope
- No backend / Supabase changes. State is in-memory like other program-page state today.
- Student-facing views are not touched (platform is teacher-only per project memory).
- Reports/Attendance tabs untouched.
- Content tab untouched.

### Files to add
- `src/data/mockChapterTests.ts`
- `src/components/teacher/programs/ChapterTestsTab.tsx`
- `src/components/teacher/programs/ChapterTestPreviewModal.tsx`
- `src/components/teacher/programs/AddTestFromLibraryModal.tsx`

### Files to modify
- `src/types/program.ts`
- `src/components/teacher/programs/ProgramChapterAccordion.tsx`
- `src/pages/teacher/batches/BatchProgramsPage.tsx`
- `src/pages/teacher/exams/AIExamGeneratorPage.tsx` (prefill from query params only)
