
## Requirements (recap)

**Reports tab — needs to answer two things for the whole section without forcing the teacher to dig:**
1. For each chapter (and each topic inside it), **how many assessments have been conducted** — visible across all 14 chapters in one comprehensive view.
2. For each individual assessment, **which students were absent** (only absent list — present list not needed).

Constraints you called out:
- Avoid "expand every chapter to see anything" — teacher must get a comprehensive overview at a glance.
- Expand/collapse is OK as a secondary affordance, not as the primary way to read the data.
- Don't add a noisy new top-level tab if avoidable.

**Attendance tab — currently just a CTA. Should show:**
- Mark attendance button at the top.
- The **last ~5 days** of attendance, each row showing date + quick absentee summary.
- Click a day → see the absent students for that day.
- "View all" → existing `/teacher/reports/attendance` page.

---

## Proposed UI/UX

### Reports tab → split into two sub-tabs: **Assessments** and **Performance**

Keep the existing summary card behavior under "Performance" (one-line average + link out). The new work lives under **Assessments**, which becomes the default.

#### Assessments sub-tab — "Chapter × Topic assessment matrix"

A single scannable table, not an accordion-first layout. One row per chapter, always visible.

```text
Chapter                              Tests   Attempts   Avg    Absentees   
─────────────────────────────────────────────────────────────────────────
▸ 1. Real Numbers                     4        128      72%       6        
▸ 2. Polynomials                      2         60      65%       9        
▸ 3. Pair of Linear Equations         0          —       —        —        
▸ 4. Quadratic Equations              5        150      58%      14        
... (all 14 chapters listed, no expansion needed to see the count)
```

- "Tests" column is the headline number the teacher cares about — visible for every chapter at once.
- "Absentees" is the total unique student-absences across that chapter's tests, clickable.
- Chevron (▸) expands the row inline to reveal a **topic breakdown** for that chapter only:

```text
▾ 4. Quadratic Equations              5        150      58%      14
    Topic                            Tests   Avg     Last conducted
    ─────────────────────────────────────────────────────────────
    4.1 Introduction                   2     61%     Mon 8 Jun
    4.2 Solution by factorisation      2     55%     Wed 3 Jun
    4.3 Nature of roots                1     60%     Thu 28 May
    └─ [View 5 assessments →]   ← opens the exam list drawer for this chapter
```

- Topic rows are read-only stats; the **"View N assessments"** link opens a right-side **drawer** listing every individual exam in that chapter (title, topic tag, date, attempted/absent count). No new page, no new tab.

#### Per-exam absentee view (the second requirement)

Inside the drawer, each exam row has an **"Absent (n)"** chip. Clicking it expands to show just the absent students (name, roll, last attendance %) with a "Notify" action. Present students are never listed — keeps it focused.

#### Why this layout works for 14 chapters

- The matrix shows **all chapters at once** — teacher sees test coverage gaps (the "0 tests" rows jump out) without expanding anything.
- Topic-level depth is one click away, not the default.
- Per-exam absentee detail lives in a drawer, so the teacher never loses the chapter overview behind them.
- No new top-level tab. Exams stay grouped under their chapter, which is how you described the mental model.

### Attendance tab — inline recent-days view

Replace the single summary card with:

```text
┌──────────────────────────────────────────────────────────────┐
│  [+ Mark attendance for today]              View all →       │
├──────────────────────────────────────────────────────────────┤
│  Mon 9 Jun   ●●●●●○○○○○   42 / 48 present   6 absent  ›     │
│  Sun 8 Jun   Holiday                                          │
│  Sat 7 Jun   ●●●●●●●○○○   45 / 48 present   3 absent  ›     │
│  Fri 6 Jun   ●●●●●○○○○○   40 / 48 present   8 absent  ›     │
│  Thu 5 Jun   ●●●●●●●●○○   46 / 48 present   2 absent  ›     │
└──────────────────────────────────────────────────────────────┘
```

- 5 rows, each with date, mini bar, present/absent count.
- Clicking a row expands an inline panel listing the absent students for that day.
- "View all" routes to `/teacher/reports/attendance`.
- "Mark attendance for today" routes to the existing mark-attendance flow.

### Tabs order

`Students | Reports | Attendance | Content` stays unchanged. Content tab is untouched as you asked.

---

## Technical implementation plan

### Files to add

1. `src/components/teacher/batches/reports/ChapterAssessmentMatrix.tsx`
   - Renders the always-visible chapter table. Internal `expandedChapterId` state for inline topic rows.
   - Props: `chapters` (derived from program data) and `onOpenChapterExams(chapterId)`.

2. `src/components/teacher/batches/reports/ChapterExamsDrawer.tsx`
   - Right-side `Sheet` (shadcn) listing exams for a chapter.
   - Each exam row expands to show only absent students.
   - Props: `chapterId`, `open`, `onOpenChange`.

3. `src/components/teacher/batches/attendance/RecentAttendanceList.tsx`
   - Renders last 5 days, inline expand for absentees, two CTAs at top.

4. `src/data/mockSectionAssessments.ts`
   - Deterministic mock derived from the chapter list for batch `n`: per-chapter test count, per-topic test count, exam list with `{id, title, topicId, date, totalStudents, absentStudentIds}`. Seeded by `batchId` so numbers are stable.

5. `src/data/mockSectionAttendance.ts`
   - Last 5 days of attendance per batch with absent student IDs. Seeded deterministically.

### Files to modify

1. `src/components/teacher/batches/SectionTabs.tsx`
   - **Reports tab**: replace the single `SummaryPanel` with a nested `Tabs` (`Assessments` default, `Performance` keeps the existing card). Render `ChapterAssessmentMatrix` + mount `ChapterExamsDrawer`.
   - **Attendance tab**: replace `SummaryPanel` with `RecentAttendanceList`.
   - Accept `batchId` (already available via `batch.id`) and pass through.

2. `src/pages/teacher/batches/SectionWorkspacePage.tsx`
   - No structural changes; existing `<SectionTabs />` mount stays.

### Data shape

```ts
// mockSectionAssessments
interface SectionExam {
  id: string
  title: string
  chapterId: string
  topicId: string
  date: string            // ISO
  totalStudents: number
  absentStudentIds: string[]   // resolved via mockBatchStudents
  avgScore: number             // 0-100
}
interface ChapterAssessmentRollup {
  chapterId: string
  chapterName: string
  testCount: number
  attempts: number
  avgScore: number | null
  absenteeTotal: number
  topics: { topicId: string; topicName: string; testCount: number; avgScore: number | null; lastDate: string | null }[]
}
```

Chapter list is read from the same source `BatchProgramsPage` uses (program/chapter mock). Rollups are computed once per render from the seeded exam list.

### Routing / navigation

- Drawer is in-page — no new routes.
- "View all" in Attendance → existing `/teacher/reports/attendance`.
- "Open detailed reports" CTA on Performance sub-tab stays → `/teacher/reports/batch-reports`.

### State scope

All new state (`expandedChapterId`, `openDrawerChapterId`, `expandedAttendanceDate`, `expandedExamId`) is local to the respective components. No global store, no API contract changes — pure presentation layer per project rules.

### Empty / loading / zero states

- Chapter with 0 tests → row shows `—` and a subtle "No assessments yet" hint on expand with a "Create assessment" link to existing assessments flow.
- Day with 0 absentees → row shows green "All present", no expand affordance.
- Holiday/no-class days → labeled "Holiday", not expandable.

### Out of scope (explicitly)

- Content tab (untouched).
- Students tab (untouched).
- No backend / Supabase changes — mock data only, matching how the rest of this page works today.
