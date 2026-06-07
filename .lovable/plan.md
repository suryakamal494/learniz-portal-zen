# Redesign: My Sections page (`/teacher/batches`)

## Goal
Move past the plain "playing-card" look. Use only the data we currently keep on the card (class, subject, section name) but compose it into a visually richer, branded card with a clear primary action and a new secondary **Programs** button.

## What changes

### 1. Section cards (`SectionCard.tsx`) — full visual redesign
New composition per card (no new data):

```text
┌───────────────────────────────────────────────┐
│  ░░ soft subject-tinted gradient header ░░    │
│  ┌────┐                            ╲ motif   │
│  │ PA │  Class 12 · Physics                  │
│  └────┘                                       │
│                                               │
│  Physics Advanced Section A                   │
│  ─────────────────────────                    │
│                                               │
│  [ ▦ Programs ]        [ Open section → ]     │
└───────────────────────────────────────────────┘
```

Key elements:
- **Gradient header band** (~80px) using the subject palette (blue/purple/green/peach) instead of the current 4px stripe. Soft pastel → white fade.
- **Initials avatar** (e.g. "PA", "MF") in a rounded-2xl tile with palette colors, overlapping the gradient and card body (sits on the divider line).
- **Subject icon** watermark (Atom / Sigma / FlaskConical / Leaf / GraduationCap from lucide) lightly placed in the top-right corner of the gradient (low opacity, decorative).
- **Class · Subject chip** moves next to the avatar (smaller, no background — just text with palette color).
- **Section name** as the prominent title (kept).
- Thin hairline divider under the title.
- **Action row** at the bottom with two buttons:
  - **Programs** — secondary/outline button with `LayoutGrid` icon, on the left. Click handler is a no-op placeholder for now (user said they will define behavior later). It will be a real `<Button>` so it's clickable and not disabled.
  - **Open section** — primary blue button on the right (unchanged behavior, navigates to `/teacher/batches/:id`).
- Hover: card lifts (shadow-lg), gradient slightly intensifies, avatar tile scales 1.03. Use Tailwind transitions only.

Card shell:
- `rounded-2xl`, `border border-gray-200/70`, `shadow-sm hover:shadow-lg`, `transition-all duration-300`.
- Subject palette drives gradient + avatar + chip + icon tint; the rest stays neutral so the page reads as a cohesive set.

### 2. Listing page (`BatchListingPage.tsx`) — polish only
- Keep header, search row, and grid.
- Drop the unused `deriveCounts` helper (cards no longer use those numbers).
- Slightly more generous gap (`gap-5`) so the richer cards breathe.
- No change to routing, search logic, or data source.

### 3. Programs button wiring
- New optional prop on `SectionCard`: `onPrograms?: (batch: Batch) => void`.
- For now the listing page passes a handler that simply logs / does nothing; user will tell us where it should go.
- Button is always visible and enabled so the user can see and click it in preview.

## Out of scope
- No data model changes, no new metrics, no tooltips.
- No changes to `SectionIdentityCard`, `SectionProgramsSummary`, or any downstream section page.
- No new routes; the Programs button's destination will be defined in a follow-up.

## Files touched
- `src/components/teacher/batches/SectionCard.tsx` — redesign + Programs button.
- `src/pages/teacher/batches/BatchListingPage.tsx` — remove `deriveCounts`, pass `onPrograms`, minor spacing.
- (Optionally) `src/components/teacher/batches/sectionTheme.ts` — add a `gradient` field per palette for the new header band.
