# Section-Scoped Scheduling — Phase-Wise Implementation Plan

## Locked rules (from prior turns)
- **One cell = one allocation.** A `(weekStartDate, weekday, periodIndex)` holds exactly one `{programId, subjectId, trackId}`. No stacking, ever.
- **Section period budget is fixed.** `workingDays × periodsPerDay × weeks` is the single pool shared across all programs/subjects/tracks.
- **Tracks of same subject occupy different cells.** Parallel = two distinct cells.
- **Cell conflict** → Confirm & Replace dialog. **Row fill** → skip occupied. **Faculty conflict detection** → out of scope.
- 4-stepper stays: Setup → Period Allocation → Weekly Timetable → Preview.

---

## Visual System (applies to all four steps)

**Color tokens per subject** (HSL, defined in `index.css`, mapped to Tailwind):
```
Physics    → 217 91% 60% (blue)     surface 217 91% 96%
Chemistry  → 142 71% 45% (emerald)  surface 142 71% 95%
Math       → 262 83% 58% (violet)   surface 262 83% 96%
Biology    → 25  95% 53% (orange)   surface 25  95% 95%
English    → 340 82% 52% (rose)     surface 340 82% 96%
+ fallback palette of 6 more, auto-assigned by subject index
```
Track variants: T1 = solid swatch, T2 = swatch with diagonal pattern, T3 = swatch with dot pattern. Same hue family, different texture — readable at a glance without reading labels.

**Header chrome (all steps):**
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Section: Class 11 Morning · Aug 2026 → Oct 2026             [Window ▾]    │
│  ────────────────────────────────────────────────────────────────────────  │
│  ◉─── Setup ───◉─── Allocation ───◉─── Timetable ───○ Preview              │
│                                                                             │
│  Budget 1,104p   Allocated 1,104p   Remaining 0p   ████████████████ 100%   │
└─────────────────────────────────────────────────────────────────────────────┘
```
Sticky on scroll. Budget strip stays visible across Steps 2–4 so the user always knows where they stand.

**Typography:** Display = `Sora` (already in repo via Tailwind), body = `Inter`. Subject names in cells use `font-medium`, period counts in `font-mono tabular-nums`.

**Cards:** 16px radius, `shadow-[0_2px_8px_rgba(15,23,42,0.04)]`, 1px border `border-slate-200/70`. Hover lift = `translate-y-[-1px]` + shadow bump. No purple-on-white gradients.

---

## Phase A — Data Model & Store (no UI yet)

**Files**
- `src/types/section.ts` *(new)* — `Section`, `AcademicWindow`, `Track`, `CellAllocation`.
- `src/types/instituteProgram.ts` — `WeeklyTimetableCell` becomes `{ slot: SlotKey, allocation: CellAllocation | null }`.
- `src/hooks/useSection.ts` *(new)* — store mirroring `useInstitutePrograms`, with `setCellAllocation(slot, allocation, { force })` that throws `CellOccupiedError` when force=false.
- `src/data/mockSections.ts` *(new)* — one section with 2 programs (CBSE + JEE), 3 subjects each, 1–2 tracks per subject.
- `src/utils/calendarAutomation.ts` — `computeSectionCapacity(window, config)`; `generateFromTimetable` keyed by `(programId, subjectId, trackId)`.

**Acceptance:** unit-level — `setCellAllocation` rejects occupied slot unless forced; capacity math returns expected integer for a 12-week window.

---

## Phase B — Step 1: Section Setup

**Layout (desktop ≥1280):** two-column. Left 60% = form. Right 40% = sticky live `CapacityStrip` + a mini calendar preview showing working days highlighted across the window.

```text
┌─────────────────────────── Setup ────────────────────────────┐
│ Section name      [ Class 11 Morning      ]                  │
│ Academic window   [ 01 Aug 26 ] → [ 10 Oct 26 ]   71 days    │
│                                                              │
│ Working days      [M][T][W][T][F][S] · Sun off               │
│ Periods / day     6     Period length 50m   [+ Per-period…]  │
│ Day starts        08:00                                      │
│ Breaks            ☕ 10:30 (15m) · 🍱 13:00 (40m)             │
│ Holidays          3 institute · +0 program · −0 skipped      │
│ Faculty pool      12 selected from 34 → [ Manage pool ]      │
│                                                              │
│ Auto-saved · just now                  [ Continue → ]        │
└──────────────────────────────────────────────────────────────┘
```
Right pane:
```text
┌─ Capacity preview ─────┐
│  Working days   61     │
│  Periods/day     6     │
│  ─────────────────     │
│  Total budget  366 p   │
└────────────────────────┘
┌─ Window calendar ──────┐
│  Aug  ███░███░███░███░ │
│  Sep  ███░███░███░███░ │  (working = filled, off = ░,
│  Oct  ███░███░          holiday = red dot)
└────────────────────────┘
```

**Components**
- `SectionSetupStep.tsx`, `FacultyPoolPicker.tsx` *(new)*, reuse `CapacityStrip.tsx`, new `WindowCalendarPreview.tsx`.

**Mobile:** single column, calendar preview collapses to a one-line "61 working days · 366 periods" chip.

---

## Phase C — Step 2: Period Allocation

**Layout (desktop ≥1280):** three-column.
- Left 22% — **Program/Subject/Track tree** (sticky). Each node shows colored dot + `allocated/target` pill.
- Center 56% — **Editing panel** for the selected node.
- Right 22% — **Live budget panel**: shared section budget + per-program donut + per-subject mini-bars, all reacting on each keystroke.

```text
TREE                    EDITING                              BUDGET
─────────────           ────────────────────────             ──────────────
▾ CBSE  420/450         Physics · Track 1                    Section
  ▾ Physics 200/220       Faculty: A. Rao                    1,104 / 1,104
    ● T1   120/120        Periods to allot: [ 120 ]          ████████ 100%
    ● T2    80/100        Topics                             
  ▸ Chem    ...            Vectors        [ 8 ]              CBSE  ●●●●○ 78%
  ▸ Math    ...            Kinematics    [ 12 ]              JEE   ●●●○○ 62%
▾ JEE   620/654            Newton's laws [ 18 ]              
  ▸ Physics 300/320        + Add topic                       Physics ████░ 87%
  ▸ Chem    ...           [ Split evenly ] [ Match target ]  Chem    ███░░ 60%
                                                              Math    ██░░░ 40%
```

**Track UX:** "Add track" inside any subject opens a small modal — name, faculty from pool, chapter checklist. Tracks render as sibling pills under the subject with their texture variant.

**Validation gate to Step 3:**
- `Σ allocations ≤ section budget` (hard block on over-allocation, red banner).
- Every subject `allocated > 0` (soft warn, can proceed).
- Inline blocker reason shown on the disabled Continue button.

**Components**
- Refactor `PeriodAllocationWorkspace.tsx` from program-scoped to section-scoped.
- `AllocationTree.tsx`, `AllocationEditor.tsx`, `TrackEditorModal.tsx`, `BudgetSidebar.tsx` *(all new)*.

**Mobile:** tree collapses to a top-of-page accordion. Editor stacks. Budget panel becomes a sticky bottom sheet (peek 56px → drag up).

---

## Phase D — Step 3: Weekly Timetable

This is the centerpiece. Single-allocation enforcement lives here.

**Layout (desktop ≥1280):** two-column.
- Left 18% — **Subject/Track palette**: collapsible groups by program, each track shown with its color chip + remaining periods (`80/120 placed`). Click to "arm" — the cursor now paints that allocation.
- Right 82% — **Grid**, full width, no horizontal scroll up to 6 weekdays × 8 periods. Beyond that, only the grid scrolls horizontally (header stays).

```text
PALETTE              MON       TUE       WED       THU       FRI       SAT
─────────         ┌────────────────────────────────────────────────────────┐
CBSE              │P1│CBSE·Phy │JEE·Math │CBSE·Chm│CBSE·Phy │JEE·Phy  │ —  │
 ◆ Phy T1 80/120  │  │  T1 Rao │  T1 Sen │  T1 Iyer│  T2 Das │  T1 Rao │    │
 ◇ Phy T2 40/100  ├──┼─────────┼─────────┼─────────┼─────────┼─────────┼────┤
 ◆ Chm T1         │P2│  free   │CBSE·Phy │ ...                              │
 ◆ Math T1        │  │  ＋     │  T1 Rao │
JEE               ├──┼─────────┼─────────┼ ...
 ◆ Phy T1         │P3│ ...
 ◇ Phy T2         
 ◆ Chm T1         
```

**Cell anatomy:**
```
┌─────────────────┐
│ CBSE · Phy T1   │  ← top line (subject color background, 12px text)
│ A. Rao          │  ← faculty (10px, opacity 70%)
└─────────────────┘
```
Empty cell = dashed border + faint `＋` in muted color. Hover on empty cell shows armed-allocation preview (50% opacity).

**Conflict flow:**
1. User has Physics T1 armed.
2. Clicks cell holding `JEE · Chm T1`.
3. **AlertDialog**:
   ```
   Replace allocation?
   ─────────────────────
   This slot currently holds  JEE · Chemistry · T1.
   Replacing will free that slot for Chemistry and assign
   CBSE · Physics · T1 here.
   
   [ Cancel ]   [ Replace ]
   ```
4. On replace: old allocation's "placed" counter decrements, new one increments, both palette entries animate the change.

**Row fill:**
- Right-click row label → "Fill row with armed allocation".
- Iterates left→right, skips occupied cells.
- Bottom toast: `Filled 4 of 6 in Monday · 2 slots already taken`.

**Per-cell faculty override:** click faculty line → small popover with track's default + other pool members. Override marker = tiny dot under faculty name.

**Components**
- Rewrite `WeeklyTimetableBuilder.tsx`.
- `SubjectTrackPalette.tsx`, `TimetableCell.tsx`, `ReplaceAllocationDialog.tsx`, `RowFillMenu.tsx`, `CellFacultyPopover.tsx` *(new)*.

**Mobile:** palette becomes a bottom sheet (tap "Add allocation"); grid scrolls horizontally; cells enlarge to 56px min-height. Long-press = open replace dialog.

---

## Phase E — Step 4: Preview & Status

**Layout:** full-width calendar (month view), top tabs `[Calendar] [List] [By Subject]`.

- Each dated slot inherits its cell's color + allocation label.
- Drag-swap two slots: topic flow recomputes only for the affected `(program, subject, track)` lanes. Confirm modal shows the topic shift before committing.
- **Per-subject status bar** above the calendar:
  ```
  CBSE · Physics  ● Draft   →  [ Lock ]
  CBSE · Chem     ● Locked  →  [ Publish ] [ Unlock ]
  JEE  · Physics  ● Published
  ```
- Status colors: Draft = slate, Locked = amber, Published = emerald.

**Components**
- `SectionPreviewStep.tsx`, `SubjectStatusRail.tsx`, reuse `CurriculumCalendarView.tsx` (extend for swap).

---

## Phase F — Routing, terminology, cleanup
- New route `/institute/sections/:sectionId/schedule` (4-stepper entry).
- Old `/institute/programs/:id/schedule` redirects to the parent section's schedule.
- Cards/list pages updated to read from section store; "Teaching hours" labels → "Periods".
- Delete legacy `ProgramHoursPage.tsx` (already done) and any program-scoped capacity helpers.

---

## Phase G — Polish & QA
1. Responsive QA: 360 / 768 / 1024 / 1280 / 1440.
2. Empty/loading/error states for every step (skeleton in tree, empty palette, save-failure toast).
3. Keyboard nav: stepper Tab order, arrow keys move grid focus, Enter places armed allocation, Esc cancels.
4. Animations: framer-motion fades on step transitions (180ms), cell paint = scale 0.96→1 + opacity 0→1 (140ms), replace dialog = slide-up.
5. Tabular numerals everywhere a count is shown (budgets, palette pills, status rail).
6. Accessibility: every color chip paired with text label; AA contrast verified on subject palette.

---

## Out of scope (deferred, per user)
- Faculty double-booking detection across cells.
- Per-subject academic window overrides.
- "Share with faculty for review" status.
- Student-facing rendering rules when only some subjects are published.
