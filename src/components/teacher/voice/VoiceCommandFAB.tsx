import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, X, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { voiceRoutes } from '@/lib/voiceRoutes'
import { mockBatches } from '@/data/mockBatches'
import { supabase } from '@/integrations/supabase/client'

type Phase = 'idle' | 'listening' | 'thinking'

const EXAMPLES = [
  '"Show attendance"',
  '"Open batch reports"',
  '"Create assessment"',
  '"Go to lesson plans"',
  '"AI exam generator"',
  '"Open question bank"',
]

export function VoiceCommandFAB() {
  const navigate = useNavigate()
  const sr = useSpeechRecognition()
  const [phase, setPhase] = useState<Phase>('idle')
  const [open, setOpen] = useState(false)
  const [exampleIdx, setExampleIdx] = useState(0)

  // Rotate example prompts while panel is open
  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 2200)
    return () => clearInterval(t)
  }, [open])

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
          batches: mockBatches.map(b => ({ id: b.id, name: b.name })),
        },
      })
      if (error) throw error
      const { routeId, batchId, confidence, friendlyName } = data || {}

      const route = voiceRoutes.find(r => r.id === routeId)
      if (!route || routeId === 'none' || (confidence ?? 0) < 0.35) {
        toast.error("Sorry, I didn't catch that", {
          description: `Heard: "${transcript}". Try a phrase like ${EXAMPLES[0]}.`,
        })
        setPhase('idle')
        setOpen(false)
        return
      }

      let path = route.path
      if (route.needsParam === 'batchId') {
        const useBatch = batchId || mockBatches[0]?.id
        if (!useBatch) {
          toast.error('No batch found to open.')
          setPhase('idle'); setOpen(false); return
        }
        path = path.replace(':batchId', useBatch)
      }

      toast.success(`Opening ${friendlyName || route.label}`, {
        description: `Heard: "${transcript}"`,
      })
      setPhase('idle')
      setOpen(false)
      navigate(path)
    } catch (e: any) {
      console.error(e)
      toast.error('Voice command failed', { description: e?.message || 'Please try again.' })
      setPhase('idle')
    }
  }, [navigate])

  // When speech ends with a final transcript, submit
  useEffect(() => {
    if (phase === 'listening' && !sr.isListening && sr.transcript) {
      submit(sr.transcript)
    }
  }, [sr.isListening, sr.transcript, phase, submit])

  // Error handling
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

  return (
    <>
      {/* Expanded panel */}
      {open && (
        <div className="fixed bottom-28 right-6 z-[60] w-[min(360px,calc(100vw-3rem))] rounded-2xl border border-blue-100 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className={`relative inline-flex h-2 w-2 rounded-full ${phase === 'listening' ? 'bg-red-500' : phase === 'thinking' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {phase === 'listening' && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {phase === 'listening' ? 'Listening…' : phase === 'thinking' ? 'Understanding…' : 'Voice Assistant'}
              </span>
            </div>
            <button
              onClick={() => { sr.stop(); setOpen(false); setPhase('idle') }}
              className="rounded-md p-1 text-gray-500 hover:bg-white hover:text-gray-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-4 min-h-[88px] flex items-center">
            {phase === 'thinking' ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Finding the right page…
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
            <span className="text-[11px] text-gray-400">Auto-submits on pause</span>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleMicClick}
        aria-label="Voice command"
        className={`fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all
          ${phase === 'listening'
            ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110'
            : phase === 'thinking'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
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
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
    </>
  )
}
