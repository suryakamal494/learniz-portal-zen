## Seed multiple Academic Windows in mock data

Right now every program in `mockInstitutePrograms.ts` ships with at most one flat schedule (one window). The Phase B switcher works, but on first load each program shows only "Window 1", so there is nothing to traverse between — devs can't see the window-swap behaviour without manually clicking "+ Add" and re-entering data.

This plan seeds **2–3 realistic academic windows per program** so the switcher is immediately demonstrable, and adds a small dev-facing affordance to make the traversal behaviour obvious.

---

### 1. Mock data — `src/data/mockInstitutePrograms.ts`

For each existing program with a `schedule`, populate `schedule.windows` and `schedule.activeWindowId` with **three pre-built windows** that share the schedule-level fields (faculty pool, day start, breaks, period length) but differ on per-window slices:

```text
Window 1 — "Term 1 · Foundation"
  Jun 1 → Sep 30 · Mon–Sat · 7 periods/day
  Allocation:   Physics 40, Chemistry 35, Maths 50, Biology 30
  Tracks:       Maths split into T1 (Algebra) + T2 (Calculus)
  Weekly grid:  fully filled (so timetable step is non-empty)
  Holidays:     adds Aug 15 override note

Window 2 — "Term 2 · Board Prep"
  Oct 1 → Dec 20 · Mon–Sat · 8 periods/day
  Allocation:   Physics 55, Chemistry 50, Maths 60, Biology 40
  Tracks:       Physics split into T1 (Mechanics) + T2 (Optics)
  Weekly grid:  fully filled, different subject mix than Term 1
  Holidays:     adds Diwali, removes one institute holiday

Window 3 — "Term 3 · Revision Sprint"
  Jan 5 → Mar 15 · Mon–Fri · 6 periods/day
  Allocation:   lighter — Physics 30, Chemistry 30, Maths 35, Biology 25
  Tracks:       single track per subject (reset)
  Weekly grid:  partially filled (shows in-progress state)
  Holidays:     none
```

Set `activeWindowId = "win-term-1"` so the program lands on Term 1.

Key intent: each window has **visibly different** working days, periods/day, allocation totals, track configuration, and timetable density — so switching tabs in the `AcademicWindowSwitcher` produces obviously different content on all three steps (Setup, Allocation, Timetable).

### 2. Dev-visible traversal cue — `AcademicWindowSwitcher.tsx`

Small additions so devs can see the swap happening:

- Show a **"Last switched: <window label> · <timestamp>"** debug line under the pill bar (only when `import.meta.env.DEV` is true). Updates every time `switchActiveWindow` runs.
- Animate the active pill with a brief ring pulse on switch (200ms) so the swap is visually obvious.
- Add tooltip on each pill: `"Click to load this window's allocation & timetable"`.

### 3. Capacity strip & timetable header

`CapacityStrip.tsx` already reads from the flat config (which mirrors active window). No code change needed — it will automatically show different totals per window once the seed data exists. Verify visually after step 1.

### 4. No type or hook changes

`useInstitutePrograms.ts` already has `switchActiveWindow`, `ensureWindows`, `addWindow`, `deleteWindow`. `ScheduleConfig.windows[]` and `AcademicWindow` types are already in place. This plan is **data-only + one cosmetic UI tweak**.

---

### Files touched

- `src/data/mockInstitutePrograms.ts` — add `windows[]` + `activeWindowId` per program
- `src/components/institute/programs/AcademicWindowSwitcher.tsx` — dev-only switch indicator, pulse animation, pill tooltips

### Out of scope

- No changes to allocation/timetable/holidays logic
- No changes to Section workspace (Phase E already shipped)
- No calendar-generator changes (still pending — separate plan)

---

### One confirmation

For the mock seed, should all programs get the **same three terms** (Term 1 / Term 2 / Term 3) for consistency, or should I vary them per program (e.g. JEE program gets "Phase 1 / Phase 2 / Test Series", NEET gets "Pre-Board / Board / Revision")? I'll go with **varied per program** unless you say otherwise — it makes the demo richer.
