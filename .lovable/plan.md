
# Academic Schedule tab — dated grid + collapsible progress + auto chapter assignment

## What you'll see (final UX)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Academic Schedule                                                       │
│  Class 12 PCM · Term 1 · Foundation (14 Apr → 30 Aug 2025) · 120 days    │
│  Last generated: 09 Jul 14:22 · 100% filled (240/240)  [ Regenerate ▾ ]  │
├──────────────────────────────────────────────────────────────────────────┤
│  [ T1 ✅ 100% ]  →  [ T2 🔒 locked ]  →  [ T3 🔒 locked ]                │
├──────────────────────────────────────────────────────────────────────────┤
│  ⚠ Timetable updated after last generation · 3 changes  [ Re-gen T1 ]    │
├──────────────────────────────────────────────────────────────────────────┤
│  ▸ Progress panel (collapsed)  · Physics 64% · Chem 71% · Maths 58% …    │
├──────────────────────────────────────────────────────────────────────────┤
│  W1 W2 W3 W4 W5 [W7] W8 … W24                                            │
│  Week 7 · Mon 19 May → Sat 24 May 2025                                   │
│                                                                          │
│  PERIOD │  MON 19    TUE 20    WED 21    THU 22    FRI 23    SAT 24     │
│  P1     │  ┌──────┐  ┌──────┐  …                                         │
│  08:30  │  │CBSE  │  │CBSE  │                                            │
│         │  │PHYS  │  │CHEM  │                                            │
│         │  │Magnet│  │Redox │  ← chapter (auto)                          │
│         │  │Para/ │  │Electr│  ← topic    (auto)                         │
│         │  │A.Rao │  │P.Shar│                                            │
│  P2 …                                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

The **dated grid is the main view** (exactly the chip design from screenshot 2, dated across the real term). The **progress panel is a collapsible drawer** above it — closed by default, expands in place, doesn't cover the grid.

**Locked terms** (T2, T3 before T1 is done) show a centered lock card instead of the grid: "Term 2 opens once Term 1 is 100% scheduled. Currently 87% (208/240)."

---

## Phased build

### Phase 1 — Data model & auto-generator (foundation)

Extend cells to carry chapter/topic; add a deterministic generator.

- Add to `TimetableCell`: `chapterId?`, `chapterName?`, `topicName?`, `generatedAt?`, `manuallyEdited?`.
- New `src/utils/scheduleGenerator.ts`:
  - Input: section, window, term, sub-programs, tracks, weekly-timetable cells (from Step 3).
  - Walks each `(subject, track)` chapter list in order; distributes topics across all dated slots for that track within the term, respecting `plannedHours`.
  - Preserves any cell where `manuallyEdited=true` (teacher overrides survive regen).
  - Marks `generatedAt` on every touched cell + writes a `ScheduleGenerationLog` entry (term, timestamp, cells touched, cells preserved).
- Update `useSection.ts` with `generateSchedule(termId)` and `regenerateSchedule(termId)`.
- Selector `getTermCompletion(section, window, termId)` → `{ filled, total, pct }`.

### Phase 2 — Term gating

- `getTermStatus(section, window)` returns `{ t1: 'complete'|'in-progress', t2: 'locked'|'unlocked'|…, t3: … }`.
- T2 unlocks only when T1 pct === 100; T3 only when T2 === 100.
- Term progression strip component (three chips with ✅/🔒/in-progress states).
- Locked-term empty state card with CTA "Go to Term 1".

### Phase 3 — Academic Schedule route & dated grid

- New route/tab hosting: `AcademicScheduleTab` inside Schedule Workspace, with a link from the Section preview too.
- Header: section, term, window dates, last-generated timestamp, fill %, Regenerate button (confirm modal lists "X manually edited cells preserved").
- Term progression strip (Phase 2).
- Change-log notice if `timetableChangeLog` has entries newer than `lastGeneratedAt` for this term → "Timetable updated · N changes · [Re-generate]".
- Week chip bar (W1…Wn for this term only), same look as Weekly Timetable.
- **Dated grid**: reuse `SectionTimetableStep` cell chip styling; each cell shows Program • Subject • Track badge · **chapter** · *topic* · teacher. Read-only by default; inline edit chapter/topic/teacher per class (marks `manuallyEdited=true`).
- Cells rendered from generated data for the selected week + term; empty state when term not yet generated ("Generate Term 1 schedule" CTA).

### Phase 4 — Collapsible progress panel

- Collapsed row: one line per subject with % filled and mini bar (`Physics 64% ██████░░`).
- Expanded in place (not modal) — Radix Collapsible:

  ```text
  Subject/Chapter        Planned  Scheduled  Start    End      %
  Physics · T1 (CBSE)
    Kinematics             12       12 ✅    04 Aug   16 Aug   100
    Laws of Motion         10       10 ✅    18 Aug   30 Aug   100
    Work, Energy, Power    14        9 🟡    01 Sep   —         64
    Rotational Motion      12        0 ⚪    —        —          0
  ```
- Weekly heatmap strip (W1…Wn shaded by fill %) — clicking a week jumps the grid.
- Smooth expand/collapse, remembers state per session.

### Phase 5 — Mock data

Populate `sec-cls11-morning` and `sec-cls12-pcm` with realistic three-term data:

- **T1 (Class 12 PCM)**: 100% generated, 8 manual edits, matches screenshot 2 (Magnetism & Matter · Para/Dia/Ferro, Redox & Electrode Potentials, etc.).
- **T2 / T3**: locked. Toggle-friendly flag so QA can flip T1 to 87% and see T2's lock card.
- Chapter/topic banks per subject/track (Physics CBSE T1: 8 chapters × ~4 topics; JEE Physics T1: 6 chapters × ~5 topics; Chem, Maths, Bio, Eng, Hindi, SoSt equivalents).
- 3 `timetableChangeLog` entries dated after T1 generation to demo the "Timetable updated" notice.

### Phase 6 — QA checklist

- [ ] Term 1 generates 100% with correct chapter order.
- [ ] Regenerate preserves manually edited cells.
- [ ] Term 2 locked card renders; CTA jumps back to T1.
- [ ] Change-log notice appears when Weekly Timetable is edited after generation.
- [ ] Progress panel expand/collapse doesn't cause layout shift under the grid.
- [ ] Week chip in progress heatmap navigates the dated grid.
- [ ] Class 11 Morning and Class 12 PCM both have visible mock data across all three terms.
- [ ] No horizontal scroll on the grid at 1280 px (existing constraint).
- [ ] Dev Notes popover on header explains generator rules.

---

## Technical notes

- **Files created**: `scheduleGenerator.ts`, `AcademicScheduleTab.tsx`, `TermProgressionStrip.tsx`, `ScheduleProgressPanel.tsx` (collapsible), `DatedTimetableGrid.tsx`, `ChapterProgressTable.tsx`, `WeeklyHeatmap.tsx`, `LockedTermCard.tsx`.
- **Files modified**: `types/section.ts` (cell fields, ScheduleGenerationLog), `useSection.ts` (generate/regenerate actions), `mockSections.ts` (chapter banks + seeded generations), `sectionUtils.ts` (completion + term status selectors).
- **Untouched**: Setup, Period Allocation, Weekly Timetable stay exactly as they are — this tab consumes their output.
