## Goal

In the Section's Setup & Allocation page, hide (not delete) Steps 3 (Weekly Timetable) and 4 (Preview), and move draft/publish control into Step 2 (Period Allocation). Only windows that are **published** from Period Allocation should appear in the Schedule Workspace pickers.

## Changes

### 1. `SectionSchedulePage.tsx` — collapse to 2 visible steps
- Keep only `Setup` and `Period Allocation` in the stepper (already the case in code; the screenshot is a stale published preview). Verify no leftover Step 3/4 UI leaks.
- Remove the "Next up → Open Weekly Timetable / Open Academic Schedule" CTA card at the bottom of Allocation. Timetable/Preview live in Schedule Workspace and are unlocked only after publish.

### 2. `SectionAllocationStep.tsx` — add Save as Draft + Publish
- Add a sticky footer bar inside the allocation step with:
  - **Save as Draft** button (secondary) — sets `window.status = 'draft'`, toast "Draft saved".
  - **Publish** button (primary indigo) — sets `window.status = 'published'`, toast "Published — now visible in Schedule Workspace".
  - Small status pill next to buttons: current `draft` / `published` state + last-saved timestamp.
  - Publish disabled if `totalAllocated < totalPeriods * 0.5` (guardrail against publishing empty allocations) with tooltip explaining why.
- Add a `DevNote` next to the buttons titled **"Draft vs Publish — why it matters"** explaining:
  - Draft = free editing, invisible to Schedule Workspace.
  - Publish = window becomes selectable in Schedule Workspace (timetable + academic schedule).
  - Re-publishing after edits triggers change-log entries in Academic Schedule.
- Wire status changes through a new `updateWindowStatus(sectionId, windowId, status)` helper in `useSection` / section store (mutates the mock section in memory so it survives the session).

### 3. `useScheduleWorkspace.ts` — filter to published windows only
- Section dropdown: show only sections that have at least one `published` window.
- Window dropdown: filter `section.windows` to `status === 'published'`.
- Default `windowId` = last published window (not just last window).
- Empty state in `ScheduleWorkspacePage` when no published windows exist: "No published academic windows yet. Publish one from Section → Period Allocation." with a link back.

### 4. `ScheduleWorkspacePage.tsx` — reflect the gating
- Add a DevNote at the top of the toolbar explaining that only published windows appear here and edits still flow back to the source section.
- Handle the empty-list case above.

### 5. Mock data sanity
- Ensure at least one window per demo section is `published` (Class 11 Morning Term 1 already is). Leave the currently-`draft` windows as draft so the filter is visibly meaningful.

## Technical notes

- Window status type already exists (`'draft' | 'published'`) on `SectionWindow`; no schema change needed.
- Publish is per-window, per-section (matches existing Weekly Timetable publish semantics — no duplication).
- No backend changes; all mock/in-memory as today.
- DevNote component (`src/components/dev/DevNote.tsx`) is DEV-only and tree-shakes in prod, so notes won't affect the production UI.

## Out of scope

- Deleting Step 3/4 components or their code — kept intact for potential re-enable.
- Any change to Weekly Timetable's own publish flow in Schedule Workspace (stays as-is).
