# Chapter Accordion Tab Redesign

## Problem
The 3 tabs inside each expanded chapter need restructuring:
- Lesson plans and topics are in separate tabs — the teacher wants them combined.
- "Lesson Plans" tab should become "Study Notes".
- The "Start" topic action should be renamed "Start Online Class".

## Solution
Restructure the 3 tabs in `ProgramChapterAccordion`.

### Tab Changes

**1. Schedule tab (combined)**
- Top section: Topics list (existing design, unchanged).
- Bottom section: Lesson plans (moved from the old Lesson Plans tab).
- Rename topic action button: "Start" → "Start Online Class".
- Action buttons "Add from library" and "Create lesson plan" now appear below the lesson plans section inside this tab.
- Add a small "Lesson Plans" sub-header to visually separate topics from lesson plans.

**2. Study Notes tab (renamed from "Lesson Plans")**
- Tab label: "Study Notes" (icon stays as notebook).
- Renders the actual list of `ChapterStudyNote` for this chapter (title, fileName, description, sharedAt).
- "Add study notes" button moves here.
- Empty state: "No study notes shared for this chapter yet."

**3. Tests tab**
- No changes.

## Data Flow Updates
- `ProgramChapterAccordion` Props: replace `studyNoteCount?: number` with `studyNotes?: ChapterStudyNote[]`.
- `ChapterListSection` in `BatchProgramsPage.tsx`: pass `studyNotes={studyNotes?.[ch.id]}` instead of just a count.
- `BatchProgramsPage`: pass the full `studyNotes` record into `ChapterListSection`.

## Files to modify
- `src/components/teacher/programs/ProgramChapterAccordion.tsx` — tab restructuring, move lesson plans into Schedule, create Study Notes content.
- `src/pages/teacher/batches/BatchProgramsPage.tsx` — pass full study notes data through `ChapterListSection`.

## No changes to
- Tabs UI component (`tabs.tsx`) — styling already works.
- `ChapterTestsTab.tsx`, `LessonPlanCard.tsx` — imported unchanged.
- Backend or types — `ChapterStudyNote` already exists.
