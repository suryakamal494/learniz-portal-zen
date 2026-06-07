# Context-Aware Voice Navigation (v2 — with slug resolution + clarification)

## Your idea — validated

You're absolutely right on both points:

1. **Slugs + semantic AI matching** is the correct way to handle name conflicts. "Physics", "PHY", "PHY 101", "Phy-11" should all resolve to the same subject. Same for chapters: "Kinematics" ≈ "Kinematics & Motion" ≈ "Motion in 1D".
2. **Ask the user when uncertain.** If the AI can't confidently pick between two candidates (e.g. "Section A" exists for both Physics and Chemistry batches), the FAB should ask a short clarification question instead of guessing.

This makes voice nav feel intelligent rather than brittle.

## Feasibility: High
- Mock data already has stable IDs we can repurpose as slugs.
- Gemini handles semantic alias matching natively when given the canonical list + aliases.
- The FAB already has a panel UI — we just add a "pick one" state.

## Implementation Plan

### 1. Canonical catalog with slugs + aliases
**New file:** `src/lib/voiceCatalog.ts`

Build a single source of truth derived from existing mock data:
```ts
type CatalogEntry = {
  id: string          // stable slug, e.g. "physics"
  name: string        // canonical display name, e.g. "Physics"
  aliases: string[]   // ["phy", "phy 101", "phy-11", "physics 11"]
  subjectId?: string  // for chapters/topics — parent link
}

export const voiceCatalog = {
  subjects: CatalogEntry[],
  chapters: CatalogEntry[],   // each linked to a subjectId
  batches:  CatalogEntry[],   // aliases include "section a", "11 a", "alpha", etc.
}
```
Aliases are seeded from data + a small hand-curated list (short codes, common spoken variants). Easy to extend later.

### 2. AI does semantic resolution, not exact match
**File:** `supabase/functions/voice-intent/index.ts`

Send the catalog (id + name + aliases) into the system prompt and instruct Gemini:
- Return the **slug (id)**, never the spoken phrase
- If multiple candidates are plausible, return them in a `candidates[]` array with confidence each
- If confidence is low or candidates tie within ~0.15, return `needsClarification: true`

Extended tool schema:
```
{
  routeId,
  filters: { subjectId?, chapterId?, batchId? },
  candidates?: { field: "subjectId"|"chapterId"|"batchId",
                 options: [{ id, name, confidence }] },
  needsClarification?: boolean,
  confidence,
  friendlyName
}
```

### 3. Client uses slugs everywhere
**File:** `src/components/teacher/voice/VoiceCommandFAB.tsx`

- Receive slugs from edge function → look up canonical names from `voiceCatalog`
- Build deep-link URL with slugs: `/teacher/lms/series?subject=physics&chapter=kinematics`
- Toast shows resolved names: *"Opening Lesson Plans · Physics › Kinematics"*

### 4. Clarification state on the FAB
New FAB phase: `'clarifying'`. When `needsClarification` is true, the panel shows:

> Heard: *"open section A reports"*
> Which Section A did you mean?
> [ Physics – Section A ]  [ Chemistry – Section A ]  [ Cancel ]

Teacher taps (or says the number — *"first one"* via a second mini-listen — optional v2). On selection, we navigate with the chosen slug. No extra AI call needed.

### 5. Declare filter support per route
**File:** `src/lib/voiceRoutes.ts`

Add `supportedFilters?: ('subjectId'|'chapterId'|'batchId')[]` per route:
- `lessonPlans` → `subjectId, chapterId`
- `reports.chapter` → `subjectId, chapterId` (auto-jump to detail if exact chapter)
- `batch.programs` → `batchId, subjectId`
- `reports.attendance` → `batchId`
- `reports.section` → `batchId, subjectId`

### 6. Target pages read filters from URL (slug → state)
Wire `useSearchParams` into existing filter state. Use `voiceCatalog` to map slug → display value the page already expects. No UI/business-logic changes — filters just pre-populate.

Pages touched:
- `LMSSeriesPage.tsx`
- `ChapterAnalyticsListPage.tsx`
- `BatchProgramsPage.tsx`
- `BatchReportsPage.tsx`
- `AttendancePage.tsx`

### 7. Smart deep-jump
If the resolved `chapterId` exactly matches a chapter detail route, skip the list page and go directly to `/teacher/reports/chapter-analytics/:chapterId`.

### 8. Updated example phrases on the FAB
- *"Physics lesson plans"*
- *"PHY 101 programs of Section A"*
- *"Kinematics report"*
- *"Open chemistry attendance"*

## Challenges & mitigations

| Challenge | Mitigation |
|---|---|
| Maintaining aliases over time | Auto-seed from data; aliases are a plain array — easy to append |
| AI token cost grows with catalog | Send only id + name + 3-4 aliases per entry; cap chapters to those matching the (likely) subject when one is detected in transcript |
| User picks wrong clarification option | Cancel button + Alt+M restarts cleanly |
| Slug collisions | Auto-suffix on build (`physics`, `physics-2`) — covered by `voiceCatalog.ts` generator |

## What stays the same
- Free browser STT (Web Speech API)
- Single AI call per command (clarification = local pick, no second call)
- Same FAB / Alt+M shortcut / pastel theme
- No new dependencies, no DB changes

## Out of scope (v3)
- Voice-driven actions (create / edit / mark)
- TTS read-back of results
- Multi-turn refinement ("now last week only")
