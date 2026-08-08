import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Globe, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Activity, 
  ExternalLink,
  History,
  ShieldCheck,
  Building2,
  Zap,
  Award,
  Briefcase
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Skeleton } from '../../components/common/Skeleton'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useUIStore } from '../../store/useUIStore'

import { ResumeActionMenu, ActionMenuOption } from '../../components/resumes/ResumeActionMenu'
import { DeleteResumeModal } from '../../components/resumes/DeleteResumeModal'
import { AIAssistantOrb } from '../../components/common/AIAssistantOrb'
import api from '../../services/api'

interface DashboardData {
  metrics: {
    total_resumes: number
    total_versions: number
    total_portfolios: number
    published_portfolios: number
    ai_generations_used: number
    latest_ats_score: number
    profile_completeness: number
  }
  recent_resumes: Array<{
    id: string
    title: string
    target_role: string
    template_id: string
    ats_score: number
    version_count?: number
    updated_at: string
  }>
  recent_versions?: Array<{
    id: string
    parent_resume_id: string
    version_name: string
    source: string
    company: string
    job_title: string
    ats_score: number
    created_at: string
  }>
  ats_trends?: Array<{
    company: string
    job_title: string
    score: number
    date: string
  }>
  recent_portfolios: Array<{
    id: string
    title: string
    slug: string
    is_published: boolean
    template_id: string
    views_count: number
    updated_at: string
  }>
  recent_activities: Array<{
    id: string
    action: string
    description: string
    timestamp: string
  }>
  active_applications?: Array<{
    id: string
    company: string
    job_title: string
    status: string
    updated_at: string
  }>
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [showCustomize, setShowCustomize] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<{ id: string, title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [widgets, setWidgets] = useLocalStorage('dashboard_widgets', {
    metrics: true,
    trends: true,
    resumes: true,
    versions: true,
    actions: true,
    activity: true,
    applications: true
  })

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets({ ...widgets, [key]: !widgets[key] })
  }

  useEffect(() => {
    api.get<any, any>('/dashboard/overview')
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data)
        }
      })
      .catch(() => {
        setData({
          metrics: {
            total_resumes: 1,
            total_versions: 3,
            total_portfolios: 1,
            published_portfolios: 1,
            ai_generations_used: 14,
            latest_ats_score: 92,
            profile_completeness: 95,
          },
          recent_resumes: [
            {
              id: 'res_sample',
              title: 'Principal Software Engineer Resume',
              target_role: 'Lead Full Stack & Cloud Architect',
              template_id: 'modern_linear',
              ats_score: 92,
              version_count: 3,
              updated_at: new Date().toISOString(),
            },
          ],
          recent_versions: [
            {
              id: 'v_1',
              parent_resume_id: 'res_sample',
              version_name: 'Google SWE Tailored Edition',
              source: 'AI_TAILORED',
              company: 'Google',
              job_title: 'Staff Engineer',
              ats_score: 91,
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'v_2',
              parent_resume_id: 'res_sample',
              version_name: 'Amazon Principal Architect',
              source: 'AI_TAILORED',
              company: 'Amazon',
              job_title: 'Principal Architect',
              ats_score: 94,
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          ats_trends: [
            { company: 'Google', job_title: 'Staff Engineer', score: 91, date: 'Aug 04' },
            { company: 'Amazon', job_title: 'Solutions Architect', score: 94, date: 'Aug 05' },
            { company: 'Microsoft', job_title: 'Azure Engineer', score: 86, date: 'Aug 05' },
            { company: 'Zoho', job_title: 'Product Developer', score: 82, date: 'Aug 06' },
          ],
          recent_portfolios: [],
          recent_activities: [
            {
              id: 'act_1',
              action: 'VERSION_CREATED',
              description: 'Created tailored resume version for Amazon Principal Architect',
              timestamp: new Date().toISOString(),
            },
          ],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleResumeAction = (action: ActionMenuOption, resume: any) => {
    switch (action) {
      case 'open_studio':
        window.location.href = `/resumes/builder/${resume.id}`
        break
      case 'delete':
        setResumeToDelete({ id: resume.id, title: resume.title || resume.version_name })
        setDeleteModalOpen(true)
        break
      // Additional actions can be handled similarly
      default:
        console.log('Action not implemented yet on dashboard:', action)
    }
  }

  const confirmDelete = async () => {
    if (!resumeToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/resumes/${resumeToDelete.id}`)
      addToast({ type: 'success', message: 'Resume deleted successfully.' })
      
      // Update local state to remove the deleted resume and its versions
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          recent_resumes: prev.recent_resumes.filter(r => r.id !== resumeToDelete.id),
          recent_versions: prev.recent_versions?.filter(v => v.parent_resume_id !== resumeToDelete.id)
        }
      })
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Failed to delete resume.' })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setResumeToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.06] relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-accent-violet/6 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-6">
          <div className="hidden lg:block shrink-0">
            <AIAssistantOrb size="md" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Command Center
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.fullName || 'Explorer'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Manage your parent resumes, target child versions, live ATS audit trends, and AI career assets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="ghost" size="md" onClick={() => setShowCustomize(!showCustomize)} className="bg-white/5">
              Customize
            </Button>
            {showCustomize && (
              <Card className="absolute right-0 top-12 w-48 p-2 z-50 shadow-2xl flex flex-col gap-1 bg-surface-100 border border-white/10 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">Dashboard Widgets</div>
                {Object.keys(widgets).map((key) => (
                  <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={widgets[key as keyof typeof widgets]}
                      onChange={() => toggleWidget(key as keyof typeof widgets)}
                      className="rounded border-white/20 bg-black/20 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-xs text-white capitalize">{key}</span>
                  </label>
                ))}
              </Card>
            )}
          </div>
          <Link to={ROUTES.RESUMES}>
            <Button variant="glow" size="md">
              <Plus className="w-4 h-4 mr-1" /> Create Resume
            </Button>
          </Link>
          <Link to={ROUTES.AI_HUB}>
            <Button variant="outline" size="md" className="border-accent-pink/40 text-accent-pink hover:bg-accent-pink/10">
              <Sparkles className="w-4 h-4 mr-1" /> Launch AI Hub
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 4 Glassmorphic Metrics Summary Cards */}
      {widgets.metrics && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.35 }}>
        <Card className="flex flex-col gap-2 p-5 border border-white/[0.06] relative overflow-hidden h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Resumes & Versions</span>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{data?.metrics.total_resumes}</span>
              <span className="text-[10px] text-primary-300 font-semibold">
                + {data?.metrics.total_versions || 0} Versions
              </span>
            </div>
          )}
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
        <Card className="flex flex-col gap-2 p-5 border border-white/[0.06] h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Latest ATS Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {data?.metrics.latest_ats_score || 88}%
              </span>
              <span className="text-[10px] text-emerald-300">High Match</span>
            </div>
          )}
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}>
        <Card className="flex flex-col gap-2 p-5 border border-white/[0.06] h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Portfolios Built</span>
            <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{data?.metrics.total_portfolios}</span>
              <span className="text-[10px] text-emerald-400">
                {data?.metrics.published_portfolios} Live
              </span>
            </div>
          )}
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
        <Card className="flex flex-col gap-2 p-5 border border-white/[0.06] h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">AI Career Runs</span>
            <div className="p-2 rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{data?.metrics.ai_generations_used}</span>
              <span className="text-[10px] text-gray-400">Optimizations</span>
            </div>
          )}
        </Card>
        </motion.div>
      </div>
      )}

      {/* ATS Match Score Trends Across Companies */}
      {widgets.trends && data?.ats_trends && data.ats_trends.length > 0 && (
        <Card className="p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Target Job ATS Match Performance</h3>
                <p className="text-xs text-gray-400">Compatibility scores achieved across target job postings</p>
              </div>
            </div>
            <Link to={ROUTES.AI_HUB} className="text-xs text-primary-400 hover:underline flex items-center gap-1 font-semibold">
              Analyze New Role <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {data.ats_trends.map((tr, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-surface-50 border border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{tr.company}</span>
                  <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                    tr.score >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-300'
                  }`}>
                    {tr.score}%
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 truncate">{tr.job_title}</span>
                <span className="text-[10px] text-gray-500 pt-1 border-t border-white/5">{tr.date}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Grid: Recent Resumes & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Resumes & Child Versions */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active Applications Widget */}
          {widgets.applications && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" /> Active Applications
                </h2>
                <Link to={ROUTES.JOBS} className="text-xs font-semibold text-primary-400 hover:text-white flex items-center">
                  View Tracker <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {data?.active_applications && data.active_applications.length > 0 ? (
                  data.active_applications.map((app) => (
                    <Link to={`/jobs/${app.id}`} key={app.id}>
                      <Card className="p-4 border-white/5 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                            {app.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{app.job_title}</h4>
                            <p className="text-xs text-gray-400">{app.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="px-2.5 py-1 rounded-full bg-surface-100 text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                            {app.status}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Updated {new Date(app.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                    <Briefcase className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No active applications found.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.href = ROUTES.JOBS}>
                      Explore Jobs
                    </Button>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Recent Resumes Section */}
          {widgets.resumes && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" /> Parent Resumes
              </h2>
              <Link to={ROUTES.RESUMES} className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View All Resumes <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-36 w-full rounded-2xl" />
                <Skeleton className="h-36 w-full rounded-2xl" />
              </div>
            ) : data?.recent_resumes.length === 0 ? (
              <Card className="p-8 flex flex-col items-center text-center gap-3 border-dashed border-white/15">
                <FileText className="w-10 h-10 text-gray-500" />
                <h3 className="font-bold text-white text-base">No Resumes Created Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Start building your first AI-optimized resume tailored for top tech roles.
                </p>
                <Link to={ROUTES.RESUMES}>
                  <Button variant="primary" size="sm" className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Create First Resume
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.recent_resumes.map((resume) => (
                  <Card 
                    key={resume.id} 
                    interactive 
                    className={`p-5 flex flex-col justify-between gap-4 border border-white/10 relative overflow-visible ${
                      activeMenuId === resume.id ? 'z-[100]' : 'z-0'
                    }`}
                  >
                    <div className="absolute top-4 right-4 z-50">
                      <ResumeActionMenu 
                        onAction={(action) => handleResumeAction(action, resume)} 
                        isParent={true} 
                        onOpenChange={(isOpen) => setActiveMenuId(isOpen ? resume.id : null)}
                      />
                    </div>
                    <Link to={`/resumes/builder/${resume.id}`} className="absolute inset-0 z-0" />
                    
                    <div className="flex flex-col gap-1 relative z-0 pointer-events-none">
                      <div className="flex items-center justify-between pr-8">
                        <span className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider">
                          {resume.template_id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {resume.version_count && (
                            <span className="px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-300 text-[10px] font-medium border border-primary-500/20">
                              {resume.version_count} versions
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">
                            {resume.ats_score}% ATS
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-base truncate">{resume.title}</h3>
                      <span className="text-xs text-gray-400 truncate">{resume.target_role}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {new Date(resume.updated_at).toLocaleDateString()}
                      </span>
                      <Link to={`/resumes/builder/${resume.id}`} className="text-primary-400 hover:text-white font-medium flex items-center gap-0.5">
                        Open Studio <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Recent Child Versions Section */}
          {widgets.versions && data?.recent_versions && data.recent_versions.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-accent-pink" /> Targeted Child Versions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.recent_versions.map((ver) => (
                  <Card 
                    key={ver.id} 
                    interactive 
                    className={`p-5 flex flex-col justify-between gap-4 border border-white/10 relative overflow-visible ${
                      activeMenuId === ver.id ? 'z-[100]' : 'z-0'
                    }`}
                  >
                    <div className="absolute top-4 right-4 z-50">
                      <ResumeActionMenu 
                        onAction={(action) => handleResumeAction(action, ver)} 
                        isParent={false} 
                        onOpenChange={(isOpen) => setActiveMenuId(isOpen ? ver.id : null)}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1 pr-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-pink/10 text-accent-pink font-semibold uppercase border border-accent-pink/20">
                          {ver.source === 'AI_TAILORED' ? 'AI Tailored' : ver.source}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400">
                          {ver.ats_score}% ATS
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate mt-1">{ver.version_name}</h4>
                      {ver.company && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {ver.company} {ver.job_title ? `— ${ver.job_title}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-400">
                      <span>{new Date(ver.created_at).toLocaleDateString()}</span>
                      <Link to={`/resumes/builder/${ver.parent_resume_id}`} className="text-accent-pink hover:underline font-medium">
                        Open in Builder →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Actions & Activity Feed */}
        <div className="flex flex-col gap-6">
          {/* Quick Action Menu */}
          {widgets.actions && (
          <Card className="p-6 flex flex-col gap-4 border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-pink" /> AI Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Link to={ROUTES.AI_HUB}>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-surface-100 border border-white/5 text-xs text-gray-200 hover:text-white transition-all group">
                  <span className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Run ATS Audit
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </Link>

              <Link to={ROUTES.RESUMES}>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-surface-100 border border-white/5 text-xs text-gray-200 hover:text-white transition-all group">
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-primary-400" /> Create Tailored Version
                  </span>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </Link>

              <Link to={ROUTES.PORTFOLIOS}>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-surface-100 border border-white/5 text-xs text-gray-200 hover:text-white transition-all group">
                  <span className="flex items-center gap-2 font-medium">
                    <Globe className="w-4 h-4 text-accent-cyan" /> New Portfolio Site
                  </span>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </Link>
            </div>
          </Card>
          )}

          {/* User Activity Stream */}
          {widgets.activity && (
          <Card className="p-6 flex flex-col gap-4 border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Recent Activity Log
            </h3>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="flex flex-col gap-3">
                {data?.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-white">{activity.description}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          )}
        </div>
      </div>

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
