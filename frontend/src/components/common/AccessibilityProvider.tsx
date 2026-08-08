import React, { createContext, useContext, useState } from 'react'

interface AccessibilityContextType {
  announceMessage: (msg: string) => void
  highContrast: boolean
  toggleHighContrast: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcement, setAnnouncement] = useState('')
  const [highContrast, setHighContrast] = useState(false)

  const announceMessage = (msg: string) => {
    setAnnouncement(msg)
    setTimeout(() => setAnnouncement(''), 3000)
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
  }

  return (
    <AccessibilityContext.Provider value={{ announceMessage, highContrast, toggleHighContrast }}>
      <div className={highContrast ? 'contrast-125 saturate-150' : ''}>
        {/* ARIA Live Region for Screen Readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
  return ctx
}
