/**
 * Voice catalog — canonical slugs + aliases for subjects, chapters, batches.
 * Drives semantic voice-intent resolution: spoken phrases like "PHY 101",
 * "physics", "Kinematics & Motion" all map to a stable id (slug).
 *
 * Slugs are intentionally short, lowercase, hyphen-separated, and stable so
 * they can be used as URL query parameters (e.g. ?subject=physics).
 */

import { mockBatches } from '@/data/mockBatches'
import { mockPrograms } from '@/data/mockPrograms'
import { mockChapterSummaries } from '@/data/mockChapterReports'
import { mockLMSSeries } from '@/data/mockLMSSeries'

export interface CatalogEntry {
  id: string // slug — stable, URL-safe
  name: string // canonical display name
  aliases: string[] // short codes & spoken variants
  subjectId?: string // parent link (for chapters)
  reportChapterId?: string // when set, links to /teacher/reports/chapter-analytics/<id>
}

export interface VoiceCatalog {
  subjects: CatalogEntry[]
  chapters: CatalogEntry[]
  batches: CatalogEntry[]
}

/* -------------------------------------------------------------------------- */
/* Slug helpers                                                                */
/* -------------------------------------------------------------------------- */

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ensureUnique(slug: string, used: Set<string>): string {
  if (!used.has(slug)) {
    used.add(slug)
    return slug
  }
  let i = 2
  while (used.has(`${slug}-${i}`)) i++
  const s = `${slug}-${i}`
  used.add(s)
  return s
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)))
}

/* -------------------------------------------------------------------------- */
/* Alias generation                                                            */
/* -------------------------------------------------------------------------- */

const SUBJECT_SHORT_CODES: Record<string, string[]> = {
  physics: ['phy', 'phy 101', 'phy101', 'phys'],
  chemistry: ['chem', 'chm', 'chem 101'],
  mathematics: ['math', 'maths', 'mat', 'math 101'],
  biology: ['bio', 'biol', 'bio 101'],
  english: ['eng'],
  computer: ['cs', 'comp sci', 'computer science'],
}

function aliasesForSubject(name: string): string[] {
  const lower = name.toLowerCase()
  const aliases: string[] = [lower]
  // pick up first word (e.g. "Physics Advanced" -> "physics")
  const first = lower.split(/\s+/)[0]
  if (first && first !== lower) aliases.push(first)
  // short codes
  for (const [key, codes] of Object.entries(SUBJECT_SHORT_CODES)) {
    if (lower.includes(key)) aliases.push(...codes)
  }
  return uniq(aliases)
}

function aliasesForChapter(name: string): string[] {
  const lower = name.toLowerCase()
  const aliases: string[] = [lower]
  // split on " and " / "&" / "-" to capture sub-phrases
  const parts = lower
    .split(/\s+(?:and|&|-|–|—|\/)\s+|,\s+/)
    .map((p) => p.trim())
    .filter((p) => p && p !== lower && p.length > 2)
  aliases.push(...parts)
  // drop leading articles
  const stripped = lower.replace(/^the\s+/, '')
  if (stripped !== lower) aliases.push(stripped)
  return uniq(aliases)
}

function aliasesForBatch(name: string): string[] {
  const lower = name.toLowerCase()
  const aliases: string[] = [lower]
  // "Physics Advanced Section A" -> capture "section a", "physics a", "a"
  const sectionMatch = lower.match(/section\s+([a-z0-9]+)/)
  if (sectionMatch) {
    aliases.push(`section ${sectionMatch[1]}`)
    aliases.push(sectionMatch[1])
  }
  // single-letter trailing token (e.g. "... A")
  const lastTok = lower.split(/\s+/).pop() || ''
  if (lastTok.length <= 2 && /^[a-z0-9]+$/.test(lastTok)) aliases.push(lastTok)
  // first word
  const first = lower.split(/\s+/)[0]
  if (first) aliases.push(first)
  // first word + last token (subject + section)
  if (first && lastTok && first !== lastTok) aliases.push(`${first} ${lastTok}`)
  return uniq(aliases)
}

/* -------------------------------------------------------------------------- */
/* Build catalog                                                               */
/* -------------------------------------------------------------------------- */

function buildSubjects(): CatalogEntry[] {
  const map = new Map<string, CatalogEntry>()
  const used = new Set<string>()

  const addByName = (name: string) => {
    const key = name.trim().toLowerCase()
    if (!key) return
    if (map.has(key)) return
    const slug = ensureUnique(toSlug(name), used)
    map.set(key, { id: slug, name, aliases: aliasesForSubject(name) })
  }

  for (const p of mockPrograms) for (const s of p.subjects) addByName(s.name)
  for (const c of mockChapterSummaries) addByName(c.subjectName)
  for (const s of mockLMSSeries) addByName(s.subject)
  return Array.from(map.values())
}

function buildChapters(subjects: CatalogEntry[]): CatalogEntry[] {
  const subjectIdByName = new Map(
    subjects.map((s) => [s.name.toLowerCase(), s.id]),
  )
  const map = new Map<string, CatalogEntry>()
  const used = new Set<string>()

  const add = (
    chapterName: string,
    subjectName: string,
    reportChapterId?: string,
  ) => {
    const key = `${subjectName.toLowerCase()}::${chapterName.trim().toLowerCase()}`
    if (!chapterName || !subjectName) return
    const existing = map.get(key)
    if (existing) {
      if (reportChapterId && !existing.reportChapterId) {
        existing.reportChapterId = reportChapterId
      }
      return
    }
    const subjectId = subjectIdByName.get(subjectName.toLowerCase())
    const slug = ensureUnique(toSlug(chapterName), used)
    map.set(key, {
      id: slug,
      name: chapterName,
      aliases: aliasesForChapter(chapterName),
      subjectId,
      reportChapterId,
    })
  }

  // From programs (chapter -> subject)
  for (const p of mockPrograms) {
    for (const s of p.subjects) {
      for (const ch of s.chapters) add(ch.name, s.name)
    }
  }
  // From chapter analytics — these carry a reportChapterId we can deep-link to
  for (const c of mockChapterSummaries) {
    add(c.chapterName, c.subjectName, c.chapterId)
  }
  // From LMS series
  for (const s of mockLMSSeries) {
    if (s.chapter) add(s.chapter, s.subject)
  }
  return Array.from(map.values())
}

function buildBatches(): CatalogEntry[] {
  const used = new Set<string>()
  return mockBatches.map((b) => ({
    id: b.id, // batches already have a stable id used in URLs
    name: b.name,
    aliases: aliasesForBatch(b.name),
    // keep slug uniqueness reserved alongside numeric ids
    ...(used.add(b.id) && {}),
  }))
}

const _subjects = buildSubjects()
const _chapters = buildChapters(_subjects)
const _batches = buildBatches()

export const voiceCatalog: VoiceCatalog = {
  subjects: _subjects,
  chapters: _chapters,
  batches: _batches,
}

/* -------------------------------------------------------------------------- */
/* Lookups                                                                     */
/* -------------------------------------------------------------------------- */

export function getSubjectById(id?: string | null): CatalogEntry | undefined {
  if (!id) return undefined
  return voiceCatalog.subjects.find((s) => s.id === id)
}

export function getChapterById(id?: string | null): CatalogEntry | undefined {
  if (!id) return undefined
  return voiceCatalog.chapters.find((c) => c.id === id)
}

export function getBatchById(id?: string | null): CatalogEntry | undefined {
  if (!id) return undefined
  return voiceCatalog.batches.find((b) => b.id === id)
}

/** Resolve a slug back to the display name a page's filter state expects. */
export function getSubjectNameById(id?: string | null): string | undefined {
  return getSubjectById(id)?.name
}
export function getChapterNameById(id?: string | null): string | undefined {
  return getChapterById(id)?.name
}

/** Compact catalog payload for the edge function (keeps prompt small). */
export function getCatalogForAI() {
  const trim = (e: CatalogEntry) => ({
    id: e.id,
    name: e.name,
    aliases: e.aliases.slice(0, 5),
    ...(e.subjectId ? { subjectId: e.subjectId } : {}),
  })
  return {
    subjects: voiceCatalog.subjects.map(trim),
    chapters: voiceCatalog.chapters.map(trim),
    batches: voiceCatalog.batches.map(trim),
  }
}
