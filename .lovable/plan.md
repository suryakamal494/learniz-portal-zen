## Weekly Timetable UX Fixes

Three problems to fix in `WeeklyTimetableBuilder.tsx`. No backend/type changes — frontend UX only.

---

### 1. Confusing button labels & missing undo

**Today:**
- "Copy this week to…" → Next / Next 4 / All remaining
- "Apply as repeating pattern" → silently overwrites every week, no undo

**Change to:**
- **Rename** "Apply as repeating pattern" → **"Copy to all weeks"** (same icon).
- **Merge** both copy actions under one clear "Copy this week to…" dropdown:
  - Next week only
  - Next 4 weeks
  - All remaining weeks
  - All weeks (including past weeks in window)
- **Before any bulk copy**, show a confirm dialog: *"This will replace the timetable for N week(s). Continue?"* — and snapshot the previous `cells` array.
- **Add an Undo toast** (sonner) after every bulk operation (Copy-to-N, Clear week, Fill row, Fill column): *"Pattern applied to 12 weeks. [Undo]"* — Undo restores the snapshot via `onChange`. Snapshot kept in a `useRef` (last action only — single-level undo, like Gmail).
- **Per-week deletion**: each week chip (W1…W13) gets a tiny ✕ on hover that clears just that week's cells. Also add a clearer **"Clear this week"** button (already exists, keep) and a new **"Clear all weeks"** option in a small "More" menu next to it.

---

### 2. Column "Fill this day" is wrong mental model

**Problem:** Filling a whole column with one subject (Chemistry every period Monday) is unrealistic. A subject is usually taught once per day.

**Replace the column ✨ menu with a "Plan this day" popover** that lets the teacher pick **multiple subjects in order**, one per period:

```
┌─ Plan Monday ──────────────────┐
│ Pick subjects to drop into     │
│ Monday's empty periods (top    │
│ down). Already-filled periods  │
│ are skipped.                   │
│                                │
│ 1. [Chemistry  ▼]  [✕]         │
│ 2. [Physics    ▼]  [✕]         │
│ 3. [Math       ▼]  [✕]         │
│ + Add subject                  │
│                                │
│ ☐ Overwrite filled periods     │
│ ☐ Repeat list if periods left  │
│                                │
│ [Cancel]      [Apply to Monday]│
└────────────────────────────────┘
```

Behavior on Apply:
- Walk Monday's periods top-to-bottom.
- For each empty period (or all, if Overwrite is on), assign the next subject from the ordered list.
- If list shorter than periods: stop (or wrap, if "Repeat" is on).
- Triggers undo snapshot + toast.

Keep the existing row ✨ ("Fill row across week") — that one is correct: same subject for P1 across Mon–Sat is realistic.

---

### 3. Small clarity tweaks

- Rename column-header icon tooltip "Fill this day" → **"Plan this day"**.
- Rename row-icon tooltip "Fill this row" → **"Use this subject across the week"**.
- Update helper text under "Weekly timetable" to: *"Pick a subject for each period. Use the row tool to repeat across the week, the column tool to plan a day, then copy the week to others."*
- Week chip ✕-on-hover with tooltip "Clear this week".

---

### Technical notes

- File touched: only `src/components/institute/programs/WeeklyTimetableBuilder.tsx`.
- New small subcomponent `PlanDayPopover` inside the same file (uses existing `Popover`, `Select`, `Button`, `Checkbox` from shadcn).
- Snapshot/undo via `useRef<WeeklyTimetableCell[] | null>` + `toast(... , { action: { label: 'Undo', onClick } })` from `sonner` (already in project).
- No changes to `ScheduleConfig` types, generator, or other steps.

### Out of scope
- Multi-level undo history
- Drag-to-paint cells
- Conflict detection across subjects/teachers
