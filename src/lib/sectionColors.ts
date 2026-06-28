import { SubjectColor } from '@/types/section';

/**
 * Single source of truth for subject color rendering across the section
 * scheduling workspace. Each subject gets a hue family; tracks differ
 * by texture (see `trackPattern`) so two tracks of the same subject
 * remain distinguishable inside a single cell label.
 */

export interface SubjectPaletteV2 {
  /** Solid fill swatch e.g. for chips and dots. */
  solid: string;
  /** Very light surface e.g. cell background. */
  surface: string;
  /** Strong text on light surface. */
  text: string;
  /** Border that matches the hue. */
  border: string;
  /** A ring color for focused state. */
  ring: string;
  /** Gradient header background. */
  headerGradient: string;
}

const TABLE: Record<SubjectColor, SubjectPaletteV2> = {
  blue:    { solid: 'bg-blue-500',    surface: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    ring: 'ring-blue-300',    headerGradient: 'from-blue-500/90 to-blue-600' },
  emerald: { solid: 'bg-emerald-500', surface: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-300', headerGradient: 'from-emerald-500/90 to-emerald-600' },
  violet:  { solid: 'bg-violet-500',  surface: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  ring: 'ring-violet-300',  headerGradient: 'from-violet-500/90 to-violet-600' },
  orange:  { solid: 'bg-orange-500',  surface: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  ring: 'ring-orange-300',  headerGradient: 'from-orange-500/90 to-orange-600' },
  rose:    { solid: 'bg-rose-500',    surface: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    ring: 'ring-rose-300',    headerGradient: 'from-rose-500/90 to-rose-600' },
  amber:   { solid: 'bg-amber-500',   surface: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   ring: 'ring-amber-300',   headerGradient: 'from-amber-500/90 to-amber-600' },
  cyan:    { solid: 'bg-cyan-500',    surface: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    ring: 'ring-cyan-300',    headerGradient: 'from-cyan-500/90 to-cyan-600' },
  fuchsia: { solid: 'bg-fuchsia-500', surface: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', ring: 'ring-fuchsia-300', headerGradient: 'from-fuchsia-500/90 to-fuchsia-600' },
  teal:    { solid: 'bg-teal-500',    surface: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    ring: 'ring-teal-300',    headerGradient: 'from-teal-500/90 to-teal-600' },
  sky:     { solid: 'bg-sky-500',     surface: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     ring: 'ring-sky-300',     headerGradient: 'from-sky-500/90 to-sky-600' },
  lime:    { solid: 'bg-lime-500',    surface: 'bg-lime-50',    text: 'text-lime-800',    border: 'border-lime-200',    ring: 'ring-lime-300',    headerGradient: 'from-lime-500/90 to-lime-600' },
  indigo:  { solid: 'bg-indigo-500',  surface: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  ring: 'ring-indigo-300',  headerGradient: 'from-indigo-500/90 to-indigo-600' },
};

export function sectionPalette(color: SubjectColor): SubjectPaletteV2 {
  return TABLE[color] ?? TABLE.blue;
}

/** Track texture variant — used as a subtle CSS background pattern overlay so
 *  T1/T2/T3 of the SAME subject stay readable without color clashes. */
export function trackPattern(trackIndex: number): React.CSSProperties {
  if (trackIndex === 0) return {};
  if (trackIndex === 1) {
    return {
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 4px, transparent 4px 8px)',
    };
  }
  return {
    backgroundImage:
      'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.45) 1px, transparent 1.5px)',
    backgroundSize: '6px 6px',
  };
}
