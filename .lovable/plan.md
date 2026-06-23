
# Programs Module — UI/UX Refinement Plan

Scope: Programs list card, Teaching Hours page, and Curriculum Preview. No backend changes; mock data + presentation only. Color palette stays within the existing pastel theme (Blue / Green / Purple / Peach) — we add hierarchy and emphasis, not new brand colors.

---

## Phase 1 — Mock data expansion

Goal: realistic scale so layout decisions are validated against long pages.

- Rebuild `mockInstitutePrograms.ts` for **Class 12 PCM — Excellence**:
  - 3 subjects: Physics (blue), Chemistry (green), Mathematics (purple)
  - **12 chapters per subject**, **5 topics per chapter** → 180 topics total
  - Hours per topic varied (0.5 – 2.5h) so chapter/subject rollups differ
- Add a second program (e.g. Class 11 PCB) with the same shape so the list card isn't lonely.
- Add `startDate` to each program's `ScheduleConfig` (default term start) used by the preview to derive date ranges even before scheduling is generated.

## Phase 2 — Programs list card redesign

Problems today: dull card, ambiguous "38/38 topics", no chapter count, no glanceable identity.

- Card gets a **subject-tinted left accent bar** + soft gradient header strip (uses existing subject pastel tokens).
- Primary metrics row, each as a labeled chip with a hover **tooltip**:
  - **Chapters** — `36` (sum across subjects) — tooltip: "Total chapters across all subjects in this program."
  - **Topics** — `180` — tooltip: "Total teachable topics. Each topic has its own hour budget."
  - **Hours** — `262h` — tooltip: "Sum of teaching hours across all topics."
  - **Periods** — `≈ 393` — tooltip: "Hours converted to class periods using the program's period length (40 min)."
- Status pills get color: Hours `Finalized` (green) / `Draft` (amber); Schedule `Generated` (blue) / `Not scheduled` (slate).
- Subject mini-legend (3 dots + names + chapter counts) under the metrics.
- Primary CTA emphasized (filled indigo), secondary actions ghost.

## Phase 3 — Teaching Hours page redesign

Problems today: period length buried, weak expand/collapse affordance, monotone surfaces, no clear "where am I" hierarchy.

Layout:

```text
┌─ Sticky page header ──────────────────────────────────────┐
│ Step 1 · Set Hours per Topic     [Period length: 40 min ▾]│  ← elevated, indigo accent
│ Class 12 PCM — Excellence                                 │
│ 3 subjects · 36 chapters · 180 topics                     │
└───────────────────────────────────────────────────────────┘

┌─ Subject card (Physics, blue tint) ───────── expanded ────┐
│ ● Physics              12 ch · 60 topics   60h · 90p  [▾] │  ← colored header bar
│   ┌─ Ch 1. Electrostatics  5/5 topics · 7.5h · 12p  [▾] ─┐│
│   │  Coulomb's Law          [ 2.0 ] h   ≈ 3p   ✓        ││
│   │  …                                                    ││
│   └──────────────────────────────────────────────────────┘│
│   ┌─ Ch 2. Current Electricity  collapsed             [▸]│  ← visibly different state
│   …                                                       │
└───────────────────────────────────────────────────────────┘
```

Specifics:

- **Period length** promoted to a pill in the sticky header with a tooltip: "Used to convert teaching hours into class periods. Changing this re-computes all period counts on this page." Editing opens a small popover; saving animates the period counts.
- **Subject headers**: pastel tinted background matching the subject, bold subject name, chapter/topic/hours/periods inline. Clear chevron rotation on expand.
- **Chapter rows**: collapsed state = light surface + right chevron; expanded state = elevated surface, left subject-color rail, down chevron, slight shadow. Smooth height transition.
- **Topic rows**: zebra striping inside expanded chapter; input gets focus ring in subject color; the `≈ 3p` chip is a tooltip target ("≈ 3 periods of 40 min, rounded up from 2.0 h").
- **Bulk controls** above the tree: `Expand all`, `Collapse all`, `Apply default 1h to empty topics`.
- **Sticky summary card** unchanged in position, but progress bar gets subject-segmented fill (blue + green + purple proportions).
- Long-page ergonomics: subject jump nav (Physics · Chemistry · Mathematics) sticky under the header; intersection observer highlights current subject.

## Phase 4 — Curriculum Preview gets date ranges

Problem today: preview shows hours/periods but not *when* topics happen — meaningless for an "academic period" view.

- Derive a date plan from `ScheduleConfig` (start date, working days, periods/day) without requiring full schedule generation. A lightweight `planDates(program)` utility walks subjects → chapters → topics round-robin and emits `{startDate, endDate}` per topic, chapter, and subject.
- Preview table gains two columns: **Start** and **End** (e.g. `12 Apr` → `18 Apr`). Chapter and subject rows show their span (`12 Apr – 06 May · 18 days`).
- Header summary line: `3 subjects · 36 chapters · 180 topics · 262h · ≈ 393 periods · Term: 12 Apr – 28 Nov`.
- If no `startDate` is set, show an inline "Set term start date" input right in the preview header (no navigation needed) — writes back to the program's `ScheduleConfig`.
- Print stylesheet updated so the date columns survive the PDF export stub.

## Phase 5 — Shared polish

- Add a reusable `<MetricChip label value tooltip />` used by list cards, hours header, preview header.
- Tooltip copy file `src/lib/programTooltips.ts` so terminology stays consistent (Topics, Periods, Hours, Chapters, Period length).
- Empty/expanded/hover states audited for WCAG AA contrast against the pastel surfaces.
- No new dependencies; uses existing shadcn `Tooltip`, `Collapsible`, `Popover`.

## Technical notes

- Files touched:
  - `src/data/mockInstitutePrograms.ts` — 3×12×5 dataset + start dates
  - `src/pages/institute/programs/ProgramsListPage.tsx` — card redesign + chips
  - `src/pages/institute/programs/ProgramHoursPage.tsx` — sticky header, subject/chapter visual states, jump nav, bulk actions
  - `src/pages/institute/programs/ProgramPreviewPage.tsx` — date columns, term header, inline start-date setter
  - `src/utils/calendarAutomation.ts` — add `planDates()` helper (pure, no side effects)
  - New: `src/components/institute/programs/MetricChip.tsx`, `src/lib/programTooltips.ts`
- No route changes, no type-breaking model changes (only optional `startDate` already exists on `ScheduleConfig`).

## Out of scope (for this round)

- Schedule generation workspace UI (separate redesign pass)
- LMS unlock logic
- Backend persistence

---

Approve and I'll implement Phases 1 → 5 in order in one build pass.
