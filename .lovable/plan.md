## Scope
Two surfaces. No backend/logic changes.

---

## Phase 1 — Programs list card: add Teaching Hours access

`ProgramsListPage.tsx` — keep current clean card design, just add the missing entry point.

Footer row becomes a 3-action layout:
```text
[ Teaching Hours ]   👁 View curriculum         [ Open program → ]
```

- **Teaching Hours** → outline/ghost button, navigates to `/institute/programs/:id/hours`. Always visible regardless of `hoursFinalised`.
- **View curriculum** → existing link, navigates to `/institute/programs/:id/preview`.
- **Open program** → primary CTA. Routes to `/hours` if not finalized, `/preview` if finalized (existing behavior).
- All three use `e.stopPropagation()`; card-level click stays as today.
- Tiny status pill (Finalized green / Draft amber) sits next to the Teaching Hours button so user sees state at a glance.
- No fee, no metric grid, no chapters/topics/hours numbers on the card — keeps the clean look the user approved.

---

## Phase 2 — Curriculum Preview restructured as collapsible tree

Rewrite `ProgramPreviewPage.tsx` layout only. `planDates()` and data untouched.

### Header (sticky)
```text
Class 12 PCM — Excellence · Starts 14 Apr · Ends 28 Nov
[ Expand all ] [ Collapse all ]                    [ 🖨 Print ]
```

### Body — 3-level accordion
1. **Subject row** (always visible): color rail, name, summary chips `12 chapters · 60 topics · 88h · ~132p · 14 Apr → 22 Jul`.
2. **Chapter card** (visible when subject expanded): title, `5 topics · 7.5h · ~12p`, date range `14 Apr → 21 Apr`.
3. **Topic table** (visible when chapter expanded): Topic · Hours · Periods · Start · End.

Default: all collapsed.
- **Expand all** opens every subject + chapter.
- **Collapse all** closes everything.

Optional subject filter tabs above accordion: `[ All ] [ • Physics ] [ • Chemistry ] [ • Mathematics ]`.

---

## Phase 3 — Print always renders fully expanded

`@media print` rules:
- Force every subject + chapter open regardless of on-screen state.
- Hide: Expand/Collapse buttons, Print button, subject filter tabs, sticky shadow.
- `page-break-inside: avoid` on chapter cards.

Print button calls `expandAll()` (state update) then `window.print()` so React-driven collapses also render expanded — belt + suspenders with CSS.

---

## Phase 4 — Polish
- Smooth chevron rotation + height transition.
- Empty-state guards (0 chapters / 0 topics).
- Keyboard Enter/Space toggles on subject + chapter headers.

---

## Files touched
- `src/pages/institute/programs/ProgramsListPage.tsx` — add Teaching Hours button + status pill in footer.
- `src/pages/institute/programs/ProgramPreviewPage.tsx` — full restructure (accordion, tabs, expand/collapse, print CSS).

## Out of scope
Schedule generation, LMS unlock, backend persistence, hours-page internals.
