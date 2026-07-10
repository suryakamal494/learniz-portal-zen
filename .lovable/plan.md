Add informative tooltips to the Weekly Timetable top strip and the Subject cards so users understand the three numbers shown (week filled, window target, window total).

### Files to edit
- `src/components/institute/sections/SectionTimetableStep.tsx`

### Changes
1. **Top strip tooltip**
   - Wrap the `{stats.filled} / {stats.capacity} cells filled this week` block in a tooltip.
   - Tooltip text: explain that the numerator is the number of period slots already assigned in the currently selected week, and the denominator is the total available period slots in that week (working days × periods per day).

2. **Subject card tooltips**
   - Wrap the `thisWeek / target` line with a tooltip explaining: numerator = periods placed in the selected week; denominator = total periods required for this track across the entire active academic window.
   - Wrap the progress bar with a tooltip explaining: it shows the window-total progress for this track (total periods placed in the whole window vs the window target).
   - Wrap the `Window total X / Y` line with a tooltip explaining: numerator = periods placed across the entire active window; denominator = target periods for this track in the window.

3. **Implementation detail**
   - Use the existing `@/components/ui/tooltip` components (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`).
   - Add a local `TooltipProvider` wrapper inside `SectionTimetableStep` (following the pattern used in `MetricChip.tsx`) so the tooltips work without assuming a global provider.

### Out of scope
- No changes to the data model, calculations, or auto-generation logic.
- No changes to other timetable features (drag/swap, copy week, dev notes, etc.).