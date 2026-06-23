
## Understanding

Today the green graph button on the Teacher Panel opens `/institute`, which is a single-purpose "Academic Insights" sidebar (Dashboard, Overview, Teachers, Subjects, Classes, Students, Grand Tests, Schedule Tracking, Learning Response).

You want `/institute` to become a real **Institute Panel** — a parent shell that hosts multiple top-level modules in its sidebar. The very first module is **Academic Insights** (everything that currently lives at `/institute/*` moves under it, unchanged). Then we add two more top-level modules now: **Timetable** and **Exam Module**, with more to come later.

Yes — requirement is clear.

## What changes

### 1. Re-brand the shell
- `InstituteSidebar` header label changes from "Academic Insights" → "Institute Panel" (icon stays `Building2`).
- Add a tiny module switcher / grouped nav (see structure below) so it's obvious this shell hosts multiple modules.

### 2. New sidebar information architecture
Sidebar becomes grouped by module instead of one flat list:

```text
Institute Panel
├── Academic Insights              (group label)
│   ├── Dashboard                  → /institute/insights/dashboard
│   ├── Overview                   → /institute/insights
│   ├── Teachers                   → /institute/insights/teachers
│   ├── Subjects                   → /institute/insights/subjects
│   ├── Classes                    → /institute/insights/classes
│   ├── Students                   → /institute/insights/students
│   ├── Grand Tests                → /institute/insights/grand-tests
│   ├── Schedule Tracking          → /institute/insights/schedule-tracking
│   └── Learning Response          → /institute/insights/learning-response
├── Timetable                      (group label)
│   └── Timetable                  → /institute/timetable
└── Exam Module                    (group label)
    └── Exams                      → /institute/exams
```

Each group uses shadcn `SidebarGroup` + `SidebarGroupLabel`. When the sidebar is collapsed, only icons show (existing behavior preserved).

### 3. Routing updates (`src/App.tsx`)
- Move every existing Academic Insights route under `/institute/insights/*` (Overview becomes the `index` of `/institute/insights`).
- Add `/institute` `index` redirect → `/institute/insights` so the green button still lands cleanly.
- Add two new routes:
  - `/institute/timetable` → new `InstituteTimetablePage`
  - `/institute/exams` → new `InstituteExamsPage`
- Keep the legacy `/institute/dashboard`, `/institute/teachers`, etc. as `<Navigate>` redirects to their `/institute/insights/...` counterparts so any existing links (e.g. the green button, deep links) keep working.

### 4. New scaffold pages (placeholders, mock-data ready, follow the institute design language)
- `src/pages/institute/timetable/InstituteTimetablePage.tsx`
  - Header "Institute Timetable" + subtitle
  - Filter row (Class / Section / Week)
  - Empty weekly grid placeholder with a "Coming soon" hint card so you can iterate next
- `src/pages/institute/exams/InstituteExamsPage.tsx`
  - Header "Exam Module" + subtitle
  - Tabs placeholder: Schedule · Question Papers · Results
  - Stat cards row (Upcoming, Ongoing, Completed) with mock numbers
  - Empty list placeholder

Both pages reuse existing tokens, `Card`, `Button`, pastel theme, "Data WITH Understanding" header pattern (title → subtitle → "what's next" hint), per project memory.

### 5. Entry button from Teacher Panel
The existing green graph button already points at `/institute`. We only need to make sure it lands on the new Institute Panel home, which the index redirect handles. **No teacher-sidebar changes** required for this step (the request is the destination, not the button itself).

## Files to touch

- `src/components/institute/InstituteSidebar.tsx` — relabel to "Institute Panel", regroup nav into Academic Insights / Timetable / Exam Module, update URLs to `/institute/insights/*`.
- `src/App.tsx` — re-nest insights routes under `/institute/insights`, add timetable + exams routes, add legacy redirects, set `/institute` index redirect.
- `src/pages/institute/timetable/InstituteTimetablePage.tsx` — new scaffold.
- `src/pages/institute/exams/InstituteExamsPage.tsx` — new scaffold.

## Out of scope (now)

- Real timetable editor logic, exam CRUD, or any backend wiring.
- Renaming/relocating the green button itself.
- Visual redesign of existing Academic Insights pages — they only move under `/institute/insights/*`, internals unchanged.
