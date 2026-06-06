## What we're building

A floating mic button at the bottom-right of every teacher page. Tap → speak → the system parses intent and navigates to the right page. Navigation only (no actions, no answers). Browser-native speech recognition. No paid integrations.

```text
┌─ Teacher page ───────────────────────────────┐
│                                              │
│           (page content)                     │
│                                              │
│                                  ┌────────┐  │
│                                  │  🎤    │  │  ← floating FAB
│                                  └────────┘  │
└──────────────────────────────────────────────┘

Tap mic → expands into a panel:
┌──────────────────────────────────────────┐
│ 🎤  Listening…                       ✕   │
│ ──────────────────────────────────────── │
│ "show me batch A reports"                │  ← live transcript
│                                          │
│ Try: "Open assessments" · "Attendance"   │
│      "Batch 11-A" · "Question bank"      │
└──────────────────────────────────────────┘

After speech ends:
┌──────────────────────────────────────────┐
│ 🎯  Opening Batch Reports for 11-A…      │
│     Wrong page? [Cancel]                 │
└──────────────────────────────────────────┘
```

## Tech choices (all free, already available)

- **Speech-to-Text**: Browser `webkitSpeechRecognition` / `SpeechRecognition` Web Speech API. Works in Chrome, Edge, Safari (incl. iOS 14.5+). No key, no cost, low latency. Graceful fallback message for Firefox.
- **Intent parsing**: Lovable AI Gateway (`google/gemini-3-flash-preview`) with **structured output via tool calling** returning `{ route, params, confidence, friendlyName }`. ~300ms.
- **Edge function**: `supabase/functions/voice-intent/index.ts` keeps the prompt + route registry server-side and uses `LOVABLE_API_KEY`.
- **Routing**: existing `react-router-dom` `useNavigate`.
- **Requires Lovable Cloud** (for the edge function + LOVABLE_API_KEY). Will be enabled in Phase 0.

## Route registry (drives the LLM)

A single typed file `src/lib/voiceRoutes.ts` lists every teacher page with examples. The LLM picks one. New pages = add one entry. Examples:

```ts
{ id: 'reports.batch', path: '/teacher/reports/section', label: 'Batch Reports',
  examples: ['show reports', 'batch performance', 'how did batch A do'] }
{ id: 'attendance', path: '/teacher/reports/attendance', label: 'Attendance',
  examples: ['mark attendance', 'attendance report', "today's attendance"] }
{ id: 'assessments', path: '/teacher/exams', label: 'Assessments', ... }
{ id: 'assessment.create', path: '/teacher/exams/create', ... }
{ id: 'assessment.ai', path: '/teacher/exams/ai-generator', ... }
{ id: 'lessons', path: '/teacher/lms', ... }
{ id: 'lessonPlans', path: '/teacher/lms/series', ... }
{ id: 'studyNotes', path: '/teacher/classroom/notes', ... }
{ id: 'questionBank', path: '/teacher/question-bank', ... }
{ id: 'schedule', path: '/teacher/classroom/schedule', ... }
{ id: 'batches', path: '/teacher/batches', ... }
{ id: 'messages', path: '/teacher/messages', ... }
{ id: 'notifications', path: '/teacher/notifications', ... }
// + batch-specific: { id: 'batch.open', path: '/teacher/batches/:batchId', needsParam: 'batchId' }
```

For parametrised routes (e.g. "open Batch 11-A"), the edge function receives the list of available batches from `mockBatches` and resolves the param.

## UX rules

- **Single mic FAB**, bottom-right, 56px, blue-indigo gradient with subtle pulse when idle, animated wave when recording. Hidden on `/login` and `/brochure`.
- **States**: idle → listening (live transcript) → thinking (200–600ms shimmer) → navigating (toast with "Opening X… Cancel"). Auto-stops on 2s silence.
- **Low-confidence handling**: if confidence < 0.6, show a confirmation chip with top 2 guesses instead of navigating.
- **Errors**: mic denied → tooltip explains; STT unsupported → hide FAB; AI error → toast "Couldn't understand, try again".
- **Privacy notice**: first use shows a one-time tooltip explaining audio is processed in the browser and only the transcript is sent.
- **Keyboard shortcut**: `Alt+M` toggles mic (bonus, no extra UI).

## Phase-wise implementation

### Phase 0 — Backend setup
- Enable Lovable Cloud (required for edge function + LOVABLE_API_KEY).

### Phase 1 — Route registry + edge function
- `src/lib/voiceRoutes.ts` — typed array of all navigable teacher pages with `id`, `path`, `label`, `examples[]`, optional `needsParam`.
- `supabase/functions/voice-intent/index.ts` — accepts `{ transcript, batches[] }`, calls Lovable AI Gateway with a tool-calling schema:
  ```json
  { "routeId": "string", "params": { "batchId": "string?" },
    "confidence": 0-1, "friendlyName": "string" }
  ```
  Handles 429/402 with friendly error payloads.

### Phase 2 — Speech recognition hook
- `src/hooks/useSpeechRecognition.ts` — wraps Web Speech API: `start()`, `stop()`, exposes `transcript`, `isListening`, `isSupported`, `error`. Handles permission denial, no-speech, network errors.

### Phase 3 — Voice command UI
- `src/components/teacher/voice/VoiceCommandFAB.tsx` — floating mic button with idle/listening/thinking states, animated mic icon (lucide `Mic` + custom pulse rings).
- `src/components/teacher/voice/VoiceCommandPanel.tsx` — expanded panel above the FAB showing live transcript, example prompts (rotating), close button.
- `src/components/teacher/voice/VoiceResultToast.tsx` — confirmation toast with "Opening X…" and Cancel/Wrong-page action.
- Pastel theme, blue/indigo primary, follows existing design tokens.

### Phase 4 — Wire into TeacherLayout
- Mount `<VoiceCommandFAB />` inside `src/components/teacher/layout/TeacherLayout.tsx` so it appears on every teacher page automatically.
- On submit: call edge function → navigate using `useNavigate()` → show toast.
- Add `Alt+M` global shortcut listener.

### Phase 5 — Polish & QA
- Mobile: FAB shifts above any sticky bottom bars (e.g. AI Exam Generator footer). Use `bottom-20` on those pages via a context flag or just `bottom-24` globally with safe-area-inset.
- Low-confidence confirmation chips.
- First-use privacy tooltip.
- Test phrases across ~15 representative intents.
- Verify Safari iOS behavior.

## What stays the same

- No existing pages or routes change.
- No new dependencies (Web Speech API is browser-native; we already have `lucide-react`, `react-router-dom`, `sonner`).
- Only `TeacherLayout.tsx` gets one extra child component.

## Open question (not blocking)

When a teacher says "Open Batch A" but there are multiple matches (Batch A — Physics, Batch A — Chemistry), should the toast show a 2-option chooser, or just navigate to the most recently active one? Default: 2-option chooser.
