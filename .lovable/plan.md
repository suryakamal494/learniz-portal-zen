
## Goals

Three UI/UX fixes to the Weekly Timetable's **Day view** (`src/components/institute/workspace/DayScheduleTab.tsx`) plus a small tweak to `TimetableWorkspaceTab.tsx`.

---

## 1. Compact the "Placing into" subject-card rail

The left rail currently uses a wide `minmax(220px, 22%)` column with vertically stacked cards (subject on top, faculty underneath). It dominates the viewport (see image 1).

Changes:
- Shrink the rail column to `minmax(180px, 16%)` (approx. 180–200px wide).
- Rebuild each subject card as a **single line**: color chip + subject name (truncate) + optional program / track badges on the right. Move faculty into a tooltip on hover instead of a second row.
- Tighten padding (`p-1.5` → `p-1`), reduce inter-card gap (`gap-1.5` → `gap-1`), and drop card border radius one step (`rounded-lg` → `rounded-md`).
- Keep the DevNote and "Placing into / section / window" header but pack it into a single 2-line block.

Result: minimum 5 subject rows visible without scroll on a 900px-tall viewport; rail no longer eats horizontal space from the grid.

---

## 2. Draft/Publish button placement

- **Week view**: keep the existing status card in `TimetableWorkspaceTab.tsx` unchanged (Save-as-Draft + Publish / Re-publish + Revert).
- **Day view**: add a compact status strip at the top of `DayScheduleTab` showing only **Save as Draft** (calls the existing toast — writes already persist via `useSection`, this button just confirms/announces). No Publish button here.

The parent `TimetableWorkspaceTab` currently renders its own status card that contains Publish. When Day view is active (controlled from `ScheduleWorkspacePage`), we hide the Publish/Re-publish actions in that status card and show only draft-scope info + the Day-view save strip. Week view retains full controls.

Implementation: pass a `view: 'week' | 'day'` prop into `TimetableWorkspaceTab` (already available in `ScheduleWorkspacePage`) and conditionally hide publish actions when `view === 'day'`. Day view renders its own tiny "Save as Draft" pill inside `DayScheduleTab`.

---

## 3. Per-row **Autofill subjects** action

Each section row in the Day-view grid gets a new small button in its row header (next to the section name / status badges).

Interaction:
1. Click **Autofill** → popover opens with a multi-select checklist of every `PaletteEntry` for that row's section (built via the same `buildPalette(section)` used for the rail).
2. Each entry shows: subject name, program code chip, track chip, faculty name — same info as the rail card.
3. Options at the bottom: **Fill empty periods only** (default on) / **Overwrite everything**. Distribution order = "round-robin across selected subjects, left→right across P1..Pn".
4. Confirm button "Fill row" → writes cells for that section's `(weekStart, weekday, P0..Pn-1)` via `setCellAllocation(..., { force: overwrite })`. Skips periods already filled when "empty only" is chosen.
5. Disabled when row is not editable (no active window / not a working day).

The same button appears on every editable row. No global "fill all rows" — user asked per-row.

Empty-selection state: button stays disabled until at least one subject is checked.

---

## Technical Details

Files touched:
- `src/components/institute/workspace/DayScheduleTab.tsx` — rail compaction, per-row Autofill popover, Save-as-Draft strip, single-line card layout, distribution helper.
- `src/components/institute/workspace/TimetableWorkspaceTab.tsx` — accept `view` prop, hide Publish/Re-publish when Day view is active.
- `src/pages/institute/ScheduleWorkspacePage.tsx` — pass current view down to `TimetableWorkspaceTab`.

No data-model or hook changes. Autofill reuses `setCellAllocation`; existing `CellOccupiedError` path handles overwrite.

New sub-component (inline in `DayScheduleTab.tsx`) `AutofillPopover` — self-contained, holds its own selected-ids state and overwrite toggle.

DevNote on the Autofill button explains: "Round-robin distribution across selected subjects. Manually-edited cells are still overwritten only if 'Overwrite everything' is on."
