
# Restructure: Program Setup → Period Allocation → Weekly Timetable → Preview

Reframes the program-scheduling flow around **periods** (not raw hours), folds the standalone "Teaching Hours" page into the stepper as **Step 2**, and adds faculty defaults to the weekly grid. Also fixes a setup auto-save gap and surfaces capacity (periods + working days) at the top of every step.

---

## 1. Audit finding — does Setup auto-save?

Looked at `ProgramSchedulePage.tsx` → `SetupStep`:

- Every field uses `update(key, value)` → `onChange(...)` → `persistConfig` → `setSchedule(program.id, cfg)`.
- So yes, **start date, end date, working days, day start time, period length, periods/day, breaks, default faculty, holidays — all auto-save on change** to the in-memory store. There is no "Save setup" button and none is needed.
- One exception worth noting: the separate `ProgramHoursPage` has its own local `periodMins` that only persists when you click the period popover "Apply" button. After the restructure this page goes away, removing the inconsistency.

**Action:** No extra save button. Add a small `Saved · just now` indicator next to the Setup header so users get explicit confirmation. Period length stays auto-saved like every other field.

---

## 2. New 3-step flow (replaces today's 3 steps + separate Hours page)

```text
┌──────────────┐    ┌─────────────────────┐    ┌─────────────────┐    ┌──────────┐
│ 1. Setup     │ →  │ 2. Period Allocation│ →  │ 3. Weekly       │ →  │ 4. Preview│
│ (calendar +  │    │ (workspace)         │    │    Timetable    │    │           │
│  school day) │    │                     │    │                 │    │           │
└──────────────┘    └─────────────────────┘    └─────────────────┘    └──────────┘
```

The standalone `/institute/programs/:id/hours` route is retired. Its entry points (cards, "Set teaching hours" CTA, the `!program.hoursFinalised` gate) all redirect into Step 2 of the schedule flow. Existing `hoursFinalised` flag is reused to gate Step 3.

### Step 1 — Setup (mostly unchanged)
- Same fields as today (academic window, working days, school day builder, default faculty, holidays, breaks).
- New: top-right capacity preview card showing live **Working days · Periods available** as soon as window + school-day fields are filled. This is the same number Step 2 uses, so users see the budget forming.
- "Saved" indicator + keep the "Continue →" CTA at the bottom with mandatory-field blockers.

### Step 2 — Period Allocation (new workspace, replaces Teaching Hours)
This is the core change. Hours are gone from the UI; everything is in **periods**.

**Header strip (sticky):**
```text
┌────────────────────────────────────────────────────────────────────────┐
│  Working days: 184    Periods available: 1,104    Allocated: 0 / 1,104│
│  Remaining: 1,104  ████████░░░░░░░░░░░░░░░░░░  0%                     │
└────────────────────────────────────────────────────────────────────────┘
```
- `Periods available = workingDays.length × periodsPerDay` from Setup.
- `Allocated = Σ periods across all topics`.
- `Remaining` counter is the gate: it must read **0** before "Continue to Timetable" enables.
- Over-allocation shows red `+12 over budget` with a fix CTA.

**Per-subject row (collapsed by default):**
```text
▾ Physics              Target: [ 200 ] periods   Allocated: 187/200    🟧 13 to assign
                       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                       ▾ Ch 1 Mechanics             Target: [ 40 ] / 38
                           • Vectors            [ 8 ] periods
                           • Kinematics         [ 12 ]
                           • Newton's laws      [ 18 ]
                           + Add topic
                       ▸ Ch 2 Thermodynamics        Target: [ 30 ] / 30 ✓
                       ▸ Ch 3 …
```

Rules:
- Subject target is editable, defaults to 0. Subject row shows allocated/target with the same Green/Amber/Red threshold the rest of the platform uses (≥100% green, partial amber, 0 red).
- Inside a subject, chapters get optional targets, topics carry the actual period count. **Validation is only at subject level** — the user's rule was "200 periods don't need to be spread evenly across chapters". Chapter targets are advisory.
- Topic input is the same +/- stepper UX as today's hours input, but the unit is now "periods" (integers, min 0).
- When the user edits a topic count, the subject "Allocated" and the global "Remaining" counter decrement live.
- Auto-balance helpers per subject: "Distribute remaining evenly across empty topics" and "Match target exactly".
- A subject is **complete** when `allocated === target` AND `target > 0`. Step is **complete** when all subjects complete AND remaining === 0.

**Continue gating:**
- "Continue to Timetable" disabled while `remaining ≠ 0`, with inline reason: e.g. "Allocate 13 more periods to Physics, 7 to Bio".
- On click, sets `hoursFinalised = true` so the legacy gate still passes.

### Step 3 — Weekly Timetable (one addition)

Keep current grid + week chips + tools. Add:

- **Faculty chip inside every filled cell**, prefilled from `config.defaultFaculty[subjectId]`. Cell now shows `Physics · A. Rao` instead of just the subject color block.
- **Row action menu** already lets you fill a row with a subject. Extend it: after picking the subject, a second dropdown "Faculty for this row" appears, defaulting to the subject's default faculty. Choosing a different faculty applies it to every cell of that row (and only to cells that share that subject — mixed rows are left alone).
- Per-cell override: clicking the faculty chip inside one cell opens a popover to swap just that cell's faculty.
- New `WeeklyTimetableCell.facultyId?: string` (optional; null = use default faculty for the subject). This flows into `generateFromTimetable` so the calendar honors it.

### Step 4 — Preview
Unchanged.

---

## 3. Terminology & copy

- Drop "Teaching Hours" from sidebar/cards. Use **Period Allocation** as the step name and any cross-page CTA.
- Program cards & batch cards: replace the "Teaching hours" stat with "Periods allocated" (X / Y). Falls back to "Not allocated yet" until Step 2 is complete.
- Tooltips in `programTooltips.ts` updated to talk about periods, not hours.
- Internal data still has a per-topic count — we rename `hours` → `periods` only in the **UI labels**; the field stays `hours` in the type to avoid a migration. (Period length × period count is no longer used; the field literally holds period count now. Acceptable since rollups already treat it numerically.)
  - *Alternative if you'd rather be clean:* add a parallel `periods: number` field on `InstituteTopic` and deprecate `hours`. More invasive — flag for your call in the questions section.

---

## 4. Responsive UI plan

- Step 2 header strip: stacked on mobile (`grid-cols-1`), single row on `md+`. Remaining counter is always visible (sticky on scroll).
- Subject row: collapses to single column on mobile, target input full-width, chapters list scrolls inside the card.
- Weekly grid: existing horizontal-scroll behavior preserved. Faculty chips truncate to first initial + last name on `<lg` viewports.
- All inputs are 44px touch targets, numeric keypad on mobile (`inputMode="numeric"`).

---

## 5. Files touched

**Edits**
- `src/pages/institute/programs/ProgramSchedulePage.tsx` — add Step 2 (`AllocationStep`), reorder, capacity strip in header, remove `hoursFinalised` redirect screen.
- `src/components/institute/programs/WeeklyTimetableBuilder.tsx` — faculty chip per cell, row faculty selector, cell faculty popover, accept `defaultFaculty` + `faculty[]` props.
- `src/types/instituteProgram.ts` — add `facultyId?: string` to `WeeklyTimetableCell`; add `subjectTargetPeriods?: Record<string, number>` to `ScheduleConfig` to persist Step 2 targets.
- `src/utils/calendarAutomation.ts` — `generateFromTimetable` reads `cell.facultyId ?? config.defaultFaculty[subjectId]`. Add `computeCapacity(config)` returning `{ workingDays, periods }`.
- `src/hooks/useInstitutePrograms.ts` — small helpers `setSubjectTarget`, `setTopicPeriods` (alias of existing).
- `src/pages/institute/programs/ProgramsListPage.tsx` and any card/preview using "teaching hours" → "Periods allocated".
- `src/lib/programTooltips.ts` — copy updates.
- `src/App.tsx` — remove `/hours` route, redirect to `/schedule`.

**New**
- `src/components/institute/programs/PeriodAllocationWorkspace.tsx` — the Step 2 body (header strip, subject accordion list, validation hook).
- `src/components/institute/programs/CapacityStrip.tsx` — reusable "Working days / Periods available / Remaining" card used in Step 1 mini-preview and Step 2 header.

**Delete**
- `src/pages/institute/programs/ProgramHoursPage.tsx` (logic merged into `PeriodAllocationWorkspace`).
- `src/components/teacher/courses/ConfigureHoursModal.tsx` is unrelated (teacher side) — leave it.

---

## 6. Phase-wise implementation

**Phase A — Plumbing (no UI change visible)**
1. Add `facultyId?` to `WeeklyTimetableCell`, `subjectTargetPeriods?` to `ScheduleConfig`.
2. Add `computeCapacity` util; update `generateFromTimetable` to use per-cell faculty.
3. Add hooks for setting subject target and topic periods.

**Phase B — Step 2 workspace**
4. Build `CapacityStrip` (working days, periods available, allocated, remaining).
5. Build `PeriodAllocationWorkspace` — subject accordion, chapter sub-accordion, topic input with live decrement of remaining.
6. Wire validation: `remaining === 0` && every subject `allocated === target > 0` → enable continue.
7. Integrate into `ProgramSchedulePage` as new Step 2; renumber stepper; remove old gate screen.

**Phase C — Step 3 faculty UX**
8. Render faculty chip inside each filled cell.
9. Add row-level faculty override (subject picker → faculty picker → apply).
10. Add per-cell faculty popover.
11. Make sure preview/calendar uses per-cell faculty.

**Phase D — Terminology + retire old page**
12. Replace "Teaching hours" labels with "Periods allocated" on cards, lists, tooltips.
13. Delete `ProgramHoursPage.tsx`, remove route, point any deep links into Step 2.
14. Update mock data so Step 2 starts with sensible per-subject targets where possible.

**Phase E — Polish**
15. Responsive QA at 360 / 768 / 1024 / 1280.
16. Sticky behavior of capacity strip, focus states, keyboard nav for steppers.
17. Empty/loading/error states for each step.

---

## Open questions for you

1. **Topic field rename:** keep storing the integer in the existing `hours` field (zero migration, slightly misleading name internally) or add a new `periods` field and deprecate `hours`?
2. **Chapter targets:** advisory only (no enforcement), or do you want chapters to also "balance to target = 0" the way subjects do?
3. **Default faculty when none is set:** Step 1 already requires a default faculty per subject before you can leave Setup. Keep that hard requirement, or allow Step 2/3 to proceed and only require faculty at calendar-generation time?
