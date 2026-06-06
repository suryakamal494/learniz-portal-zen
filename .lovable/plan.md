## What I understood

You want me to:

1. **Rename** the `✨ AI Test Generator` button on `/teacher/exams` to `✨ AI Exam Generator`.
2. **Replace the 3-page flow** (Step 1 Config → Step 2 Preview → Step 3 Test Info) with a **single-page workspace** that:
   - Captures **test metadata first** (Name, Duration, Marks/Q, Negative Marking, Exam Type, Instructions) — the natural starting point for a teacher.
   - Then the **AI configuration** (Subject, Chapter, Topics, Number of Questions, Difficulty, Question Type, Categories, Custom Instructions).
   - Then the **generated questions list** which **accumulates** across multiple Generate clicks (new questions append to the existing list; nothing gets wiped).
   - Lets the teacher select, delete, or regenerate individual questions.
   - One final **Create Exam** action submits everything.
3. **Layout** must work well on desktop AND mobile, feel spacious (not cramped, not empty), and avoid forcing teachers between pages.

## Proposed UX: Two-pane workspace (desktop) / Stacked accordion (mobile)

```text
Desktop ≥ lg                                  Mobile / Tablet
┌─────────────────────┬──────────────────────┐  ┌──────────────────┐
│ LEFT PANE (sticky)  │ RIGHT PANE (scroll)  │  │ Sticky top bar:  │
│ ~38% width          │ ~62% width           │  │ counters + CTA   │
│                     │                      │  ├──────────────────┤
│ 1. Test Details     │ Generated Questions  │  │ Accordion:       │
│    (collapsible)    │  ─ Counter strip     │  │  ▸ Test Details  │
│                     │    (Total / Selected │  │  ▸ AI Config     │
│ 2. AI Configuration │     / Deleted)       │  │  ▸ Questions (N) │
│    (collapsible)    │  ─ Bulk actions      │  ├──────────────────┤
│                     │  ─ Question cards    │  │ Bottom action    │
│ [Generate +N Qs]    │    (accumulate)      │  │ bar: Generate /  │
│ [Reset]             │  ─ Empty state when  │  │ Create Exam      │
│                     │    none yet          │  │                  │
│ Sticky footer:      │                      │  │                  │
│ Create Exam (N Qs)  │                      │  │                  │
└─────────────────────┴──────────────────────┘  └──────────────────┘
```

**Why this layout**
- Teachers see config + output simultaneously — no page hops.
- Left pane stays sticky so they can tweak topic/difficulty and click Generate without losing the question list on the right.
- On mobile the same sections collapse into an accordion with a sticky bottom action bar, preserving touch-friendly targets (≥48px).

### Key interaction rules
- **Generate is additive.** Clicking Generate appends new questions to the existing list with a fresh batch tag (e.g. "Batch 2 · 5 Qs · Easy · Conceptual") so teachers can see provenance. Nothing is cleared.
- **Per-question actions:** select (checkbox), delete (soft remove → goes to "Deleted" with Restore), regenerate single (replaces that one question using the same config).
- **Bulk actions:** Select all in batch, delete selected, regenerate deleted.
- **Test Summary chip** in the right pane header always shows live counters: Total / Selected / Deleted / Total Marks (selected × marks per Q).
- **Create Exam** is enabled only when: test name filled, marks/Q > 0, at least 1 question selected. Disabled state shows tooltip listing missing fields.
- **Validation inline** in the left pane (red ring + helper text), not blocking modals.
- **Unsaved changes guard** when leaving the page with selected questions.

### Visual style (matches existing pastel system)
- Left pane = white card with subtle Blue/Green/Purple section dividers reusing the existing Content Selection / Question Configuration / Additional Requirements color cues from screenshot 1.
- Right pane = light gray surface with white question cards (same look as screenshot 2).
- Primary buttons: existing Blue/Indigo. Generate button: existing violet gradient.

## Phase-wise implementation plan

### Phase 1 — Rename + entry point
- `src/pages/teacher/exams/ExamsMainPage.tsx`: rename button label `AI Test Generator` → `AI Exam Generator`, wire `onClick` to navigate to `/teacher/exams/ai-generator`.
- Register route in `src/App.tsx`.

### Phase 2 — Types & mock service
- `src/types/aiExamGenerator.ts`: `AIExamConfig`, `AIQuestionBatch`, `GeneratedQuestion` (extends existing `Question`), `TestDetails`, `QuestionStatus` (`active | selected | deleted`).
- `src/data/mockAIGenerator.ts`: a `generateMockQuestions(config)` that returns 1–15 fake MCQs derived from existing `mockQuestionBank` filtered by subject/chapter, tagged with batch id and difficulty.

### Phase 3 — Page shell & layout
- `src/pages/teacher/exams/AIExamGeneratorPage.tsx` with responsive two-pane / accordion layout, sticky CTAs, breadcrumb back to Assessment.
- Hook `useAIExamGenerator` to centralize state: `testDetails`, `aiConfig`, `batches[]`, `questions[]` (with status), derived counters.

### Phase 4 — Left pane components
- `TestDetailsSection.tsx` — Test Name, Duration, Marks/Q, Negative Marking, Exam Type (select), Test Instructions (select). Reuse field components from existing `CreateExamPage`.
- `AIConfigurationSection.tsx` — Subject/Chapter/Topics dropdowns (driven by `questionBankService`), Number of Questions, Difficulty (multi-checkbox), Question Type, Question Category (multi-checkbox), Custom Instructions textarea. Color-coded sub-cards mirroring screenshot 1.
- `GenerateActionBar.tsx` — Generate button (shows "+N questions"), Reset Config button, validation hints.

### Phase 5 — Right pane components
- `GeneratedQuestionsPanel.tsx` — header with counters strip (Total / Available / Selected / Deleted / Total Marks), Select All, Regenerate Deleted, Show Answers toggle.
- `GeneratedQuestionCard.tsx` — same card visual as screenshot 2 with: checkbox, batch chip, difficulty chip, category chip, marks/min meta, per-card menu (Regenerate / Delete / Restore / Preview). Uses existing `QuestionPreviewModal`.
- `BatchDivider.tsx` — subtle separator labeled "Batch 2 · 5 Qs · Hard · Logical · 14:23" so teachers can trace what each generate call produced.
- `EmptyQuestionsState.tsx` — friendly empty state shown before first Generate.

### Phase 6 — Submit flow
- Sticky footer button `Create Exam (N selected · M marks)` → validates, then calls a mock `createExamFromAI(testDetails, selectedQuestions)` and navigates back to `/teacher/exams` with a success toast. Wire to existing exam list mock so the new exam appears at the top.

### Phase 7 — Polish & responsive QA
- Mobile accordion behavior, sticky bottom action bar, keyboard scroll into newly added batch, loading skeletons during Generate (~1s simulated), toast on rate-limit-like failures.
- Verify spacing matches existing pastel theme; no cramped/empty feel; touch targets ≥48px.

## What stays the same
- The original 3 pages (if they exist) are not touched outside the rename + new route; we add a brand-new page and only the button entry point changes.
- All existing components (`QuestionPreviewModal`, `questionBankService`, exam mocks) are reused.

## Open questions before I build
1. Should "Regenerate single" actually call the mock generator (replace that one card) or just mark it for the next batch run?
2. On submit, should the created exam appear in the existing `mockExamsData` list immediately (so teachers see it), or simulate an API and show only a toast?
3. For the test metadata, do you want `Pass Percentage` and `Start Date/Time` too (present in existing `ExamFormData`), or keep the AI flow minimal (Name, Duration, Marks/Q, Negative, Exam Type, Instructions only) and let teachers edit the rest from the standard Edit Exam page?
