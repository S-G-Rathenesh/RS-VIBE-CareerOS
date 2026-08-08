import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Search, Filter, Sparkles, LayoutGrid, CheckCircle, Upload, ArrowUpRight } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { ResumeImportModal } from '../../components/resumes/ResumeImportModal'
import { useUIStore } from '../../store/useUIStore'
import { ResumeActionMenu, ActionMenuOption } from '../../components/resumes/ResumeActionMenu'
import { DeleteResumeModal } from '../../components/resumes/DeleteResumeModal'
import { ROUTES } from '../../constants/routes'
import api from '../../services/api'

export const ResumesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const addToast = useUIStore((s) => s.addToast)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<{ id: string, title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  useEffect(() => {
    api.get<any, any>('/resumes')
      .then(res => setResumes(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAction = (action: ActionMenuOption, resume: any) => {
    switch (action) {
      case 'open_studio':
        window.location.href = `/resumes/builder/${resume.id}`
        break
      case 'delete':
        setResumeToDelete({ id: resume.id, title: resume.title })
        setDeleteModalOpen(true)
        break
      default:
        console.log('Action not implemented:', action)
    }
  }

  const confirmDelete = async () => {
    if (!resumeToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/resumes/${resumeToDelete.id}`)
      addToast({ type: 'success', message: 'Resume deleted successfully.' })
      setResumes(prev => prev.filter(r => r.id !== resumeToDelete.id))
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Failed to delete resume.' })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setResumeToDelete(null)
    }
  }

  const sampleTemplates = [
    { id: 'modern_linear', name: 'Linear Dark', badge: 'High ATS Score', desc: 'Minimalist tech theme inspired by Linear.' },
    { id: 'framer_creative', name: 'Framer Glass', badge: 'Creative', desc: 'Sleek glassmorphism accents for UI/UX & Design Engineers.' },
    { id: 'apple_executive', name: 'Apple Executive', badge: 'Classic', desc: 'Clean typography for senior leadership & management.' },
  ]

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header & Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Resumes</h1>
          <p className="text-xs text-gray-400">Manage, edit, duplicate, and export your AI-optimized resumes</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-1" /> Import PDF / DOCX
          </Button>
          <Button variant="glow" size="md" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Resume
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 glass-panel p-3 rounded-2xl border border-white/10">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search resumes by title or job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="bg-surface-100 border-none"
          />
        </div>
      </div>

      {/* Resumes Grid / Empty State */}
      {resumes.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center gap-4 border border-dashed border-white/15">
          <div className="w-16 h-16 rounded-3xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-glow-primary">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Resumes Created Yet</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Import an existing PDF/DOCX resume or pick a modern template to start building.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" size="md" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-1" /> Upload PDF / DOCX
            </Button>
            <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
              <Sparkles className="w-4 h-4 mr-1" /> Build with AI
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card 
              key={resume.id} 
              interactive 
              className={`p-6 flex flex-col justify-between gap-4 border border-white/10 relative overflow-visible ${
                activeMenuId === resume.id ? 'z-[100]' : 'z-0'
              }`}
            >
              <div className="absolute top-4 right-4 z-50">
                <ResumeActionMenu 
                  onAction={(action) => handleAction(action, resume)} 
                  isParent={true} 
                  onOpenChange={(isOpen) => setActiveMenuId(isOpen ? resume.id : null)}
                />
              </div>
              <Link to={`/resumes/builder/${resume.id}`} className="absolute inset-0 z-0" />
              
              <div className="flex flex-col gap-2 relative z-0 pointer-events-none">
                <div className="flex items-center justify-between pr-8">
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                    {resume.template_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">
                    ATS Score: {resume.ats_score || 90}%
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg truncate">{resume.title}</h3>
                <span className="text-xs text-gray-400 truncate">{resume.target_role}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs relative z-10 pointer-events-none">
                <span className="text-gray-500 text-[11px]">
                  {new Date(resume.updated_at).toLocaleDateString()}
                </span>
                <span className="text-primary-400 font-medium flex items-center gap-1">
                  Edit Canvas <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <ResumeImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />

      {/* Template Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <Card className="w-full max-w-2xl p-6 border border-white/15 glass-panel flex flex-col gap-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Select Resume Template</h3>
                <p className="text-xs text-gray-400">Choose a modern ATS-friendly layout foundation</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sampleTemplates.map((template) => (
                <div
                  key={template.id}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-primary-500/50 flex flex-col justify-between gap-3 cursor-pointer group transition-all"
                  onClick={() => {
                    setShowModal(false)
                    // Navigate to builder
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">{template.badge}</span>
                    <h4 className="font-bold text-white text-sm group-hover:text-primary-300 transition-colors">{template.name}</h4>
                    <p className="text-[11px] text-gray-400 leading-snug">{template.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <DeleteResumeModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        resumeTitle={resumeToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}


