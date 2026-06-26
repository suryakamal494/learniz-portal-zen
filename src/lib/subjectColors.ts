/** Centralised pastel palette mapping for institute subjects. */

type Palette = {
  bg: string;
  bgSoft: string;
  text: string;
  border: string;
  ring: string;
  dot: string;
  slot: string;
};

const PALETTES: Record<string, Palette> = {
  blue:     { bg: 'bg-blue-500',    bgSoft: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    ring: 'ring-blue-200',    dot: 'bg-blue-500',    slot: 'bg-blue-100 text-blue-800 border-blue-300' },
  emerald:  { bg: 'bg-emerald-500', bgSoft: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-200', dot: 'bg-emerald-500', slot: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  violet:   { bg: 'bg-violet-500',  bgSoft: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  ring: 'ring-violet-200',  dot: 'bg-violet-500',  slot: 'bg-violet-100 text-violet-800 border-violet-300' },
  rose:     { bg: 'bg-rose-500',    bgSoft: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    ring: 'ring-rose-200',    dot: 'bg-rose-500',    slot: 'bg-rose-100 text-rose-800 border-rose-300' },
  amber:    { bg: 'bg-amber-500',   bgSoft: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   ring: 'ring-amber-200',   dot: 'bg-amber-500',   slot: 'bg-amber-100 text-amber-800 border-amber-300' },
  cyan:     { bg: 'bg-cyan-500',    bgSoft: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    ring: 'ring-cyan-200',    dot: 'bg-cyan-500',    slot: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  orange:   { bg: 'bg-orange-500',  bgSoft: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  ring: 'ring-orange-200',  dot: 'bg-orange-500',  slot: 'bg-orange-100 text-orange-800 border-orange-300' },
};

export function subjectPalette(color: string): Palette {
  return PALETTES[color] ?? PALETTES.blue;
}
