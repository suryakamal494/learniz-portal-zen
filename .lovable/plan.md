# Timetable Workspace — Revised Layout + UX

## 1. Layout: 20 / 80 split, no grid scroll

```text
┌───────────────────────────────────────────────────────────────┐
│ Toolbar (section · window · compare)                          │
├───────────────────────────────────────────────────────────────┤
│ Week chip bar (W1..Wn) · progress · bulk actions              │
├────────────────┬──────────────────────────────────────────────┤
│ Subject cards  │  Timetable grid                              │
│ (~20%, sticky) │  (~80%, fills width, no horizontal scroll)   │
│                │                                              │
│ compact 1-col  │  Day columns share remaining width equally   │
│ scrollable Y   │  Cell content scales down to fit             │
└────────────────┴──────────────────────────────────────────────┘
```

- CSS: `grid-cols-[minmax(200px,20%)_1fr]` with `gap-4`.
- Palette rail: `sticky top-4`, `max-h-[calc(100vh-160px)] overflow-y-auto`, 1-column stack of compact cards.
- Grid pane: `min-w-0` so it never forces horizontal overflow.
- Below `lg` (1024px): stack vertically — palette on top (horizontal chip strip, `overflow-x-auto`), grid below full-width. Split only activates on desktop.

### Preventing horizontal scroll on the grid

Feasible with these constraints:
- Grid uses CSS `grid-template-columns: 56px repeat(N, minmax(0, 1fr))` where N = working days (5 or 6). `minmax(0,1fr)` is the key — it lets columns shrink below their content's intrinsic width.
- All cell content uses `min-w-0` + `truncate` so long subject names never push the column wider.
- Chips (program/track) shrink to `text-[9px]` and use icon-only fallback under a width threshold (via a container query or a JS-measured breakpoint on the grid pane).
- Period label column is fixed at 56px; day columns share the rest equally.
- Expected day-column width at 1280px viewport: `(1280 × 0.8 − 56 − paddings) / 6 ≈ 145px` — plenty for the compact cell.
- At 1028px (current viewport): `(1028 × 0.8 − 56) / 6 ≈ 128px` — still comfortable for the compact cell. Below ~900px total width we fall back to the stacked layout, so no horizontal scroll ever appears on the grid.

Vertical scroll: the grid itself does not scroll — the whole page scrolls if 7 period rows exceed viewport height (rare at ≥900px tall). No inner scrollbars on the grid.

## 2. Compact "Subject cards" palette (1-column rail)

- Rename header → **"Subject cards"** (drop "track palette" wording).
- Each card: `p-2`, ~56px tall, one row.
  - Subject name (`text-sm font-semibold`, truncate)
  - Program + track chips inline right (`text-[9px]`)
  - Progress `5 / 40` in `text-[10px] text-slate-500` below
- Selected state: 2px colored ring, no size change.

## 3. Clickable "+" in empty cells

Empty cell becomes a full-cell button:
- **If a palette card is selected** → click paints immediately (existing flow).
- **If nothing is selected** → click opens a small Popover listing palette entries (searchable if >8). Choosing one paints and closes.
- Disabled in `readOnly` and locked windows.

## 4. Richer mock data for Class 12 PCM — Excellence

In `mockSections.ts`, expand `PCM_SEED` from 1 week → **weeks W1–W6** of Term 1:
- W1: keep current 40/42 fill.
- W2–W4: ~90% filled with varied distributions (rotate which JEE track lands in P6/P7, swap some Physics T1 ↔ T2).
- W5–W6: ~60% filled (partial-progress demo).
- W7+: empty (in-progress demo).
- Ensures "Copy this week to…" has meaningful source weeks and the progress bar animates across weeks.

## Out of scope
- No changes to Setup/Allocation steps, drag-swap, copy-week, plan-day tools, or Academic Schedule tab.
- No data-model changes.

## Files
- `src/components/institute/sections/SectionTimetableStep.tsx` — layout grid, palette rail, empty-cell popover, cell shrinking.
- `src/data/mockSections.ts` — expand `PCM_SEED` to W1–W6.
