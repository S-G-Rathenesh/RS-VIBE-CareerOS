import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Globe, CheckCircle, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface PortfolioImportModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (data: any) => void
}

type ImportTab = 'saved_resume' | 'upload_resume' | 'existing_portfolio'

export const PortfolioImportModal: React.FC<PortfolioImportModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('saved_resume')
  const [resumes, setResumes] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const { addToast } = useUIStore()

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'saved_resume') {
        const res = await api.get<any, any>('/resumes')
        if (res.success) setResumes(res.data)
      } else if (activeTab === 'existing_portfolio') {
        const res = await api.get<any, any>('/portfolios')
        if (res.success) setPortfolios(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const mapResumeToPortfolio = (resumeData: any) => {
    return {
      title: `${resumeData.personal_info?.full_name || 'My'} Portfolio`,
      hero_tagline: resumeData.target_role || resumeData.personal_info?.title || '',
      bio: resumeData.personal_info?.summary || '',
      skills: resumeData.skills?.flatMap((s: any) => s.items || s.name || []) || [],
      experience: resumeData.work_experience || [],
      education: resumeData.education || [],
      certificates: resumeData.certificates || [],
      projects: resumeData.projects || [],
      social_links: {
        github: resumeData.personal_info?.github || '',
        linkedin: resumeData.personal_info?.linkedin || '',
        website: resumeData.personal_info?.website || ''
      }
    }
  }

  const handleImportSavedResume = () => {
    if (!selectedId) return
    const resume = resumes.find(r => r.id === selectedId)
    if (!resume) return
    
    setImporting(true)
    setTimeout(() => {
      onApply(mapResumeToPortfolio(resume))
      setImporting(false)
      onClose()
      addToast({ type: 'success', message: 'Imported from saved resume successfully!' })
    }, 500) // fake delay for UX
  }

  const handleUploadResume = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setImporting(true)
    try {
      // Use dry_run=true to avoid saving duplicate resumes to DB
      const res = await api.post<any, any>('/resumes/import?dry_run=true', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.success && res.data) {
        onApply(mapResumeToPortfolio(res.data))
        addToast({ type: 'success', message: 'Resume uploaded and imported!' })
        onClose()
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to upload and parse resume.' })
    } finally {
      setImporting(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadResume(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUploadResume(file)
  }

  const handleImportPortfolio = () => {
    if (!selectedId) return
    const portfolio = portfolios.find(p => p.id === selectedId)
    if (!portfolio) return
    
    setImporting(true)
    setTimeout(() => {
      // Drop DB specific fields to create a fresh draft
      const { id, _id, user_id, is_published, slug, created_at, updated_at, ...rest } = portfolio
      onApply({ ...rest, title: `${rest.title} (Copy)` })
      setImporting(false)
      onClose()
      addToast({ type: 'success', message: 'Portfolio duplicated successfully!' })
    }, 500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl pointer-events-auto"
            >
              <Card className="flex flex-col h-[600px] overflow-hidden bg-surface-100 border border-white/10 shadow-2xl relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="p-6 border-b border-white/10 shrink-0">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary-400" /> Import Content to Portfolio
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Kickstart your portfolio by importing data from your existing career assets.
                  </p>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Left Sidebar Tabs */}
                  <div className="w-64 border-r border-white/10 bg-surface-50/30 flex flex-col p-4 gap-2">
                    <button
                      onClick={() => { setActiveTab('saved_resume'); setSelectedId(null) }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${
                        activeTab === 'saved_resume' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> From Saved Resume
                    </button>
                    <button
                      onClick={() => { setActiveTab('upload_resume'); setSelectedId(null) }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${
                        activeTab === 'upload_resume' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Upload className="w-4 h-4" /> Upload Document
                    </button>
                    <button
                      onClick={() => { setActiveTab('existing_portfolio'); setSelectedId(null) }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${
                        activeTab === 'existing_portfolio' ? 'bg-accent-pink text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Globe className="w-4 h-4" /> Duplicate Portfolio
                    </button>
                  </div>

                  {/* Right Content Area */}
                  <div className="flex-1 p-6 overflow-y-auto bg-surface-50/10">
                    {activeTab === 'saved_resume' && (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">Select a Resume</h3>
                          <span className="text-xs text-gray-400">{resumes.length} available</span>
                        </div>
                        {loading ? (
                          <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                          </div>
                        ) : resumes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                            <FileText className="w-8 h-8 text-gray-600" />
                            <p className="text-sm text-gray-400">No saved resumes found.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {resumes.map(resume => (
                              <button
                                key={resume.id}
                                onClick={() => setSelectedId(resume.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                                  selectedId === resume.id 
                                    ? 'bg-primary-500/10 border-primary-500' 
                                    : 'bg-surface-50 border-white/5 hover:border-white/20'
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-white text-sm">{resume.title}</span>
                                  <span className="text-xs text-gray-400">{resume.target_role || 'No role specified'}</span>
                                </div>
                                {selectedId === resume.id && <CheckCircle className="w-5 h-5 text-primary-400" />}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="pt-4 border-t border-white/10 shrink-0">
                          <Button 
                            variant="primary" 
                            className="w-full" 
                            disabled={!selectedId || importing}
                            isLoading={importing}
                            onClick={handleImportSavedResume}
                          >
                            Import Selected Resume <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'upload_resume' && (
                      <div 
                        className={`flex flex-col items-center justify-center h-full text-center gap-6 rounded-2xl border-2 border-dashed transition-all p-6 relative ${
                          dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Upload className="w-10 h-10" />
                        </div>
                        <div className="flex flex-col gap-2 max-w-sm">
                          <h3 className="font-bold text-white text-lg">Upload Resume File</h3>
                          <p className="text-sm text-gray-400">
                            Upload a PDF or DOCX file. Our AI will parse the content and structure it for your new portfolio instantly.
                          </p>
                        </div>
                        <div className="relative mt-4">
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={importing}
                          />
                          <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 pointer-events-none" isLoading={importing}>
                            {importing ? 'Processing AI Upload...' : 'Select File (PDF / DOCX)'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'existing_portfolio' && (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">Select a Portfolio to Duplicate</h3>
                          <span className="text-xs text-gray-400">{portfolios.length} available</span>
                        </div>
                        {loading ? (
                          <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
                          </div>
                        ) : portfolios.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                            <Globe className="w-8 h-8 text-gray-600" />
                            <p className="text-sm text-gray-400">No existing portfolios found.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {portfolios.map(port => (
                              <button
                                key={port.id}
                                onClick={() => setSelectedId(port.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                                  selectedId === port.id 
                                    ? 'bg-accent-pink/10 border-accent-pink' 
                                    : 'bg-surface-50 border-white/5 hover:border-white/20'
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-white text-sm">{port.title}</span>
                                  <span className="text-xs text-gray-400">/{port.slug}</span>
                                </div>
                                {selectedId === port.id && <CheckCircle className="w-5 h-5 text-accent-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="pt-4 border-t border-white/10 shrink-0">
                          <Button 
                            variant="primary" 
                            className="w-full bg-accent-pink border-accent-pink hover:bg-accent-pink/80" 
                            disabled={!selectedId || importing}
                            isLoading={importing}
                            onClick={handleImportPortfolio}
                          >
                            Duplicate Portfolio <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
