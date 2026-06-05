export type SectionPalette = {
  key: string
  accent: string // top strip bg
  chipBg: string
  chipText: string
  avatarBg: string
  avatarText: string
  ring: string
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
  },
  {
    key: 'purple',
    accent: 'bg-purple-500',
    chipBg: 'bg-purple-50',
    chipText: 'text-purple-700',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    ring: 'ring-purple-100',
  },
  {
    key: 'green',
    accent: 'bg-emerald-500',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    ring: 'ring-emerald-100',
  },
  {
    key: 'peach',
    accent: 'bg-orange-400',
    chipBg: 'bg-orange-50',
    chipText: 'text-orange-700',
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-700',
    ring: 'ring-orange-100',
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
