## Root cause

Both bugs trace back to flexbox shrinking rules, not to anything in the timetable code itself.

### 1. Step 1 "Default faculty per subject" — Mathematics dropdown overflows the card (image 1)

```
<div className="flex items-center gap-3">
  <span dot />
  <div className="flex-1 text-sm">{s.name}</div>   ← grows with text
  <FacultyCombobox … />                            ← fixed width trigger
</div>
```

`flex-1` on the label has no `min-w-0`, so long subject names (`Mathematics`, `Social Studies`) push the row wider than the card. The combobox trigger then sticks out the right side. This is purely a row-layout bug.

### 2. Steps 2 & 3 — timetable scrolls the **whole page** horizontally and slides under the sticky top bar (images 2 & 3)

The grid is correctly wrapped in `overflow-x-auto` with a `min-w-[760px]` / `min-w-[900px]` table. That *should* produce an inner scroll. It doesn't, because every flex ancestor up the chain defaults to `min-width: auto`:

```
SidebarProvider (flex row)
  └─ SidebarInset (flex col)            ← min-width: auto
       └─ <Outlet>
            └─ ProgramSchedulePage
                 └─ max-w-7xl … p-6      ← min-width: auto
                      └─ Card
                           └─ overflow-x-auto
                                └─ table min-w-[900px]   ← pushes everyone wider
```

Because the inner table sets a min content width, and no ancestor declares `min-w-0`, the **page** grows wider than the viewport. Result:
- Body gets a horizontal scrollbar (visible at bottom of images 2 & 3).
- The sticky top header is positioned relative to the viewport, but the page slides under it on horizontal scroll → "timetable goes behind the nav bar".
- The sidebar appears to "move with" the timetable for the same reason.

This is the canonical Tailwind/flex pitfall — fix is to add `min-w-0` (and `w-full`) at the flex chain so the inner `overflow-x-auto` is the one that scrolls.

### 3. Desktop should fit without horizontal scroll at all

Once the flex chain shrinks correctly, the actual numbers are fine on a ≥1280px desktop:

| Region | Width |
|---|---|
| Sidebar (expanded) | ~256px |
| Page padding (`p-6` × 2) | 48px |
| Available for table | ~976px @ 1280 viewport |
| Table `min-w-[900px]` (preview) / `760px` (builder) | fits |

So no architectural change is needed — just lower the `min-w` floors slightly and let the inner scroll handle smaller laptops/tablets.

## Fixes (frontend / presentation only)

### `src/components/institute/InstituteLayout.tsx`
- Wrap `<Outlet />` in `<div className="min-w-0 w-full">` (currently `flex-1`) so the route content can shrink under the sidebar.
- Keep header `sticky top-0 z-40 bg-background` (already there); add `border-b shadow-sm` so when content does scroll vertically it doesn't visually bleed.

### `src/pages/institute/programs/ProgramSchedulePage.tsx`
- Outer page wrapper: `max-w-7xl mx-auto p-6 space-y-5 min-w-0 w-full` (add `min-w-0 w-full`).
- The two grid wrappers that hold the timetable (`grid grid-cols-1 lg:grid-cols-2`) get `min-w-0` and their children get `min-w-0`.

### `src/components/institute/programs/WeeklyTimetableBuilder.tsx` (Step 2 table)
- Card wrapping table: `<CardContent className="p-0 overflow-x-auto min-w-0">`.
- Table: drop `min-w-[760px]` → `min-w-[680px]` so 6 day columns of `min-w-[100px]` fit a 13" laptop without scroll, but still scroll on tablet.
- Each day `<th>` and `<td>` `min-w-[100px]` (down from 120) to free width.
- Wrap the whole builder card stack in `<div className="min-w-0 w-full">`.

### `src/pages/institute/programs/ProgramSchedulePage.tsx` (Step 3 preview table)
- Same fix: `<CardContent className="p-0 overflow-x-auto min-w-0">`, table `min-w-[820px]` (down from 900), day cells `min-w-[120px]` (down from 140).
- Make the W-chip strip wrapper `min-w-0` so it scrolls *inside* the card, not the whole page.

### `src/pages/institute/programs/ProgramSchedulePage.tsx` Step 1 faculty card
Replace the row markup:

```tsx
<div className="flex items-center gap-3 min-w-0">
  <span className="h-2 w-2 rounded-full shrink-0" />
  <div className="text-sm text-slate-700 w-28 shrink-0 truncate">{s.name}</div>
  <div className="flex-1 min-w-0">
    <FacultyCombobox … />   {/* trigger gets w-full */}
  </div>
</div>
```

Inside `FacultyCombobox` (subject combobox), give the `PopoverTrigger` button `w-full` so it fills the `flex-1 min-w-0` slot instead of bursting out.

## Out of scope

- No business logic, mock data, calendar generation, or step-flow changes.
- No restructuring of the sidebar component.
- No new components.

## Verification

After implementing, scrolling the schedule page on a 1280×800 desktop should NOT produce a horizontal page scrollbar, the timetable should fully fit in the visible region, and the sticky header should sit cleanly above the content. On tablet (1024px), the inner table scrolls horizontally inside its card while the page itself stays put.
