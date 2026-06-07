import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, X, Loader2, Sparkles, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { voiceRoutes, type VoiceFilterField } from '@/lib/voiceRoutes'
import {
  getCatalogForAI,
  getBatchById,
  getChapterById,
  getSubjectById,
  voiceCatalog,
} from '@/lib/voiceCatalog'
import { supabase } from '@/integrations/supabase/client'

type Phase = 'idle' | 'listening' | 'thinking' | 'clarifying'

interface IntentResponse {
  routeId: string
  filters: { subjectId: string | null; chapterId: string | null; batchId: string | null }
  confidence: number
  friendlyName: string
  needsClarification: boolean
  clarifyField: VoiceFilterField | null
  candidates: { id: string; name: string; confidence: number }[]
  reason?: string
}

interface PendingNav {
  routeId: string
  subjectId: string | null
  chapterId: string | null
  batchId: string | null
  friendlyName: string
  transcript: string
}

const EXAMPLES = [
  '"Physics lesson plans"',
  '"PHY 101 programs of Section A"',
  '"Kinematics report"',
  '"Open chemistry attendance"',
  '"Show motion chapter analytics"',
  '"Open Section A programs"',
]

export function VoiceCommandFAB() {
  const navigate = useNavigate()
  const sr = useSpeechRecognition()
  const [phase, setPhase] = useState<Phase>('idle')
  const [open, setOpen] = useState(false)
  const [exampleIdx, setExampleIdx] = useState(0)
  const [pending, setPending] = useState<PendingNav | null>(null)
  const [clarify, setClarify] = useState<{
    field: VoiceFilterField
    options: { id: string; name: string }[]
  } | null>(null)

  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 2200)
    return () => clearInterval(t)
  }, [open])

  const lookupName = useCallback((field: VoiceFilterField, id: string | null) => {
    if (!id) return null
    if (field === 'subjectId') return getSubjectById(id)?.name || null
    if (field === 'chapterId') return getChapterById(id)?.name || null
    if (field === 'batchId') return getBatchById(id)?.name || null
    return null
  }, [])

  const finalizeNavigation = useCallback((p: PendingNav) => {
    const route = voiceRoutes.find(r => r.id === p.routeId)
    if (!route) {
      toast.error('Route not found')
      return
    }

    // Resolve batchId for routes that need it as a path param
    let resolvedBatchId = p.batchId
    if (route.needsParam === 'batchId' && !resolvedBatchId) {
      resolvedBatchId = voiceCatalog.batches[0]?.id || null
      if (!resolvedBatchId) {
        toast.error('No section found to open.')
        return
      }
    }

    let path = route.path
    if (route.needsParam === 'batchId' && resolvedBatchId) {
      path = path.replace(':batchId', resolvedBatchId)
    }

    // Deep-jump: chapter analytics → detail page when we have a real chapterId
    if (route.id === 'reports.chapter' && p.chapterId) {
      const ch = getChapterById(p.chapterId)
      if (ch?.reportChapterId) {
        path = `/teacher/reports/chapter-analytics/${ch.reportChapterId}`
      }
    }

    // Append supported filter slugs as query params
    const qs = new URLSearchParams()
    const supported = route.supportedFilters || []
    if (supported.includes('subjectId') && p.subjectId) qs.set('subject', p.subjectId)
    if (supported.includes('chapterId') && p.chapterId) qs.set('chapter', p.chapterId)
    if (supported.includes('batchId') && resolvedBatchId && route.needsParam !== 'batchId') {
      qs.set('batch', resolvedBatchId)
    }
    if ([...qs.keys()].length > 0) path += `?${qs.toString()}`

    // Build friendly toast description
    const ctx: string[] = []
    if (p.subjectId) ctx.push(getSubjectById(p.subjectId)?.name || '')
    if (p.chapterId) ctx.push(getChapterById(p.chapterId)?.name || '')
    if (resolvedBatchId) ctx.push(getBatchById(resolvedBatchId)?.name || '')
    const ctxStr = ctx.filter(Boolean).join(' · ')

    toast.success(`Opening ${p.friendlyName || route.label}`, {
      description: ctxStr ? `${ctxStr}\nHeard: "${p.transcript}"` : `Heard: "${p.transcript}"`,
    })
    setPhase('idle')
    setOpen(false)
    setPending(null)
    setClarify(null)
    navigate(path)
  }, [navigate])

  const submit = useCallback(async (transcript: string) => {
    if (!transcript.trim()) {
      setPhase('idle')
      return
    }
    setPhase('thinking')
    try {
      const { data, error } = await supabase.functions.invoke('voice-intent', {
        body: {
          transcript,
          routes: voiceRoutes,
          catalog: getCatalogForAI(),
        },
      })
      if (error) throw error
      const intent = data as IntentResponse
      const { routeId, filters, confidence, friendlyName } = intent

      const route = voiceRoutes.find(r => r.id === routeId)
      if (!route || routeId === 'none' || (confidence ?? 0) < 0.35) {
        toast.error("Sorry, I didn't catch that", {
          description: `Heard: "${transcript}". Try a phrase like ${EXAMPLES[0]}.`,
        })
        setPhase('idle')
        setOpen(false)
        return
      }

      const next: PendingNav = {
        routeId,
        subjectId: filters?.subjectId || null,
        chapterId: filters?.chapterId || null,
        batchId: filters?.batchId || null,
        friendlyName: friendlyName || route.label,
        transcript,
      }

      // Clarification needed?
      if (intent.needsClarification && intent.clarifyField && intent.candidates.length > 1) {
        setPending(next)
        setClarify({
          field: intent.clarifyField,
          options: intent.candidates.slice(0, 3).map(c => ({
            id: c.id,
            name: lookupName(intent.clarifyField!, c.id) || c.name,
          })),
        })
        setPhase('clarifying')
        return
      }

      finalizeNavigation(next)
    } catch (e: any) {
      console.error(e)
      toast.error('Voice command failed', { description: e?.message || 'Please try again.' })
      setPhase('idle')
    }
  }, [finalizeNavigation, lookupName])

  // Submit when speech ends with a final transcript
  useEffect(() => {
    if (phase === 'listening' && !sr.isListening && sr.transcript) {
      submit(sr.transcript)
    }
  }, [sr.isListening, sr.transcript, phase, submit])

  useEffect(() => {
    if (sr.error) {
      const msg = sr.error === 'not-allowed'
        ? 'Microphone permission denied'
        : sr.error === 'no-speech' ? 'No speech detected'
        : `Mic error: ${sr.error}`
      toast.error(msg)
      setPhase('idle')
    }
  }, [sr.error])

  const handleMicClick = useCallback(() => {
    if (!sr.isSupported) {
      toast.error('Voice not supported in this browser', {
        description: 'Try Chrome, Edge, or Safari.',
      })
      return
    }
    if (phase === 'idle') {
      setOpen(true)
      setPhase('listening')
      sr.start()
    } else if (phase === 'listening') {
      sr.stop()
    }
  }, [phase, sr])

  const handleClarifyPick = (id: string) => {
    if (!pending || !clarify) return
    const next: PendingNav = { ...pending, [clarify.field === 'subjectId' ? 'subjectId' : clarify.field === 'chapterId' ? 'chapterId' : 'batchId']: id } as PendingNav
    finalizeNavigation(next)
  }

  const handleClose = () => {
    sr.stop()
    setOpen(false)
    setPhase('idle')
    setPending(null)
    setClarify(null)
  }

  // Alt+M shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault()
        handleMicClick()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMicClick])

  if (!sr.isSupported) return null

  const liveText = (sr.transcript + ' ' + sr.interim).trim()
  const fieldLabel = clarify?.field === 'subjectId' ? 'subject' : clarify?.field === 'chapterId' ? 'chapter' : 'section'

  return (
    <>
      {open && (
        <div className="fixed bottom-28 right-6 z-[60] w-[min(380px,calc(100vw-3rem))] rounded-2xl border border-blue-100 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className={`relative inline-flex h-2 w-2 rounded-full ${phase === 'listening' ? 'bg-red-500' : phase === 'thinking' ? 'bg-amber-500' : phase === 'clarifying' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                {phase === 'listening' && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {phase === 'listening' ? 'Listening…'
                  : phase === 'thinking' ? 'Understanding…'
                  : phase === 'clarifying' ? 'Quick check'
                  : 'Voice Assistant'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-gray-500 hover:bg-white hover:text-gray-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-4 min-h-[88px]">
            {phase === 'thinking' ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Finding the right page…
              </div>
            ) : phase === 'clarifying' && clarify ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    Which <span className="font-semibold">{fieldLabel}</span> did you mean?
                    <p className="text-xs text-gray-500 mt-0.5">Heard: "{pending?.transcript}"</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clarify.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleClarifyPick(opt.id)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-sm text-indigo-800 font-medium hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : liveText ? (
              <p className="text-sm text-gray-900 leading-relaxed">{liveText}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-gray-400">Try saying</p>
                <p className="text-sm text-indigo-700 font-medium transition-all">
                  {EXAMPLES[exampleIdx]}
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Powered by AI · Alt+M
            </span>
            <span className="text-[11px] text-gray-400">
              {phase === 'clarifying' ? 'Tap to pick' : 'Auto-submits on pause'}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleMicClick}
        aria-label="Voice command"
        className={`fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all
          ${phase === 'listening'
            ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110'
            : phase === 'thinking'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : phase === 'clarifying'
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-105'}`}
      >
        {phase === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 opacity-40 animate-ping" />
            <span className="absolute inset-[-6px] rounded-full bg-red-400 opacity-20 animate-ping [animation-delay:200ms]" />
          </>
        )}
        {phase === 'thinking' ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : phase === 'listening' ? (
          <MicOff className="h-6 w-6 relative" />
        ) : phase === 'clarifying' ? (
          <HelpCircle className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
    </>
  )
}
