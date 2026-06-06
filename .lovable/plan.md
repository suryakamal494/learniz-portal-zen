# AI Exam Generator — Compact Redesign (Horizontal Strip Workspace)

Picking **Direction v2 — Horizontal strip workspace** because it directly fixes the "page is too long" problem: it collapses the tall left rail into a single thin pinned config strip and gives the entire page width and height to the question feed.

## What the new page looks like

```text
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back   ✨ AI Exam Generator           [Active|Selected|Deleted]   │ sticky header
├──────────────────────────────────────────────────────────────────────┤
│ Name+Duration │ Subject·Chapter │ Difficulty │ Qty │ [Generate ✨] ⚙ │ sticky config strip
├──────────────────────────────────────────────────────────────────────┤
│           ─── Batch 1 · 5 Qs · Medium · Conceptual ───               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ☑ Q1  [Physics][Formulae]                       ↻  🗑        │   │
│  │   "A force F acts on 2 kg…"  (KaTeX math)                    │   │
│  │   A □   B ✓   C □   D □                                       │   │
│  │   Explanation: F = ma = 4 N                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Q2 Physics + small circuit diagram thumbnail                 │   │
│  │ Q3 Chemistry · H₂O molecular geometry                        │   │
│  │ Q4 Math · ∫ x² dx                                            │   │
│  │ Q5 Chemistry · stoichiometry                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│            [ + Generate 5 more in this batch ]                       │
├──────────────────────────────────────────────────────────────────────┤
│ Total 15  •  Selected 5  •  Marks 15      [Cancel]  [Create Exam →] │ sticky footer
└──────────────────────────────────────────────────────────────────────┘
```

## Key changes vs current page

- Remove the tall left pane (`Test Details` + `AI Configuration` accordions).
- Replace with one **sticky horizontal config strip** under the header: Exam Name + Duration · Subject▾Chapter▾ · Difficulty pills · Quantity · `Generate Batch` · ⚙ Advanced popover.
- Advanced popover (⚙) hosts the less-used fields: Marks/Q, Negative Marking, Exam Type, Test Instructions, Topic multi-select, Category checkboxes, Question Type, Prompt textarea.
- Question feed becomes the entire body: max-width canvas, grouped by **Batch dividers**, rich cards with KaTeX math, optional diagram thumbnail, A–D options (correct highlighted), explanation, hover-revealed kebab (Select / Delete / Regenerate).
- Segmented filter `Active | Selected | Deleted` lives in the header right.
- Sticky bottom action bar keeps live counters and `Create Exam`.
- "Generate N more" affordance sits at the end of each batch (and the config strip's button still appends a new batch).

## Phased implementation

**Phase 1 — Config strip**
- New `AIExamConfigStrip.tsx`: 12-col grid with Name+Duration, Subject/Chapter, Difficulty pills, Qty, Generate button, Advanced ⚙ trigger.
- Remove the old left-pane `SectionCard` rendering from `AIExamGeneratorPage.tsx`.

**Phase 2 — Advanced popover**
- `AIExamAdvancedPopover.tsx` (shadcn `Popover` + `Sheet` on mobile) holding Marks/Q, Negative Marking, Exam Type, Instructions, Topic, Category checkboxes, Question Type, Prompt.

**Phase 3 — Question feed polish**
- Upgrade `GeneratedQuestionCard` to the v2 visual: checkbox column, subject/category chips, KaTeX-rendered math (use existing `katex` if present, otherwise `react-katex`), optional diagram thumbnail slot, highlighted correct option, explanation box, hover-revealed action row (Regenerate / Delete / kebab with Select).
- `BatchDivider` updated to pill style ("Batch N · X Qs · Difficulty · Category").
- Add `Generate N more` inline button at the end of each batch (uses that batch's config).

**Phase 4 — Mock data with substance**
- Expand `mockAIGenerator.ts`: at least 12 templates across Physics/Chemistry/Math with real KaTeX strings (`$F = ma$`, `$\int x^2\,dx$`, `$H_2O$`), 2 templates with `diagramUrl` (inline SVG circuit + molecular geometry), varied difficulties and categories.
- Every Generate click returns the requested count, never empty.

**Phase 5 — Sticky footer + segmented filter**
- Move `Active | Selected | Deleted` filter into the header right.
- Footer keeps Total / Selected / Marks counters + `Cancel` / `Create Exam` (existing behavior preserved).

**Phase 6 — Responsive**
- ≥ lg: horizontal strip as designed.
- < lg: strip collapses to two rows (Name+Subject row, Difficulty+Qty+Generate row); Advanced opens as bottom `Sheet`.

## Technical notes

- Files to add: `src/components/teacher/exams/ai/AIExamConfigStrip.tsx`, `AIExamAdvancedPopover.tsx`, `BatchDivider.tsx` (if not already extracted).
- Files to edit: `src/pages/teacher/exams/AIExamGeneratorPage.tsx` (layout swap), `src/components/teacher/exams/ai/GeneratedQuestionCard.tsx` (visual upgrade), `src/data/mockAIGenerator.ts` (templates + diagrams).
- Keep all existing logic: additive batches (`setQuestions(prev => [...prev, ...newQs])`), per-question regenerate, deleted-state restore, create-exam append to `mockExamsData`, route `/teacher/exams/ai-generator`.
- Tokens only — no hardcoded hex; use `primary` (indigo), `muted`, `border`, `card` from the design system.
- No new dependencies unless `katex`/`react-katex` is missing; will check first and fall back to formatted spans if absent.

## Out of scope

- Sidebar/header redesign, other exams pages, backend wiring, AI provider integration.
