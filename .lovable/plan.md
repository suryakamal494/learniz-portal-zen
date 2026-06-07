# Simplify Section Cards & Headers — Remove Ambiguous Numbers

You're right — `25/30`, `66%`, `36%` shown without context don't tell the teacher anything actionable. Stripping them keeps the surface clean. Going forward, any number we *do* keep should answer "what does this mean?" on hover (noted as a principle, not part of this change).

## Scope

### 1. "My Sections" cards — `SectionCard.tsx`
Keep: class/subject chip, section name, **Open section** button.
Remove:
- Students `25/30` tile
- Attendance `66%` tile
- `4 Lessons · 2 Notes · 3 Assess.` chip row

Result: a clean card with just the identity + CTA.

### 2. "Programs & Progress" panel — `SectionProgramsSummary.tsx`
Keep: header icon + title, subject rows with "3 chapters · 8 lesson plans".
Remove:
- The `35% overall completion` text in the subheader (keep `2 subjects`)
- The per-subject percentage badge (`36%`, `33%`)
- The progress bar under each subject

Result: a clean subject inventory, no orphan percentages.

### 3. Section identity header — `SectionIdentityCard.tsx`
Keep: avatar, section name, `Class 12 · Science Stream`, students count.
Remove:
- `· ID #001`
- The split `25/30` and `83% filled` — replace with a single tile: **"25 students"**
- Attendance tile (`66% Moderate`)
- Assessments tile (`3 Assigned`)

Result: one tile, one number — total students.

## Files Touched
- `src/components/teacher/batches/SectionCard.tsx`
- `src/components/teacher/batches/SectionIdentityCard.tsx`
- `src/components/teacher/batches/SectionProgramsSummary.tsx`

Pure UI cleanup — no data model, routing, or business logic changes.

## Out of scope (noted for later)
- "Data WITH Understanding" hover tooltips on retained numbers — apply when we add the next batch of metrics, not now.
