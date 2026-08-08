import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  X,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  BrainCircuit,
  Zap,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface ApplyWithResumeModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId: string
  resumeTitle?: string
  defaultRole?: string
}

export const ApplyWithResumeModal: React.FC<ApplyWithResumeModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
  defaultRole = 'Senior Software Engineer',
}) => {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [company, setCompany] = useState('Google')
  const [jobTitle, setJobTitle] = useState(defaultRole)
  const [location, setLocation] = useState('Remote')
  const [salary, setSalary] = useState('$190k - $240k')
  const [jobDescription, setJobDescription] = useState('')
  const [autoTailor, setAutoTailor] = useState(true)
  const [autoCoverLetter, setAutoCoverLetter] = useState(true)
  const [autoInterviewPrep, setAutoInterviewPrep] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  if (!isOpen) return null

  const handleExecutePipeline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      addToast({ type: 'error', message: 'Please paste the Job Description to tailor assets.' })
      return
    }

    setLoading(true)
    try {
      const res: any = await api.post('/jobs/apply-workflow', {
        parent_resume_id: resumeId,
        company,
        job_title: jobTitle,
        job_description: jobDescription,
        location,
        salary: salary || undefined,
        auto_tailor: autoTailor,
        auto_cover_letter: autoCoverLetter,
        auto_interview_prep: autoInterviewPrep,
      })

      if (res.success && res.data) {
        setResult(res.data)
        addToast({
          type: 'success',
          message: `Application workspace for ${company} created with ${res.data.ats_score}% ATS score!`,
        })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Pipeline execution failed' })
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
            <div className="w-9 h-9 rounded-xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center text-accent-pink">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                1-Click Apply & Tailor Pipeline
              </h2>
              <p className="text-xs text-gray-400">
                Spawns a tailored resume version, ATS audit, cover letter, and interview prep workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!result ? (
            <form onSubmit={handleExecutePipeline} className="space-y-4">
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center gap-3 text-xs text-primary-300">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Parent Resume: <strong className="text-white">{resumeTitle || 'Master Resume'}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Target Company *"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google, Stripe, Amazon..."
                  required
                />
                <Input
                  label="Target Role *"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Principal Cloud Architect..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / San Francisco"
                />
                <Input
                  label="Target Comp"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="$190k - $240k"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Job Description * (AI analyzes keywords & aligns experience)
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job posting snippet here..."
                  className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-accent-pink"
                  required
                />
              </div>

              {/* Automation Checkboxes */}
              <div className="p-4 rounded-2xl bg-surface-50 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white block mb-1">Automated Pipeline Actions:</span>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTailor}
                    onChange={(e) => setAutoTailor(e.target.checked)}
                    className="rounded border-white/20 bg-surface-100 text-accent-pink focus:ring-0"
                  />
                  <span>Create Tailored Child Resume Snapshot in MongoDB</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCoverLetter}
                    onChange={(e) => setAutoCoverLetter(e.target.checked)}
                    className="rounded border-white/20 bg-surface-100 text-accent-pink focus:ring-0"
                  />
                  <span>Draft & Link Role-Aligned Cover Letter</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoInterviewPrep}
                    onChange={(e) => setAutoInterviewPrep(e.target.checked)}
                    className="rounded border-white/20 bg-surface-100 text-accent-pink focus:ring-0"
                  />
                  <span>Synthesize 8 Targeted Interview Questions for Screening</span>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="glow" size="lg" isLoading={loading} className="w-full">
                  <Sparkles className="w-4 h-4 mr-1.5" /> Execute 1-Click Application Pipeline
                </Button>
              </div>
            </form>
          ) : (
            /* Success Summary & Navigation */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">Application Workspace Ready!</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Your resume has been tailored for <strong>{result.company}</strong>, generating an ATS match score of{' '}
                  <span className="text-emerald-400 font-bold">{result.ats_score}%</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Resume Version</span>
                  <span className="text-xs font-bold text-white truncate">{result.resume_version_name}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">ATS Compatibility</span>
                  <span className="text-xs font-bold text-emerald-400">{result.ats_score}% Match</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-50 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Interview Questions</span>
                  <span className="text-xs font-bold text-accent-pink">{result.interview_questions_count} Questions Prepped</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="md" onClick={onClose}>
                  Stay in Builder
                </Button>
                <Button
                  variant="glow"
                  size="md"
                  onClick={() => {
                    onClose()
                    navigate(`/jobs/${result.application_id}`)
                  }}
                >
                  Open Application Workspace <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
