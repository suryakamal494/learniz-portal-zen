# Plan — Surface "Add material" directly on teacher lesson plan cards

## Goal
A teacher just created a blank lesson plan and shouldn't have to figure out that "material lives behind Preview." The card itself should offer **Add material** as a primary action.

## Changes

### 1. `LessonPlanCard.tsx` — compact actions + Add material CTA
- Replace the "Preview" text button with an **icon-only** ghost button (eye icon, `aria-label="Preview"`) for **every** card. Saves horizontal space.
- For teacher-created plans (`createdBy === 'teacher'`):
  - Add a primary **`+ Add material`** button (blue, same height as preview) placed before the edit/preview icons.
  - Keep the pencil **Edit** icon button (icon-only).
- New prop: `onAddMaterial?: () => void`. Rendered only when present AND the plan is teacher-created.
- Final action row order, teacher card:  `[+ Add material]  [✏️]  [👁]`
- Final action row order, admin card:   `[👁]`

### 2. `LessonPlanPreviewModal.tsx` — allow opening directly in "Add" view
- Accept a new prop `initialView?: 'list' | 'add'` (default `'list'`).
- On open, set internal `view` to `initialView`. Reset to `'list'` on close (existing behavior).
- Keep the existing in-modal "+ Add material" button so the action is also available from the preview, as the user requested.

### 3. `ProgramChapterAccordion.tsx`
- Add `onAddMaterial?: (lessonPlanId: string) => void` prop, forwarded to `LessonPlanCard` for teacher plans only.

### 4. `BatchProgramsPage.tsx`
- New state: `addMaterialLpId: string | null`.
- Pass `onAddMaterial={(lpId) => setAddMaterialLpId(lpId)}` through `ChapterListSection` → `ProgramChapterAccordion`.
- When `addMaterialLpId` is set, render the existing `LessonPlanPreviewModal` with `initialView="add"` and that plan as context. (Re-use the same modal — don't open two at once. If preview was already open, prefer the add-material trigger and close preview.)
- Close handler clears `addMaterialLpId` (and `previewLpId` if it was the same).

## Why this stays simple
- One new prop on the card, one new prop on the modal, no new components.
- "Add material" is now a 1-click action from the card (the primary entry point) AND still available inside the preview (secondary).
- Preview becomes an icon to keep the row light, since 99% of new teacher cards will have 0 contents and the user's first need is *adding*, not *previewing*.

## Files touched
- `src/components/teacher/programs/LessonPlanCard.tsx`
- `src/components/teacher/programs/LessonPlanPreviewModal.tsx`
- `src/components/teacher/programs/ProgramChapterAccordion.tsx`
- `src/pages/teacher/batches/BatchProgramsPage.tsx`
