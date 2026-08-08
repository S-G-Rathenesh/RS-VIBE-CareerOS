import { useState, useCallback } from 'react'
import { useShortcuts } from './useShortcuts'

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initialState)
  const [future, setFuture] = useState<T[]>([])

  const set = useCallback((newState: T | ((curr: T) => T)) => {
    setPresent((current) => {
      const resolvedState = typeof newState === 'function' ? (newState as Function)(current) : newState
      
      // Don't save if state hasn't changed (simple reference check, can be upgraded to deep equal if needed)
      if (current === resolvedState) return current

      setPast((p) => {
        const newPast = [...p, current]
        if (newPast.length > maxHistory) {
          newPast.shift() // Remove oldest state if we exceed max history
        }
        return newPast
      })
      setFuture([]) // Clear future when a new action is taken
      
      return resolvedState
    })
  }, [maxHistory])

  const undo = useCallback(() => {
    if (past.length === 0) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)

    setPast(newPast)
    setFuture([present, ...future])
    setPresent(previous)
  }, [past, present, future])

  const redo = useCallback(() => {
    if (future.length === 0) return

    const next = future[0]
    const newFuture = future.slice(1)

    setPast([...past, present])
    setFuture(newFuture)
    setPresent(next)
  }, [past, present, future])

  const reset = useCallback((newInitialState: T) => {
    setPast([])
    setPresent(newInitialState)
    setFuture([])
  }, [])

  // Register keyboard shortcuts
  useShortcuts([
    { key: 'z', ctrl: true, shift: false, handler: undo, description: 'Undo' },
    { key: 'z', ctrl: true, shift: true, handler: redo, description: 'Redo' },
  ])

  return {
    state: present,
    set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
  }
}
