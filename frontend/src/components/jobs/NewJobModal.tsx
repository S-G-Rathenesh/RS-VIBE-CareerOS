import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface NewJobModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (newJob: any) => void
  defaultStatus?: string
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultStatus = 'applied',
}) => {
  const { addToast } = useUIStore()
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [careerPageUrl, setCareerPageUrl] = useState('')
  const [status, setStatus] = useState(defaultStatus)
  const [salary, setSalary] = useState('')
  const [location, setLocation] = useState('Remote')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [recruiterName, setRecruiterName] = useState('')
  const [recruiterEmail, setRecruiterEmail] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [loading, setLoading] = useState(false)

  // Resumes list for linking
  const [resumes, setResumes] = useState<any[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus)
      api.get<any, any>('/resumes')
        .then((res) => {
          if (res.success && res.data) {
            setResumes(res.data)
            if (res.data.length > 0) setSelectedResumeId(res.data[0].id)
          }
        })
        .catch(() => {})
    }
  }, [isOpen, defaultStatus])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !jobTitle.trim()) {
      addToast({ type: 'error', message: 'Company and Job Title are required.' })
      return
    }

    setLoading(true)
    try {
      const selectedResume = resumes.find((r) => r.id === selectedResumeId)
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        company,
        job_title: jobTitle,
        job_description: jobDescription || undefined,
        career_page_url: careerPageUrl || undefined,
        status,
        salary: salary || undefined,
        location: location || 'Remote',
        employment_type: employmentType,
        resume_id: selectedResumeId || undefined,
        resume_version_name: selectedResume ? selectedResume.title : undefined,
        recruiter_name: recruiterName || undefined,
        recruiter_email: recruiterEmail || undefined,
        tags: tags.length > 0 ? tags : [company],
      }

      const res: any = await api.post('/jobs', payload)
      if (res.success && res.data) {
        addToast({ type: 'success', message: `Job workspace for ${company} created!` })
        onCreated(res.data)
        onClose()
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to create job application' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border border-white/10 bg-surface-100 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Job Application Workspace</h2>
              <p className="text-xs text-gray-400">Track company, stage, linked resume, and recruiter contact.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Google, Stripe, Microsoft..."
              required
            />
            <Input
              label="Job Title / Role *"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Staff Software Engineer..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Stage Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-50 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary-500"
              >
                <option value="draft">Draft</option>
                <option value="applied">Applied</option>
                <option value="assessment">Assessment</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote / San Francisco"
            />

            <Input
              label="Salary / Comp"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="$180k - $220k"
            />
          </div>

          {/* Linked Resume */}
          {resumes.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Link Resume / Version Asset
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-surface-50 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.target_role || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Recruiter Details */}
          <div className="p-4 rounded-2xl bg-surface-50/50 border border-white/5 space-y-3">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-accent-cyan" /> Recruiter / Contact (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Recruiter Name"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Sarah Jenkins"
              />
              <Input
                label="Recruiter Email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="sarah@company.com"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">
              Job Description (Optional context for AI Email & Interview tools)
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job responsibilities or requirements snippet..."
              className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Career / Posting URL"
              value={careerPageUrl}
              onChange={(e) => setCareerPageUrl(e.target.value)}
              placeholder="https://company.com/jobs/123"
            />
            <Input
              label="Tags (Comma-separated)"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Tier 1, Cloud, Referral"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="glow" size="lg" isLoading={loading} className="w-full">
              <Plus className="w-4 h-4 mr-1.5" /> Create Application Workspace
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
