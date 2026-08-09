import { useEffect } from 'react'
import { useUIStore } from '../store/useUIStore'

/**
 * A production-only deterrence hook to discourage casual inspection via developer tools.
 * It prevents the context menu and blocks common keyboard shortcuts.
 */
export function useDevToolsDeterrence() {
  const { addToast } = useUIStore()

  useEffect(() => {
    // Only enable deterrence in production environments
    if (!import.meta.env.PROD) {
      return
    }

    let lastToastTime = 0
    const TOAST_COOLDOWN = 5000 // 5 seconds between warning toasts

    const warnUser = () => {
      const now = Date.now()
      if (now - lastToastTime > TOAST_COOLDOWN) {
        addToast({
          type: 'warning',
          message: 'Developer tools are restricted on this site.',
        })
        lastToastTime = now
      }
    }

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      warnUser()
    }

    // Block common developer tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow normal typing/shortcuts inside inputs, textareas, and contenteditable elements
      // unless it's a specific DevTools shortcut that we always want to block.
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        warnUser()
        return
      }

      // Detect Ctrl (Windows/Linux) or Cmd (Mac)
      const isCmdOrCtrl = e.ctrlKey || e.metaKey

      if (isCmdOrCtrl) {
        // Block Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
        // Block Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)
        // Block Ctrl+Shift+C (Windows) or Cmd+Option+C (Mac)
        const isIJC = ['i', 'j', 'c'].includes(e.key.toLowerCase())
        if (e.shiftKey || e.altKey) {
            if (isIJC) {
                e.preventDefault()
                warnUser()
                return
            }
        }

        // Block Ctrl+U (Windows) or Cmd+Option+U (Mac) / Cmd+U
        if (e.key.toLowerCase() === 'u') {
            // We allow Ctrl+U inside inputs for potential rich text editing, but block it globally for view source
            if (!isInput) {
                e.preventDefault()
                warnUser()
                return
            }
            if (e.altKey) { // Mac Cmd+Option+U
                e.preventDefault()
                warnUser()
                return
            }
        }
      }
    }

    // Register event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [addToast])
}
