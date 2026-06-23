## Changes

### 1. Show faculty name in calendar view (`CurriculumCalendarView.tsx`)
- Import `MOCK_FACULTY` from `@/data/mockInstitutePrograms` and build a `facultyById` lookup (id → name, short initials).
- **Day view**: append a small "· <Faculty Name>" line/chip next to topic on each period row.
- **Week view**: add a `text-[10px] text-slate-500 truncate` line under topic showing faculty name (initials on narrow cells).
- **Month view**: keep subject chips; add a tooltip listing faculty per subject for that day.
- Add "Faculty" mini-legend row under subject legend showing each subject → assigned faculty.

### 2. Promote List / Calendar toggle (`ProgramPreviewPage.tsx`)
Currently buried in the right-side header cluster with Expand/Collapse/Print. Restructure header so:
- The List/Calendar segmented toggle becomes a **primary control directly under the program title** (left side, larger pill with icons + labels).
- Expand all / Collapse all / Print stay on the right as secondary actions (smaller, ghost styling), and Expand/Collapse only render in List mode (already the case).
- On mobile, toggle stacks above secondary actions.

### 3. Replace decimal-hour displays with `Xh Ym` everywhere in program modules
Use existing `formatHoursShort` from `src/utils/formatUtils.ts` (e.g. `52.5 → "52h 30m"`, `33 → "33h"`).

Files & lines to update:
- `ProgramPreviewPage.tsx` — header roll-up (`309.9h`), subject totals (`{sRoll.hours}h`), topic hours (`{t.hours}h`).
- `ProgramSchedulePage.tsx` — `${roll.hours}h teaching`, subject row `{s.hours}h`.
- `ProgramHoursPage.tsx` — subject pill (`{sRoll.hours}h`), big total (`{roll.hours} hrs`), subject summary (`{s.hours}h · {s.periods}p`), topic helper text (`${topic.hours} h`).
- `ProgramsListPage.tsx` — any remaining hour readouts on cards (verify and convert if present).

Periods (`~546p`, `{periods}p`) stay unchanged — only hours are reformatted.

### Out of scope
No data-model changes; faculty assignments already exist on `ScheduleSlot.facultyId` and `MOCK_FACULTY`. No backend work.
