# Real content behind the annotation overlay

Right now every lesson-plan content row has `url: '#'` (from `LP_POOL` in `src/data/mockPrograms.ts`), so the Preview modal always falls back to the `PlaceholderSlide`. That's why the canvas looks like a popup over nothing. Fix: populate mock data with real, embeddable content per type, and have the modal render it properly.

## 1. Real mock URLs in `LP_POOL`

In `src/data/mockPrograms.ts` give each content entry a real, classroom-style URL by `type`:

- **html** (interactive simulation) → PhET HTML5 sim iframes, e.g.
  `https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_en.html`,
  `https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html`,
  `https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html`.
  Picked by subject (physics/chem/etc.) so each lesson plan gets a topical sim.
- **video** → YouTube embed URLs (e.g. Khan Academy / 3Blue1Brown style topical clips). Stored as `https://www.youtube.com/embed/<id>?rel=0`.
- **pdf** → public sample PDFs (e.g. `https://www.africau.edu/images/default/sample.pdf` plus 1-2 other classroom-style PDFs) so an actual document renders in the iframe.
- **ppt** → no public PPT-to-iframe option, so this stays `url: ''` and the modal renders an in-app **DemoSlideDeck** (see §3) themed by content title.
- **note** → bodied text (3-5 paragraphs of teaching notes) stored in a new optional `body` field on `LessonPlanContent`, so notes show real content behind annotations instead of "Note content goes here".

Update `src/types/program.ts` to add `body?: string` on `LessonPlanContent`.

## 2. Modal renders content by type — properly

Update `src/components/teacher/programs/LessonContentPreviewModal.tsx`:

- **video** — if URL contains `youtube.com/embed` or `youtu.be`, render via `<iframe allowfullscreen>` instead of `<video>`. Otherwise keep `<video controls>`.
- **html / pdf** — `<iframe src={url} className="w-full h-full bg-white" allow="fullscreen; accelerometer; gyroscope">`. Add `sandbox` only if needed; PhET requires scripts.
- **ppt** — if no URL, mount the new `DemoSlideDeck` (see §3) with a topic derived from `content.title`.
- **note** — render `content.body` (Markdown-ish: split paragraphs, bullets, optional formula block) instead of dumping the URL string.
- Drop the generic `PlaceholderSlide` as the default; keep it only as a final fallback when a URL is missing for html/pdf/video.

## 3. New `DemoSlideDeck` component

`src/components/teacher/preview/DemoSlideDeck.tsx` — a small self-contained slide presenter to back the `ppt` type:

- 5-6 styled slides (title slide + content slides) with `.slide-content` semantic classes (title 88px, body 32px) so it actually looks like a projected deck behind the annotation canvas.
- Prev / Next buttons + Left/Right arrow keys for navigation.
- Slide counter pill ("3 / 6") in the bottom-right corner.
- Topic decks keyed by keyword in the content title:
  - "magnetic" / "current" → Magnetic Effects of Current (definition, right-hand rule, solenoid, applications)
  - "projectile" / "motion" → Projectile Motion deck
  - "atom" / "structure" → Atomic Structure deck
  - default → a generic "Concept Introduction" deck built from the lesson-plan title.
- Renders inside the modal at the full preview area; the annotation canvas sits on top exactly as today, and Interact mode lets the teacher click Next/Prev underneath.

## 4. Wire YouTube/iframe-safe rendering

Add a tiny `isYouTubeUrl` helper local to the modal. Render YouTube via iframe with `allowfullscreen` and `?rel=0&modestbranding=1`.

## Files touched

- `src/types/program.ts` — add `body?: string` on `LessonPlanContent`.
- `src/data/mockPrograms.ts` — populate `LP_POOL` entries with real `url` / `body` per type; pick simulations and videos by subject.
- `src/components/teacher/programs/LessonContentPreviewModal.tsx` — type-aware rendering (YouTube iframe, PDF iframe, PhET iframe, DemoSlideDeck, rich note).
- **New** `src/components/teacher/preview/DemoSlideDeck.tsx` — in-app demo deck for `ppt` content.

## Out of scope

- Real PPTX parsing/rendering (would need a library + file uploads).
- Real classroom video hosting (we use public YouTube embeds for demo).
- Persisting annotations across sessions.
