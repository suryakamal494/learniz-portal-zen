## Goal
In `/teacher/exams/ai-generator`, make each generated question's meta tags (Topic, Difficulty, Category) editable inline, persist edits across new generation batches, and never show an empty "No questions yet" state — pre-seed a demo batch of 5 so the right panel always feels alive.

## Requirements (as understood)
1. Each question card in the Generated Questions panel shows its three meta tags as **editable controls** (dropdowns): Topic, Difficulty, Category. Chapter stays as a read-only badge (it identifies the batch's scope).
2. Editing a question's meta tag updates only that question. When the teacher clicks Generate again, the new batch is **appended**; previously edited questions keep their edited values untouched.
3. The teacher can also edit the meta tags of newly generated questions the same way.
4. Right panel never renders the empty state. On first load, seed 5 sample questions (a "Sample batch") so teachers see the editable UX immediately. Left panel (Test Details + AI Configuration) remains required for *new* generations and still gates the Generate button exactly as today.
5. Sample batch is clearly labeled (e.g., "Sample") and behaves like any other batch — teachers can edit, deselect, delete, or replace it by generating their own.

## UX design

**Per-question card meta strip** (replaces the static badges currently shown):
```
[Topic ▾]   [Difficulty ▾]   [Category ▾]   · Chapter: Electrolysis · 2 marks
```
- Compact shadcn `Select` triggers styled as small pill buttons (h-7, text-xs) so the row stays dense and doesn't add vertical bulk.
- **Topic** options = topics of the question's source chapter (from `SUBJECT_OPTIONS`).
- **Difficulty** options = easy / medium / hard, color-coded (green/amber/rose) on the trigger itself so a glance still reads the level.
- **Category** options = `QUESTION_CATEGORIES`.
- A tiny "edited" dot appears next to a tag when its value differs from the AI-generated original (helps teachers audit changes before creating the exam).

**Sample batch banner** (top of Generated Questions panel when only the sample exists):
> "Showing 5 sample questions so you can try editing meta tags. Generate your own batch on the left to replace or add to these."
With a subtle "Clear samples" link.

## Technical implementation

### State / data
- `AIQuestionBatch` gains an optional `isSample?: boolean` (no type churn elsewhere).
- On mount, if `questions.length === 0`, seed one sample batch + 5 questions via existing `generateMockQuestions` using a default config (Physics → Electric Charges and Fields, mixed difficulties/categories) and mark `batch.isSample = true`. This runs in a `useEffect` once.
- Edits update the per-question fields directly on the `GeneratedQuestion` in state — no separate override map needed, because batches are append-only and questions already carry their own `topic / difficulty / category`. Persistence across new batches is automatic since we never mutate previously generated items during `handleGenerate`.
- Track originals: extend `GeneratedQuestion` with optional `originalTopic / originalDifficulty / originalCategory` set at creation time, so the "edited" dot can compare without extra state.

### New small handler
```ts
const handleUpdateMeta = (id: string, patch: Partial<Pick<GeneratedQuestion,'topic'|'difficulty'|'category'>>) =>
  setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q))
```

### Render changes (in `AIExamGeneratorPage.tsx`, question card section)
- Replace the current static `Badge` row for topic/difficulty/category with three `Select` controls bound to `handleUpdateMeta`.
- Resolve available topic list per card by looking up the question's chapter via `SUBJECT_OPTIONS` (helper `getTopicsForChapter(chapterName)`).
- Keep chapter, marks, and serial as plain text (non-editable).

### Empty-state removal
- Remove the "No questions yet" block entirely. The first-mount seeding guarantees `questions.length > 0`. If the teacher deletes everything (including samples), show a tiny inline hint instead of a full-page empty state: "All questions cleared — generate a batch from the left."

### Files touched
- `src/pages/teacher/exams/AIExamGeneratorPage.tsx` — seeding effect, replace meta badges with editable Selects, add `handleUpdateMeta`, drop full empty-state block.
- `src/types/aiExamGenerator.ts` — add `originalTopic/originalDifficulty/originalCategory?` to `GeneratedQuestion`; add `isSample?` to `AIQuestionBatch`.
- `src/data/mockAIGenerator.ts` — set the three `original*` fields when creating questions; export a small `getTopicsForChapter(chapterName)` helper used by the card.

No backend, no routing, no left-pane logic changes. Generate button, validation, batch counter, select-all, regenerate-deleted, and Create Exam flow all stay as they are.

## Out of scope
- Editing the question text or options themselves (you only asked about meta tags).
- Persisting edits across page reloads.
