## Step 3 (Preview) — Carry forward Step 2 timetable + auto-fill chapter & topic

Step 2 already builds the weekly timetable (subjects per period × day). Step 3 should display **that same timetable**, week by week, with the chapter and topic **auto-populated from teaching hours** and the faculty resolved from defaults. No new timetable structure; we just carry Step 2 forward and layer the syllabus on top.

---

### Concept

```text
Step 1  →  Period slots (P1=08:30–09:10, P2…, breaks)
Step 2  →  Weekly timetable template     (Mon P1 = Physics, Mon P2 = Chemistry …)
Step 3  →  Same grid, week-by-week, with chapter + topic + teacher auto-filled
           by walking each subject's topic queue and consuming hours topic-by-topic
           across the periods Step 2 reserved for that subject.
```

So Step 3's job is:
1. Render the **same Periods × Days grid** the Step 2 builder used (same look, same period rows, same break bands).
2. Add a **week selector** on top (W1, W2, W3 …) — defaults to W1, navigates through the academic window.
3. For every Step-2 cell that has a subject, fill in **chapter → topic** by consuming hours from that subject's syllabus queue, and assign the **default faculty** for that subject.
4. Let the user edit chapter / topic / teacher per cell. Time and subject are **read-only** in Step 3 (they belong to Step 1 and Step 2 respectively — to change them, go back).

### How auto-fill works (uses existing generator)

`generateFromTimetable(program, config, locked)` already does exactly this:
- Walks the academic window day by day.
- For each day, replays Step 2's weekly template.
- Pulls the next available topic from each subject's hour queue (`computeCoverageCursor`).
- Allocates `hoursToPeriods(topic.hours, periodLengthMins)` consecutive periods to that topic, advancing the cursor.
- Returns `ScheduleSlot[]` with `subjectId`, `chapterId`, `topicId`, `facultyId`, `startTime`, `endTime`.

Step 3 already calls this on entry (`generateFromTimetable` in `onGenerate`). We just need a view that **renders those slots back into the Step 2 grid shape**, grouped per selected week.

### UI changes — `CalendarStep` in `ProgramSchedulePage.tsx`

- Replace today's default landing view with a new **Timetable** view that visually mirrors `WeeklyTimetableBuilder`.
- Keep Month / Week / List as secondary views in the existing switcher; add `'timetable'` as the new default.

New subcomponent `Step3TimetableView`:

1. **Week selector bar** (same chip strip pattern as Step 2):
   - Chips `W1 … Wn` for every week between `config.startDate` and the last generated slot's date.
   - Each chip tooltip: `Apr 14 – Apr 19`. Active chip highlighted in blue.
   - Prev / Next arrows + "Jump to today" if today is inside the window.

2. **Grid** (identical layout to Step 2 builder):
   - Rows = `computeDayLayout(config)` (period rows + break bands).
   - Columns = `config.workingDays` with the **real date** of that weekday in the selected week shown in the header (`Mon 14`, `Tue 15`, …).
   - Header row also shows period time on the left (`P1 · 08:30–09:10`).

3. **Cell rendering** (for each Step 2 cell that has a subject, find the matching generated slot for that date+periodIndex):
   - **Subject pill** (colored, read-only — same visual as Step 2).
   - **Topic line** (bold) + **chapter sub-line** (small, muted) — both editable via a single click → opens a Popover with chapter ▼ then topic ▼ (chapters limited to the cell's subject; topics limited to the chosen chapter).
   - **Faculty chip** with pencil — opens Select filtered by subject (reuses `facultyOptionsFor` pattern from `CurriculumCalendarView`).
   - **Time** rendered plain (`08:30 – 09:10`), not editable.
   - If Step 2 cell is empty (no subject) → grid cell shows a muted "—" (no auto-fill, since Step 2 didn't reserve that period).
   - If Step 2 has a subject but the generator ran out of topics for it → show subject pill + italic "Syllabus complete" placeholder.

4. **Edit semantics**:
   - Editing chapter resets topic to the chapter's first topic.
   - Editing topic / chapter / teacher patches that single `ScheduleSlot` via the existing `onChangeSlots` flow and marks `locked: true` so a re-generate won't overwrite it.
   - Subject and time are never editable from Step 3 — small inline note: *"Subject comes from Step 2 · Time comes from Step 1. Edit chapter, topic or teacher per class here."*

5. **Regenerate button** (already exists) is kept; it warns that locked cells are preserved.

### Mock data — Class 12 PCM expansion

To make the Step 3 grid feel realistic, expand `prog-1` in `src/data/mockInstitutePrograms.ts`:

- Add 4 subjects: **Biology** (`rose`), **English** (`amber`), **Hindi** (`orange`), **Social Studies** (`cyan`) — each with 6–8 chapters × 4 topics, seeded hours.
- Add 2 faculty per new subject to `MOCK_FACULTY` (Bio: Meera Iyer / Rohit Das; English: Sneha Pillai / James Thomas; Hindi: Kavya Joshi / Suresh Yadav; Social: Riya Khanna / Aakash Verma).
- Pre-fill `prog-1.schedule.defaultFaculty` so every subject has an assigned teacher.
- Seed `prog-1.schedule.weeklyTimetable` with a realistic Step 2 template (6 periods × Mon–Sat, mixing all 7 subjects), so Step 3 has data to render without forcing the user to redo Step 2.

`prog-2` and `prog-3` are untouched.

### Files touched

- `src/data/mockInstitutePrograms.ts` — add subjects, faculty, default-faculty wiring, seeded weekly template for `prog-1`.
- `src/pages/institute/programs/ProgramSchedulePage.tsx`:
  - Extend `ViewMode` with `'timetable'` and default to it in Step 3.
  - Add `Step3TimetableView` subcomponent (week selector + Periods × Days grid + edit popovers). Reuses `computeDayLayout`, `subjectPalette`, existing slot-edit plumbing.

No changes to types, `calendarAutomation.ts`, the Step 2 builder, or the Step 1 setup.

### Out of scope

- Editing subject or time from Step 3 (must go back to Step 2 / Step 1).
- Bulk-apply edits across weeks.
- Drag-to-move slots.
- Touching `prog-2` / `prog-3` seeds.
