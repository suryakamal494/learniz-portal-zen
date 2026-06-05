# Plan: Rename "Batches" → "Sections" Platform-Wide

## Scope
Replace all user-facing occurrences of the word "Batch / Batches / batch / batches" with "Section / Sections / section / sections" across the entire platform (teacher, institute, and any shared pages).

This is a **UI/terminology-only** change. No data models, route paths, file names, variable names, type names, prop names, mock data keys, or component names will be renamed — only the visible text strings shown to users.

## What Will Change

### 1. Visible Text Strings
All hardcoded user-facing strings in JSX/TSX:
- "Batch" → "Section"
- "Batches" → "Sections"
- "batch" → "section" (mid-sentence)
- "batches" → "sections" (mid-sentence)
- "Batch-wise" → "Section-wise"
- "batch-wise" → "section-wise"
- "Add Batch" → "Add Section"
- "Create Batch" → "Create Section"
- "View Batch" → "View Section"
- "Select Batches" / "All Batches" / "Specific Batches" → Sections equivalents
- "Batch Reports" → "Section Reports"
- "Batch Assignment" → "Section Assignment"
- "Batch Name" → "Section Name"
- Toast/notification messages mentioning batch
- Tooltips, placeholders, empty-state messages, summary banners

### 2. Areas Affected (high-level)
- **Teacher → Sections (formerly Batches)** module
  - `BatchListingPage`, `AddBatchPage`, `ViewStudentsPage`, `AssignLMSPage`, `BatchNotesAssignmentPage`
- **Teacher Sidebar / Navigation** — menu label "Batches" → "Sections"
- **Teacher Dashboard** — "Batch Reports" card, upcoming-class "batch" labels, stats
- **Teacher Reports** — `BatchReportsPage`, batch report cards, headers
- **Teacher Exams** — `UpdateBatchesPage` (page title, summary text, button labels), exam → batch assignment screens
- **Teacher Schedule** — any "batch" column / filter labels
- **Institute → Schedule Tracking** — `BatchProgressTable` ("Batch-wise Progress", "X batches"), `BatchWiseTracking`
- **Institute → Class Overview / Student Reports / Teacher Performance / Section Students** — any "batch" mentions (e.g., "Batch 11-A", "Batch Accuracy", batch tiles)
- **Institute Dashboard** — alerts, stats, recent grand tests referencing batches
- **Login page / Brochure / any marketing copy** — if "batch" appears
- **Toast messages, modal titles, button labels, table headers, badges** throughout

### 3. What Will NOT Change
- File names (e.g., `BatchListingPage.tsx`, `mockBatches.ts`) — kept to avoid breaking imports and routing
- Route paths (e.g., `/teacher/batches`) — kept to avoid breaking bookmarks/links
- TypeScript types & interfaces (`Batch`, `BatchFormData`, `BatchProgress`, `BatchStudent`, etc.)
- Variable names, prop names, state names, function names
- Mock data field keys (`batchId`, `batchName`, `currentStudents`, etc.)
- CSS class names, test IDs
- Database/backend identifiers (none exist yet, but principle stands)

> Rationale: Renaming internal identifiers is a large, risky refactor with no user-visible benefit. The terminology change is fully achieved by updating display strings only. If you want route paths renamed too (e.g., `/teacher/sections`), I can do that as a follow-up.

## Approach

1. **Sweep the codebase** with case-sensitive search for the four forms: `Batches`, `Batch`, `batches`, `batch`.
2. **Filter to user-facing strings only** — JSX text nodes, string literals passed to `title`, `label`, `placeholder`, `description`, toast `title`/`description`, `<CardTitle>`, `<Badge>` children, table headers, button text, alt text, aria-labels.
3. **Skip code identifiers** — anything inside variable names, type references, import paths, object keys, file paths, route paths, CSS classes, comments (unless the comment is misleading after rename).
4. **Handle compound phrases** carefully:
   - "Batch-wise" → "Section-wise"
   - "batch(es)" → "section(s)"
   - Pluralization preserved (Batches → Sections, batch → section)
5. **Special-case checks**:
   - "Grand Test Batch" or domain-specific compounds — confirm they read naturally as "Section"
   - Singular "a batch" / plural "batches" grammar stays correct
6. **Verify** by re-running the search after edits to confirm only intentional remaining instances (identifiers, file names, types).

## Deliverable
A single sweep updating all user-visible text. No functional behavior changes. Build and routes continue working unchanged.

## Confirmation Needed
Please confirm two things before I proceed:

1. **Internal identifiers stay as-is** (recommended) — types, props, file names, route paths keep the word "batch". Only displayed text changes. ✅ proceed
2. **Or full rename** — also rename routes (`/teacher/batches` → `/teacher/sections`), file names, types, and variables. This is much larger and riskier.

If you don't specify, I'll proceed with option **1 (UI text only)**.
