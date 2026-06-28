## Audit conclusion

Yes — I understand the blunder.

I incorrectly created a separate **Section-scoped scheduling workspace** and added a new banner/card saying **“Plan multiple programs together.”** That was not your intended flow.

Your intended requirement was:

```text
Institute sidebar
  → Sections
    → existing cards currently shown under Programs
      → Setup & Allocation button
        → existing 4-step flow:
           1. Setup
           2. Period Allocation
           3. Weekly Timetable
           4. Preview
```

You wanted all the new scheduling rules added inside the existing **Setup & Allocation** flow, not as a parallel UI or separate route.

## What was implemented vs what you asked

### 1. Existing flow location

**Asked:** Use the existing `Programs → Setup & Allocation → 4-stepper` flow.

**Current implementation:**
- Existing route still exists: `/institute/programs/:programId/schedule`.
- But I also added a new route: `/institute/sections/:sectionId/schedule`.
- I added a new banner on the Programs page: **“New · Section-scoped scheduling / Plan multiple programs together.”**

**Audit result:** Not correct. The new separate section workspace should be removed/parked, and the existing flow should become the single source of truth.

### 2. Programs vs Sections terminology

**Asked:** Rename **Programs** as **Sections**. The existing cards are effectively batch/section cards.

**Current implementation:**
- Sidebar still says **Programs**.
- Page title still says **Programs**.
- CTA still says **New Program**.
- Breadcrumb still says **Programs**.
- Card data still renders from `useInstitutePrograms()`.

**Audit result:** Not implemented correctly. Terminology must be corrected in the existing module.

### 3. “Setup” and “Period Allocation” relationship

They are not the same thing, but they are part of the same existing Setup & Allocation wizard.

```text
Setup = defines the section capacity and operating rules
- academic window
- working days
- periods per day
- period length
- day start time
- breaks
- holidays
- default/faculty selection where needed

Period Allocation = spends that fixed capacity
- subject-wise allocation
- track-wise allocation
- chapter/topic allocation
- capacity validation
```

So your understanding is right: both belong inside the same **Setup & Allocation** workflow. They should not be split into a separate “section scheduling” product surface.

### 4. Multiple programs together

My thinking was: one physical section may have multiple academic programs such as CBSE + JEE, and since the timetable has one cell per period, those programs must share the same section period budget.

But the UI I built expressed this incorrectly. I exposed it as a new separate concept: **“Plan multiple programs together.”** That created confusion.

Correct interpretation:
- The user should not see a separate “multiple programs together” banner.
- If a section/batch contains multiple academic tracks/programs, that should be handled inside the existing Setup & Allocation flow as data, not as a separate entry point.
- The visible module should still feel like: **open a section card → configure setup/allocation**.

### 5. One cell, one allocation rule

**Asked:** One cell only one subject/track/allocation. If CBSE Physics T1 is allocated in a slot, JEE Physics T1 cannot occupy that same slot. Another track must use another cell.

**Current implementation:**
- Implemented in the new section store/workspace.
- Not implemented inside the existing `ProgramSchedulePage` / existing `WeeklyTimetableBuilder` flow.

**Audit result:** Business rule was implemented in the wrong place.

### 6. Conflict UX

**Asked:** Occupied cell click should show **Confirm & Replace**.

**Current implementation:**
- Implemented in the new section timetable step.
- Existing weekly timetable still uses direct subject selection/popovers and does not enforce the same allocation object model.

**Audit result:** Implemented in the wrong place.

### 7. Row/bulk fill behavior

**Asked:** Row/bulk fill should skip occupied cells.

**Current implementation:**
- Implemented in the new section workspace.
- Existing `WeeklyTimetableBuilder` row fill currently replaces the whole row.

**Audit result:** Existing flow still needs correction.

### 8. Capacity counter scope

**Asked:** Capacity is fixed for a specific section/batch. It does not change whether the section has 1 subject, 10 subjects, 1 program, or 10 programs.

**Current implementation:**
- Existing program flow computes capacity per program schedule.
- New section flow computes section capacity correctly, but in the wrong UI.

**Audit result:** Logic direction was right, placement was wrong. Capacity must be shown and enforced in the existing Setup & Allocation flow after renaming it to Sections.

### 9. UI/UX polish

**Asked:** Modern, professional, easy to understand, subject colors, headers, desktop overview visible properly.

**Current implementation:**
- Some polish exists in both old and new flows.
- Subject colors exist.
- But the new banner and separate route make the UX confusing.
- Desktop overview is split across two competing scheduling experiences.

**Audit result:** Visual work exists, but product structure is wrong.

## Corrective implementation plan

### Phase 0 — Park the mistaken work safely

Do not delete the useful logic immediately. First, park it so the useful pieces can be reused.

**Keep for reuse:**
- one-cell-one-allocation model
- conflict replacement logic
- skip-occupied row fill logic
- track color/pattern ideas
- section capacity helper logic

**Remove from visible product UI:**
- “New · Section-scoped scheduling” banner
- “Plan multiple programs together” CTA
- `/institute/sections/:sectionId/schedule` as a visible entry point

**Update internal plan note:**
- Mark previous phase plan as parked.
- Add corrected direction: implement into existing Setup & Allocation flow.

### Phase 1 — Rename Programs module to Sections

Change visible terminology only, without changing the user journey.

```text
Before                         After
Programs                       Sections
New Program                    New Section / disabled if still coming soon
Programs & Calendar Automation Sections & Calendar Automation
Setup & Allocation             Setup & Allocation
View curriculum                View curriculum / Preview, based on current behavior
```

Sidebar:
```text
Programs group → Sections group
Programs item  → Sections item
/institute/programs can remain as the route internally for now
```

Important: keep the existing card grid. These are the cards the user already understands.

### Phase 2 — Treat existing cards as section/batch cards

The existing cards remain the entry point.

Card meaning becomes:
```text
Card = one section / batch planning unit
```

Display should make that clear:
- Class/batch name prominent, e.g. `Class 12 PCM — Excellence`
- Section labels shown clearly, e.g. `Sections A, B`
- Subject chips remain visible
- CTA remains **Setup & Allocation**

No extra “multiple programs together” banner.

### Phase 3 — Extend the existing data model, not the separate section model

Add the missing scheduling parameters into the existing `InstituteProgram` / schedule model.

Needed additions:
- academic window remains in `schedule.startDate` / `schedule.endDate`
- fixed section capacity remains derived from setup fields
- subject/track allocation support inside existing schedule data
- cell allocation model for timetable cells

Correct cell model concept:
```ts
cell = {
  weekStartDate,
  weekday,
  periodIndex,
  allocation: {
    subjectId,
    trackId,
    facultyId?
  } | null
}
```

If future data includes multiple academic programs within one section, the allocation can include `programId`, but it should not become a separate visible UI concept unless needed.

### Phase 4 — Fix Step 1: Setup inside existing wizard

Improve the existing Setup step, not the separate Section Setup page.

Setup must show:
- academic start and end date
- working days
- periods/day
- period length
- day start time
- breaks
- holidays
- capacity preview
- faculty/default teacher configuration where needed

Capacity language must be section/batch-first:
```text
Section capacity = working days × periods/day across this academic window.
This number stays fixed no matter how periods are distributed across subjects or tracks.
```

Desktop layout:
```text
Left: Setup form
Right: sticky capacity summary + day timeline + holiday summary
```

### Phase 5 — Fix Step 2: Period Allocation inside existing wizard

Refactor existing `PeriodAllocationWorkspace` to support tracks and the fixed section capacity rule.

Required behavior:
- subject-level colored headers
- track rows under each subject: T1, T2, etc.
- add track action inside a subject
- faculty per track if required
- period allocation per track
- chapter/topic allocation below track/subject
- total allocation cannot exceed section capacity

Validation:
```text
Hard block: total allocated > section capacity
Soft warning: subject has 0 allocation
Allowed: total allocated less than capacity if user intentionally leaves free periods
```

This matters because you said the section period count is fixed, but all periods may or may not be assigned immediately depending on planning stage.

### Phase 6 — Fix Step 3: Weekly Timetable inside existing wizard

Rewrite the existing `WeeklyTimetableBuilder` behavior to use allocation chips instead of plain subject-only cells.

Required behavior:
- left palette: subject/track options with remaining count
- cell accepts only one allocation
- clicking occupied cell opens Confirm & Replace
- row fill skips occupied cells
- different tracks always require different cells
- cell shows subject color, track name, faculty line
- no faculty conflict detection for now

Conflict modal:
```text
Replace allocation?
This slot currently has Physics · T1.
Replacing will remove that allocation from this cell and place Chemistry · T1 here.

Cancel | Replace
```

Row fill:
```text
Filled 4 cells · skipped 2 occupied cells
```

### Phase 7 — Fix Step 4: Preview inside existing wizard

Keep the existing preview/generation flow, but make it understand track allocations.

Preview should show:
- dated classes generated from the weekly timetable
- subject colors
- track labels where relevant
- chapter/topic mapping
- draft/locked/published status only if already needed; otherwise keep it parked

Do not introduce a new preview surface.

### Phase 8 — Cleanup and guardrails

Remove or hide the mistaken visible additions:
- remove section banner from the list page
- remove section route from visible navigation
- avoid exposing `MOCK_SECTIONS` in the product UI

Keep reusable code only if it is folded back into the existing flow.

### Phase 9 — Responsive and professional UX pass

After the corrected behavior is in the existing flow:
- test desktop overview at 1024, 1280, 1440
- test mobile at 360 and 768
- make subject headers readable
- ensure no text overlap in timetable cells
- ensure touch targets are at least 44px
- keep subject colors consistent
- keep counters as whole numbers only
- use time format like `6h 42m`, never decimal hours

## Final corrected product direction

The final product should feel like this:

```text
Sections
  └─ Section / batch card
      └─ Setup & Allocation
          ├─ Setup: define capacity
          ├─ Period Allocation: distribute capacity across subjects/tracks/topics
          ├─ Weekly Timetable: place one allocation per cell
          └─ Preview: generate dated teaching plan
```

No separate “new section scoped scheduling” workspace. No confusing “Plan multiple programs together” banner. The rules you gave should live inside the existing Setup & Allocation flow.