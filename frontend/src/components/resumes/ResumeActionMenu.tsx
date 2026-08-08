import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Copy, Trash2, Sparkles, FolderDown, Download, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ActionMenuOption = 
  | 'open_studio' 
  | 'duplicate' 
  | 'create_version' 
  | 'run_ats' 
  | 'generate_portfolio' 
  | 'rename' 
  | 'archive' 
  | 'delete'

interface ResumeActionMenuProps {
  onAction: (action: ActionMenuOption) => void
  isParent?: boolean
  className?: string
  onOpenChange?: (isOpen: boolean) => void
}

export const ResumeActionMenu: React.FC<ResumeActionMenuProps> = ({ 
  onAction, 
  isParent = true,
  className = '',
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (action: ActionMenuOption, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(false)
    onOpenChange?.(false)
    onAction(action)
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const nextState = !isOpen
          setIsOpen(nextState)
          onOpenChange?.(nextState)
        }}
        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-1 w-48 bg-surface-100 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex flex-col p-1 text-xs font-medium">
              <button 
                onClick={(e) => handleSelect('open_studio', e)}
                className="flex items-center w-full px-3 py-2 text-left text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Open Studio
              </button>
              
              <button 
                onClick={(e) => handleSelect('duplicate', e)}
                className="flex items-center w-full px-3 py-2 text-left text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
              </button>

              {isParent && (
                <>
                  <button 
                    onClick={(e) => handleSelect('create_version', e)}
                    className="flex items-center w-full px-3 py-2 text-left text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2" /> Tailored Version
                  </button>
                  <button 
                    onClick={(e) => handleSelect('run_ats', e)}
                    className="flex items-center w-full px-3 py-2 text-left text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Run ATS Audit
                  </button>
                  <button 
                    onClick={(e) => handleSelect('generate_portfolio', e)}
                    className="flex items-center w-full px-3 py-2 text-left text-accent-pink hover:bg-accent-pink/10 rounded-lg transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 mr-2" /> Generate Portfolio
                  </button>
                </>
              )}

              <button 
                onClick={(e) => handleSelect('rename', e)}
                className="flex items-center w-full px-3 py-2 text-left text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
              </button>

              <div className="h-px bg-white/10 my-1 mx-2" />

              <button 
                onClick={(e) => handleSelect('archive', e)}
                className="flex items-center w-full px-3 py-2 text-left text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                <FolderDown className="w-3.5 h-3.5 mr-2" /> Archive
              </button>
              
              <button 
                onClick={(e) => handleSelect('delete', e)}
                className="flex items-center w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2 group-hover:animate-pulse" /> Delete Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
