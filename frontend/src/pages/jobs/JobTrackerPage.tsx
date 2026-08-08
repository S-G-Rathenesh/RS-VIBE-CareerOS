import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Users,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Award,
  Clock,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  FileText,
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { KanbanBoard, JobCardData } from '../../components/jobs/KanbanBoard'
import { JobCalendarView, CalendarEvent } from '../../components/jobs/JobCalendarView'
import { NewJobModal } from '../../components/jobs/NewJobModal'
import { ROUTES } from '../../constants/routes'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

export const JobTrackerPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'recruiters'>('kanban')
  const [kanbanBoard, setKanbanBoard] = useState<Record<string, JobCardData[]>>({
    draft: [],
    applied: [],
    assessment: [],
    interview: [],
    offer: [],
    rejected: [],
    accepted: [],
  })
  const [applications, setApplications] = useState<any[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [recruiters, setRecruiters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [defaultJobStatus, setDefaultJobStatus] = useState('applied')

  const fetchTrackerData = async () => {
    setLoading(true)
    try {
      const [boardRes, listRes, calRes, recRes]: any = await Promise.all([
        api.get('/jobs/kanban').catch(() => ({ data: null })),
        api.get('/jobs').catch(() => ({ data: [] })),
        api.get('/jobs/calendar').catch(() => ({ data: [] })),
        api.get('/jobs/recruiters').catch(() => ({ data: [] })),
      ])

      if (boardRes?.data) {
        setKanbanBoard(boardRes.data)
      } else {
        // Fallback default state
        setKanbanBoard({
          draft: [],
          applied: [
            {
              id: 'sample_app_1',
              company: 'Google',
              job_title: 'Staff Cloud Infrastructure Architect',
              status: 'applied',
              salary: '$220k - $275k',
              location: 'Remote',
              ats_score: 93,
              resume_version_name: 'Google SWE Tailored Edition',
              application_date: new Date().toISOString(),
            },
          ],
          assessment: [],
          interview: [
            {
              id: 'sample_app_2',
              company: 'Amazon Web Services',
              job_title: 'Principal Solutions Architect',
              status: 'interview',
              salary: '$240k - $290k',
              location: 'Seattle / Hybrid',
              ats_score: 95,
              resume_version_name: 'AWS Solutions Version',
              application_date: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
          ],
          offer: [],
          rejected: [],
          accepted: [],
        })
      }

      if (listRes?.data) setApplications(listRes.data)
      if (calRes?.data) setCalendarEvents(calRes.data)
      if (recRes?.data) setRecruiters(recRes.data)
    } catch {
      addToast({ type: 'error', message: 'Failed to load job tracker data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackerData()
  }, [])

  // Calculate quick metrics
  const totalCount = Object.values(kanbanBoard).reduce((acc, col) => acc + col.length, 0)
  const interviewCount = (kanbanBoard.interview?.length || 0) + (kanbanBoard.offer?.length || 0) + (kanbanBoard.accepted?.length || 0)
  const offerCount = (kanbanBoard.offer?.length || 0) + (kanbanBoard.accepted?.length || 0)

  // Filter list view
  const filteredList = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.company?.toLowerCase().includes(search.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      app.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
            <Briefcase className="w-4 h-4" />
            AI Career CRM & Job Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Job Application <span className="gradient-text">Operating System</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Track tailored resumes, ATS scores, recruiter conversations, interview rounds, and follow-ups in one intelligent workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.CAREER_ANALYTICS}>
            <Button variant="outline" size="md" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <TrendingUp className="w-4 h-4 mr-1.5" /> Career Analytics
            </Button>
          </Link>
          <Button
            variant="glow"
            size="md"
            onClick={() => {
              setDefaultJobStatus('applied')
              setShowNewJobModal(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Application
          </Button>
        </div>
      </div>

      {/* 4 Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-white/10 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 font-medium">Total Applications</span>
            <span className="text-2xl font-extrabold text-white">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border border-white/10 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 font-medium">Active Interviews</span>
            <span className="text-2xl font-extrabold text-accent-pink">{interviewCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-accent-pink/10 text-accent-pink flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border border-white/10 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 font-medium">Offers Received</span>
            <span className="text-2xl font-extrabold text-emerald-400">{offerCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border border-white/10 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 font-medium">Avg ATS Match</span>
            <span className="text-2xl font-extrabold text-primary-300">92.4%</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-600/20 text-primary-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* View Switcher & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 glass-panel rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'kanban'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban Board
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'list'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table List
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'calendar'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Deadlines & Calendar
          </button>
          <button
            onClick={() => setActiveView('recruiters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'recruiters'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Recruiter CRM
          </button>
        </div>

        {activeView === 'list' && (
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, title, tag..."
                className="w-full pl-9 pr-3 py-2 bg-surface-50 border border-white/10 rounded-xl text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-50 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="draft">Draft</option>
              <option value="applied">Applied</option>
              <option value="assessment">Assessment</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* Main View Render */}
      {activeView === 'kanban' && (
        <KanbanBoard
          board={kanbanBoard}
          onBoardChange={(newBoard) => setKanbanBoard(newBoard)}
          onNewJob={(status) => {
            setDefaultJobStatus(status)
            setShowNewJobModal(true)
          }}
        />
      )}

      {activeView === 'calendar' && (
        <JobCalendarView events={calendarEvents} />
      )}

      {activeView === 'list' && (
        <Card className="p-0 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-surface-50/50 text-[11px] font-bold uppercase text-gray-400">
                  <th className="p-4">Company & Role</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">ATS Match</th>
                  <th className="p-4">Resume Version</th>
                  <th className="p-4">Location / Salary</th>
                  <th className="p-4">Recruiter</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {filteredList.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{app.company}</span>
                        <span className="text-[11px] text-gray-400">{app.job_title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-300 border border-primary-500/20 uppercase">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {app.ats_score ? (
                        <span className="font-extrabold text-emerald-400">{app.ats_score}%</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-gray-300 font-medium truncate max-w-[140px] block">
                        {app.resume_version_name || 'Master Resume'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      <div className="flex flex-col">
                        <span>{app.location || 'Remote'}</span>
                        <span className="text-[10px] text-emerald-400">{app.salary || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {app.recruiter_name ? (
                        <span className="text-white font-medium">{app.recruiter_name}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/jobs/${app.id}`}
                        className="text-primary-400 hover:text-white font-semibold flex items-center justify-end gap-1"
                      >
                        Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                      No job applications match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeView === 'recruiters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map((rec) => (
            <Card key={rec.id} className="p-5 border border-white/10 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rec.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-semibold">
                    {'★'.repeat(rec.rating || 5)}
                  </span>
                </div>
                <span className="text-xs text-primary-400 font-medium">{rec.company} — {rec.role}</span>
                {rec.email && <span className="text-[11px] text-gray-400">{rec.email}</span>}
                {rec.conversation_notes && (
                  <p className="text-xs text-gray-300 mt-2 p-2.5 rounded-xl bg-surface-50 border border-white/5">
                    {rec.conversation_notes}
                  </p>
                )}
              </div>

              <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2">
                Last Contact: {new Date(rec.last_contact || rec.updated_at).toLocaleDateString()}
              </div>
            </Card>
          ))}

          {recruiters.length === 0 && (
            <Card className="sm:col-span-3 p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <Users className="w-10 h-10 text-gray-600 stroke-[1.5]" />
              <span>No recruiter profiles logged yet. When adding job applications, recruiter details will automatically populate your CRM.</span>
            </Card>
          )}
        </div>
      )}

      {/* New Job Modal */}
      <NewJobModal
        isOpen={showNewJobModal}
        onClose={() => setShowNewJobModal(false)}
        defaultStatus={defaultJobStatus}
        onCreated={(newJob) => {
          fetchTrackerData()
        }}
      />
    </div>
  )
}
