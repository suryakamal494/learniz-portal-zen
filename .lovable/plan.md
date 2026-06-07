# Fix My Sections cards: real section identity + no overflow

## Problems being fixed
1. Cards talk about subjects (Physics/Chemistry/Maths) and show subject icons. A section is a classroom, not a subject. A section should be identified by **Class + Section name** (e.g. *Class 12 · Section A*, *Class 11 · Kalpana Chawla*).
2. Mock names ("Physics Advanced Section A", "Mathematics Foundation") read like subjects, not sections.
3. The action row overflows at the current card width — "Programs" text gets clipped, "Open section" pushes past the card edge.

## Changes

### 1. Mock data — rename batches to real classroom sections
`src/data/mockBatches.ts` — rename `name` fields (keep ids/class/everything else):

| id | class    | name (new)                  |
|----|----------|-----------------------------|
| 1  | Class 12 | Section A                   |
| 2  | Class 11 | Kalpana Chawla              |
| 3  | Class 12 | Bhagat Singh                |
| 4  | Class 11 | Yamuna                      |
| 5  | Class 12 | Sarabhai                    |

These are the kinds of section names schools actually use (alphabet sections, freedom-fighter/scientist names, river names).

### 2. Remove subject-derived UI from `SectionCard.tsx`
- Drop `deriveSubject` and `subjectIcon` entirely.
- Header gradient + avatar tint stay, but the palette is now seeded by `batch.id` only (no subject meaning attached). Decorative motif in the header switches from subject icons to a neutral abstract mark (`Users` icon for "a classroom of people", still low-opacity).
- Caption above the title becomes just **CLASS 12** (uppercase tracked) — no "· PHYSICS".
- Title shows the section name as-is (e.g. "Section A", "Kalpana Chawla").
- Avatar initials are derived from the section name (e.g. "SA", "KC", "BS", "YA", "SR").

### 3. Fix the action-row overflow
Current row puts two full-width buttons side by side with text + icon, which clips on ~250px cards.

Plan:
- Reduce horizontal padding inside the card body from `px-5` to `px-4` to give more usable width.
- "Programs" becomes a compact icon-led pill: `h-9 px-3`, smaller text (`text-[13px]`), `whitespace-nowrap`, `shrink-0`.
- "Open section" stays primary but uses `h-9 px-3.5 text-[13px]`, `whitespace-nowrap`, `shrink-0`, and the arrow icon is `h-3.5 w-3.5`.
- Wrap the row in `flex items-center justify-between gap-2 flex-wrap` so on the narrowest breakpoints the buttons can stack instead of clip.
- Both buttons get `min-w-0` safety and `inline-flex items-center gap-1.5`.

### 4. Tooltip / a11y
- Add `title="Programs"` and `title="Open section"` so the intent stays clear even if text is ever truncated.

## Out of scope
- No data model changes (still `Batch.name` and `Batch.class`).
- No routing changes; Programs button stays a placeholder handler.
- No changes to downstream section pages — they already read `batch.name` and will simply show the new section names.

## Files touched
- `src/data/mockBatches.ts` — rename `name` fields only.
- `src/components/teacher/batches/SectionCard.tsx` — remove subject logic, swap motif icon, tighten button row.
