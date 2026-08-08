import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Tablet, Smartphone, ExternalLink, Globe, X } from 'lucide-react'
import { getPortfolioThemeComponent } from './themes'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'

interface PortfolioPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  portfolio: any
  onPublishClick: () => void
}

export const PortfolioPreviewModal: React.FC<PortfolioPreviewModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onPublishClick,
}) => {
  const { addToast } = useUIStore()
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // ESC key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOpenNewTab = () => {
    try {
      sessionStorage.setItem('portfolio_preview_draft', JSON.stringify(portfolio))
      window.open('/p/preview', '_blank')
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to prepare new tab preview.' })
    }
  }

  const ThemeComponent = getPortfolioThemeComponent(portfolio?.theme_id)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex flex-col bg-background/95 backdrop-blur-xl">
        {/* Top Floating Control Bar */}
        <div className="h-16 px-6 border-b border-white/10 bg-surface-100/90 flex items-center justify-between gap-4 shrink-0 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight">Draft Preview</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
              Live Local Editor State
            </span>
          </div>

          {/* Device Viewport Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-50 border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device === 'desktop'
                  ? 'bg-primary-600 text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device === 'tablet'
                  ? 'bg-primary-600 text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device === 'mobile'
                  ? 'bg-primary-600 text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleOpenNewTab} className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-primary-400" /> Open in New Tab
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                onClose()
                onPublishClick()
              }}
              className="text-xs"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" /> Publish & Share
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
              title="Close Preview (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Render Canvas */}
        <div className="flex-1 bg-[#090a0f] overflow-y-auto flex justify-center p-4">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`transition-all duration-300 ${
              device === 'desktop'
                ? 'w-full h-full'
                : device === 'tablet'
                ? 'w-[768px] min-h-[900px] my-4 rounded-2xl border border-white/20 shadow-2xl overflow-hidden bg-background'
                : 'w-[375px] min-h-[750px] my-4 rounded-3xl border-4 border-surface-200 shadow-2xl overflow-hidden bg-background'
            }`}
          >
            {ThemeComponent ? (
              <ThemeComponent portfolio={portfolio} />
            ) : (
              <div className="flex items-center justify-center min-h-[400px] text-gray-400 font-mono text-xs">
                No preview available for theme: {portfolio?.theme_id}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
