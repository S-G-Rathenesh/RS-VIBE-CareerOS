import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Sparkles,
  User,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Plus,
  Send,
  Copy,
  Video,
  Award,
  DollarSign,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ROUTES } from '../../constants/routes'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

export const JobWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()

  const [job, setJob] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'interviews' | 'emails' | 'recruiter' | 'documents'>('overview')

  // Timeline Event Modal State
  const [newTimelineTitle, setNewTimelineTitle] = useState('')
  const [newTimelineDesc, setNewTimelineDesc] = useState('')

  // Interview Modal State
  const [newRoundName, setNewRoundName] = useState('Technical Screen')
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewerRole, setInterviewerRole] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [interviewScore, setInterviewScore] = useState<number>(85)

  // AI Email Studio State
  const [emailType, setEmailType] = useState('follow_up')
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailKeyPoints, setEmailKeyPoints] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  const fetchJobWorkspace = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res: any = await api.get(`/jobs/${id}`)
      if (res.success && res.data) {
        setJob(res.data)
        setEmailRecipient(res.data.recruiter_name || 'Hiring Team')
      } else {
        // Fallback demo mock if local test
        setJob({
          id,
          company: 'Google',
          job_title: 'Staff Cloud Infrastructure Architect',
          status: 'interview',
          salary: '$220k - $275k',
          location: 'Remote',
          ats_score: 93,
          resume_version_name: 'Google SWE Tailored Edition',
          job_description: 'Architecting ultra-reliable multi-region Kubernetes mesh, distributed storage, and gRPC backends.',
          application_date: new Date().toISOString(),
          recruiter_name: 'Sarah Jenkins',
          recruiter_email: 'sarah@google.com',
          recruiter_linkedin: 'https://linkedin.com/in/sarahjenkins',
          timeline: [
            {
              id: 't1',
              title: 'AI Tailored Application Pipeline Completed',
              description: 'Generated Google SWE Tailored Edition resume and cover letter with 93% ATS match.',
              date: new Date().toISOString(),
              icon: 'sparkles',
            },
            {
              id: 't2',
              title: 'Application Submitted via Google Careers',
              description: 'Uploaded tailored resume PDF and custom cover letter.',
              date: new Date().toISOString(),
              icon: 'briefcase',
            },
          ],
          interviews: [
            {
              id: 'iv1',
              round_name: 'Technical Screening',
              interviewer_name: 'Staff Engineer',
              interviewer_role: 'Cloud Mesh Lead',
              score: 92,
              user_notes: 'Discussed distributed consensus, Raft vs Paxos, and container cold start optimizations.',
              weak_areas: ['Memory allocation benchmarks in Rust'],
              strong_areas: ['Distributed System Design', 'Kubernetes Networking'],
              ai_suggestions: ['Highlight STAR metrics: reduced latency by 35% across 20k nodes.'],
            },
          ],
        })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to load application workspace' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobWorkspace()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !job) return
    try {
      const res: any = await api.put(`/jobs/${id}/status?status_val=${newStatus}`, {})
      if (res.success && res.data) {
        setJob(res.data)
        addToast({ type: 'success', message: `Stage moved to ${newStatus.toUpperCase()}` })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update stage' })
    }
  }

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTimelineTitle.trim() || !id) return
    try {
      const res: any = await api.post(`/jobs/${id}/timeline`, {
        title: newTimelineTitle,
        description: newTimelineDesc || undefined,
        icon: 'git-commit',
      })
      if (res.success) {
        addToast({ type: 'success', message: 'Timeline event recorded' })
        setNewTimelineTitle('')
        setNewTimelineDesc('')
        fetchJobWorkspace()
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to add timeline event' })
    }
  }

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoundName.trim() || !id) return
    try {
      const res: any = await api.post(`/jobs/${id}/interviews`, {
        round_name: newRoundName,
        interviewer_name: interviewerName || undefined,
        interviewer_role: interviewerRole || undefined,
        user_notes: interviewNotes || undefined,
        score: interviewScore,
      })
      if (res.success) {
        addToast({ type: 'success', message: 'Interview session round logged' })
        setNewRoundName('Technical Round 2')
        setInterviewerName('')
        setInterviewerRole('')
        setInterviewNotes('')
        fetchJobWorkspace()
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to log interview round' })
    }
  }

  const handleGenerateEmail = async () => {
    if (!job) return
    setEmailLoading(true)
    try {
      const res: any = await api.post('/jobs/generate-email', {
        email_type: emailType,
        company: job.company,
        job_title: job.job_title,
        recipient_name: emailRecipient || 'Hiring Team',
        key_points: emailKeyPoints || undefined,
      })
      if (res.success && res.data) {
        setGeneratedEmail(res.data)
        addToast({ type: 'success', message: 'AI Email Draft Ready!' })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to generate email' })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!id || !confirm('Are you sure you want to delete this job application workspace?')) return
    try {
      await api.delete(`/jobs/${id}`)
      addToast({ type: 'success', message: 'Job application deleted' })
      navigate(ROUTES.JOBS)
    } catch {
      addToast({ type: 'error', message: 'Failed to delete application' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-white">Application Workspace Not Found</h2>
        <Link to={ROUTES.JOBS} className="text-primary-400 mt-2 block">
          Back to Job Tracker
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.JOBS}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Tracker CRM
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteJob}
          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Workspace
        </Button>
      </div>

      {/* Workspace Header Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> {job.company}
            </span>
            {job.ats_score && (
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {job.ats_score}% ATS Match
              </span>
            )}
            {job.resume_version_name && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                {job.resume_version_name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {job.job_title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-500" /> {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <DollarSign className="w-3.5 h-3.5" /> {job.salary}
              </span>
            )}
            {job.application_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" /> Applied:{' '}
                {new Date(job.application_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Stage Status Selector */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <span className="text-[11px] font-bold uppercase text-gray-400">Application Stage</span>
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-surface-50 border border-primary-500/40 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary-500"
          >
            <option value="draft">Draft</option>
            <option value="applied">Applied & Submitted</option>
            <option value="assessment">Assessment / Take-Home</option>
            <option value="interview">Interviewing</option>
            <option value="offer">Offer Received 🎉</option>
            <option value="rejected">Archived / Rejected</option>
            <option value="accepted">Offer Accepted</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview & JD', icon: Briefcase },
          { id: 'timeline', label: 'Timeline & History', icon: Clock },
          { id: 'interviews', label: 'Interview Center', icon: Video },
          { id: 'emails', label: 'AI Email Studio', icon: Send },
          { id: 'recruiter', label: 'Recruiter CRM', icon: User },
          { id: 'documents', label: 'Document Vault', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                active
                  ? 'bg-primary-600 text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-400" /> Target Job Description
              </h3>
              <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                {job.job_description || 'No job description provided for this application.'}
              </p>
            </Card>

            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-pink" /> AI Application Notes & Recommendations
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {job.notes || 'All application assets, ATS keyword alignments, and child snapshots are saved.'}
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Connected Assets
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400">Tailored Resume Version</span>
                  <span className="font-bold text-white">{job.resume_version_name || 'Master Resume'}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400">ATS Keyword Fit</span>
                  <span className="font-bold text-emerald-400">{job.ats_score || 90}% Match Score</span>
                </div>
                {job.recruiter_name && (
                  <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400">Primary Recruiter</span>
                    <span className="font-bold text-accent-cyan">{job.recruiter_name}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Timeline */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 border border-white/10 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" /> Application Journey Timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {job.timeline?.map((event: any) => (
                  <div key={event.id} className="relative flex items-start gap-4 group">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] shadow-glow-primary">
                      ✓
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{event.title}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(event.date || event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-400">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-400" /> Log Custom Event / Milestone
              </h3>
              <form onSubmit={handleAddTimeline} className="space-y-3">
                <Input
                  label="Event Title *"
                  value={newTimelineTitle}
                  onChange={(e) => setNewTimelineTitle(e.target.value)}
                  placeholder="e.g. Recruiter Phone Screen Completed"
                  required
                />
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Notes / Outcomes</label>
                  <textarea
                    rows={3}
                    value={newTimelineDesc}
                    onChange={(e) => setNewTimelineDesc(e.target.value)}
                    placeholder="Feedback from interviewer, next steps discussed..."
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <Button type="submit" variant="glow" size="sm" className="w-full">
                  Append to Timeline
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Interview Center */}
      {activeTab === 'interviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {job.interviews?.map((iv: any) => (
              <Card key={iv.id} className="p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{iv.round_name}</span>
                    <span className="text-xs text-gray-400">
                      {iv.interviewer_name || 'Interview Team'} ({iv.interviewer_role || 'Interviewer'})
                    </span>
                  </div>
                  {iv.score && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Score: {iv.score}%
                    </span>
                  )}
                </div>

                {iv.user_notes && (
                  <p className="text-xs text-gray-300 bg-surface-50 p-3 rounded-xl border border-white/5">
                    <strong>Notes:</strong> {iv.user_notes}
                  </p>
                )}

                {iv.strong_areas?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Strengths:</span>
                    {iv.strong_areas.map((s: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {iv.ai_suggestions?.length > 0 && (
                  <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 rounded-xl text-xs text-accent-pink flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{iv.ai_suggestions[0]}</span>
                  </div>
                )}
              </Card>
            ))}

            {(!job.interviews || job.interviews.length === 0) && (
              <Card className="p-12 text-center text-xs text-gray-500">
                No interview sessions logged for this role yet.
              </Card>
            )}
          </div>

          <div>
            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-400" /> Log Interview Session
              </h3>
              <form onSubmit={handleAddInterview} className="space-y-3">
                <Input
                  label="Round Name *"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  placeholder="System Design Round"
                  required
                />
                <Input
                  label="Interviewer Name"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="Alex Chen"
                />
                <Input
                  label="Interviewer Role"
                  value={interviewerRole}
                  onChange={(e) => setInterviewerRole(e.target.value)}
                  placeholder="Engineering Director"
                />
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Debrief / Notes</label>
                  <textarea
                    rows={3}
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="Questions asked, system diagrams drawn, follow-up items..."
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <Button type="submit" variant="glow" size="sm" className="w-full">
                  Save Interview Round
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Email Studio */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <Card className="p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-pink" /> AI Communication Studio
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Email Purpose</label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="w-full bg-surface-50 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary-500"
                  >
                    <option value="thank_you">Post-Interview Thank You</option>
                    <option value="follow_up">Status Follow-up</option>
                    <option value="salary_negotiation">Salary & Comp Negotiation</option>
                    <option value="acceptance">Formal Offer Acceptance</option>
                    <option value="decline">Gracious Offer Decline</option>
                    <option value="referral_request">Team Referral Request</option>
                  </select>
                </div>

                <Input
                  label="Recipient Name"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="Sarah Jenkins"
                />

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">
                    Specific Points to Mention
                  </label>
                  <textarea
                    rows={3}
                    value={emailKeyPoints}
                    onChange={(e) => setEmailKeyPoints(e.target.value)}
                    placeholder="e.g. Target $210k base, mentioned distributed cache project..."
                    className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <Button
                  variant="glow"
                  size="md"
                  onClick={handleGenerateEmail}
                  isLoading={emailLoading}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-1" /> Generate Email Draft
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" /> Generated Email Draft
                </h3>
                {generatedEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
                      )
                      addToast({ type: 'success', message: 'Copied email to clipboard!' })
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Draft
                  </Button>
                )}
              </div>

              {generatedEmail ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-surface-50 border border-white/5">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Subject</span>
                    <span className="text-xs font-bold text-white">{generatedEmail.subject}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-50 border border-white/5 whitespace-pre-wrap text-xs text-gray-300 leading-relaxed font-mono">
                    {generatedEmail.body}
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                  Select email type and click "Generate Email Draft" to synthesize a tailored message.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Recruiter CRM */}
      {activeTab === 'recruiter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-accent-cyan" /> Recruiter Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400">Name</span>
                <span className="font-bold text-white">{job.recruiter_name || 'Not assigned'}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400">Email</span>
                <span className="font-bold text-primary-300">{job.recruiter_email || 'Not provided'}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400">LinkedIn</span>
                <span className="font-bold text-gray-300">{job.recruiter_linkedin || 'Not provided'}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {activeTab === 'documents' && (
        <Card className="p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-400" /> Attached Application Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-surface-50 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-400" />
                <div>
                  <span className="font-bold text-white block">{job.resume_version_name || 'Tailored Resume'}</span>
                  <span className="text-[10px] text-gray-400">Version Snapshot (MongoDB)</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">Custom Cover Letter</span>
                  <span className="text-[10px] text-gray-400">Linked to {job.company}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
