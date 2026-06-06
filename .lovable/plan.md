# Programs & Progress for Section Workspace

Bring two missing things into a teacher's section view (`/teacher/batches/:batchId`):
1. **Programs** assigned to the batch — Subject (only if 2+) → Chapters → Lesson Plans (with Preview).
2. **My Progress** for this batch — chapter-wise % completion driven by teaching status logs.

Shown as an **inline summary card** on the workspace, with **dedicated pages** for drill-down. A new **"Programs"** Quick Action becomes the first tile.

---

## Program structure (canonical)

```text
Program (per batch)
└── Subject tab        ← only rendered if batch has 2+ subjects
    └── Chapter (collapsible)
        └── Lesson Plan card  [ Preview ]
                └── (in modal) PPTs · HTML · Videos · etc.
```

No topics. No subject header when there's only one subject — just go straight to chapters.

---

## What the teacher sees on the workspace

```text
┌─ Programs & Progress ─────────────────────────────────┐
│  2 programs · 42% overall completion                  │
│                                                       │
│  ● Chemistry      ████████░░  68%                     │
│  ● Physics        ████░░░░░░  35%                     │
│                                                       │
│  What it means: On track in Chemistry; Physics        │
│  needs attention this week.                           │
│                                                       │
│  [ View programs → ]   [ Open progress tracker → ]    │
└───────────────────────────────────────────────────────┘
```

Quick Actions row reorders so **Programs** is the first tile, before Assign Lesson Plan.

---

## New pages

### 1. Programs page — `/teacher/batches/:batchId/programs`
- **Subject tabs** at top — rendered only when batch has 2+ subjects. Single-subject batches skip tabs.
- Under the active subject: **chapter accordion list**.
  - Chapter header: name, chapter number, lesson-plan count, chapter % complete pill (Green/Amber/Red per thresholds).
  - Expanded: vertical stack of **Lesson Plan cards**.
- **Lesson Plan card** contents:
  - Title, short summary, item counts (e.g. "3 PPTs · 1 video · 2 HTML"), status badge.
  - **Preview** button → opens `LessonPlanPreviewModal` listing every content item inside the lesson plan with type icon, title, and a "View" link that opens the existing MediaViewer.

### 2. Progress Tracker page — `/teacher/batches/:batchId/progress`
- Top summary: overall %, hours completed vs planned ("18h 30m of 44h"), sessions completed/partial/missed.
- Subject tabs (same rule: only if 2+ subjects) → per-chapter rows with progress bar, % complete, hours spent, last-taught date.
- Filter: status (All / In progress / Not started / Done).
- Reuses pastel pill thresholds and the "Data WITH Understanding" pattern.

---

## Phased implementation

### Phase 1 — Data model & mocks
- `src/types/program.ts`:
  - `Program { id, batchId, subjects: ProgramSubject[] }`
  - `ProgramSubject { id, name, chapters: ProgramChapter[] }`
  - `ProgramChapter { id, name, order, lessonPlans: ProgramLessonPlan[] }`
  - `ProgramLessonPlan { id, title, summary, contents: LessonPlanContent[], lmsSeriesId? }`
  - `LessonPlanContent { id, type: 'ppt'|'html'|'video'|'pdf'|'note', title, url? }`
- `src/data/mockPrograms.ts` — mix of single-subject and 2-subject batches; reuses existing chapter/lesson-plan names from `mockLMSSeries` / `mockCourses`.
- `src/utils/programProgress.ts` — joins `mockPrograms` with `mockTeachingProgress` to compute:
  - `getProgramSummary(batchId)` → list for the workspace card.
  - `getChapterProgress(batchId, subjectId, chapterId)` → % + hours + sessions.

### Phase 2 — Inline summary on Section Workspace
- `src/components/teacher/batches/SectionProgramsSummary.tsx` — the card shown above.
- Inserted in `SectionWorkspacePage.tsx` between the Identity card and Quick Actions.
- Add **Programs** as the first tile in `SectionQuickActions.tsx` (BookOpenCheck icon, blue) → routes to Programs page.

### Phase 3 — Programs page
- `src/pages/teacher/batches/BatchProgramsPage.tsx` at `/teacher/batches/:batchId/programs`.
- Components:
  - `ProgramSubjectTabs.tsx` — only renders when `subjects.length > 1`; otherwise returns children directly.
  - `ProgramChapterAccordion.tsx` — chapter rows with % pill + collapsible body.
  - `LessonPlanCard.tsx` — title, content-type counts, status badge, **Preview** button.
  - `LessonPlanPreviewModal.tsx` — lists every content item with type icon; "View" hooks into the existing `MediaViewer` for PPT/HTML/video.
- Wire route in `App.tsx`.

### Phase 4 — Progress Tracker page
- `src/pages/teacher/batches/BatchProgressTrackerPage.tsx` at `/teacher/batches/:batchId/progress`.
- Components:
  - `ProgressOverviewCards.tsx` (overall %, hours, sessions).
  - `ChapterProgressList.tsx` (per-chapter rows, reuses the subject-tabs rule).
  - `ProgressFilters.tsx` (status only).
- "Open progress tracker" button on the workspace card links here.

### Phase 5 — Polish & verification
- Empty states: no programs assigned, no lesson plans in a chapter.
- Loading skeletons via `TeacherLoadingSkeleton`.
- Verify pastel theme, Blue/Indigo primary buttons, `Xh Ym` time format, integer percentages.
- Update `mem://features/program-management` to document the per-batch program shape: subject-tab-only-if-needed, no topics, Preview modal on lesson plans.

---

## Technical notes
- All progress is **read-only** here — ticking lesson plans as taught stays out of scope (driven by existing schedule status logs).
- `MediaViewer` is reused for content previews — no new viewer code.
- No backend changes; mocks + frontend only, Laravel-ready prop shapes.
- Mobile-first grids and existing semantic tokens throughout.

---

## Out of scope
- Editing/assigning programs from the teacher side (institute action).
- Falling-behind notifications.
- Topic-level breakdown (intentionally removed per requirement).
