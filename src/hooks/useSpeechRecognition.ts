import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech API typing shim
type SR = any

function getSR(): SR | null {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export interface UseSpeechRecognition {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interim: string
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(): UseSpeechRecognition {
  const SR = getSR()
  const isSupported = !!SR
  const recRef = useRef<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupported) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-IN'
    rec.maxAlternatives = 1

    rec.onresult = (e: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interimText += r[0].transcript
      }
      if (finalText) setTranscript(prev => (prev + ' ' + finalText).trim())
      setInterim(interimText)
    }
    rec.onerror = (e: any) => {
      setError(e.error || 'speech_error')
      setIsListening(false)
    }
    rec.onend = () => {
      setIsListening(false)
      setInterim('')
    }
    recRef.current = rec
    return () => {
      try { rec.abort() } catch {}
    }
  }, [isSupported, SR])

  const start = useCallback(() => {
    if (!recRef.current) return
    setError(null)
    setTranscript('')
    setInterim('')
    try {
      recRef.current.start()
      setIsListening(true)
    } catch (e: any) {
      setError(e?.message || 'start_failed')
    }
  }, [])

  const stop = useCallback(() => {
    try { recRef.current?.stop() } catch {}
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterim('')
    setError(null)
  }, [])

  return { isSupported, isListening, transcript, interim, error, start, stop, reset }
}
