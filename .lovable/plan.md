## Problem statement

Schools plan timetables in two directions:
- **Week direction** (current): pick one section, fill Mon–Sat × P1–P7 for the whole academic window.
- **Day direction** (new): pick one weekday (e.g. Monday) for **one specific week**, and fill it across **every section** in the institute at once.

Both are two views on the **same underlying data**. A cell placed in Day view must appear in Week view and vice versa. Save as Draft / Publish are properties of the **(section, window)** pair, not of the view.

## Solution shape

Add a **View toggle (Week | Day)** at the top of the Weekly Timetable workspace. The two views share:
- The same `SectionCell[]` store (`useSection`).
- The same window draft/publish status per section.
- The same drag-swap and cell-action layer.

They differ only in axes:

```text
Week view: rows = periods, cols = weekdays          (scope = 1 section, whole window)
Day view : rows = sections, cols = periods          (scope = all sections, ONE weekday, ONE week)
```

### Day-view scope rule (resolves cross-section publish conflicts)

Day view is **always scoped to one specific week + one specific weekday**. It never spans the whole academic window. Flow:

1. Enter Day view → user picks **Week** (W1…Wn across institute calendar) and **Weekday** (Mon…Sat).
2. Grid renders one row per section in the institute, filtered/greyed based on that section's active window:
   - Section has an **active window** that covers the picked week → row is **editable**.
   - Section has **no active window** for that week (term hasn't started, is between terms, or all windows locked) → row is rendered **greyed out** with a tag ("No active window · Term 2 starts Nov 3"). No cells accepted.
3. Edits in Day view write into that section's currently-active window using the standard `setCellAllocation` API. Draft/publish status is inherited from the section+window — nothing new to reconcile.
4. Once the user finishes a day, they switch to Week view to fan the day out across the window via the existing **Copy to weeks…** action.

This keeps Draft/Publish semantics identical in both views because a cell always belongs to exactly one `(section, window, weekStart, weekday, periodIndex)` tuple.

### Drag-swap rule (both views)

Swap is allowed when the **allocation identity matches** between source and target cell. Identity = `programId + subjectId + trackId + facultyId`. Concretely:

- Within the same section (Week view or Day view row): swap allowed whenever both cells hold the same `(program, subject, track, faculty)` OR one cell is empty.
- Across sections (Day view only, row ↔ row): swap allowed **only if both cells share the same allocation identity** — e.g. Physics T1 · Faculty A can swap with another Physics T1 · Faculty A slot, but not with Physics T1 · Faculty B (different faculty = different card, per user rule).
- Empty target: always allowed if the target section's window is active.

Rejected swaps show a toast: "Can't swap — different subject/track/faculty".

## Phased implementation

### Phase 1 — View toggle + shell
- Add `view: 'week' | 'day'` state in `SectionTimetableStep.tsx` (or lift into `ScheduleWorkspacePage` if cleaner).
- Toggle pill (matches the Weekly/Academic tab styling) placed left of the week-chip bar.
- Week view stays exactly as-is when toggle = week.

### Phase 2 — Day view scope pickers
- When toggle flips to Day, render a two-control bar: **Week selector** (chip strip like current W1…Wn based on the institute calendar span) + **Weekday selector** (Mon–Sat pills).
- Persist last picked week+weekday in URL query (`?dayWeek=…&dayDow=…`) so refresh/back works.

### Phase 3 — DayViewGrid component
- New `src/components/institute/sections/DayViewGrid.tsx`.
- Rows = all sections from `mockSections` (or institute roster helper). Columns = periods 1..maxPeriodsPerDay across sections (use the max; shorter sections show — in trailing cols).
- Per row, resolve the section's **active window** for the picked week. If none, render the row greyed with an inline tag and disable drop targets.
- Cell renderer reuses the existing chip component from Week view (Program badge · Subject color · Track chip · Teacher initials · ✎ manual flag).
- Sticky first column = section name + class + active-window label.

### Phase 4 — Shared cell-action layer
- Extract the current cell popover / picker / drag handlers from `SectionTimetableStep.tsx` into a small shared module `sectionCellActions.ts` (or a hook `useCellActions`) that both grids consume. No behaviour change for Week view.
- Enforce the drag-swap identity rule described above in this shared layer.

### Phase 5 — Subject-card rail behaviour in Day view
- Rail on the left still shows subject cards, but scoped to the **currently focused section row** (click a row header to focus; default = first editable row).
- Metrics (this-week / window-total) recompute for the focused section+window — reuses existing helpers.

### Phase 6 — Mock data & sanity
- Confirm at least 3 sections have overlapping active windows covering the same week so Day view has content out of the box (Class 11 Morning, Class 12 PCM Excellence, and one more). Add a fourth section with a **gap week** to demonstrate the greyed row state.
- Verify Day-view edits round-trip to Week view for the same section.

### Phase 7 — Dev notes (mandatory)
Add `DevNote` popovers on:
- The View toggle → explains "same data, two directions", and that Save-as-Draft is per (section, window) not per view.
- The Day-view week/weekday pickers → explains scope restriction (one week only) and rationale (avoids cross-window publish conflicts).
- Greyed section rows → explains the "no active window for this week" rule.
- Any cell where a cross-row swap is rejected → dev-note tooltip listing the identity keys (`program|subject|track|faculty`) and why the swap was blocked. This is the spec the backend integration will mirror.

## Technical notes (for devs)

- **No new persistence model.** Day view is a pure render + input transformation over existing `SectionCell[]` across sections. The store already keys cells by `(section, weekStart, weekday, periodIndex)`, so writes from Day view are ordinary `setCellAllocation` calls on the target section.
- **Draft/Publish stays per (section, window).** A day edited in Day view for Section A stays in Section A's draft; publishing Section A doesn't touch Section B. No merged publish state to reconcile.
- **Swap identity key** = `${programId}|${subjectId}|${trackId}|${facultyId}`. Enforce in the shared cell-actions module so both views behave identically and the backend contract is unambiguous.
- **Greying logic**: a section row is editable in Day view iff there exists a window in `section.windows` whose `[startDate, endDate]` contains the picked week's Monday AND whose status ≠ `locked`.
- **Copy-to-weeks** stays a Week-view action; Day view intentionally has no multi-week fan-out to keep its scope narrow.

## Out of scope

- Cross-section bulk copy (e.g. "copy Monday from Class 11 Morning to Class 11 Evening"). Can be added later once Day view stabilises.
- Changing Academic Schedule tab.
