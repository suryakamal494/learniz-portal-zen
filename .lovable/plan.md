
## Updated audit + plan (incorporating your latest clarifications)

### Direct answers to your questions

**Q1. Drop cross-program cell conflict (old Phase 7)?**
✅ Dropped. Each section is self-scoped; we won't try to detect a CBSE↔JEE clash that spans sections. One-cell-one-allocation stays — but only *within the active section's own timetable*.

**Q2. Multiple programs in one section — how does period budgeting work?**
Shared pool, as you described:
```
Section capacity = working_days × periods_per_day        (fixed)
Allocated        = Σ all tracks across ALL programs in the section
Remaining        = Capacity − Allocated
```
Program 1 taking 50 + Program 2 taking 50 → 100 deducted from the section budget. No per-program quota.

**Q3. Where do I group chapters into a specific track? Does the UI exist today?**
❌ **No, it does not exist today.** This is a real gap.

Today's Step 2 shows:
```
Subject (Physics)
 ├─ Track row: T1  [faculty ▾]  [periods #]
 ├─ Track row: T2  [faculty ▾]  [periods #]
 └─ Chapter list (flat, NOT bound to any track)
     ├─ Chapter 1 → Topic 1 [periods #]
     ├─ Chapter 2 → Topic 2 [periods #]
     └─ …
```
So when tracks exist, the user has no way to say "Chapter 3 → T1, Chapter 4 → T2." This must be added.

---

### Proposed UI for chapter-to-track grouping (new Phase C+)

Inside Step 2, when a subject has **≥2 tracks**, the subject's chapter list switches from one flat list into a **track-tabbed list**:

```
─ Physics  ──────────────────────────────────────────────
  Tracks:  [ T1  Sharma · 60p ]  [ T2  Mehta · 40p ]  [+ Add track]

  ┌─ T1 (Sharma · 60 periods) ─────────────────────────┐
  │  Chapter 1 — Kinematics      [ assign ▾ T1 ✓ ]    │
  │  Chapter 2 — Laws of Motion  [ assign ▾ T1 ✓ ]    │
  │  Chapter 3 — Work, Energy    [ assign ▾ T1 ✓ ]    │
  │  Σ 24 periods allotted to topics here              │
  └────────────────────────────────────────────────────┘

  ┌─ T2 (Mehta · 40 periods) ──────────────────────────┐
  │  Chapter 4 — Thermodynamics  [ assign ▾ T2 ✓ ]    │
  │  Chapter 5 — Optics          [ assign ▾ T2 ✓ ]    │
  └────────────────────────────────────────────────────┘

  ┌─ Unassigned (drag/select track) ───────────────────┐
  │  Chapter 6 — Modern Physics  [ assign ▾ ▾ ]       │
  └────────────────────────────────────────────────────┘
```

Mechanics:
- Each chapter carries `trackId?: string` (new field on `InstituteChapter`).
- When the subject has exactly 1 track, every chapter is auto-bound to it — no extra UI shown.
- When ≥2 tracks, an "Assign to track" dropdown appears on each chapter row + an "Unassigned" bucket at the bottom.
- Per-track footer shows: `chapter count · topics-configured / topics-total · periods allotted / track target`.
- A topic's periods only count toward the **track it belongs to** (inherited from its parent chapter).
- Hard validation: a chapter's topic-period sum must not exceed the parent track's target.
- Generator (Step 3 palette + Step 4 preview) reads `chapter.trackId` so when the user places a "Physics · T1" cell, the calendar maps it only to topics from T1 chapters.

---

### Revised phase plan (after your edits)

| Phase | Title | Notes |
|---|---|---|
| **A** | Faculty pool in Step 1 | multi-select pool, Step 2 track-faculty filters to pool |
| **B** | Multiple academic windows in Step 1 | window list + active switcher; allocation & timetable stored per `windowId` |
| **C** | Enable/disable track + Lock subject | `enabled` flag on track, `locked` on subject |
| **C+** | **Chapter→Track grouping in Step 2** *(new, per your Q3)* | track-tabbed chapter UI when ≥2 tracks; `chapter.trackId` field; validation against track target |
| **D** | Conditional cell display | program+subject+track+teacher rendering matrix |
| **E** | Multiple programs per section | Section wraps `programs[]`; shared period pool; Step 2/3 iterate programs; **no cross-section conflict logic** |
| **F** | Responsive & visual polish pass | 1024/1280/1440 desktop + 768/360 mobile |

Dropped from the plan:
- ❌ Old Phase 7 — cross-program / cross-section cell conflict.

---

### Build order I recommend

1. **Phase A → C+ first** (faculty pool, multi-windows, track enable/lock, **chapter-to-track grouping**) — these all live inside Step 1 + Step 2 and are independent.
2. **Phase D** — cosmetic/render only, low risk.
3. **Phase E** — data-shape change (Section wraps programs); biggest refactor, do last with your explicit go-ahead.
4. **Phase F** — polish.

---

### One blocker question before I start coding
For **Phase B (multiple academic windows)** — when you switch from Window 1 → Window 2:
- **(a)** the period allocation + weekly timetable are *separate per window* (each window has its own plan), OR
- **(b)** allocations are *shared*, the window only changes the date range the calendar lays them onto?

Pick one and I'll start with Phase A immediately after, holding E until you confirm.

---

## Build status (live)

| Phase | Status |
|---|---|
| A — Faculty pool in Setup | ✅ Shipped |
| C — Track enable/disable + Subject lock | ✅ Shipped |
| C+ — Chapter→Track grouping in Step 2 | ✅ Shipped |
| D — Conditional cell display (single program scope) | ✅ Shipped |
| B — Multiple academic windows (separate per window) | ⏳ Next |
| E — Multiple programs per section | ⏳ After B |
| F — Responsive polish | ⏳ After E |

### What landed this turn

**Phase A — Faculty pool**
- `ScheduleConfig.facultyPool?: string[]` on type.
- New `FacultyPoolPicker` multi-select inside Step 1 → Faculty card (above per-subject defaults).
- Per-subject default-faculty dropdowns and Step 3 cell-faculty selects now filter to the pool when set.

**Phase C — Track enable + Subject lock**
- `ScheduleTrack.enabled?: boolean` + `ScheduleConfig.subjectLocks?: Record<string, boolean>`.
- Eye / EyeOff toggle on every track row in Step 2.
- Lock / Unlock icon on every subject header in Step 2.
- Disabled tracks are excluded from capacity totals and from the Step 3 palette.
- Locked subjects: targets, faculty, add/remove track, chapter→track assignment and topic period inputs all become read-only.

**Phase C+ — Chapter→Track grouping**
- `InstituteChapter.trackId?: string | null`.
- `setChapterTrack()` store helper.
- When a subject has ≥2 tracks, every chapter row in Step 2 shows an "Assign track" dropdown (Unassigned / T1 / T2…). Unassigned chapters are visually flagged with a dashed amber border.

**Phase D — Conditional cell display**
- Step 3 cell now hides the track badge when the subject has only one enabled track.
- Faculty line is hidden when no faculty is set for the cell (instead of showing the "Faculty" placeholder text).

