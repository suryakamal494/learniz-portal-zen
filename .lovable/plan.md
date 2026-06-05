# Redesign: /teacher/batches → Sections Workspace (UI-only)

## Intent
Turn the current single dense page into a **two-level drill-down**. Level 1 is a clean gallery of the teacher's sections. Level 2 is a focused workspace for one section where every action that belongs to *that* section lives together.

**Important constraint:** This is a UI/navigation redesign only. All existing deep pages (Assign Lesson Plan, Assign Study Notes, Assessments, Schedule, Attendance, Reports, View Students) keep their current implementation and backend wiring. We only change *how* the teacher gets to them and how the entry surface is composed.

## Level 1 — My Sections (gallery)
Route: `/teacher/batches` (kept)

Replace the table with a polished card grid (reference image 2 as starting point).

Each card:
- Color accent strip (rotating pastel: blue / green / purple / peach)
- Class + Course chip (e.g. "Class 10 · SSC")
- Section name + ID
- Two compact metrics: `Students x/capacity`, `Attendance %` (Green ≥70 / Amber 40–69 / Red <40, no decimals)
- Tiny status row: Lesson plan · Study Notes · Assessments (with assigned counts)
- Primary CTA: **Open section** → Level 2

Page chrome: "My Sections" title + subtitle, search, count chip, "Create Section" button.
States: loading skeletons, empty, error.

## Level 2 — Section Workspace
Route: `/teacher/batches/:batchId` (new container page)

1. **Breadcrumb header** — `← My Sections / Star batch`
2. **Section identity card** — avatar tile, name, Class · Course · ID, plus 3 KPIs (Students, Attendance %, Assessments) with one-line "what it means" microcopy following the Data WITH Understanding pattern.
3. **Quick Actions row** (5 tiles, equal-width, touch-friendly, wraps 2-col on mobile):
   - Assign Lesson Plan
   - Assign Study Notes
   - Assign Assessment
   - Schedule Class
   - Mark Attendance

   Each tile **navigates to the existing page** with the current section pre-selected via route param / query string. The destination pages are not modified.

4. **Tabs** — Students | Reports | Attendance | Content
   - **Students** — embeds existing ViewStudents listing for this section
   - **Reports** — embeds existing BatchReports filtered to this section
   - **Attendance** — embeds existing attendance summary filtered to this section
   - **Content** — read-only view of Lesson Plans / Study Notes / Assessments currently assigned to this section, with links into the existing detail pages

   All panels lazy-load with loading/empty/error states. No business logic added — we read from the same mock/data sources already in use.

## Navigation wiring
- `BatchListingPage` card click → `/teacher/batches/${id}`
- New route added in `App.tsx`: `/teacher/batches/:batchId` → `SectionWorkspacePage`
- Existing routes (`add`, `:id/assign-lms`, notes, exams update-batches, schedule create/edit, attendance) remain unchanged. Quick-action tiles deep-link into them with the section preselected.

## Design system
- Pastel surfaces on `bg-gray-50`, white cards, blue/indigo primary buttons
- Terminology already aligned: Sections, Lesson Plan, Study Notes, Assessment
- Mobile-first: 1 → 2 → 3 column gallery; tabs horizontally scrollable on small screens
- Metric thresholds and no-decimals rule applied throughout

## Files

**New**
- `src/pages/teacher/batches/SectionWorkspacePage.tsx`
- `src/components/teacher/batches/SectionCard.tsx`
- `src/components/teacher/batches/SectionIdentityCard.tsx`
- `src/components/teacher/batches/SectionQuickActions.tsx`
- `src/components/teacher/batches/SectionTabs.tsx` (+ StudentsPanel, ReportsPanel, AttendancePanel, ContentPanel sub-components)

**Edited**
- `src/pages/teacher/batches/BatchListingPage.tsx` — replace table with card grid
- `src/App.tsx` — register `/teacher/batches/:batchId`

**Untouched (backend / functionality preserved)**
- AddBatchPage, AssignLMSPage, BatchNotesAssignmentPage, ViewStudentsPage
- UpdateBatchesPage (exams), CreateClassPage, EditSchedulePage, AttendancePage, BatchReportsPage
- All `src/data/*` mocks and `src/types/*`

## Out of scope (your "next step")
- Any change to the destination pages' logic or backend
- Further refinement of tab contents — awaiting your detailed requirements after this drill-down shell lands
