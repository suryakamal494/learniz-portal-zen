## Summary

Restructure the Schedule tab on each chapter: topics become expandable rows, each topic shows its linked lesson plans inside, "Mark done" is replaced by a topic-status control, and "Start Online Class" only renders when the topic actually has a meeting link. The chapter-level "Lesson Plans" section is removed from the Schedule tab; its "Add from library" / "Create lesson plan" actions move up to the Schedule tab header.

---

## Changes in detail

### 1. Drop the chapter-level Lesson Plans block on the Schedule tab
- Remove the standalone `Lesson Plans` list (currently rendered below the Topics list) from `ProgramChapterAccordion.tsx`.
- Move the two action buttons — **Add from library** and **+ Create lesson plan** — to the top of the Schedule tab content, right-aligned on the row that currently shows the "Topics" header.
  - On click these still call the existing `onAddFromLibrary(chapter.id)` / `onCreateLessonPlan(chapter.id)` handlers; the lesson plan they create / pick is attached to the chapter (no topic auto-link yet — same as today).

### 2. Topic rows become expandable, with their lesson plans nested inside
- Each topic `<li>` becomes an accordion: clicking the row (or a chevron on the left) toggles an inner panel.
- Inner panel content:
  - List of lesson plans for that topic, resolved via the existing `topic.lessonPlanIds → chapter.lessonPlans` lookup (the `lpToTopics` map already in the file, inverted).
  - Each lesson plan is rendered with the existing `LessonPlanCard` so Preview / Edit / Add material keep working unchanged.
  - Empty state: small muted line `No lesson plans linked to this topic yet.` plus a tiny `Link lesson plan` link that opens the existing Add-from-library modal pre-scoped to the chapter (re-uses `onAddFromLibrary`).
- Lesson plans not linked to any topic stay visible in a collapsed `Unlinked lesson plans (n)` group below the topic list, so nothing disappears from the UI.

### 3. Replace "Mark done" with "Mark status"
Per-topic controls become:
- **Mark status** button → opens a small popover (Radix `Popover`, already imported) with three options matching `TopicStatus`:
  - Not started
  - In progress
  - Done
  - Selecting one calls the existing `onTopicStatusChange(topicId, status)` — no schema change.
- The status icon on the left of the topic row stays (visual indicator).
- Rationale for the user's confusion about multi-period topics: the **Mark status** here represents the topic's **overall teaching status across all its scheduled periods**, not per-period. Per-period completion still lives in the Academic Schedule page where each period instance is logged independently. We will add a one-line helper under the popover: _"Reflects overall progress across all scheduled periods for this topic."_ so the distinction is explicit.

### 4. Conditional "Start Online Class"
- Add an optional `meetingLink?: string` field on `ProgramTopic` (in `src/types/program.ts`).
- Update mock data in `src/data/mockPrograms.ts` so for the sample chapter (e.g. Magnetic Effects of Current) only 2 of the 4 topics get a `meetingLink`; the rest stay undefined.
- In the topic row, render **Start Online Class** / **Resume Online Class** only when `t.meetingLink` is truthy. When it's missing, show nothing in that slot (no greyed-out button, no placeholder), so the row stays clean.
- Clicking the button opens `t.meetingLink` in a new tab in addition to flipping status to `in-progress`.

### 5. Files to edit

- `src/types/program.ts` — add `meetingLink?: string` to `ProgramTopic`.
- `src/data/mockPrograms.ts` — sprinkle `meetingLink` onto ~2 topics per active chapter.
- `src/components/teacher/programs/ProgramChapterAccordion.tsx`
  - Add a per-topic open/closed state map (`useState<Record<string, boolean>>`).
  - Build `topicToLessonPlans` map from `lpToTopics`.
  - Render expandable topic rows with nested `LessonPlanCard` list.
  - Replace `Mark done` / `Reopen` buttons with a `Mark status` popover.
  - Gate `Start Online Class` on `t.meetingLink`.
  - Move `Add from library` / `Create lesson plan` to the Schedule-tab topics header; delete the lower Lesson Plans block.
- No changes to Study Notes tab, Tests tab, or chapter header.

### Out of scope
- Per-period mark-status logging (lives in Academic Schedule, untouched).
- Auto-linking newly created lesson plans to a specific topic (still chapter-scoped for now).
- Backend / API wiring.
