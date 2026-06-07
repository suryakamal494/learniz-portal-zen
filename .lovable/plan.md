# Voice navigation — fix stale routes + add "currently teaching" intent

## 1. Fix stale route paths in `src/lib/voiceRoutes.ts`
Replace these with the real router paths (verified against `src/App.tsx` / page files):

| id | old path | new path |
|---|---|---|
| `schedule` | `/teacher/classroom/schedule` | `/teacher/schedule` |
| `schedule.create` | `/teacher/classroom/schedule/create` | `/teacher/schedule/create` |
| `studyNotes` | `/teacher/classroom/notes` | `/teacher/lms/notes` |
| `studyNotes.create` | `/teacher/classroom/notes/create` | `/teacher/lms/notes/create` |
| `lessons.library` | `/teacher/lms/library` | `/teacher/lms/content/library` |
| `reports.section` | `/teacher/reports/section` | `/teacher/reports/section-reports` |

Remove entirely (route does not exist / superseded):
- `liveAssessment` (no `/teacher/classroom/live-quizzes` page)
- `batch.progress` — superseded by `batch.programs` (the Programs page already shows "Where you stand").

(I'll re-read `src/App.tsx` first and only change paths that are actually wrong; the table above is from my audit and will be confirmed before writing.)

## 2. Resolve the `courses` vs `batch.programs` overlap
- `courses.examples` becomes `['courses', 'create course', 'course library']` — drop `'programs'` and `'curriculum'`.
- `batch.programs.examples` gets the new "currently teaching" vocabulary (see §3).

## 3. New "currently teaching" intent
Two complementary additions:

### 3a. Enrich `batch.programs` examples
Add: `"what am i teaching now"`, `"current chapter"`, `"currently teaching"`, `"todays topic"`, `"this weeks lesson"`, `"where do i stand in the program"`, `"jump to current chapter"`, `"show my program"`, `"open my program"`.

### 3b. New virtual route `programs.current`
Path template: `/teacher/batches/:batchId/programs` (same as `batch.programs`), but the route id signals the client to:
1. Pick the **subject** containing today's focus topic (compute on the client via `getTodayFocus` over the resolved batch's program — already in `src/utils/programSchedule.ts`).
2. Append `?subject=<slug>#chapter-<chapterId>` so the existing `ProgramSubjectTabs` selects the right subject and `ChapterListSection`'s `useEffect` scrolls the highlighted chapter into view.

Examples: `"what am i teaching today"`, `"take me to the current chapter"`, `"where am i in the program right now"`, `"show currently running"`, `"open this weeks topic"`.

The LLM never has to know which chapter — `programs.current` is a marker; the client does the resolution after navigation intent is returned.

## 4. Client resolution for `programs.current`
In `VoiceCommandFAB.finalizeNavigation`:
- When `routeId === 'programs.current'`:
  - Resolve `batchId` (named batch → use it; otherwise prefer the batch in the current URL via `useParams` / `useLocation`; otherwise fall back to `voiceCatalog.batches[0]`).
  - Look up the program via `getProgramByBatchId(batchId)` and call `getTodayFocus(program)`.
  - If a focus exists, build `path = /teacher/batches/<batchId>/programs?subject=<subjectSlug>#chapter-<chapterId>`. The subject slug must match what `BatchProgramsPage` already does — it matches by **subject name (lowercased)**, so look up the subject name and pass its slug from `voiceCatalog` (already keyed by name).
  - If no focus (nothing scheduled), navigate to the plain Programs URL and toast "Nothing scheduled for today — opening Programs."
- For all other routes, behavior is unchanged.

## 5. Programs page must honor `#chapter-<id>` hash
`BatchProgramsPage` already scrolls to the focus chapter via its own `useEffect`. That works when the focus matches; but for the voice flow we want to guarantee scroll based on the URL hash too. Add a small `useEffect` to `BatchProgramsPage` that, when `location.hash` starts with `#chapter-`, scrolls that element into view after first render (RAF + 100 ms timer to wait for accordion mount). This keeps the existing focus-scroll behavior intact and makes the deep-link survive subject-tab switches.

## 6. Smarter `batchId` fallback
In `finalizeNavigation`, if a route `needsParam === 'batchId'` and `intent.filters.batchId` is null, prefer the `:batchId` from the current location path (matched via `/teacher/batches/(\d+)`) over `voiceCatalog.batches[0]`.

## 7. Tighten the LLM system prompt (in `supabase/functions/voice-intent/index.ts`)
Add one bullet to RULES:
> "Phrases about 'what I'm teaching now', 'currently teaching', 'today's topic', 'this week's lesson', 'where do I stand in the program' map to `programs.current`. Phrases about 'open program / show curriculum / programs of <section>' map to `batch.programs`. Phrases about 'create course / new course' map to `courses`."

Deploy the edge function after the edit.

## Files touched
- `src/lib/voiceRoutes.ts` — path fixes, example fixes, drop `liveAssessment` + `batch.progress`, add `programs.current`.
- `src/components/teacher/voice/VoiceCommandFAB.tsx` — handle `programs.current`, smarter batch fallback.
- `src/pages/teacher/batches/BatchProgramsPage.tsx` — honor `#chapter-<id>` hash on mount.
- `supabase/functions/voice-intent/index.ts` — system-prompt rule for the new intent class; redeploy.

## Out of scope
- No backend / schema changes.
- No new components.
- Voice-driven topic status toggles ("mark Galvanic Cells as done") — separate feature, will flag but not implement.
- Reorganizing the voice catalog or chapter slug strategy.

## How the target scenario will behave after this
User says: *"Take me to where I can see what I'm currently teaching."*
→ LLM returns `routeId: "programs.current"` (no subject/chapter needed).
→ Client resolves batch from current URL (`/teacher/batches/1/...`) → fetches program → `getTodayFocus()` → Chemistry · Chapter 3 Electrochemistry · Galvanic Cells.
→ Navigates to `/teacher/batches/1/programs?subject=chemistry#chapter-chem-ch-3`.
→ Programs page opens, Chemistry tab selected, page scrolls to the blue-ringed "Currently teaching" chapter.
