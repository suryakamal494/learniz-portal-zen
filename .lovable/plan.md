# Unified Program Page — Understanding + Phase Plan

## Part 1 — What I understood (please confirm)

### The problem with today
- `/teacher/batches/:id/programs` shows only chapters + lesson plans.
- `/teacher/batches/:id/progress` shows only completion percentages.
- These two are split, and neither answers the teacher's real question: *"What am I supposed to teach today, where do I stand, and what material should I use?"*
- Numbers like `36%` or `7h` appear with no explanation — a first-time teacher has no way to interpret them.

### What "Programs" should actually be
One **comprehensive view per section** that fuses three lenses the teacher needs every day:

1. **Where I stand (Status)**
   - Chapter-wise completion of the syllabus assigned by the institute.
   - "Pending vs completed", not just a raw percent.
   - Every number has a hover explanation ("36% means 18 of 50 planned hours marked taught").

2. **What to teach, when (Schedule lens)**
   - The institute pre-assigns an **academic schedule**: chapter → topics → planned hours → expected start/end dates.
   - The teacher's program view re-projects that schedule as *"today / this week / upcoming"*.
   - Compares **planned date vs actual progress** → shows **"You are 2 days behind on Kinematics"** or **"On track"** or **"Ahead by 1 day"**.
   - Crucially: **this is NOT the full Academic Schedule module re-rendered**. It's a focused, contextual slice scoped to this section, surfaced as "what's due now".

3. **What material to use (Content)**
   - For the topic of the day / selected topic → the **lesson plans** attached to it (notes, slides, videos, assessments).
   - One click from "Kinematics → Motion graphs" to the lesson plan / preview.

### Other rules I picked up
- **Days-behind logic** is driven by the **status the teacher marks**, not by calendar alone. If today is the 15th and the schedule expected Topic X by the 13th but the teacher hasn't marked it complete → "2 days behind".
- **Stale-status nudge**: if the teacher hasn't updated any topic status for ~7 days, show a soft inline alert at the top of the program page: *"You haven't marked progress for 8 days. Update so your schedule stays accurate."*
- **Every number is explained on hover** — % values, hours, "days behind" — using a consistent tooltip pattern (What it means → How it's calculated → What to do next).
- **Reuse existing design language** (pastel cards, blue primary, Class/Section context first) but the *layout & interactions* can be modern (timeline, week strip, focus card for "today").
- **Merge** today's `BatchProgramsPage` and `BatchProgressTrackerPage` into one page. The "Progress" route becomes a redirect or a deep anchor inside the new program page. The teacher should not have to context-switch between two URLs to get a complete picture.

### What I'm NOT building
- Not duplicating the institute-side Academic Schedule editor.
- Not adding a calendar/timetable grid view of the whole year.
- Not changing how the institute assigns programs.
- Not touching `/teacher/batches` listing or section workspace shell.

---

## Part 2 — Phase-wise implementation plan

### Phase 1 — Data model & schedule scaffolding (foundation, no UI)
Extend mock data so the program carries schedule + status signals. Until this exists, the UI has nothing to compute "days behind" from.

- Extend `mockPrograms` types:
  - `Topic`: `{ id, name, plannedHours, plannedStartDate, plannedEndDate, status: 'not-started' | 'in-progress' | 'done', lastUpdatedAt, lessonPlanIds[] }`
  - `Chapter`: add `topics: Topic[]`, `plannedStartDate`, `plannedEndDate`.
- Seed 1 section (Section A) with a realistic schedule spanning past + present + future dates so all schedule states are demoable (on-track, behind, ahead, done, not-started, stale).
- Add a pure `programSchedule.ts` util:
  - `getTodayFocus(program)` → the topic that should be in progress today.
  - `getScheduleDeltaForChapter(chapter, today)` → `{ state: 'on-track'|'behind'|'ahead'|'done'|'not-started', deltaDays }`.
  - `getStaleStatusInfo(program, today)` → `{ daysSinceLastUpdate, isStale }`.
  - `explainPct(spentHrs, plannedHrs)` → tooltip-ready strings.
- Migrate existing `programProgress.ts` consumers to read from the extended shape (no UI changes yet).

**Exit criteria:** existing pages keep rendering; new utils are unit-callable.

### Phase 2 — New unified Program page shell + merge
Stand up the new page and route, kill the split.

- Rename `BatchProgramsPage` content into a new `ProgramOverviewPage` mounted at `/teacher/batches/:batchId/programs`.
- Make `/teacher/batches/:batchId/progress` redirect to `…/programs#progress` (preserves voice-nav deep links).
- Remove the "Open progress tracker" / "View programs" cross-links — there's only one page now.
- New layout (top → bottom):
  1. Breadcrumb (My Sections / Section · Class / Programs)
  2. **Stale-status alert strip** (only if `isStale`)
  3. **Section + subject context** card (which section, which subject tab — keep existing `ProgramSubjectTabs`)
  4. **Today's focus** card (Phase 3)
  5. **Status overview** strip (Phase 3)
  6. **Schedule + chapters** main panel (Phase 4)
  7. **Topic detail drawer / lesson-plan rail** (Phase 5)

**Exit criteria:** single URL renders all old info, no dead routes, no duplicate cross-nav buttons.

### Phase 3 — "Where I stand" + "Today's focus" widgets
The first two of the three lenses, with the tooltip standard baked in.

- **Today's focus card**
  - Shows: today's date, the scheduled topic (`getTodayFocus`), the chapter it belongs to, planned hours, and a one-click "Mark in progress / Mark done" status toggle.
  - If the teacher is behind, the card surfaces: *"You should be teaching `Motion graphs` today. You're 2 days behind on `Kinematics`."* with a "Catch up" CTA that scrolls to that chapter.
- **Status overview strip** (4 small tiles, each with a `Tooltip`):
  - Syllabus completed (% + "x of y hours marked taught")
  - Chapters in progress (count)
  - Chapters behind schedule (count, red tint if >0)
  - Last status update (relative time)
- **Tooltip primitive**: wrap reusable `<MetricWithMeaning>` component — every numeric tile and chip uses it. Tooltip body = "What it means / How it's calculated / What to do next" — matches the project's Core "Data WITH Understanding" rule.

**Exit criteria:** every number on the page has a hover explanation; teacher sees what to do today without scrolling.

### Phase 4 — Schedule-aware chapter list
Replaces the current flat accordion.

- Per chapter row:
  - Chapter name + `plannedStartDate → plannedEndDate` range.
  - **Schedule pill**: `On track` / `Behind 2d` / `Ahead 1d` / `Done` / `Not started` — colored per project thresholds (green/amber/red).
  - Inline progress bar (hours spent / planned) with tooltip.
  - Expandable topic list — each topic shows planned date, status chip, quick status toggle, and a "View lesson plans" link.
- **Filters above the list**: `All / This week / Behind / In progress / Not started / Done`.
- **"Today" anchor**: a thin horizontal marker line in the list between past-due and upcoming chapters so the teacher visually sees where "now" is.

**Exit criteria:** teacher can answer "what am I behind on?" in one glance and drill into the exact topic.

### Phase 5 — Topic → content (lesson plans) integration
The third lens — collapses today's "navigate to a separate lesson-plan page" into a side rail.

- Clicking a topic opens a right-side **Topic Drawer**:
  - Header: chapter > topic, planned date, status toggle.
  - Tabs: `Lesson plans` (cards from existing `LessonPlanCard`) · `Notes` · `Assessments` (links into existing modules, do not duplicate).
  - "Open in full lesson-plan editor" link for the existing deep workflow.
- Keep `LessonPlanPreviewModal` for quick peek without leaving the page.

**Exit criteria:** from one program page, the teacher reaches every piece of content for any topic in ≤2 clicks.

### Phase 6 — Stale-status nudges + status-driven recompute
Polish that closes the loop between marking status and the schedule view.

- Top-of-page alert when `daysSinceLastUpdate ≥ 7`: *"You haven't updated progress for 8 days — your schedule view may be inaccurate. Update now."* with dismissible behavior (session-scoped) and a quick "Mark today's topic" shortcut.
- When the teacher toggles a topic status anywhere on the page, recompute all schedule deltas in place (no full reload) and animate any chip whose state changed.
- Empty / no-program-assigned and no-schedule-yet states with clear next-step copy.

**Exit criteria:** marking a topic done immediately moves the chapter chip from "Behind 2d" to "On track", and the stale-status alert clears.

---

## Open questions before I start Phase 1

1. **Days-behind anchor**: should "behind" be measured against **planned end date of the topic** or **planned end date of the chapter**? (I'm planning per-topic, rolled up per-chapter — confirm.)
2. **Stale threshold**: 7 days OK, or different (e.g., 3 / 14)?
3. **Status values**: are `not-started / in-progress / done` enough, or do you also want `skipped` / `revisit`?
4. **Progress route**: OK to redirect `/progress` → `/programs#progress` so voice-nav and existing links still work?

Once you confirm understanding + answer the open questions, I'll start with Phase 1.
