import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Save, Globe, Eye, ArrowLeft, Sparkles, Download, 
  Trash2, Plus, MoveUp, MoveDown, Wand2 
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { PortfolioPublishModal } from '../../components/portfolios/PortfolioPublishModal'
import { PortfolioImportModal } from '../../components/portfolios/PortfolioImportModal'
import { PortfolioPreviewModal } from '../../components/portfolios/PortfolioPreviewModal'
import { AIEnhancerModal } from '../../components/resumes/AIEnhancerModal'
import { MediaUploader } from '../../components/common/MediaUploader'
import { PORTFOLIO_THEME_REGISTRY, getPortfolioThemeComponent } from '../../components/portfolios/themes'
import { ROUTES } from '../../constants/routes'
import { useUIStore } from '../../store/useUIStore'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useDraftRecovery } from '../../hooks/useDraftRecovery'
import api from '../../services/api'

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About Me' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'education', label: 'Education' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'contact', label: 'Social & Contact' },
  { key: 'seo', label: 'SEO Config' },
  { key: 'theme', label: 'Theme' },
  { key: 'analytics', label: 'Analytics' },
]

export const PortfolioBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useUIStore()

  const [saving, setSaving] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const [showEnhancerModal, setShowEnhancerModal] = useState(false)
  const [enhancerTargetText, setEnhancerTargetText] = useState('')
  const [enhancerSectionType, setEnhancerSectionType] = useState('summary')
  const [enhancerApplyCallback, setEnhancerApplyCallback] = useState<((enhanced: string) => void) | null>(null)
  
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const initialPortfolioState = {
    title: 'My Career Portfolio',
    tagline: 'Professional Developer & Engineer',
    hero_tagline: 'Professional Developer & Engineer',
    bio: '',
    location: '',
    availability: 'Available for hire',
    cta_text: 'Get In Touch',
    cta_link: '#contact',
    theme_id: 'developer_dark',
    slug: 'my-portfolio',
    is_published: false,
    avatar_url: '',
    email: '',
    contact: { email: '', phone: '', location: '' },
    social_links: { github: '', linkedin: '', twitter: '', website: '', email: '' },
    projects: [],
    skills: [],
    experience: [],
    education: [],
    certificates: [],
    about: {
      full_name: 'My Career Portfolio',
      professional_title: 'Professional Developer & Engineer',
      bio: '',
      location: '',
      availability: 'Available for hire',
      avatar_url: '',
      cta_text: 'Get In Touch',
      cta_link: '#contact'
    },
    seo_config: { meta_title: '', meta_description: '', keywords: [] },
    theme_config: {
      accent_color: '#6366f1',
      font_family: 'sans',
      layout_variant: 'standard',
      border_radius: 'md',
      glass_intensity: 'medium'
    }
  }

  const { state: portfolio, set: setPortfolio, undo, redo, canUndo, canRedo, reset } = useUndoRedo<any>(initialPortfolioState)

  const handleSaveToDB = async (dataToSave: any) => {
    const targetId = dataToSave.id || id
    if (!targetId || targetId === 'new') return // Prevent auto-save from failing on uncreated portfolios
    await api.put(`/portfolios/${targetId}`, dataToSave)
  }

  const { status: saveStatus, triggerSave } = useAutoSave(portfolio, handleSaveToDB)

  // Draft recovery
  const { hasUnsavedDraft, saveDraft, clearDraft, handleRestore, handleDiscard } = useDraftRecovery(
    `portfolio_${id}`,
    portfolio,
    (draft) => setPortfolio(draft),
    () => {} 
  )

  useEffect(() => {
    if (portfolio !== initialPortfolioState) {
      saveDraft(portfolio)
    }
  }, [portfolio, saveDraft])

  useEffect(() => {
    if (id && id !== 'new') {
      api.get<any, any>(`/portfolios/${id}`)
        .then((res) => {
          if (res.success && res.data) {
            reset({ ...initialPortfolioState, ...res.data })
            clearDraft()
          }
        })
        .catch(() => {})
    }
  }, [id, reset, clearDraft])

  useEffect(() => {
    if (activeTab === 'analytics' && id && id !== 'new' && !analyticsData) {
      setLoadingAnalytics(true)
      api.get<any, any>(`/portfolios/${id}/analytics?timeframe=30d`)
        .then((res) => {
          if (res.success && res.data) setAnalyticsData(res.data)
        })
        .catch(() => {})
        .finally(() => setLoadingAnalytics(false))
    }
  }, [activeTab, id, analyticsData])

  const handleSave = async () => {
    setSaving(true)
    try {
      if ((!id || id === 'new') && !portfolio.id) {
        // Create new portfolio
        const res = await api.post<any, any>('/portfolios', portfolio)
        if (res.success && res.data) {
          const newId = res.data.id
          setPortfolio({ ...portfolio, ...res.data })
          window.history.replaceState(null, '', `/portfolios/builder/${newId}`)
          clearDraft()
          addToast({ type: 'success', message: 'Portfolio created successfully!' })
        }
      } else {
        await triggerSave(portfolio)
        clearDraft()
        addToast({ type: 'success', message: 'Portfolio changes saved!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Saved locally.' })
    } finally {
      setSaving(false)
    }
  }

  const handleApplyImport = (importedData: any) => {
    setPortfolio({
      ...portfolio,
      ...importedData
    })
  }

  const openEnhancer = useCallback((text: string, type: string, callback: (enhanced: string) => void) => {
    setEnhancerTargetText(text)
    setEnhancerSectionType(type)
    setEnhancerApplyCallback(() => callback)
    setShowEnhancerModal(true)
  }, [])

  /* ─── Array Helpers ─── */
  const addArrayItem = (field: string, defaultObj: any) => {
    setPortfolio({ ...portfolio, [field]: [...(portfolio[field] || []), defaultObj] })
  }
  
  const updateArrayItem = (field: string, index: number, key: string, value: any) => {
    const arr = [...(portfolio[field] || [])]
    arr[index] = { ...arr[index], [key]: value }
    setPortfolio({ ...portfolio, [field]: arr })
  }

  const removeArrayItem = (field: string, index: number) => {
    const arr = [...(portfolio[field] || [])]
    arr.splice(index, 1)
    setPortfolio({ ...portfolio, [field]: arr })
  }

  const moveArrayItem = (field: string, index: number, direction: 'up'|'down') => {
    const arr = [...(portfolio[field] || [])]
    if (direction === 'up' && index > 0) {
      const temp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = temp
    } else if (direction === 'down' && index < arr.length - 1) {
      const temp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = temp
    }
    setPortfolio({ ...portfolio, [field]: arr })
  }

  // Generic render for Preview Canvas
  const PreviewComponent = getPortfolioThemeComponent(portfolio.theme_id)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -my-4 -mx-4">
      {hasUnsavedDraft && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-100 border border-primary-500/30 p-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10">
          <span className="text-xs text-white">An unsaved draft was found.</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="glow" onClick={handleRestore}>Restore Draft</Button>
            <Button size="sm" variant="ghost" onClick={handleDiscard}>Discard</Button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.PORTFOLIOS} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            className="bg-transparent text-lg font-bold text-white focus:outline-none focus:border-b border-primary-500 max-w-xs"
            value={portfolio.title || ''}
            onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })}
            placeholder="Portfolio Title"
          />
          <span className="px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-[10px] font-semibold uppercase">
            {portfolio.theme_id}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-2 bg-surface-50 p-1 rounded-lg border border-white/5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md ${canUndo ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed'}`}
              title="Undo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3l-3 2.7"/></svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md ${canRedo ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed'}`}
              title="Redo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.setItem('portfolio_preview_draft', JSON.stringify(portfolio))
              setShowPreviewModal(true)
            }}
          >
            <Eye className="w-4 h-4 text-emerald-400 mr-1" /> Preview
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)} className="hidden md:flex border-accent-pink text-accent-pink hover:bg-accent-pink/10">
            <Download className="w-4 h-4 mr-1" /> Import Content
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowPublishModal(true)}>
            <Globe className="w-4 h-4 mr-1 text-primary-400" /> Publish & SEO
          </Button>

          <Button variant="glow" size="sm" isLoading={saving || saveStatus === 'saving'} onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Studio Workstation */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Editor Controls */}
        <div className="w-[420px] glass-panel border-r border-white/10 flex flex-col shrink-0">
          <div className="flex flex-wrap p-3 border-b border-white/5 gap-1.5 shrink-0 justify-start">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-primary-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Configuration</h3>
                <Input label="Portfolio Title (Internal)" value={portfolio.title || ''} onChange={e => setPortfolio({...portfolio, title: e.target.value})} />
                <Input label="URL Slug" value={portfolio.slug || ''} onChange={e => setPortfolio({...portfolio, slug: e.target.value})} placeholder="e.g. john-doe" />
                <Input label="Custom Domain (Optional)" value={portfolio.custom_domain || ''} onChange={e => setPortfolio({...portfolio, custom_domain: e.target.value})} placeholder="e.g. johndoe.dev" />
              </div>
            )}

            {/* 1. HERO SECTION EDITOR */}
            {activeTab === 'hero' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hero Section</h3>
                  <span className="text-[10px] text-gray-400 font-mono">First Impression</span>
                </div>
                
                <Input 
                  label="Name / Headline Title" 
                  value={portfolio.hero?.name || portfolio.title || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      title: val,
                      hero: { ...(portfolio.hero || {}), name: val }
                    })
                  }} 
                  placeholder="e.g. Alex Vance"
                />

                <Input 
                  label="Professional Title" 
                  value={portfolio.hero?.title || portfolio.about?.professional_title || portfolio.hero_tagline || portfolio.tagline || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      hero_tagline: val,
                      tagline: val,
                      hero: { ...(portfolio.hero || {}), title: val }
                    })
                  }} 
                  placeholder="e.g. Senior Full-Stack Engineer & AI Specialist"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-300">Short Hero Tagline (1–2 lines max)</label>
                  <textarea 
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-20"
                    value={portfolio.hero?.short_tagline || portfolio.hero_tagline || portfolio.tagline || ''}
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        hero_tagline: val,
                        hero: { ...(portfolio.hero || {}), short_tagline: val }
                      })
                    }}
                    placeholder="e.g. Building scalable web platforms & AI-driven developer tooling."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-300">Hero Layout Alignment</label>
                  <select 
                    className="bg-surface-50 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-primary-500"
                    value={portfolio.hero?.alignment || 'center'}
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        hero: { ...(portfolio.hero || {}), alignment: val }
                      })
                    }}
                  >
                    <option value="center">Centered Minimal</option>
                    <option value="left">Left Aligned</option>
                    <option value="split">Split Screen Hero</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-300">Hero Profile Image</label>
                  <MediaUploader 
                    category="avatar"
                    currentUrl={portfolio.hero?.profile_image || portfolio.avatar_url || ''}
                    onUploadSuccess={(url) => {
                      setPortfolio({
                        ...portfolio,
                        avatar_url: url,
                        hero: { ...(portfolio.hero || {}), profile_image: url },
                        about: { ...(portfolio.about || {}), profile_image: url, avatar_url: url }
                      })
                    }}
                  />
                  <Input 
                    label="Or Image Direct URL" 
                    value={portfolio.hero?.profile_image || portfolio.avatar_url || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        avatar_url: val,
                        hero: { ...(portfolio.hero || {}), profile_image: val },
                        about: { ...(portfolio.about || {}), profile_image: val, avatar_url: val }
                      })
                    }} 
                    placeholder="https://..."
                  />
                </div>

                <Input 
                  label="Hero Background Image URL (Optional)" 
                  value={portfolio.hero?.background_url || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      hero: { ...(portfolio.hero || {}), background_url: val }
                    })
                  }} 
                  placeholder="https://..."
                />

                <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Call To Action</h4>
                  <Input 
                    label="Primary Button Label" 
                    value={portfolio.hero?.primary_cta?.label || portfolio.cta_text || 'Get In Touch'} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        cta_text: val,
                        hero: { ...(portfolio.hero || {}), primary_cta: { ...(portfolio.hero?.primary_cta || {}), label: val } }
                      })
                    }} 
                    placeholder="Get In Touch"
                  />
                  <Input 
                    label="Primary Button Link" 
                    value={portfolio.hero?.primary_cta?.link || portfolio.cta_link || '#contact'} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        cta_link: val,
                        hero: { ...(portfolio.hero || {}), primary_cta: { ...(portfolio.hero?.primary_cta || {}), link: val } }
                      })
                    }} 
                    placeholder="#contact"
                  />
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secondary Call To Action</h4>
                  <Input 
                    label="Secondary Button Label" 
                    value={portfolio.hero?.secondary_cta?.label || 'View Projects'} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        hero: { ...(portfolio.hero || {}), secondary_cta: { ...(portfolio.hero?.secondary_cta || {}), label: val } }
                      })
                    }} 
                    placeholder="View Projects"
                  />
                  <Input 
                    label="Secondary Button Link" 
                    value={portfolio.hero?.secondary_cta?.link || '#projects'} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        hero: { ...(portfolio.hero || {}), secondary_cta: { ...(portfolio.hero?.secondary_cta || {}), link: val } }
                      })
                    }} 
                    placeholder="#projects"
                  />
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toggles</h4>
                  
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-surface-50 border border-white/5">
                    <span className="text-xs font-medium text-gray-300">Show Resume Download Button</span>
                    <input 
                      type="checkbox"
                      checked={portfolio.hero?.show_resume_download ?? true}
                      onChange={e => setPortfolio({
                        ...portfolio,
                        hero: { ...(portfolio.hero || {}), show_resume_download: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-primary-600 accent-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-surface-50 border border-white/5">
                    <span className="text-xs font-medium text-gray-300">Show Social Icons in Hero</span>
                    <input 
                      type="checkbox"
                      checked={portfolio.hero?.show_social_icons ?? true}
                      onChange={e => setPortfolio({
                        ...portfolio,
                        hero: { ...(portfolio.hero || {}), show_social_icons: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-primary-600 accent-primary-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 2. ABOUT ME SECTION EDITOR */}
            {activeTab === 'about' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">About Me Section</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Long-Form Story</span>
                </div>
                
                <Input 
                  label="Section Heading Title" 
                  value={portfolio.about?.section_title || 'About Me'} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      about: { ...(portfolio.about || {}), section_title: val }
                    })
                  }} 
                  placeholder="About Me"
                />

                {/* Long Biography with Counters & AI Enhancer */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Long Biography</label>
                    <button 
                      type="button" 
                      onClick={() => openEnhancer(portfolio.about?.biography || portfolio.bio || '', 'summary', (text) => {
                        setPortfolio({
                          ...portfolio,
                          bio: text,
                          about: { ...(portfolio.about || {}), biography: text }
                        })
                      })} 
                      className="text-[10px] text-accent-pink hover:text-white flex items-center font-semibold"
                    >
                      <Wand2 className="w-3 h-3 mr-1" /> Enhance AI
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-40 custom-scrollbar leading-relaxed"
                    value={portfolio.about?.biography || portfolio.bio || ''}
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        bio: val,
                        about: { ...(portfolio.about || {}), biography: val }
                      })
                    }}
                    placeholder="Write a comprehensive biography about your background, career evolution, and passion..."
                  />
                  <div className="flex items-center justify-end gap-3 text-[10px] text-gray-400 font-mono">
                    <span>Words: {(portfolio.about?.biography || portfolio.bio || '').trim().split(/\s+/).filter(Boolean).length}</span>
                    <span>Chars: {(portfolio.about?.biography || portfolio.bio || '').length}</span>
                  </div>
                </div>

                {/* Personal Story & Journey */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Personal Story & Journey</label>
                    <button 
                      type="button" 
                      onClick={() => openEnhancer(portfolio.about?.personal_story || '', 'summary', (text) => {
                        setPortfolio({
                          ...portfolio,
                          about: { ...(portfolio.about || {}), personal_story: text }
                        })
                      })} 
                      className="text-[10px] text-accent-pink hover:text-white flex items-center font-semibold"
                    >
                      <Wand2 className="w-3 h-3 mr-1" /> Enhance AI
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-28 custom-scrollbar leading-relaxed"
                    value={portfolio.about?.personal_story || ''}
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        about: { ...(portfolio.about || {}), personal_story: val }
                      })
                    }}
                    placeholder="Share what drove you into technology, key career milestones, or your personal philosophy..."
                  />
                </div>

                {/* Career Objective */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Career Objective</label>
                    <button 
                      type="button" 
                      onClick={() => openEnhancer(portfolio.about?.career_objective || '', 'summary', (text) => {
                        setPortfolio({
                          ...portfolio,
                          about: { ...(portfolio.about || {}), career_objective: text }
                        })
                      })} 
                      className="text-[10px] text-accent-pink hover:text-white flex items-center font-semibold"
                    >
                      <Wand2 className="w-3 h-3 mr-1" /> Enhance AI
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-20"
                    value={portfolio.about?.career_objective || ''}
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        about: { ...(portfolio.about || {}), career_objective: val }
                      })
                    }}
                    placeholder="What kind of high-impact roles or projects are you seeking next?"
                  />
                </div>

                {/* Additional Meta Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <Input 
                    label="Location" 
                    value={portfolio.about?.location || portfolio.location || portfolio.contact?.location || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        location: val,
                        contact: { ...(portfolio.contact || {}), location: val },
                        about: { ...(portfolio.about || {}), location: val }
                      })
                    }} 
                    placeholder="e.g. San Francisco, CA"
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-300">Availability Status</label>
                    <select 
                      className="bg-surface-50 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-primary-500"
                      value={portfolio.about?.availability || portfolio.availability || 'Available for hire'}
                      onChange={e => {
                        const val = e.target.value
                        setPortfolio({
                          ...portfolio,
                          availability: val,
                          about: { ...(portfolio.about || {}), availability: val }
                        })
                      }}
                    >
                      <option value="Available for hire">Available for hire</option>
                      <option value="Open to opportunities">Open to opportunities</option>
                      <option value="Available for freelance">Available for freelance</option>
                      <option value="Not currently available">Not currently available</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Years of Experience" 
                    value={portfolio.about?.years_experience || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        about: { ...(portfolio.about || {}), years_experience: val }
                      })
                    }} 
                    placeholder="e.g. 5+ Years"
                  />

                  <Input 
                    label="Languages Spoken" 
                    value={portfolio.about?.languages || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        about: { ...(portfolio.about || {}), languages: val }
                      })
                    }} 
                    placeholder="e.g. English, Spanish, German"
                  />
                </div>

                <Input 
                  label="Interests & Passions" 
                  value={portfolio.about?.interests || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      about: { ...(portfolio.about || {}), interests: val }
                    })
                  }} 
                  placeholder="e.g. Open Source, Generative AI, UI/UX Design"
                />

                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <label className="text-xs font-medium text-gray-300">About Me Profile Image (Optional)</label>
                  <MediaUploader 
                    category="avatar"
                    currentUrl={portfolio.about?.profile_image || portfolio.avatar_url || ''}
                    onUploadSuccess={(url) => {
                      setPortfolio({
                        ...portfolio,
                        avatar_url: url,
                        hero: { ...(portfolio.hero || {}), profile_image: url },
                        about: { ...(portfolio.about || {}), profile_image: url, avatar_url: url }
                      })
                    }}
                  />
                  <Input 
                    label="Or Direct Image URL" 
                    value={portfolio.about?.profile_image || portfolio.avatar_url || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setPortfolio({
                        ...portfolio,
                        avatar_url: val,
                        hero: { ...(portfolio.hero || {}), profile_image: val },
                        about: { ...(portfolio.about || {}), profile_image: val, avatar_url: val }
                      })
                    }} 
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Experience</h3>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('experience', { company: '', position: '', duration: '', location: '', is_current: false, description: '', bullets: [], tech_stack: [] })}>
                    <Plus className="w-4 h-4" /> Add Experience
                  </Button>
                </div>
                {(portfolio.experience || []).map((exp: any, i: number) => (
                  <Card key={i} className="p-4 flex flex-col gap-3 bg-surface-50/50 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300">Experience {i+1}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveArrayItem('experience', i, 'up')} className="p-1 hover:text-white" title="Move Up"><MoveUp className="w-3 h-3" /></button>
                        <button onClick={() => moveArrayItem('experience', i, 'down')} className="p-1 hover:text-white" title="Move Down"><MoveDown className="w-3 h-3" /></button>
                        <button onClick={() => removeArrayItem('experience', i)} className="p-1 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <Input label="Position / Role Title" value={exp.position || exp.role || ''} onChange={e => updateArrayItem('experience', i, 'position', e.target.value)} placeholder="e.g. Lead Software Engineer" />
                    <Input label="Company Name" value={exp.company || ''} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} placeholder="e.g. Acme Corp" />
                    <Input label="Dates / Duration" value={exp.duration || exp.dates || ''} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} placeholder="e.g. Jan 2022 - Present" />
                    <Input label="Location (Optional)" value={exp.location || ''} onChange={e => updateArrayItem('experience', i, 'location', e.target.value)} placeholder="e.g. Remote / New York" />
                    
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300 py-1">
                      <input 
                        type="checkbox"
                        checked={exp.is_current || false}
                        onChange={e => updateArrayItem('experience', i, 'is_current', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 accent-primary-500"
                      />
                      <span>This is my current role</span>
                    </label>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-300">Overview Description</label>
                      <textarea 
                        className="w-full bg-surface-50 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-primary-500 outline-none h-16"
                        value={exp.description || ''}
                        onChange={e => updateArrayItem('experience', i, 'description', e.target.value)}
                        placeholder="Brief summary of your responsibilities..."
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-300">Key Achievements (Bullet points, one per line)</label>
                      <textarea 
                        className="w-full bg-surface-50 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-primary-500 outline-none h-24 custom-scrollbar"
                        value={Array.isArray(exp.bullets) ? exp.bullets.join('\n') : ''}
                        onChange={e => updateArrayItem('experience', i, 'bullets', e.target.value.split('\n'))}
                        placeholder="• Architected microservices serving 1M daily users&#10;• Reduced latency by 40%"
                      />
                    </div>

                    <Input label="Technologies Used (comma separated)" value={Array.isArray(exp.tech_stack) ? exp.tech_stack.join(', ') : Array.isArray(exp.technologies) ? exp.technologies.join(', ') : ''} onChange={e => updateArrayItem('experience', i, 'tech_stack', e.target.value.split(',').map(s=>s.trim()))} placeholder="React, Node.js, AWS" />
                  </Card>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === 'projects' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Projects</h3>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('projects', { title: '', category: '', is_featured: false, description: '', image_url: '', live_link: '', github_link: '', tech_stack: [] })}>
                    <Plus className="w-4 h-4" /> Add Project
                  </Button>
                </div>
                {(portfolio.projects || []).map((proj: any, i: number) => (
                  <Card key={i} className="p-4 flex flex-col gap-3 bg-surface-50/50 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300">Project {i+1}</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveArrayItem('projects', i, 'up')} className="p-1 hover:text-white" title="Move Up"><MoveUp className="w-3 h-3" /></button>
                        <button onClick={() => moveArrayItem('projects', i, 'down')} className="p-1 hover:text-white" title="Move Down"><MoveDown className="w-3 h-3" /></button>
                        <button onClick={() => removeArrayItem('projects', i)} className="p-1 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    
                    <Input label="Project Title" value={proj.title || proj.name || ''} onChange={e => updateArrayItem('projects', i, 'title', e.target.value)} placeholder="e.g. AI Resume Studio" />
                    <Input label="Category (e.g. Web App, AI/ML, Open Source)" value={proj.category || ''} onChange={e => updateArrayItem('projects', i, 'category', e.target.value)} placeholder="e.g. Full-Stack SaaS" />
                    
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300 py-1">
                      <input 
                        type="checkbox"
                        checked={proj.is_featured || proj.featured || false}
                        onChange={e => updateArrayItem('projects', i, 'is_featured', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 accent-primary-500"
                      />
                      <span>Mark as Featured Project</span>
                    </label>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-300">Project Description</label>
                      <textarea 
                        className="w-full bg-surface-50 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-primary-500 outline-none h-20"
                        value={proj.description || ''}
                        onChange={e => updateArrayItem('projects', i, 'description', e.target.value)}
                        placeholder="Detailed project summary..."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-300">Project Image / Screenshot</label>
                      <MediaUploader 
                        category="project"
                        currentUrl={proj.image_url || proj.image || ''}
                        onUploadSuccess={(url) => updateArrayItem('projects', i, 'image_url', url)}
                      />
                      <Input label="Or Direct Image URL" value={proj.image_url || proj.image || ''} onChange={e => updateArrayItem('projects', i, 'image_url', e.target.value)} placeholder="https://..." />
                    </div>

                    <Input label="Tech Stack (comma separated)" value={Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : ''} onChange={e => updateArrayItem('projects', i, 'tech_stack', e.target.value.split(',').map(s=>s.trim()))} placeholder="TypeScript, Next.js, Tailwind" />
                    <Input label="Live Demo URL" value={proj.live_link || proj.link || ''} onChange={e => updateArrayItem('projects', i, 'live_link', e.target.value)} placeholder="https://..." />
                    <Input label="GitHub Code Repository URL" value={proj.github_link || proj.github || ''} onChange={e => updateArrayItem('projects', i, 'github_link', e.target.value)} placeholder="https://github.com/..." />
                  </Card>
                ))}
              </div>
            )}

            {/* SKILLS */}
            {activeTab === 'skills' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skills & Tech Stack</h3>
                <p className="text-xs text-gray-400">Enter skills as comma-separated values (e.g. React, Node.js, Python, AWS, PostgreSQL, Docker).</p>
                <textarea 
                  className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-40 custom-scrollbar leading-relaxed"
                  value={Array.isArray(portfolio.skills) ? portfolio.skills.map((s: any) => typeof s === 'string' ? s : s.name || s.title || '').filter(Boolean).join(', ') : ''}
                  onChange={e => setPortfolio({...portfolio, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})}
                  placeholder="React, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker..."
                />
              </div>
            )}

            {/* EDUCATION */}
            {activeTab === 'education' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Education</h3>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('education', { institution: '', degree: '', field_of_study: '', duration: '', location: '', gpa: '' })}>
                    <Plus className="w-4 h-4" /> Add Education
                  </Button>
                </div>
                {(portfolio.education || []).map((edu: any, i: number) => (
                  <Card key={i} className="p-4 flex flex-col gap-3 bg-surface-50/50 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300">Education {i+1}</span>
                      <button onClick={() => removeArrayItem('education', i)} className="p-1 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <Input label="Degree / Qualification" value={edu.degree || ''} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="e.g. B.S. Computer Science" />
                    <Input label="Institution / University" value={edu.institution || ''} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)} placeholder="e.g. Stanford University" />
                    <Input label="Field of Study" value={edu.field_of_study || ''} onChange={e => updateArrayItem('education', i, 'field_of_study', e.target.value)} placeholder="e.g. Artificial Intelligence" />
                    <Input label="Dates / Duration" value={edu.duration || ''} onChange={e => updateArrayItem('education', i, 'duration', e.target.value)} placeholder="e.g. 2018 - 2022" />
                    <Input label="Location (Optional)" value={edu.location || ''} onChange={e => updateArrayItem('education', i, 'location', e.target.value)} placeholder="e.g. Stanford, CA" />
                    <Input label="GPA / Honors (Optional)" value={edu.gpa || ''} onChange={e => updateArrayItem('education', i, 'gpa', e.target.value)} placeholder="e.g. 3.9 / 4.0" />
                  </Card>
                ))}
              </div>
            )}
            
            {/* CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certificates</h3>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('certificates', { name: '', issuer: '', date: '', credential_id: '', url: '' })}>
                    <Plus className="w-4 h-4" /> Add Certificate
                  </Button>
                </div>
                {(portfolio.certificates || []).map((cert: any, i: number) => (
                  <Card key={i} className="p-4 flex flex-col gap-3 bg-surface-50/50 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300">Certificate {i+1}</span>
                      <button onClick={() => removeArrayItem('certificates', i)} className="p-1 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <Input label="Certificate Name" value={cert.name || ''} onChange={e => updateArrayItem('certificates', i, 'name', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
                    <Input label="Issuing Organization" value={cert.issuer || ''} onChange={e => updateArrayItem('certificates', i, 'issuer', e.target.value)} placeholder="e.g. Amazon Web Services" />
                    <Input label="Issue Date" value={cert.date || ''} onChange={e => updateArrayItem('certificates', i, 'date', e.target.value)} placeholder="e.g. Nov 2023" />
                    <Input label="Credential ID (Optional)" value={cert.credential_id || ''} onChange={e => updateArrayItem('certificates', i, 'credential_id', e.target.value)} placeholder="e.g. AWS-123456" />
                    <Input label="Verification URL" value={cert.url || cert.link || ''} onChange={e => updateArrayItem('certificates', i, 'url', e.target.value)} placeholder="https://..." />
                  </Card>
                ))}
              </div>
            )}

            {/* SOCIAL & CONTACT */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social & Contact Info</h3>
                
                <Input 
                  label="Contact Email Address" 
                  type="email"
                  value={portfolio.contact?.email || portfolio.social_links?.email || portfolio.email || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      email: val,
                      contact: { ...(portfolio.contact || {}), email: val },
                      social_links: { ...(portfolio.social_links || {}), email: val }
                    })
                  }} 
                  placeholder="e.g. alex@example.com"
                />

                <Input 
                  label="Phone Number (Optional)" 
                  value={portfolio.contact?.phone || portfolio.phone || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      phone: val,
                      contact: { ...(portfolio.contact || {}), phone: val }
                    })
                  }} 
                  placeholder="e.g. +1 (555) 000-0000"
                />

                <Input 
                  label="Location / Region" 
                  value={portfolio.contact?.location || portfolio.location || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      location: val,
                      contact: { ...(portfolio.contact || {}), location: val },
                      about: { ...(portfolio.about || {}), location: val }
                    })
                  }} 
                  placeholder="e.g. San Francisco, CA"
                />

                <Input 
                  label="Resume PDF URL (For Download Button)" 
                  value={portfolio.contact?.resume_url || portfolio.resume_url || ''} 
                  onChange={e => {
                    const val = e.target.value
                    setPortfolio({
                      ...portfolio,
                      resume_url: val,
                      contact: { ...(portfolio.contact || {}), resume_url: val }
                    })
                  }} 
                  placeholder="https://..."
                />

                <Input label="Website / Blog" value={portfolio.social_links?.website || ''} onChange={e => setPortfolio({...portfolio, social_links: {...(portfolio.social_links||{}), website: e.target.value}})} placeholder="https://johndoe.dev" />
                <Input label="LinkedIn URL" value={portfolio.social_links?.linkedin || ''} onChange={e => setPortfolio({...portfolio, social_links: {...(portfolio.social_links||{}), linkedin: e.target.value}})} placeholder="https://linkedin.com/in/..." />
                <Input label="GitHub URL" value={portfolio.social_links?.github || ''} onChange={e => setPortfolio({...portfolio, social_links: {...(portfolio.social_links||{}), github: e.target.value}})} placeholder="https://github.com/..." />
                <Input label="Twitter / X" value={portfolio.social_links?.twitter || ''} onChange={e => setPortfolio({...portfolio, social_links: {...(portfolio.social_links||{}), twitter: e.target.value}})} placeholder="https://x.com/..." />
              </div>
            )}

            {/* SEO */}
            {activeTab === 'seo' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">SEO Configuration</h3>
                <Input label="Meta Title" value={portfolio.seo_config?.meta_title || ''} onChange={e => setPortfolio({...portfolio, seo_config: {...(portfolio.seo_config||{}), meta_title: e.target.value}})} />
                <textarea 
                  className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-500 outline-none h-24"
                  value={portfolio.seo_config?.meta_description || ''}
                  onChange={e => setPortfolio({...portfolio, seo_config: {...(portfolio.seo_config||{}), meta_description: e.target.value}})}
                  placeholder="Meta Description..."
                />
                <Input label="Keywords (comma separated)" value={(portfolio.seo_config?.keywords || []).join(', ')} onChange={e => setPortfolio({...portfolio, seo_config: {...(portfolio.seo_config||{}), keywords: e.target.value.split(',').map(s=>s.trim())}})} />
              </div>
            )}

            {/* THEME & CUSTOMIZATION STUDIO */}
            {activeTab === 'theme' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Base Theme System</h3>
                  <div className="flex flex-col gap-3">
                    {PORTFOLIO_THEME_REGISTRY.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setPortfolio({ ...portfolio, theme_id: theme.id })}
                        className={`w-full rounded-xl border flex flex-col overflow-hidden transition-all group ${
                          portfolio.theme_id === theme.id
                            ? 'bg-primary-600/10 border-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-surface-50 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {theme.preview_image && (
                          <div className="w-full h-24 overflow-hidden bg-black relative border-b border-white/5">
                            <img src={theme.preview_image} alt={theme.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                          </div>
                        )}
                        <div className="p-3 text-left w-full flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{theme.name}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded-full">{theme.category}</span>
                          </div>
                          <span className="text-[11px] text-gray-400">{theme.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customization Studio</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={portfolio.theme_config?.accent_color || '#6366f1'} 
                          onChange={e => setPortfolio({...portfolio, theme_config: {...(portfolio.theme_config||{}), accent_color: e.target.value}})}
                          className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        <span className="text-xs font-mono text-gray-300">{portfolio.theme_config?.accent_color || '#6366f1'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Typography</label>
                      <select 
                        className="bg-surface-50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary-500"
                        value={portfolio.theme_config?.font_family || 'sans'}
                        onChange={e => setPortfolio({...portfolio, theme_config: {...(portfolio.theme_config||{}), font_family: e.target.value}})}
                      >
                        <option value="sans">Modern Sans (Inter)</option>
                        <option value="serif">Classic Serif (Merriweather)</option>
                        <option value="mono">Developer Mono (Fira Code)</option>
                        <option value="outfit">Geometric (Outfit)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Hero Layout Variant</label>
                      <select 
                        className="bg-surface-50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary-500"
                        value={portfolio.theme_config?.layout_variant || 'standard'}
                        onChange={e => setPortfolio({...portfolio, theme_config: {...(portfolio.theme_config||{}), layout_variant: e.target.value}})}
                      >
                        <option value="standard">Standard (Photo Left, Text Right)</option>
                        <option value="centered">Centered Stack (Focus on content)</option>
                        <option value="split">50/50 Split Screen</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Border Radius (Corners)</label>
                      <select 
                        className="bg-surface-50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary-500"
                        value={portfolio.theme_config?.border_radius || 'md'}
                        onChange={e => setPortfolio({...portfolio, theme_config: {...(portfolio.theme_config||{}), border_radius: e.target.value}})}
                      >
                        <option value="none">Sharp (0px)</option>
                        <option value="sm">Subtle (4px)</option>
                        <option value="md">Standard (8px)</option>
                        <option value="lg">Soft (16px)</option>
                        <option value="full">Pill (999px)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" /> Portfolio Analytics
                </h3>
                
                {loadingAnalytics ? (
                  <div className="text-sm text-gray-400 animate-pulse flex items-center justify-center py-12">Loading Insights...</div>
                ) : analyticsData ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Total Views</span>
                        <span className="text-3xl font-black text-white">{analyticsData.total_views || 0}</span>
                      </div>
                      <div className="bg-surface-50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Unique Visitors</span>
                        <span className="text-3xl font-black text-emerald-400">{analyticsData.unique_visitors || 0}</span>
                      </div>
                    </div>
                    
                    <div className="bg-surface-50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Device Breakdown</span>
                      <div className="flex flex-col gap-2 mt-2">
                        {analyticsData.devices && Object.keys(analyticsData.devices).length > 0 ? (
                          Object.entries(analyticsData.devices).map(([device, count]: any) => (
                            <div key={device} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300 capitalize">{device}</span>
                              <span className="text-white font-mono">{count}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No device data yet.</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-surface-50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Countries</span>
                      <div className="flex flex-col gap-2 mt-2">
                        {analyticsData.countries && Object.keys(analyticsData.countries).length > 0 ? (
                          Object.entries(analyticsData.countries).map(([country, count]: any) => (
                            <div key={country} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300">{country}</span>
                              <span className="text-white font-mono">{count}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No location data yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 p-6 bg-surface-50 rounded-xl border border-white/5 text-center">
                    Publish your portfolio to start collecting analytics.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview Canvas */}
        <div className="flex-1 bg-black overflow-auto flex items-start justify-center relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50" />
          <div className="w-full h-full max-w-6xl mx-auto my-auto origin-top transition-transform">
            {PreviewComponent ? (
              <PreviewComponent portfolio={portfolio} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                <Globe className="w-12 h-12 opacity-20" />
                <p>No Preview Available for Theme: {portfolio.theme_id}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <PortfolioPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        portfolio={portfolio}
        onSave={(updated) => { setPortfolio(updated); handleSave() }}
      />

      <PortfolioImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onApply={handleApplyImport}
      />

      <PortfolioPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        portfolio={portfolio}
        onPublishClick={() => setShowPublishModal(true)}
      />

      {showEnhancerModal && (
        <AIEnhancerModal
          isOpen={showEnhancerModal}
          onClose={() => { setShowEnhancerModal(false); setEnhancerApplyCallback(null) }}
          initialText={enhancerTargetText}
          sectionType={enhancerSectionType}
          onApply={(improved) => {
            if (enhancerApplyCallback) enhancerApplyCallback(improved)
            setShowEnhancerModal(false)
          }}
        />
      )}
    </div>
  )
}
