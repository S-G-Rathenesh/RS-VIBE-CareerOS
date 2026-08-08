import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  FileText, 
  Globe, 
  Sparkles, 
  User, 
  Upload, 
  Activity, 
  History, 
  ArrowRight, 
  X,
  Briefcase,
  Loader2
} from 'lucide-react'
import { Card } from './Card'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { ROUTES } from '../../constants/routes'
import { useDebounce } from '../../hooks/useDebounce'
import api from '../../services/api'

interface SearchResult {
  id: string
  title: string
  type: 'resume' | 'portfolio' | 'job'
  subtitle?: string
}

const STATIC_ACTIONS = [
  { id: 'resumes', title: 'My Resumes', category: 'Workstations', icon: FileText, route: ROUTES.RESUMES },
  { id: 'portfolios', title: 'My Portfolios', category: 'Workstations', icon: Globe, route: ROUTES.PORTFOLIOS },
  { id: 'jobs', title: 'Job Tracker', category: 'Workstations', icon: Briefcase, route: ROUTES.JOBS },
  { id: 'ai-hub', title: 'AI Career Hub', category: 'AI Tools', icon: Sparkles, route: ROUTES.AI_HUB },
  { id: 'settings', title: 'Account Settings', category: 'Account', icon: User, route: ROUTES.SETTINGS },
  { id: 'import', title: 'Import PDF / DOCX Resume', category: 'Actions', icon: Upload, route: ROUTES.RESUMES },
]

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const debouncedQuery = useDebounce(query, 300)
  const modalRef = useFocusTrap(isOpen, () => setIsOpen(false))
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Backend search
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const res = await api.get<any, any>(`/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.success && res.data) {
          setResults(res.data)
        }
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedQuery])

  const filteredStatic = STATIC_ACTIONS.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  )

  const totalItems = filteredStatic.length + results.length

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeAction(selectedIndex)
    }
  }

  const executeAction = (index: number) => {
    if (index < filteredStatic.length) {
      handleSelectAction(filteredStatic[index].route)
    } else {
      const res = results[index - filteredStatic.length]
      if (res.type === 'resume') handleSelectAction(`/resumes/builder/${res.id}`)
      else if (res.type === 'portfolio') handleSelectAction(`/portfolios/builder/${res.id}`)
      else if (res.type === 'job') handleSelectAction(`/jobs/${res.id}`)
    }
  }

  const handleSelectAction = (route: string) => {
    navigate(route)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-md">
      <div ref={modalRef} className="w-full max-w-xl">
        <Card className="p-4 border border-white/15 glass-panel flex flex-col gap-4 shadow-2xl relative overflow-hidden">
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-3 py-2 bg-surface-50 rounded-xl border border-white/10 relative z-10">
            <Search className="w-5 h-5 text-primary-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search workstations... (Cmd+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <kbd className="px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 text-[10px] font-mono font-semibold text-gray-400">
                ESC
              </kbd>
            )}
          </div>

          {/* Action Items List */}
          <div ref={listRef} className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
            {totalItems === 0 && !loading ? (
              <div className="p-6 text-center text-xs text-gray-400">No matching results found.</div>
            ) : (
              <>
                {/* Search Results */}
                {results.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 px-3">Search Results</div>
                    {results.map((res, idx) => {
                      const listIndex = filteredStatic.length + idx
                      const isSelected = selectedIndex === listIndex
                      const IconComp = res.type === 'resume' ? FileText : res.type === 'portfolio' ? Globe : Briefcase
                      return (
                        <button
                          key={res.id}
                          onClick={() => executeAction(listIndex)}
                          onMouseEnter={() => setSelectedIndex(listIndex)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                            isSelected ? 'bg-primary-500/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                              isSelected 
                                ? 'bg-primary-500/20 border-primary-500/30 text-primary-300' 
                                : 'bg-surface-100 border-white/5 text-gray-400 group-hover:text-gray-300'
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${isSelected ? 'text-primary-300' : 'text-white group-hover:text-gray-200'}`}>
                                {res.title}
                              </span>
                              <span className="text-[10px] text-gray-400">{res.subtitle || res.type}</span>
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 transition-all ${isSelected ? 'text-primary-400 translate-x-1' : 'text-gray-600'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Static Actions */}
                {filteredStatic.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 px-3">Actions & Shortcuts</div>
                    {filteredStatic.map((act, idx) => {
                      const isSelected = selectedIndex === idx
                      const IconComp = act.icon
                      return (
                        <button
                          key={act.id}
                          onClick={() => executeAction(idx)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                            isSelected ? 'bg-primary-500/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                              isSelected 
                                ? 'bg-primary-500/20 border-primary-500/30 text-primary-300' 
                                : 'bg-surface-100 border-white/5 text-gray-400 group-hover:text-gray-300'
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${isSelected ? 'text-primary-300' : 'text-white group-hover:text-gray-200'}`}>
                                {act.title}
                              </span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{act.category}</span>
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 transition-all ${isSelected ? 'text-primary-400 translate-x-1' : 'text-gray-600'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
