// @ts-nocheck
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface RouteSpec {
  id: string
  path: string
  label: string
  examples: string[]
  needsParam?: string
}

interface BatchOpt { id: string; name: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { transcript, routes, batches } = await req.json() as {
      transcript: string
      routes: RouteSpec[]
      batches: BatchOpt[]
    }

    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing transcript' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing')

    const routeIds = routes.map(r => r.id)

    const sys = `You are a navigation intent classifier for a teacher's education platform.
Given a teacher's spoken request, pick the SINGLE best matching route id from the list.
If the route needs a batchId, pick from the provided batches by matching the spoken name loosely (e.g. "batch A physics" matches "Physics Advanced Section A").
If nothing reasonably matches, return routeId "none" with low confidence.

Available routes (id — label — examples):
${routes.map(r => `- ${r.id} — ${r.label}${r.needsParam ? ' (needs ' + r.needsParam + ')' : ''} — e.g. ${r.examples.slice(0,3).join('; ')}`).join('\n')}

Available batches (id — name):
${batches.map(b => `- ${b.id} — ${b.name}`).join('\n') || '(none)'}`

    const tool = {
      type: 'function',
      function: {
        name: 'route_intent',
        description: 'Return the best matching route.',
        parameters: {
          type: 'object',
          properties: {
            routeId: { type: 'string' },
            batchId: { type: 'string' },
            confidence: { type: 'number' },
            friendlyName: { type: 'string' },
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

    let routeId = args.routeId || 'none'
    if (routeId !== 'none' && !routeIds.includes(routeId)) routeId = 'none'

    return new Response(JSON.stringify({
      routeId,
      batchId: args.batchId || null,
      confidence: typeof args.confidence === 'number' ? args.confidence : 0,
      friendlyName: args.friendlyName || '',
      reason: args.reason || '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('voice-intent error', e)
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
