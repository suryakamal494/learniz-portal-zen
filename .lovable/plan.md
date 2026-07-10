## Why the current placement is illogical

The top toolbar exposes two selectors — **Section** and **Academic Window** — and everything below is supposed to operate on that (section, window) pair. Today:

- **Weekly Timetable** tab → uses (section, window). ✅ Toolbar matches.
- **Academic Schedule** tab → uses (section, window). ✅ Toolbar matches.
- **Day view**, buried as a sub-toggle inside the Weekly Timetable tab → spans **all sections** of the institute for one weekday of one week. It only needs the **window** (plus a "focus" section, at most). ❌ The Section picker at the top silently changes meaning when you flip this sub-toggle.

So the flaw isn't cosmetic — the Week/Day toggle changes what the toolbar *means*, while pretending to be a minor view switch nested two levels deep. That's the mismatch.

## The logical rearrangement

Group modes by their data dependencies. Three peer tabs replace the current two-tab + nested-toggle structure:

```text
[ Weekly Timetable ]  [ Day Timetable ]  [ Academic Schedule ]
      (section+window)    (window only)       (section+window)
```

Rules that fall out of this grouping:

1. **Weekly Timetable** and **Academic Schedule** keep the current toolbar: Section + Window pickers, both required. (Per your answer, these stay as separate tabs, not merged.)
2. **Day Timetable** hides the Section picker (or demotes it to an optional "Focus section" highlight chip). Window picker stays. Compare-sections control also hides — it's Week-only.
3. Academic Schedule stays **week-scoped only**, per your answer. No day-mode schedule view.
4. All three tabs still write into the same underlying cell store, so edits sync exactly like today.

## Files to change

- `src/hooks/useScheduleWorkspace.ts`
  - `WorkspaceTab` becomes `'timetable' | 'day' | 'schedule'`.
  - URL param `tab` accepts the new value; drop the separate `ttView` local state.
- `src/pages/institute/ScheduleWorkspacePage.tsx`
  - Remove the Week/Day segmented toggle from inside the Timetable tab.
  - Add a third `TabsTrigger` for **Day Timetable** (own accent color, e.g. amber/orange, distinct from indigo Week and emerald Schedule).
  - When `tab === 'day'`: hide the Section `<Select>` and the Compare controls; keep Window. Optionally show a small "Focus: {section.name}" chip that can be cleared.
  - Route `TabsContent`:
    - `timetable` → existing `TimetableWorkspaceTab` (+ compare grid).
    - `day` → existing `DayScheduleTab` (no wrapping toggle bar).
    - `schedule` → existing `AcademicScheduleTab`.
- `src/components/institute/workspace/DayScheduleTab.tsx`
  - Accept an optional `focusSectionId` (already does) and treat Section as optional; no other logic change.
- Persisted state (`schedule-workspace-state:v1`) migrates naturally — old `tab` values `timetable|schedule` still valid; add `day`.

## Out of scope

- No changes to Timetable ↔ Schedule relationship (they stay separate tabs per your answer).
- No changes to draft/publish rules, autofill, drag-swap, or mock data.
- No new Day-mode schedule view.

## QA checklist

- Deep link `?tab=day&windowId=…` opens Day tab with Section picker hidden.
- Switching from Day → Week restores the Section picker with the previously selected section.
- Compare mode control is invisible in Day tab; re-enabling it in Week tab still works.
- Edits made in Day tab appear immediately when switching to Week tab for the same section+window.
- Academic Schedule tab is unchanged.
