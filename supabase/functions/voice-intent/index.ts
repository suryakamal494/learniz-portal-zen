// @ts-nocheck
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface RouteSpec {
  id: string
  path: string
  label: string
  examples: string[]
  needsParam?: string
  supportedFilters?: string[]
}
interface Entry { id: string; name: string; aliases: string[]; subjectId?: string }
interface Catalog { subjects: Entry[]; chapters: Entry[]; batches: Entry[] }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { transcript, routes, catalog } = await req.json() as {
      transcript: string
      routes: RouteSpec[]
      catalog: Catalog
    }

    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing transcript' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing')

    const routeIds = new Set(routes.map(r => r.id))
    const subjectIds = new Set(catalog.subjects.map(s => s.id))
    const chapterIds = new Set(catalog.chapters.map(c => c.id))
    const batchIds = new Set(catalog.batches.map(b => b.id))

    const fmtList = (entries: Entry[]) =>
      entries.map(e => `  - ${e.id} (${e.name})${e.aliases.length ? ' aka ' + e.aliases.join(', ') : ''}${e.subjectId ? ' [subject=' + e.subjectId + ']' : ''}`).join('\n')

    const sys = `You are a navigation intent classifier for a teacher's education platform.

Your job: given a spoken request, pick the best matching ROUTE and any context FILTERS (subject, chapter, batch).

RULES:
1. Always return slugs (the id values), never the user's raw words.
2. Match SEMANTICALLY using names + aliases — "PHY", "phy 101", "physics 11" all = subject id "physics". "Kinematics" matches "Motion in a Straight Line" if it's the closest match.
3. Only include a filter if the route's supportedFilters list it AND the user clearly referenced that entity.
4. If chapterId is set, prefer setting its parent subjectId too (use the [subject=...] hint).
5. If two or more candidates are roughly equally plausible for the SAME field (confidence within ~0.15 of each other), set needsClarification=true and put the top 2-3 in candidates[] for that field. Pick the leader as the primary value.
6. If nothing reasonably matches, return routeId="none" with low confidence.

ROUTES (id — label — supportedFilters — examples):
${routes.map(r => `- ${r.id} — ${r.label}${r.needsParam ? ' [needs ' + r.needsParam + ']' : ''}${r.supportedFilters?.length ? ' [filters: ' + r.supportedFilters.join(',') + ']' : ''} — ${r.examples.slice(0, 3).join('; ')}`).join('\n')}

SUBJECTS:
${fmtList(catalog.subjects)}

CHAPTERS:
${fmtList(catalog.chapters)}

BATCHES:
${fmtList(catalog.batches)}`

    const tool = {
      type: 'function',
      function: {
        name: 'route_intent',
        description: 'Return the best matching route and context filters.',
        parameters: {
          type: 'object',
          properties: {
            routeId: { type: 'string' },
            subjectId: { type: 'string' },
            chapterId: { type: 'string' },
            batchId: { type: 'string' },
            confidence: { type: 'number' },
            friendlyName: { type: 'string' },
            needsClarification: { type: 'boolean' },
            clarifyField: { type: 'string', description: 'subjectId | chapterId | batchId' },
            candidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  confidence: { type: 'number' },
                },
              },
            },
            reason: { type: 'string' },
          },
          required: ['routeId', 'confidence', 'friendlyName'],
        },
      },
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: transcript },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: 'route_intent' } },
      }),
    })

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit reached. Try again shortly.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!resp.ok) {
      const t = await resp.text()
      console.error('AI gateway error', resp.status, t)
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await resp.json()
    const call = data?.choices?.[0]?.message?.tool_calls?.[0]
    const args = call ? JSON.parse(call.function.arguments || '{}') : {}

    // Validate ids against catalog — drop anything hallucinated.
    let routeId = args.routeId || 'none'
    if (routeId !== 'none' && !routeIds.has(routeId)) routeId = 'none'

    const subjectId = subjectIds.has(args.subjectId) ? args.subjectId : null
    const chapterId = chapterIds.has(args.chapterId) ? args.chapterId : null
    const batchId = batchIds.has(args.batchId) ? args.batchId : null

    const candidates = Array.isArray(args.candidates)
      ? args.candidates
          .filter((c: any) => c && typeof c.id === 'string')
          .map((c: any) => ({ id: c.id, name: c.name || c.id, confidence: c.confidence ?? 0 }))
      : []

    return new Response(JSON.stringify({
      routeId,
      filters: { subjectId, chapterId, batchId },
      confidence: typeof args.confidence === 'number' ? args.confidence : 0,
      friendlyName: args.friendlyName || '',
      needsClarification: !!args.needsClarification && candidates.length > 1,
      clarifyField: args.clarifyField || null,
      candidates,
      reason: args.reason || '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('voice-intent error', e)
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
