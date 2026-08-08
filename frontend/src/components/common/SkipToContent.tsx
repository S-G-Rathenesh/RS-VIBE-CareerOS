import React from 'react'

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl shadow-glow-primary border border-primary-400"
    >
      Skip to main content
    </a>
  )
}
