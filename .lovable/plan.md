
# Sections UI — Split Workflow & Shared Workspace

Splits the current 4-step section flow into two surfaces:
- **Inside the Section card:** Step 1 Setup + Step 2 Period Allocation only.
- **New top-level workspace** at `/institute/schedule-workspace` with two tabs: **Weekly Timetable** and **Academic Schedule**, each with a Section picker and an Academic Window picker.

Draft/Publish gates whether a timetable feeds the Academic Schedule. Full-term completeness gates Academic Schedule generation per window. Dev Notes are exposed via an info icon and never ship to production. A Compare mode allows side-by-side viewing of two sections' timetables.

---

## Phase 1 — Split the Section card (Steps 1 + 2 only)

- Remove Steps 3 & 4 from `SectionSchedulePage.tsx`. Keep the stepper as **Setup → Period Allocation**.
- After Step 2, replace "Next" with two CTAs:
  - **Open Weekly Timetable** → navigates to workspace with this section + active window preselected.
  - **Open Academic Schedule** → same, jumps to schedule tab.
- Preserve all Step 1/2 behaviour: faculty pool, academic windows switcher, sub-programs, tracks, locks, chapter→track grouping.
- Add a subtle banner: "Timetable & Academic Schedule now live in the shared workspace."

## Phase 2 — Shared Workspace shell

New route `/institute/schedule-workspace` with:
- **Section picker** (searchable dropdown, groups by class). Default = last visited section (persisted in `localStorage`); falls back to first available.
- **Academic Window picker** — driven by the selected section's `windows[]`. Default = active window.
- **Tabs:** `Weekly Timetable` | `Academic Schedule`.
- Deep-link support: `?sectionId=…&windowId=…&tab=timetable|schedule`.
- Nav entry in `InstituteSidebar` under Programs: "Schedule Workspace".

## Phase 3 — Weekly Timetable tab (Step 3 relocated)

- Reuse `SectionTimetableStep` / `WeeklyTimetableBuilder` verbatim; feed it `(section, window)` from workspace state.
- Keep drag-to-swap, palette, sub-program chips, track chips.
- Add a **status pill** in the header per window: `Draft` (amber) or `Published` (emerald), plus `Last published: <date>`.
- Toolbar buttons:
  - **Save as Draft** — persists cells; window status → `draft`. Academic Schedule tab treats this window as unavailable for generation.
  - **Publish** — sets window status → `published` and stamps `publishedAt`. Only published windows feed the Academic Schedule.
  - **Unpublish / Revert to Draft** — with confirm.
- Add a `windowStatus: 'draft' | 'published'` field on `AcademicWindow`.

## Phase 3.5 — Change tracking (feeds Phase 4 notice)

- On every published-window mutation (cell paint/clear/swap/regenerate palette), append to `window.changeLog[]`:
  `{ id, at, actor, type: 'cell.delete' | 'cell.swap' | 'cell.paint' | 'track.disable' | 'allocation.change', summary, affectedDates[] }`.
- Cap log at last 50 entries per window; expose a "Clear acknowledged" action from Academic Schedule.

## Phase 4 — Academic Schedule tab (Step 4 relocated) + Gating

Reuse existing preview/generation UI (`SectionPreviewStep` internals) with these additions:

**Publish gating**
- If selected window is `draft`, show empty state: "Weekly timetable for this window is a draft. Publish it to generate the academic schedule." with a jump-link to the Timetable tab.

**Term-completeness gating (per window, sequential)**
- A window is **complete** when every working period in every working week of the window is either filled or explicitly marked as free.
- Rule: You can generate for window *N* only if all earlier windows in the section are `published` AND complete. If window 1 is partially filled (published but incomplete), generation runs for what is filled in window 1; window 2 stays locked with reason banner: "Term 1 is incomplete — finish Term 1 before generating Term 2."
- Show a per-window completeness meter (e.g. 62% of periods filled) and blocking reason.

**Change notice section (top of tab)**
- If any change from `changeLog` occurred after `lastGeneratedAt`, render a yellow notice panel listing:
  - What changed (e.g. "Mon Period 2 deleted on 12 Nov")
  - Which generated dates it affects
  - CTA: **Re-generate** / **Acknowledge**.
- Persists until user regenerates or acknowledges.

**Generation**
- **Generate / Re-generate schedule** button; stamps `lastGeneratedAt`.
- Output list stays scoped to selected (section + window).

## Phase 5 — Dev Notes (UI-only, non-production)

- Add a small `<DevNoteIcon />` component (Lucide `Info` in a dashed ring) placed inline next to:
  - Timetable header (explains Draft vs Publish, palette merging, swap semantics).
  - Academic Schedule header (explains sequential term gating, change-notice logic, regeneration rules).
  - Any other spot flagged during build.
- Click opens a `<Popover>` / `<Dialog>` with markdown-rendered notes stored under `src/dev-notes/*.md`.
- Guarded by `import.meta.env.DEV` flag OR a `VITE_SHOW_DEV_NOTES` env — hidden in production builds. Component returns `null` when flag is off, so removing the flag strips it from the bundle.
- Add a central `docs/DEV_NOTES_INDEX.md` listing every dev note and where it appears.

## Phase 6 — Compare mode (optional side-by-side)

- **Compare** toggle button in workspace toolbar (both tabs).
- When on, a second Section picker appears; layout splits 50/50 vertically.
- Timetable rendering in compare mode:
  - Reduce cell chip density (hide sub-program chip when only one program; abbreviate track to letter; drop faculty line).
  - Show horizontal scroll inside each pane if width < threshold.
  - Sync week navigation across panes (checkbox: "Sync week").
- Compare mode is **read-only** — editing/publishing is disabled; a banner instructs users to exit compare to edit.
- Automatically disable Compare below 1200px viewport with an inline message.
- Include a Dev Note explaining density trade-offs.

## Phase 7 — Polish & regressions

- Update `docs/SECTIONS_UI.md`: new architecture diagram, draft/publish lifecycle, gating rules, dev-notes system, compare mode.
- Playwright smoke: section picker default, publish flow, gating banner appears when Term 1 incomplete, change notice appears after post-publish edit.
- Verify no regressions on Setup/Allocation, sub-program switching, and drag-swap.

---

## Technical Notes (for devs)

- New types in `src/types/instituteProgram.ts` (or `section.ts`):
  - `AcademicWindow.status: 'draft' | 'published'`
  - `AcademicWindow.publishedAt?: string`
  - `AcademicWindow.lastGeneratedAt?: string`
  - `AcademicWindow.changeLog: ChangeLogEntry[]`
- New workspace state hook `useScheduleWorkspace` (section id, window id, tab, compare-on, compare-section-id) persisted to `localStorage`.
- Reuse existing components — no rewrite of Timetable/Preview logic; only wrap them with the workspace shell and gating checks.
- Dev-note component: `src/components/dev/DevNote.tsx`, tree-shaken via `if (!import.meta.env.DEV && !import.meta.env.VITE_SHOW_DEV_NOTES) return null`.

## Open assumptions (flag if wrong)
- "Complete term" = every working period filled OR marked free (no partial credit for "some subjects done").
- Draft edits still autosave — Publish is an explicit promotion, not a save.
- Compare mode is read-only for v1.
