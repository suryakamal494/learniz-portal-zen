# Institute → Sections UI — Developer Documentation

> Scope: the **Sections scheduling workspace** at  
> `/institute/sections/:sectionId/schedule`  
> Four steps: **Setup → Period Allocation → Weekly Timetable → Preview**
>
> Audience: developers picking up this module. Every section ends with **edge cases & resolutions** so QA / backend can mirror the same invariants.

---

## 1. Overview

### 1.1 What a "Section" is

A **Section** is the master scheduling unit for a class (e.g. *Class 12 Morning*). One section:

- Owns **one academic window at a time** (`windows[]`, last entry is editable).
- Hosts **one or more Programs** (CBSE, JEE, NEET — `SectionProgram[]`).
- Each Program has **Subjects → Tracks → Chapters → Topics**.
- All Programs share **one shared period budget** computed from working days × periods/day.
- All Programs share **one weekly timetable grid** (cells are unique on `weekStartDate × weekday × periodIndex`).

### 1.2 Terminology map

| User-facing term | Code term | Notes |
|---|---|---|
| Section | `Section` | Master container |
| Program / Sub-program | `SectionProgram` (also `SubProgram` on the programs side) | CBSE, JEE, NEET. Identified by short `code`. |
| Subject | `SectionSubject` | Per-program; has a `color` token |
| Track | `SectionTrack` | T1, T2, "Repeat batch", "Advanced". Parallel sections of one subject. |
| Chapter / Topic | `SectionChapter` / `SectionTopic` | Topics carry `periods` (the unit budgeted in Step 2) |
| Window / Term | `AcademicWindow` | A time slice; multiple = sequential terms |
| Cell | `SectionCell` | One painted timetable slot |
| Slot key | `SlotKey` | `(weekStartDate, weekday, periodIndex)` — unique |
| Faculty pool | `Section.facultyPool` | Filter applied to every downstream dropdown |
| Holidays | institute-wide + section-only | Merged in capacity math |

### 1.3 The 4-step flow

```
 ┌────────┐    ┌────────────┐    ┌─────────────────┐    ┌─────────┐
 │ Setup  │ -> │ Allocation │ -> │ Weekly Timetable│ -> │ Preview │
 └────────┘    └────────────┘    └─────────────────┘    └─────────┘
   window         per-track        recurring grid       dated calendar
   working days   periods +        (program × subject   (resolved against
   periods/day    faculty per      × track painted      window + holidays
   faculty pool   subject          into cells)          + breaks)
```

**Free navigation:** every step in the top stepper is clickable at any time.  
Users do **not** have to finish Step 2 before opening Step 3. Each step renders best-effort given the current state (see §11).

### 1.4 Route & shell

- Route: `/institute/sections/:sectionId/schedule` (`SectionSchedulePage.tsx`).
- Local UI state: `step: 'setup' | 'allocation' | 'timetable' | 'preview'` (component state — not stored).
- Data state: session-only in-memory store in `src/hooks/useSection.ts`. **All mutations go through that store** so the budget strip and downstream steps re-render via `useSyncExternalStore`.

---

## 2. Shared page chrome

Defined in `SectionSchedulePage.tsx`.

### 2.1 Header bar

- Breadcrumb: `Programs › <section.name> › Schedule`
- Title block: `section.className` (small caps) + `section.name` (bold)
- Right chip: `formatRange(activeWindow)` (e.g. *1 Jun 2026 → 31 Mar 2027*)

### 2.2 Sticky stepper

```
  ① Setup    ── ② Allocation    ── ③ Timetable    ── ④ Preview
  (active: indigo / done: emerald + check / pending: slate)
```

- Stepper is `position: sticky; top: 0; z-30` — stays visible while scrolling long forms.
- Clicking any pill jumps to that step. No gating, no confirmation.

### 2.3 Budget strip (visible from Step 2 onward)

```
 Budget · Allocated · (Remaining | Over) · [████████░░░░] 64%
```

- `Budget = computeSectionCapacity(config, activeWindow, instituteHolidays).totalPeriods`
- `Allocated = totalAllocated(section)` — sum of every track's `allottedPeriods` across every program/subject
- Color rules:
  - `allocated > budget` → rose, label *Over*
  - `allocated === budget` → emerald, label *Remaining* with value 0
  - else → indigo gradient, label *Remaining*

### 2.4 Auto-save indicator

Each form shows a tiny green *Auto-saved* badge. The store is synchronous — there is no debounce; every keystroke commits immediately. The badge is therefore a UX cue, not a state machine.

---

## 3. Data model (single source of truth)

Defined in `src/types/section.ts`.

```ts
Section {
  id, name, className
  windows: AcademicWindow[]              // last entry = editable; earlier entries are read-only history
  facultyPool: string[]                  // faculty ids drawn from institute roster
  config: SectionConfig                  // working days, periods/day, breaks, holidays
  programs: SectionProgram[]             // CBSE, JEE…
  cells: SectionCell[]                   // unique on SlotKey
  subjectStatus: Record<                  // `${programId}:${subjectId}` -> 'draft' | 'locked' | 'published'
    string, SubjectStatus
  >
}

SectionProgram { id, name, code, subjects: SectionSubject[] }
SectionSubject { id, name, color, chapters: SectionChapter[], tracks: SectionTrack[] }
SectionTrack   { id, name, facultyId, chapterIds: string[], allottedPeriods: number }
SectionChapter { id, name, topics: SectionTopic[] }
SectionTopic   { id, name, periods: number }

AcademicWindow { id, startDate, endDate, locked? }
SectionConfig  { workingDays, periodsPerDay, periodLengthMins,
                 periodOverrides?, dayStartTime, breaks, holidays }

SlotKey   { weekStartDate, weekday, periodIndex }    // unique
SectionCell extends SlotKey { allocation: CellAllocation }
CellAllocation { programId, subjectId, trackId, facultyId? }
```

### 3.1 Invariants

1. **One cell = one allocation.** A `SlotKey` may host **at most one** `CellAllocation`. Enforced in `setCellAllocation` — throws `CellOccupiedError` unless `force: true`.
2. **Tracks of the same subject occupy different cells.** They are parallel sections, not the same period.
3. **Only the last window is editable.** Older windows are snapshots (`locked: true`).
4. **Faculty in dropdowns ⊂ `Section.facultyPool` ⊂ institute roster.**
5. **Allotted periods are non-negative integers.** `setTrackAllotment` clamps via `Math.max(0, Math.round(periods))`.

### 3.2 Mutations cheat-sheet (`useSection.ts`)

| Function | Purpose |
|---|---|
| `setSectionName` | Rename section |
| `setSectionConfig` | Replace `SectionConfig` wholesale |
| `setSectionFacultyPool` | Faculty pool toggles |
| `setActiveWindow(id, start, end)` | Update the editable window's dates |
| `setTrackAllotment` / `setTrackFaculty` | Step 2 edits |
| `addTrack` / `removeTrack` | Add/remove a parallel track (removeTrack also drops cells referencing it) |
| `setCellAllocation(slot, alloc, {force?})` | Paint a cell — throws `CellOccupiedError` |
| `clearCell` | Erase a cell |
| `fillSlotsSkippingOccupied` | Bulk paint a row/column without overwriting |
| `setCellFaculty` | Per-cell faculty override |
| `setSubjectStatus` | draft → locked → published |

---

## 4. Step 1 — Setup (`SectionSetupStep.tsx`)

### 4.1 Controls (form, left column)

| Control | Source field | Writes via | Constraints |
|---|---|---|---|
| Section name | `section.name` | `setSectionName` | Free text. Empty allowed in store; UI shows section name as title regardless. |
| Academic start | `activeWindow.startDate` | `setActiveWindow(id, start, win.endDate)` | `YYYY-MM-DD` |
| Academic end | `activeWindow.endDate` | `setActiveWindow(id, win.startDate, end)` | `YYYY-MM-DD` |
| Working days (M/T/W/T/F/S/S) | `config.workingDays: WeekDay[]` | `setSectionConfig` | At least one should be on (not enforced — see edge cases) |
| Periods / day | `config.periodsPerDay` | `setSectionConfig` | Clamped to ≥ 1; UI range 1–12 |
| Period length (min) | `config.periodLengthMins` | `setSectionConfig` | Clamped to ≥ 15; UI range 15–120 |
| Day starts | `config.dayStartTime` | `setSectionConfig` | HH:mm |
| Faculty pool | `section.facultyPool` | `setSectionFacultyPool` | Subset of institute roster |

### 4.2 Capacity panel (right column)

Computed live with `computeSectionCapacity(config, activeWindow, instituteHolidays)`:

```ts
workingDays = buildWorkingDays(start, end, workingDays, holidaySet).length
totalPeriods = workingDays × periodsPerDay
weeks        = ceil(workingDays / config.workingDays.length)
```

Below the metric tiles:
- **Programs in this section** — list of `{code, name, subjects.length}`
- **Breaks** — `{name, afterPeriod, durationMins}`

### 4.3 Edge cases & resolution

| Scenario | Symptom | Resolution |
|---|---|---|
| `endDate < startDate` | `buildWorkingDays` returns `[]` → budget shows 0 | Show inline warning under date inputs; downstream steps render the empty state. Fix: correct dates. |
| All weekday toggles off | Same as above — 0 working days | Force at least one (UI hint) or let user see the 0 to self-correct. |
| `periodsPerDay = 0` | Budget 0; Step 3 grid has zero rows | Re-input ≥ 1. |
| Period length × periods/day overruns the calendar day | Day end clock goes past midnight | Soft warn in Step 3 header; not blocked. |
| Two breaks at the same `afterPeriod` | Both render in sequence | Allowed; user can remove duplicates. |
| Faculty pool empty | Step 2 track dropdown is empty → cannot paint cells | Force user to pick ≥ 1 faculty before continuing. The Continue button itself is not gated, so this is a UX hint only — Step 2 will block via `blocker`. |
| Institute roster grows mid-session | New faculty don't auto-join the pool | They appear as un-checked items in the pool list; user opts in. |

---

## 5. Where holidays come from

Holidays are **merged from two sources**:

1. **Institute-wide holidays** — owned by `/institute/programs/holidays` (`InstituteHolidaysPage`), surfaced via `useInstituteHolidays()`. Affect **every** section automatically.
2. **Section-only holidays** — `section.config.holidays`. Editable from this section's setup form (additional days off for this section only).

Merge happens in `computeSectionCapacity`:

```ts
holidaySet = new Set([
  ...instituteHolidays.map(h => h.date),
  ...(config.holidays ?? []).map(h => h.date),
]);
```

### Behaviour rules

- Removing an institute-wide holiday **after** a cell has been painted on that date does not "delete" the cell — the cell exists on the recurring weekly grid, not on a calendar date. In **Step 4 Preview**, the date becomes a normal working day and the cell appears as a regular class.
- Adding an institute-wide holiday **after** painting causes the matching date in Preview to render as an *off-day overlay* (the cell is not deleted; it's hidden for that date only).
- Capacity (Budget) recomputes automatically the next time the hook reads `useInstituteHolidays`.

### Edge cases

| Scenario | Symptom | Resolution |
|---|---|---|
| Holiday date outside the active window | Ignored | No-op |
| Same date listed in both lists | Counted once (Set semantics) | None needed |
| Holiday on every working day in the window | Budget = 0 | Show empty-state hint in Preview |

---

## 6. Academic windows ("Terms") & *Previously covered up to*

### 6.1 What a window is

`AcademicWindow { id, startDate, endDate, locked? }` — a single term / semester.

- A section keeps a chronological list: `windows[]`.
- The **last** entry is always the **editable** one. Earlier entries are historical snapshots (`locked: true`) and read-only.
- The *Range* chip in the page header shows the active window via `formatRange(activeWindow)`.

### 6.2 *Previously covered up to*

When a new window is opened, the prior window's published cells form the **already-covered set**. The Step 2 / Step 3 UI uses this to:

- Mark topics whose periods were already consumed in prior terms.
- Reduce the available remainder before allocating in the new window.
- Display a "Previously covered up to *<topic>*" hint per subject.

This is **derived data** — there is no separate `previouslyCoveredUpTo` field. It's recomputed from the union of all prior windows' published cells.

### 6.3 Edge cases

| Scenario | Symptom | Resolution |
|---|---|---|
| New window overlaps the prior end date | Ambiguous "previously covered" calc | Constrain the new window to start ≥ prior `endDate + 1` day. |
| Prior window has zero published cells | "Previously covered" = nothing | Render Subject from the first topic. |
| User edits a locked window via devtools | Mutation succeeds but breaks historical truth | Always re-check `window.locked` server-side before persisting. |

---

## 7. Step 2 — Period Allocation (`SectionAllocationStep.tsx`)

### 7.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Budget strip (shared across all programs)                   │
│  Budget · Allocated · Remaining/Over · Working days · [▓░] %  │
├──────────────────────────────────────────────────────────────┤
│  Program switcher  [CBSE] [JEE] [NEET]   ← only one active   │
├──────────────────────────────────────────────────────────────┤
│  Active program card                                          │
│  ▸ Subject (color header) · total periods                    │
│    └─ Track row: [T-chip] [Faculty▼] [#periods] [🗑]         │
│    └─ + Add parallel track                                    │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Program switcher

- Only **one program is edited at a time**. The active pill is indigo-filled.
- A short pulse animation (amber ring, 650ms) confirms the switch.
- Each pill shows program `code`, `name`, and a `Np` badge with that program's running total.
- Self-heals if the currently active program is removed (`useEffect` resets to `programs[0]`).
- **Why one-at-a-time:** the budget is shared, so a single, focused mental model avoids users double-counting.

### 7.3 Per-subject / per-track edits

For each subject:
- Header strip in subject color, with running total.
- For each track:
  - **T-chip** (T1, T2, …) using `trackPattern(index)` for stripe variation.
  - **Faculty select** — options filtered to `section.facultyPool`.
  - **Periods input** — number, clamped ≥ 0 by `setTrackAllotment`.
  - **Remove** (only visible when `tracks.length > 1`; the last remaining track cannot be removed).
- **+ Add parallel track** opens a dialog with name + faculty.

### 7.4 Per-program rollup

```ts
programTotal = Σ subjects.tracks.allottedPeriods
sectionAllocated = Σ programTotal across all programs
```

### 7.5 Continue blocker

`Continue to Timetable` is disabled when:
- `allocated > budget` — message *"N periods over budget — reduce allocations"*
- `allocated === 0` — message *"Allocate at least one track before continuing"*

(Note: this is **Step-2-internal** gating only. The top stepper still allows jumping anywhere.)

### 7.6 Tracks and chapter groupings

`SectionTrack.chapterIds: string[]`:
- Empty array → track covers **all** chapters of the parent subject.
- Non-empty → track covers only the listed chapters (used when two tracks split a subject's syllabus, e.g. T1 = first half, T2 = second half).

### 7.7 Edge cases

| Scenario | Symptom | Resolution |
|---|---|---|
| Faculty assigned to a track is later removed from the pool in Step 1 | Select shows blank | Pick from the dropdown; old id remains in storage until replaced. |
| Track has 0 allotted periods | Track appears in palette but contributes nothing | Hidden from Step 3 palette (no point painting it). |
| Multiple tracks under one subject sum > intended subject budget | Section budget shows Over | User reduces; not blocked at subject level. |
| Removing a track that has painted cells | `removeTrack` cascades — drops every cell with that `trackId` | Confirmation toast recommended; cascade is intentional to keep invariants clean. |
| Adding a track named "T1" twice | Duplicate names allowed | UI hint only; ids are unique (`tr-<subjectId>-<timestamp>`). |
| Switching active program loses unsaved input | None — every keystroke commits | Safe. |

---

## 8. Step 3 — Weekly Timetable (`SectionTimetableStep.tsx`)

### 8.1 Concept

A **recurring weekly template** keyed by `(weekStartDate, weekday, periodIndex)`.  
The grid columns are weekdays from `config.workingDays`; rows are `periodIndex` 0…`periodsPerDay-1`. Breaks are rendered as separator rows between periods.

Each painted cell carries:

```
┌──────────────────────────────────┐
│ [CBSE]  ← program code chip      │
│ Physics                          │  ← subject (color-tinted)
│ [T1]    ← track chip             │
│ Ms. Iyer ← faculty (override?)   │
└──────────────────────────────────┘
```

Track chip rule: render whenever a track exists (always, even if subject has only one track — disambiguates CBSE-T1 from JEE-T1 in mixed grids).

### 8.2 Palette (left rail)

Lists every paintable `(programId, subjectId, trackId)` triple from Step 2 where:
- `track.allottedPeriods > 0`
- `track.facultyId ∈ facultyPool`

Selecting an item "arms" it; clicking a cell paints it; clicking a painted cell with the same item armed clears it.

### 8.3 Drag-to-swap

- Drag a painted cell over another painted cell → **swap** their allocations.
- Drag over an empty cell → **move**.
- Both touched cells get marked as user-locked so a subsequent auto-regenerate in Step 4 preserves them.

### 8.4 Bulk fill

Row/column "Fill" actions use `fillSlotsSkippingOccupied`: occupied cells are preserved; only empties get the armed allocation. Returns `{filled, skipped}` for a toast.

### 8.5 The cell-uniqueness invariant in code

```ts
setCellAllocation(slot, allocation, opts?) {
  const existing = cells.find(c => slotKeyEq(c, slot));
  if (existing && !opts.force) throw new CellOccupiedError(existing.allocation);
  // ...replace by slot key
}
```

UI behaviour on `CellOccupiedError`:
- Default paint → catches the error and prompts *"Replace existing X?"* (or hold ⇧ to force).
- Drag-swap path bypasses this by going through a swap helper that explicitly forces both writes.

### 8.6 Edge cases

| Scenario | Symptom | Resolution |
|---|---|---|
| Painting onto an occupied cell | `CellOccupiedError` | UI prompt: Replace / Cancel. Or hold ⇧ to force. |
| Same faculty in two programs at the same slot | Faculty double-booked | Amber outline + warning toast. Not blocked — institutes legitimately co-teach. |
| User shrinks `periodsPerDay` in Step 1 after painting | Cells with `periodIndex ≥ new max` disappear from the grid | Quarantined — kept in store, hidden in grid. Restored if user expands again. |
| User unchecks a weekday in Step 1 after painting | Same — cells for that weekday hidden | Quarantined; restored on re-enable. |
| Track removed in Step 2 | Cells cascade-deleted via `removeTrack` | No recovery — by design. |
| Faculty pool emptied | Palette empty | Re-add faculty in Step 1. |
| Holiday date in active window | Step 3 doesn't show calendar dates (it's recurring), so unaffected. Step 4 shows the off-day overlay. | None |
| Two parallel tracks of the same subject painted into the same slot | First write succeeds; second throws `CellOccupiedError` | Tracks are parallel sections — they MUST occupy different slots. UI blocks. |
| `weekStartDate` mismatch between sub-program slices | The grid resolves per-week | Drag-swap only allowed within the same `weekStartDate`. |

---

## 9. Step 4 — Preview (`SectionPreviewStep.tsx`)

### 9.1 What it does

Resolves the **recurring** weekly template into a **dated** schedule across the active window:

1. Compute working dates via `buildWorkingDays(start, end, workingDays, holidaySet)`.
2. For each date, look up the matching `weekday` cells from the template.
3. Compute per-period start/end via `computePeriodTimes(dayStartTime, periodLengthMins, breaks, periodOverrides)`.
4. Emit `ScheduleSlot[]` (dated, with `facultyId`, `subjectId`, `trackId`, `subProgramId`).

### 9.2 Views

- **Month view** — heatmap-style; color = subject.
- **Week view** — full grid with cell chips identical to Step 3, but dated.
- **Day view** (where available) — period timeline with break gaps.

Each rendered cell shows the program code (CBSE/JEE), subject name in its color, and the track chip (T1/T2).

### 9.3 Drag-to-swap in week view

- Drags update the **resolved slots**, mark both as `locked: true`.
- Locked slots survive a *Regenerate* (e.g. after a Step 2 edit).

### 9.4 Off-days

- Institute holidays + section holidays render as an **off-day overlay** on the date tile.
- The underlying template cells are not modified — toggling the holiday off restores classes for that date.

### 9.5 Edge cases

| Scenario | Symptom | Resolution |
|---|---|---|
| Step 2 allocation = 0 | Empty preview | Hint: *"Allocate periods first."* |
| Step 3 grid empty | Preview empty | Hint: *"Paint the weekly timetable first."* |
| Off-days ≥ working dates | Empty preview | Hint: *"All dates in this window are off-days."* |
| User edits Step 3 after Step 4 shown | Auto-regenerate, but locked slots preserved | Toast: *"Schedule regenerated · N user edits preserved."* |
| Same faculty double-booked across programs on same dated slot | Amber chip in preview | Warn-only |
| Holiday removed after locked drag | The locked slot stays; date returns from off-day to teaching | Expected |
| Day end clock past midnight (over-long config) | Last period wraps visually | Soft warn; allow user to reduce period length |

---

## 10. Calculations reference

All math lives in `src/utils/sectionUtils.ts` and `src/utils/calendarAutomation.ts`.

```
workingDays   = buildWorkingDays(start, end, weekdayMask, holidaySet).length
totalPeriods  = workingDays × periodsPerDay
weeks         = max(1, ceil(workingDays / weekdayMask.length))
allocated     = Σ section.programs[*].subjects[*].tracks[*].allottedPeriods
remaining     = totalPeriods − allocated
overBy        = max(0, allocated − totalPeriods)
pct           = totalPeriods === 0 ? 0 : min(100, round(allocated / totalPeriods × 100))
periodTimes   = computePeriodTimes(dayStartTime, periodLengthMins, breaks, periodOverrides)
```

`buildWorkingDays` walks day-by-day from `start` to `end`, including only dates whose weekday ∈ `workingDays` and whose ISO date ∉ `holidaySet`.

---

## 11. Free-navigation rules

| Step | Behaviour when the prior step is incomplete |
|---|---|
| Setup | Always available |
| Allocation | Renders with whatever budget is computable (could be 0). Continue button gated internally; the **stepper** is not. |
| Timetable | If allocation is empty → palette shows a hint, grid is read-only. If `periodsPerDay = 0` → empty grid placeholder. |
| Preview | Re-resolves whatever is in the template. Renders an empty-state hint when nothing can be resolved. |

Nothing is destructive when jumping back and forth — the store is the source of truth.

---

## 12. Cross-step side effects (matrix)

| Change in… | Affects | Behaviour |
|---|---|---|
| Step 1 `workingDays` ↓ | Step 2 budget, Step 3 visible columns, Step 4 dates | Quarantine cells on removed weekdays; restore on re-enable |
| Step 1 `periodsPerDay` ↓ | Step 3 visible rows, Step 4 day length | Quarantine cells with `periodIndex ≥ new max` |
| Step 1 date range | Budget + Step 4 dated slots | Recompute on next render |
| Step 1 holidays / Institute holidays | Budget + Step 4 off-days | Recompute |
| Step 1 faculty pool ↓ | Step 2 selects, Step 3 palette | Faculty removed from new picks; existing references kept until manually replaced |
| Step 2 track removed | Step 3 cells cascade-delete | Hard cascade |
| Step 2 `allottedPeriods = 0` | Step 3 palette | Hides that track |
| Step 3 painted cell | Step 4 resolved slot | One template cell × N matching dates in window |
| Step 4 drag-swap | Step 3 template? | **No** — Step 4 swaps live on dated slots only and locks them. Template remains the *baseline* for regeneration. |

---

## 13. Edge-case catalogue (consolidated)

| # | Scenario | Where | Symptom | Resolution |
|---|---|---|---|---|
| 1 | `endDate < startDate` | Setup | Budget 0 | Inline warning, fix dates |
| 2 | All weekdays off | Setup | Budget 0 | Toggle ≥ 1 on |
| 3 | `periodsPerDay = 0` | Setup | Empty grid | Set ≥ 1 |
| 4 | Faculty pool empty | Setup | No paintable items | Add ≥ 1 faculty |
| 5 | Holiday everywhere in window | Setup + Holidays | Empty preview | Reduce holidays or shift window |
| 6 | Over-allocation | Allocation | Rose budget + blocked Continue | Reduce some `allottedPeriods` |
| 7 | Track removed with painted cells | Allocation | Cells cascade-deleted | Intended; warn via toast |
| 8 | Slot collision on paint | Timetable | `CellOccupiedError` | Replace prompt or ⇧-force |
| 9 | Same faculty double-booked | Timetable + Preview | Amber outline | Warn-only |
| 10 | Step 1 shrinks weekday/periods after painting | Timetable + Preview | Some cells hidden | Quarantine; restore on expand |
| 11 | Window overlap with prior term | Setup + Windows | Ambiguous *previously covered* | Force start ≥ prior end + 1 |
| 12 | Editing a locked older window | Windows | UI read-only; server should re-check | Don't accept writes server-side |
| 13 | Two tracks of same subject in same slot | Timetable | Second write throws | Block — tracks are parallel |
| 14 | Drag-swap across `weekStartDate` | Timetable | Disallowed | Swap within same week only |
| 15 | Empty allocation but user opens Preview | Preview | Empty state | Hint with link back to Step 2 |
| 16 | Regenerate after Step 3 edit | Preview | Locked slots preserved | Toast confirms how many |

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Section** | The top-level scheduling unit (e.g. Class 12 Morning). Owns budget, programs, faculty pool. |
| **Program (Sub-program)** | A board/exam track inside a section: CBSE, JEE, NEET. Shown as a `code` chip. |
| **Subject** | Belongs to a program; carries `color` and `chapters[]`. |
| **Track** | A parallel section of a subject (T1, T2, *Advanced*…). Has its own faculty + period budget. |
| **Chapter / Topic** | Subject content. Topics carry the unit `periods`. |
| **Window / Term** | A dated slice of the academic year. Latest is editable; older are read-only. |
| **Cell** | One slot in the weekly template, uniquely keyed by `(weekStartDate, weekday, periodIndex)`. |
| **Slot** | A resolved, dated cell (Step 4 output) — `ScheduleSlot`. |
| **Budget** | `workingDays × periodsPerDay`. Shared across all programs in the section. |
| **Allocated** | Sum of `allottedPeriods` across every track. |
| **Faculty pool** | The whitelist of faculty ids this section may assign. |
| **Holiday set** | Union of institute-wide holidays and section-only holidays. |
| **Locked slot** | A Step 4 slot the user dragged/edited; preserved across regenerations. |

---

## 15. File map

| Concept | File |
|---|---|
| Page shell + stepper + budget strip | `src/pages/institute/sections/SectionSchedulePage.tsx` |
| Step 1 form | `src/components/institute/sections/SectionSetupStep.tsx` |
| Step 2 allocation | `src/components/institute/sections/SectionAllocationStep.tsx` |
| Step 3 timetable | `src/components/institute/sections/SectionTimetableStep.tsx` |
| Step 4 preview | `src/components/institute/sections/SectionPreviewStep.tsx` |
| Store + mutations + `CellOccupiedError` enforcement | `src/hooks/useSection.ts` |
| Data model & invariants | `src/types/section.ts` |
| Capacity math, working days, period times | `src/utils/sectionUtils.ts`, `src/utils/calendarAutomation.ts` |
| Institute-wide holidays | `src/pages/institute/programs/InstituteHolidaysPage.tsx`, `useInstituteHolidays` in `src/hooks/useInstitutePrograms.ts` |
| Color tokens & track stripe patterns | `src/lib/sectionColors.ts` |
| Mock seed data | `src/data/mockSections.ts` |

---

### Appendix A — Adding a new step / control checklist

1. Add the field to `SectionConfig` (or wherever) in `src/types/section.ts`.
2. Add a mutator in `src/hooks/useSection.ts`. Keep mutations pure — return a new `Section`.
3. Wire the UI control through that mutator (do **not** mutate `section` directly).
4. If the field affects budget, update `computeSectionCapacity`.
5. If it affects cells, decide: **quarantine** (hide, keep) or **cascade-delete** (drop). Document in §12.
6. Add an entry to the edge-case catalogue (§13).
