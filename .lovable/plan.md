# Plan — "Add study notes" per chapter (inline form + count indicator)

## Goal
A third action on each chapter (next to *Add from library* / *Create lesson plan*) that lets the teacher share a study note for that chapter inline. We do **not** list the notes — we just surface a count so the teacher knows "yes, things are shared here."

## 1. Where the count lives

Two places, both subtle, no new list rendered:

**A. Chapter header (collapsed and expanded)** — the small meta row that today reads `📅 1 Oct → 7 Oct · 5 topics`. Append a pill when count > 0:

```
📅 1 Oct → 7 Oct · 5 topics · 📄 3 study notes shared
```

The pill is muted emerald (`bg-emerald-50 text-emerald-700`) and the document icon makes it scannable without competing with the schedule / % pills on the right.

**B. Inside the expanded chapter, in the "Lesson plans" toolbar** — the same row that holds *Add from library / Create lesson plan*. We add the third button there and, when count > 0, show a tiny inline status to its left:

```
Lesson plans               ✓ 3 study notes shared   [+ Add study notes]  [+ Add from library]  [+ Create lesson plan]
```

That gives the teacher confirmation right where they took the action — no scrolling, no new section.

We deliberately **don't** add a separate "Study notes" panel. Listing them was rejected by the user.

## 2. The inline "Add study notes" form

A small `Dialog` (same pattern as `CreateLessonPlanInlineModal`), titled **Share study note**:

- **Read-only context chips** (auto-filled, no dropdowns): Institute · Class · Subject · Chapter.
- **Title** (required, single line).
- **File upload** (required) — accept `.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg`. We just capture the file name (mock app, no real upload).
- **Optional one-line description** (text input).
- **Share** button → fires `onShare({ chapterId, title, fileName, description })` and closes.

A toast confirms: *"Study note shared with this chapter."*

## 3. State + plumbing (no new page)

- `src/types/program.ts` — add a small interface:
  ```ts
  export interface ChapterStudyNote {
    id: string;
    title: string;
    fileName: string;
    description?: string;
    sharedAt: string;
  }
  ```
- `BatchProgramsPage.tsx` — new state `studyNotes: Record<chapterId, ChapterStudyNote[]>`. Merge counts into the computed `program` chapters as a derived `studyNoteCount` (kept off the persistent type — we pass count as a prop).
- New modal state `addNotesChapterId: string | null` mirroring the existing `createModalChapterId`.
- Pass `studyNoteCount` and `onAddStudyNote` through `ChapterListSection` → `ProgramChapterAccordion`.

## 4. Component changes

- **New file** `src/components/teacher/programs/AddStudyNoteModal.tsx` — the dialog described in §2.
- **`ProgramChapterAccordion.tsx`**:
  - New props: `studyNoteCount?: number`, `onAddStudyNote?: (chapterId: string) => void`.
  - In the meta row: render the emerald `📄 N study notes shared` pill when count > 0.
  - In the Lesson plans toolbar: add the third button **`+ Add study notes`** (gray outline, document icon — visually distinct from blue "Create lesson plan" and gray "Add from library" so all three are clearly different actions). Render the inline `✓ N study notes shared` confirmation chip to the left of the buttons when count > 0.
- **`BatchProgramsPage.tsx`**: wire state, modal, and the toast.

## 5. Why this stays clean

- One new button, one new modal, one new pill. No new page, no new list, no new section.
- The count is informational only — clicking it does nothing (per the user's "we don't want to see what notes they have added").
- All three chapter-level actions stay on one row; on narrow widths the existing `flex-wrap` handles it.

## Files touched
- `src/types/program.ts` *(add type)*
- `src/components/teacher/programs/AddStudyNoteModal.tsx` *(new)*
- `src/components/teacher/programs/ProgramChapterAccordion.tsx`
- `src/pages/teacher/batches/BatchProgramsPage.tsx`
