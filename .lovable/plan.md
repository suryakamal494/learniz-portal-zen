# UX consolidation for the Section Workspace

Goal: cut the teacher's path-to-answer to **1 click** for the core question — *"What's in my program and how much have I taught?"* — and remove duplicated entry points.

---

## What changes (at a glance)

### A. Merge Programs + Progress into one page → **Curriculum**
Two pages today (`/programs` + `/progress`) collapse into one:
**`/teacher/batches/:batchId/curriculum`**

Top of the page = compact progress overview (the tiles from the tracker).
Below = the chapter list (today's Programs view), with **per-chapter % progress baked into the chapter row itself**.

Why: chapter list and chapter % are the same mental object. Splitting them forced the teacher to ping-pong between two pages.

The old `/programs` and `/progress` routes redirect to `/curriculum` so nothing breaks.

### B. Redesign the subject switch so it reads as a subject selector
Current pills look anonymous (your screenshot). Replace with a labelled **"Subject:" segmented switch** sitting on a tinted strip, with each subject showing its own progress %:

```text
Subject:  [ ● Physics  35%  ] [   Chemistry  52%   ]
```

- Prefix label "Subject:" so its purpose is unmistakable.
- Active subject gets the blue fill + dot.
- Inactive subjects still show their %, so the teacher decides which to open before clicking.
- Hidden entirely when only one subject (no change in that case).

### C. Prune Quick Actions to what's actually unique
Drop tiles that duplicate the workspace tabs / Curriculum:
- ✂ Remove: **Programs** (now front-and-centre, see D), **Mark Attendance** (already a tab), **Assign Lesson Plan / Study Notes** (subsumed by the Curriculum view's per-chapter actions later — also reachable from LMS module).
- Keep: **Assign Assessment**, **Schedule Class**. These are real one-off actions the teacher does ad hoc.

Result: 6 tiles → 2 tiles, in a compact row.

### D. Restructure the workspace itself
New top-down order:

```text
1. Breadcrumb
2. Section Identity card                ← unchanged
3. Curriculum summary card              ← rebranded from "Programs & Progress"
   • subjects with progress bars
   • "What it means"
   • single primary button → Open Curriculum
4. Tabs: Students · Reports · Attendance     ← Content tab removed
5. Quick actions (2 tiles, smaller)     ← moved below the fold
```

Removed/changed:
- **Content tab** dropped — its counts duplicate what the Curriculum summary already shows, and assignment flows live in the LMS module.
- Quick Actions moved *below* the tabs so the first screen is data + Curriculum, not buttons.

### E. Reduce clicks to view a lesson plan
Current: Workspace → Programs → expand chapter → Preview modal → View content → MediaViewer (**4 clicks**).
After: Workspace → **Open Curriculum** → expand chapter → Preview modal (**2 clicks** to see what's inside; modal still opens MediaViewer for the actual file).

The Curriculum summary on the workspace also lets the teacher see "Physics 35% · Chemistry 52%" without going anywhere.

---

## Page-level layout for the new Curriculum view

```text
┌─ Breadcrumb: My Sections / Physics Adv A / Curriculum ────┐

┌─ Header card ─────────────────────────────────────────────┐
│ Curriculum · Physics Advanced Section A                   │
│ 2 subjects · 5 chapters · 35% overall                     │
└───────────────────────────────────────────────────────────┘

┌─ Progress overview (4 small tiles) ───────────────────────┐
│ Overall 35% │ Hours 9h 30m / 22h │ Lessons 4/12 │ ...     │
└───────────────────────────────────────────────────────────┘

┌─ Subject switch (only when 2+) ───────────────────────────┐
│ Subject:  [ ● Physics 35% ] [   Chemistry 52% ]           │
└───────────────────────────────────────────────────────────┘

What it shows / What it means strip (one line)

┌─ Chapter accordion (each row shows % + lesson counts) ────┐
│ ▸ Ch 1 · Electrostatics      ●●●○○ 60%  · 3 of 5 done    │
│   [ expanded ]                                            │
│     Lesson Plan card  [ Preview ]                         │
│     Lesson Plan card  [ Preview ]                         │
│ ▸ Ch 2 · Current Electricity  ●○○○○ 20%  · 1 of 3 done   │
└───────────────────────────────────────────────────────────┘
```

The "filter by status" pills (All / In progress / Not started / Done) move here, above the chapter list — useful once both data sets live together.

---

## Files to change

**New:**
- `src/pages/teacher/batches/BatchCurriculumPage.tsx` — merged Programs + Progress UI.
- `src/components/teacher/programs/SubjectSwitch.tsx` — the labelled segmented switch shown in your screenshot.

**Edited:**
- `src/App.tsx` — add `batches/:batchId/curriculum` route; redirect old `programs` and `progress` routes to it.
- `src/components/teacher/batches/SectionProgramsSummary.tsx` — rename headline to "Curriculum", merge the two CTAs into one **Open Curriculum** primary button.
- `src/components/teacher/batches/SectionQuickActions.tsx` — drop Programs, Assign Lesson Plan, Assign Study Notes, Mark Attendance tiles. Keep Assign Assessment + Schedule Class. Tighten grid to `grid-cols-2 sm:grid-cols-2`.
- `src/components/teacher/batches/SectionTabs.tsx` — remove the Content tab and its `TabsTrigger` + `TabsContent`.
- `src/pages/teacher/batches/SectionWorkspacePage.tsx` — reorder: Identity → Curriculum summary → Tabs → Quick actions (small).
- `src/components/teacher/programs/ProgramChapterAccordion.tsx` — accept and render per-chapter `% · X of Y done` directly in the header (uses existing util).

**Deleted:**
- `src/pages/teacher/batches/BatchProgramsPage.tsx`
- `src/pages/teacher/batches/BatchProgressTrackerPage.tsx`

(Their logic merges into `BatchCurriculumPage.tsx` — no functionality lost.)

---

## What we explicitly are *not* changing
- The Preview modal + MediaViewer chain stays as-is (already as short as it gets).
- No data-model changes — `mockPrograms` and `programProgress` utilities are reused.
- Pastel theme, Blue/Indigo primary buttons, 70/40 thresholds, `Xh Ym` time format — all unchanged.
- One-subject batches still skip the subject switch entirely.

---

## After this, the teacher's flow looks like

Open section →
- See identity + **2 subjects @ 35% / 52%** + "what it means" instantly (no click).
- Click **Open Curriculum** → entire program tree + progress + chapter % + lesson plan previews on one page.
- Quick Actions stay out of the way until needed.

That's **1 click** to the full picture, vs **3+** today, with no duplicate entry points.
