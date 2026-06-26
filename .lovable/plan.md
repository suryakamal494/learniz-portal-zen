## Root cause

The last fix added `min-w-0 / overflow-x-hidden` on the page wrapper and the `<Outlet>` div — but the shadcn `<SidebarInset>` between them is a flex child with no `min-width: 0` and no overflow clip:

```
SidebarProvider (flex row)
  └─ SidebarInset (flex-1, min-width: auto ← grows with content)   ← MISSING CLAMP
       └─ header (sticky)
       └─ <div min-w-0 w-full> (Outlet wrapper)
            └─ ProgramSchedulePage (overflow-x-hidden)
```

Because `SidebarInset` itself can grow wider than the available track, the **page** (not the timetable card) gets the horizontal scrollbar. When the user scrolls right, the whole main column slides under the fixed sidebar — exactly what the screenshot shows.

Secondary contributors:
- The sticky header in `InstituteLayout` is inside `SidebarInset`, so when the inset grows, the header grows with it and visually "tucks under" the sidebar on horizontal scroll.
- The Step 3 month view sets `min-w-[720px]` on the inner calendar without an `overflow-x-auto` wrapper around it (line 1757), so on narrow widths it also contributes to overflow.

## Fix (presentation only)

### 1. `src/components/institute/InstituteLayout.tsx`
- Pass `className="min-w-0 overflow-x-hidden"` to `<SidebarInset>` so the main column can shrink under the sidebar and any inner overflow is clipped at the inset boundary instead of bubbling to the page.
- Keep the sticky header as-is; once the inset is clamped it will align cleanly to the right of the sidebar.

### 2. `src/pages/institute/programs/ProgramSchedulePage.tsx`
- Keep the existing `overflow-x-hidden` on the outer wrapper as a defense-in-depth.
- Step 3 month view (around line 1757): wrap the `grid grid-cols-7 … min-w-[720px]` in a `<div className="overflow-x-auto min-w-0">` so horizontal overflow stays inside the card, matching the week view.
- Confirm the W-chip strip already lives inside an `overflow-x-auto` container; if not, wrap it the same way.

### 3. `src/components/institute/programs/WeeklyTimetableBuilder.tsx`
- No structural change needed — the table already has `overflow-x-auto min-w-0`. Once `SidebarInset` is clamped, this card will be the only thing that scrolls horizontally on narrow viewports.

## Result

- On ≥1280px desktop: no horizontal scrollbar anywhere — the timetable fits in the main column.
- On <1024px (tablet): the page itself never scrolls horizontally; only the timetable grid (and month calendar) scroll inside their cards.
- The sidebar stays fixed; the sticky header stays aligned to the main column; content can no longer slide under the sidebar.

## Out of scope

Mock data, calendar generation logic, stepper flow, sidebar markup, or any non-presentation changes.
