export type SectionPalette = {
  key: string
  accent: string // top strip bg
  chipBg: string
  chipText: string
  avatarBg: string
  avatarText: string
  ring: string
  gradient: string // header band background
  iconText: string // decorative motif color
  border: string // soft palette-tinted border
}

const palettes: SectionPalette[] = [
  {
    key: 'blue',
    accent: 'bg-blue-500',
    chipBg: 'bg-blue-50',
    chipText: 'text-blue-700',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
    ring: 'ring-blue-100',
    gradient: 'bg-gradient-to-br from-blue-100 via-sky-50 to-white',
    iconText: 'text-blue-400/40',
    border: 'border-blue-100',
  },
  {
    key: 'purple',
    accent: 'bg-purple-500',
    chipBg: 'bg-purple-50',
    chipText: 'text-purple-700',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    ring: 'ring-purple-100',
    gradient: 'bg-gradient-to-br from-purple-100 via-violet-50 to-white',
    iconText: 'text-purple-400/40',
    border: 'border-purple-100',
  },
  {
    key: 'green',
    accent: 'bg-emerald-500',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    ring: 'ring-emerald-100',
    gradient: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-white',
    iconText: 'text-emerald-400/40',
    border: 'border-emerald-100',
  },
  {
    key: 'peach',
    accent: 'bg-orange-400',
    chipBg: 'bg-orange-50',
    chipText: 'text-orange-700',
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-700',
    ring: 'ring-orange-100',
    gradient: 'bg-gradient-to-br from-orange-100 via-amber-50 to-white',
    iconText: 'text-orange-400/40',
    border: 'border-orange-100',
  },
]

export const getSectionPalette = (seed: string | number): SectionPalette => {
  const s = String(seed)
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return palettes[hash % palettes.length]
}

export const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

export const metricTone = (pct: number) => {
  if (pct >= 70) return { text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Strong' }
  if (pct >= 40) return { text: 'text-amber-700', bg: 'bg-amber-50', label: 'Moderate' }
  return { text: 'text-rose-700', bg: 'bg-rose-50', label: 'Needs attention' }
}
