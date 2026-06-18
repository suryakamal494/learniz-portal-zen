import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  kicker?: string;
  title: string;
  body?: string;
  bullets?: string[];
  formula?: string;
}

interface Deck {
  accent: string; // tailwind color class for accents
  slides: Slide[];
}

const DECKS: Record<string, Deck> = {
  magnetic: {
    accent: 'from-blue-600 to-indigo-600',
    slides: [
      {
        kicker: 'Chapter 3',
        title: 'Magnetic Effects of Current',
        body: 'How moving charges create magnetic fields — and how those fields push back on moving charges.',
      },
      {
        kicker: '1 · The discovery',
        title: 'Oersted, 1820',
        bullets: [
          'A current-carrying wire deflects a nearby compass needle.',
          'First experimental link between electricity and magnetism.',
          'Direction of deflection depends on the direction of current.',
        ],
      },
      {
        kicker: '2 · The law',
        title: 'Biot–Savart Law',
        formula: 'dB = (μ₀ / 4π) · (I dl × r̂) / r²',
        body: 'Magnetic field at a point due to a small current element. Magnetic analogue of Coulomb’s law.',
      },
      {
        kicker: '3 · The shortcut',
        title: 'Ampère’s Circuital Law',
        formula: '∮ B · dl = μ₀ · I_enclosed',
        bullets: [
          'Works beautifully for symmetric current distributions.',
          'Used for infinite wires, solenoids and toroids.',
        ],
      },
      {
        kicker: '4 · The force',
        title: 'Lorentz Force',
        formula: 'F = q (v × B)',
        bullets: [
          'Always perpendicular to velocity → speed never changes.',
          'A charged particle in a uniform B field moves in a circle.',
          'Radius r = mv / (qB), period T = 2πm / (qB).',
        ],
      },
      {
        kicker: 'Recap',
        title: 'What we learned',
        bullets: [
          'Moving charges → magnetic fields (Biot–Savart).',
          'Symmetry → easy fields (Ampère).',
          'Magnetic fields → forces on moving charges (Lorentz).',
        ],
      },
    ],
  },
  projectile: {
    accent: 'from-emerald-600 to-teal-600',
    slides: [
      { kicker: 'Chapter', title: 'Projectile Motion', body: 'Two-dimensional motion under gravity alone.' },
      {
        kicker: 'Setup',
        title: 'Decompose the velocity',
        bullets: ['Horizontal: v_x = u cos θ (constant)', 'Vertical: v_y = u sin θ − g t'],
      },
      {
        kicker: 'Key result',
        title: 'Range, height, time of flight',
        formula: 'R = u² sin 2θ / g    H = u² sin²θ / 2g    T = 2u sinθ / g',
      },
      {
        kicker: 'Insight',
        title: 'Maximum range at 45°',
        bullets: ['Complementary angles give the same range.', 'Air drag shifts the optimum slightly below 45°.'],
      },
    ],
  },
  atom: {
    accent: 'from-purple-600 to-fuchsia-600',
    slides: [
      { kicker: 'Chapter', title: 'Atomic Structure', body: 'From Rutherford’s gold foil to Bohr’s quantised orbits.' },
      {
        kicker: 'Model',
        title: 'Bohr’s postulates',
        bullets: [
          'Electrons orbit only in stationary states.',
          'Angular momentum is quantised: mvr = nħ.',
          'Photon emitted when electron drops between levels.',
        ],
      },
      {
        kicker: 'Spectrum',
        title: 'Hydrogen energy levels',
        formula: 'E_n = −13.6 eV / n²',
      },
    ],
  },
};

function pickDeck(title: string): Deck {
  const t = title.toLowerCase();
  if (/magnet|current|electromagnet|induct/.test(t)) return DECKS.magnetic;
  if (/projectile|motion|kinematic/.test(t)) return DECKS.projectile;
  if (/atom|bohr|hydrogen|nucle/.test(t)) return DECKS.atom;
  return DECKS.magnetic; // sensible default
}

interface Props {
  title: string;
}

/**
 * A small in-app slide deck used as backing content for `ppt` lesson-plan
 * material in the Preview modal. Renders real, projectable slides behind the
 * annotation canvas so the teacher sees content (not a placeholder).
 */
export function DemoSlideDeck({ title }: Props) {
  const deck = useMemo(() => pickDeck(title), [title]);
  const [idx, setIdx] = useState(0);
  const total = deck.slides.length;

  // Arrow key navigation (won't fire if focus is in an input).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(total - 1, i + 1));
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const slide = deck.slides[idx];

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Slide surface */}
      <div className="absolute inset-0 flex">
        {/* Accent bar */}
        <div className={`w-2 bg-gradient-to-b ${deck.accent}`} />
        <div className="flex-1 px-16 md:px-24 py-16 md:py-20 flex flex-col">
          {slide.kicker && (
            <p className="text-sm md:text-base font-semibold tracking-[0.18em] uppercase text-gray-500 mb-6">
              {slide.kicker}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            {slide.title}
          </h1>

          {slide.body && (
            <p className="mt-6 md:mt-8 text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl">
              {slide.body}
            </p>
          )}

          {slide.formula && (
            <div className="mt-8 md:mt-10 inline-block self-start">
              <div className="px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 font-mono text-2xl md:text-3xl text-gray-900">
                {slide.formula}
              </div>
            </div>
          )}

          {slide.bullets && slide.bullets.length > 0 && (
            <ul className="mt-8 md:mt-10 space-y-4 max-w-3xl">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-4 text-xl md:text-2xl text-gray-800 leading-snug">
                  <span className={`mt-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br ${deck.accent} flex-shrink-0`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer / nav — kept low so the annotation toolbar (bottom-center) doesn't clash */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 z-[1]">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-40"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 tabular-nums">
          {idx + 1} / {total}
        </div>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-40"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
