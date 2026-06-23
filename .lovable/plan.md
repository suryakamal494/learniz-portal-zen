## Schedule Setup — Holidays, Class URL & Stepper rename

All edits in `src/pages/institute/programs/ProgramSchedulePage.tsx`.

### 1. Holidays & non-teaching days — UX overhaul
Replace the single-date + required-name row with a multi-select calendar flow.

- Swap the native `<input type="date">` for a shadcn `Calendar` (popover trigger showing "Pick dates") with `mode="multiple"` so the user can click several dates in one go.
- Holiday name input becomes **optional** (remove required styling/placeholder hint, keep placeholder as `Description (optional)`).
- **Add** button behavior:
  - If 0 dates selected → disabled.
  - If 1+ dates selected → create one holiday entry per date, using the description if provided, else label as `Holiday` (fallback).
  - Clear both selected dates and description after adding.
- Holiday list rows: add an inline **edit (pencil)** action that lets the user update the description later (in-place input with save/cancel). Delete action stays.
- Sort displayed holidays by date ascending.

### 2. Remove "Class URL template"
- Delete the entire `Class URL template` Label + Input block around line 363 in `SetupStep` (and the corresponding state/handler if only used here).
- Also remove the per-slot `Class URL` field in the Calendar slot editor around line 1144 (paired with the template, no longer meaningful). Keep the rest of the slot editor intact.

### 3. Stepper rename: Calendar → Preview
- In the steps array (~line 126), rename `{ id: 'calendar', label: 'Calendar', icon: Sparkles }` to `label: 'Preview'`. Keep `id` as `calendar` to avoid breaking routing/state.
- Update any user-visible copy that says "Open the Calendar tab" / "Back to Calendar" / heading inside `CalendarStep` to say "Preview" instead. Internal variable names stay as-is.

### Out of scope
No data-model changes beyond making `name` optional on the holiday entry type (string → string | undefined). No backend work.