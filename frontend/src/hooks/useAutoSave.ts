import { useState, useEffect, useRef, useCallback } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delayMs: number = 2000
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const initialDataRef = useRef<T>(data)
  const isFirstRender = useRef(true)

  // Memoize the data for deep comparison if needed, or rely on referential equality
  // For simplicity, we just trigger when the data reference changes.

  const triggerSave = useCallback(async (dataToSave: T) => {
    setStatus('saving')
    try {
      await saveFn(dataToSave)
      setStatus('saved')
      setLastSaved(new Date())
      
      // Reset back to idle after a few seconds
      setTimeout(() => {
        setStatus((current) => (current === 'saved' ? 'idle' : current))
      }, 3000)
    } catch (error) {
      console.error('Autosave failed:', error)
      setStatus('error')
    }
  }, [saveFn])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Skip if data hasn't changed from initial
    if (JSON.stringify(initialDataRef.current) === JSON.stringify(data)) {
      return
    }

    setStatus('idle') // show pending state

    const handler = setTimeout(() => {
      triggerSave(data)
    }, delayMs)

    return () => clearTimeout(handler)
  }, [data, delayMs, triggerSave])

  return {
    status,
    lastSaved,
    triggerSave, // allow manual triggering if needed (e.g. on Ctrl+S)
  }
}
