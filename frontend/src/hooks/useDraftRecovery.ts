import { useEffect, useRef, useState } from 'react'

const DRAFT_PREFIX = 'exploreme_draft_'

export function useDraftRecovery<T>(
  key: string,
  dbData: T | null,
  onRestore: (draftData: T) => void,
  onDiscard: () => void
) {
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false)
  const draftKey = `${DRAFT_PREFIX}${key}`
  const initialLoadDone = useRef(false)

  // 1. On mount and when dbData is loaded, check for local drafts
  useEffect(() => {
    if (!dbData || initialLoadDone.current) return
    initialLoadDone.current = true

    const localDraftString = localStorage.getItem(draftKey)
    if (localDraftString) {
      try {
        const { timestamp, data } = JSON.parse(localDraftString)
        
        // Check if data is actually different
        if (JSON.stringify(data) !== JSON.stringify(dbData)) {
          // In a real app, you might compare timestamps if dbData has an `updated_at`.
          // Here, we just assume if a draft exists and differs, it might be unsaved.
          setHasUnsavedDraft(true)
        } else {
          // Same data, clear redundant draft
          localStorage.removeItem(draftKey)
        }
      } catch (err) {
        localStorage.removeItem(draftKey)
      }
    }
  }, [dbData, draftKey])

  // 2. Expose a way to save drafts manually (usually tied into every state update or debounced)
  const saveDraft = (data: T) => {
    if (!data) return
    localStorage.setItem(draftKey, JSON.stringify({
      timestamp: new Date().toISOString(),
      data
    }))
  }

  // 3. Clear draft when saving to DB is successful
  const clearDraft = () => {
    localStorage.removeItem(draftKey)
    setHasUnsavedDraft(false)
  }

  const handleRestore = () => {
    const localDraftString = localStorage.getItem(draftKey)
    if (localDraftString) {
      try {
        const { data } = JSON.parse(localDraftString)
        onRestore(data)
      } catch {}
    }
    setHasUnsavedDraft(false)
  }

  const handleDiscard = () => {
    clearDraft()
    onDiscard()
  }

  return {
    hasUnsavedDraft,
    saveDraft,
    clearDraft,
    handleRestore,
    handleDiscard
  }
}
