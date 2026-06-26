## Goal
Fix the UI / responsive bugs visible in the Programs → Schedule flow (Setup, Step 2 Weekly timetable, Step 3 Preview) and seed realistic mock data into the "Previously covered up to" panel so every state is visible to dev/design reviewers.

## What's broken (from screenshots)

**Image 1 — sidebar overlapping content**
At ~1026 CSS px (zoom / tablet), the shadcn `Sidebar` switches to its mobile/offcanvas mode. The drawer renders **without a solid background and without a backdrop**, so the nav (`Academic Insights · Dashboard · Overview · …`) sits transparently on top of the Step-3 subject cards. This affects every Institute page, not just Schedule.

**Image 2 — Step 2 Weekly timetable**
- Right‑side action chips (`Copy this week to…`, `Clear this week`) get clipped off the card on narrower viewports — they sit in a `flex` row that doesn't wrap.
- The week chips strip (W1…W13) doesn't scroll horizontally — relies on `flex-wrap` and starts breaking the card layout.
- The Period column ("P1 08:30‑09:10") and the Mon/Tue header row aren't sticky, so when the user horizontally scrolls the grid both labels disappear.
- The whole `Setup → Weekly timetable → Preview` stepper header (top pills) overflows on the right ("3" pill cut off in the screenshot).

**Step 3 Preview**
- Same horizontal‑overflow shape as Step 2 — needs sticky period/day headers when scrolling.
- Subject pill inside each cell can wrap awkwardly because subject name + lock icon + topic + chapter + faculty are all stacked with no min height.

**"Previously covered up to" panel**
Every subject shows *"Not started yet"* — the empty state. Need realistic mock progress so the populated UI is visible.

## Fixes

### 1. Sidebar overlap (global)
- In `src/components/ui/sidebar.tsx` (shadcn primitive), ensure the **mobile Sheet variant** has `bg-sidebar` (solid) and the wrapper sets `z-50` with an overlay/backdrop. Add `data-[state=open]:bg-sidebar` to the Sheet content. Verify Radix overlay is rendered (shadcn ships it but our copy may have been trimmed).
- If the shadcn primitive is intentionally untouched, wrap `InstituteSidebar` with an explicit `className="bg-sidebar"` and add `<SidebarRail />` so the offcanvas drawer is always opaque.
- Result: drawer renders on solid white with a dimmed backdrop; content underneath never bleeds through.

### 2. Stepper header (`ProgramSchedulePage` top pills)
- Wrap the 3 step pills in `overflow-x-auto` with `min-w-0` and reduce horizontal padding from `px-6` to `px-3 sm:px-6` so all 3 stay visible at ≥1024 px.

### 3. Step 2 — `WeeklyTimetableBuilder`
- Toolbar row: change the right‑side actions container to `flex-wrap gap-2 justify-end` so `Copy this week to…` and `Clear this week` wrap below on narrow widths instead of clipping.
- Week chip strip: wrap W1…Wn in `overflow-x-auto` with `flex-nowrap` + hidden scrollbar; keep ‹ › buttons as the wrap‑safe fallback.
- Grid scroll container: keep the existing `overflow-x-auto` but make the **Period column sticky** (`sticky left-0 bg-white z-10`) and the **header row sticky** (`sticky top-0 bg-slate-50 z-20`). Add `border-r` on the sticky column so it visually separates while scrolling.
- Period cell: clamp width to `w-24` with `truncate` on the time string so vertical height doesn't blow up.

### 4. Step 3 — `Step3TimetableView`
- Same sticky‑header + sticky‑period‑column treatment as Step 2 (share the pattern; both grids already use `computeDayLayout`).
- Each cell button: enforce `min-h-[78px]` so subject/topic/chapter/faculty have a stable rhythm and short cells don't visually shrink.
- Week chip strip: identical `overflow-x-auto flex-nowrap` treatment.

### 5. Mock data — "Previously covered up to"
In `src/data/mockInstitutePrograms.ts`, attach a `generatedSlots` array to `prog-1` covering **the 3 weeks before** `2025‑04‑14` (i.e. 2025‑03‑24 → 2025‑04‑12). Slots use the same Mon–Sat × 6 periods pattern as the seeded `weeklyTimetable`, with chapter/topic IDs taken from the front of each subject's queue:

- Physics → covered up to *Electrostatics → Capacitance*  (2025‑04‑11)
- Chemistry → *The Solid State → Imperfections in Solids*  (2025‑04‑12)
- Mathematics → *Relations & Functions → Composition & Inverse*  (2025‑04‑10)
- Biology → *Reproduction in Organisms → Pre‑fertilisation Events*  (2025‑04‑09)
- English → *Flamingo — Prose → Deep Water*  (2025‑04‑11)
- Hindi → *आरोह — काव्य → आलोक धन्वा*  (2025‑04‑12)
- Social Studies → *Politics in India since Independence → Era of One‑Party Dominance*  (2025‑04‑10)

`computeCoverageCursor` already reads from `program.generatedSlots`, so the `CoverageList` UI will automatically light up. No logic changes needed.

Leave `prog-2` and `prog-3` with empty `generatedSlots` so the "Not started yet" empty state is still demoable on those programs.

## Out of scope
- No redesign of subject pill colors, week selector UX, or the stepper itself.
- No changes to `calendarAutomation.ts` business logic, types, or the regeneration engine.
- `prog-2` / `prog-3` mock data, teacher‑side pages, dashboard cards.
- Touching auto‑generated shadcn types (only the sidebar primitive's mobile classes if needed).

## Files to touch
- `src/components/ui/sidebar.tsx` *(mobile drawer background + backdrop, only if missing)*
- `src/pages/institute/programs/ProgramSchedulePage.tsx` *(stepper header overflow, Step 3 sticky grid + min cell height + week strip scroll)*
- `src/components/institute/programs/WeeklyTimetableBuilder.tsx` *(toolbar wrap, week strip scroll, sticky period column + header row)*
- `src/data/mockInstitutePrograms.ts` *(seed `prog-1.generatedSlots` for the 3 prior weeks)*
