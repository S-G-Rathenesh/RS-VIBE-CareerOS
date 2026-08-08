import React, { useState } from 'react'
import {
  Sparkles,
  X,
  Zap,
  Target,
  Wand2,
  FileText,
  HelpCircle,
  History,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface AIWorkflowActionsPanelProps {
  isOpen: boolean
  onClose: () => void
  resumeId: string
  resumeData: any
  onUpdateResume: (updated: any) => void
  onOpenVersions: () => void
  onOpenAudit: () => void
}

export const AIWorkflowActionsPanel: React.FC<AIWorkflowActionsPanelProps> = ({
  isOpen,
  onClose,
  resumeId,
  resumeData,
  onUpdateResume,
  onOpenVersions,
  onOpenAudit,
}) => {
  const { addToast } = useUIStore()

  // Tailor state
  const [targetCompany, setTargetCompany] = useState('')
  const [targetRole, setTargetRole] = useState(resumeData?.target_role || '')
  const [jobDescription, setJobDescription] = useState('')
  const [loadingTailor, setLoadingTailor] = useState(false)
  const [tailorResult, setTailorResult] = useState<any>(null)

  // Cover Letter & Interview state
  const [loadingCover, setLoadingCover] = useState(false)
  const [generatedCover, setGeneratedCover] = useState('')
  const [copiedCover, setCopiedCover] = useState(false)

  const [loadingInterview, setLoadingInterview] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([])

  // 1-Click Tailor Action
  const handleTailorResume = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      addToast({ type: 'error', message: 'Please provide a target job description.' })
      return
    }

    setLoadingTailor(true)
    try {
      const res: any = await api.post(`/resumes/${resumeId}/tailor-and-version`, {
        resume_id: resumeId,
        company: targetCompany.trim() || undefined,
        job_title: targetRole.trim() || undefined,
        job_description: jobDescription.trim(),
        create_version: true,
      })

      if (res.success && res.data) {
        setTailorResult(res.data)
        addToast({
          type: 'success',
          message: `Created tailored child version: "${res.data.version_name || 'Tailored Edition'}" (${res.data.ats_match_score}% ATS)`,
        })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to tailor resume.' })
    } finally {
      setLoadingTailor(false)
    }
  }

  // Apply Tailored Version to Active Editor
  const handleApplyTailoredData = () => {
    if (tailorResult?.tailored_resume_data) {
      onUpdateResume(tailorResult.tailored_resume_data)
      addToast({ type: 'success', message: 'Applied tailored summary and skills to active editor!' })
      setTailorResult(null)
    }
  }

  // Generate Cover Letter
  const handleGenerateCover = async () => {
    setLoadingCover(true)
    try {
      const res: any = await api.post('/ai/cover-letter', {
        resume_id: resumeId,
        full_name: resumeData?.personal_info?.full_name || 'Candidate',
        target_role: targetRole || resumeData?.target_role || 'Software Engineer',
        company_name: targetCompany || 'Target Organization',
        job_description: jobDescription || undefined,
      })
      if (res.success && res.data) {
        setGeneratedCover(res.data.cover_letter)
        addToast({ type: 'success', message: 'Tailored cover letter generated and saved to history!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to generate cover letter.' })
    } finally {
      setLoadingCover(false)
    }
  }

  // Generate Interview Prep
  const handleGenerateInterview = async () => {
    setLoadingInterview(true)
    try {
      const res: any = await api.post('/ai/interview-prep', {
        resume_id: resumeId,
        job_title: targetRole || resumeData?.target_role || 'Software Engineer',
        company: targetCompany || 'Target Company',
        job_description: jobDescription || undefined,
      })
      if (res.success && res.data?.questions) {
        setInterviewQuestions(res.data.questions)
        addToast({ type: 'success', message: 'Generated targeted interview questions & model tips!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to generate interview prep.' })
    } finally {
      setLoadingInterview(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-surface-100 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center text-accent-pink">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Career Workflow Automation
              </h2>
              <p className="text-xs text-gray-400">
                1-Click Tailoring, ATS Audits, Linked Cover Letters & Interview Prep
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

        {/* Action Suite Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Station */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenAudit}
              className="p-3 rounded-2xl bg-surface-50 border border-white/5 hover:border-primary-500/40 hover:bg-primary-500/10 transition-all text-left flex flex-col gap-1 group"
            >
              <div className="flex items-center gap-1.5 text-primary-400 font-bold text-[11px]">
                <Target className="w-3.5 h-3.5 shrink-0" /> ATS Audit
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Scan formatting & density
              </p>
            </button>

            <button
              onClick={onOpenVersions}
              className="p-3 rounded-2xl bg-surface-50 border border-white/5 hover:border-accent-cyan/40 hover:bg-accent-cyan/10 transition-all text-left flex flex-col gap-1 group"
            >
              <div className="flex items-center gap-1.5 text-accent-cyan font-bold text-[11px]">
                <History className="w-3.5 h-3.5 shrink-0" /> Versions
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Diffs & snapshots
              </p>
            </button>

            <a
              href="/jobs"
              className="p-3 rounded-2xl bg-surface-50 border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all text-left flex flex-col gap-1 group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5 shrink-0" /> Job Tracker
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                CRM & Kanban
              </p>
            </a>
          </div>

          {/* Section 1: 1-Click Resume Tailoring */}
          <Card className="p-5 flex flex-col gap-4 border border-accent-pink/20 bg-accent-pink/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 1-Click AI Resume Tailoring
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent-pink/15 text-accent-pink border border-accent-pink/30 font-semibold">
                Creates New Version
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Input a job posting. AI will enhance your summary, align experience bullets, inject missing keywords, and create a targeted child version automatically.
            </p>

            <form onSubmit={handleTailorResume} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Company"
                  placeholder="e.g. Google, Amazon, Stripe"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="text-xs"
                />
                <Input
                  label="Target Role"
                  placeholder="e.g. Senior Cloud Architect"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Job Description / Requirements
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job posting snippet or responsibilities..."
                  className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-accent-pink"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                size="md"
                isLoading={loadingTailor}
                className="w-full text-xs"
              >
                <span>Generate Targeted Child Version</span>
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            {/* Tailor Results Banner */}
            {tailorResult && (
              <div className="p-4 rounded-2xl bg-surface-50 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Version Created: "{tailorResult.version_name}"</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                    {tailorResult.ats_match_score}% ATS
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-300">
                    Tailored Summary Preview:
                  </span>
                  <p className="text-xs text-gray-400 italic bg-surface-100 p-2.5 rounded-xl border border-white/5">
                    "{tailorResult.optimized_summary}"
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyTailoredData}
                  className="w-full text-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1" /> Switch Active Editor to this Version
                </Button>
              </div>
            )}
          </Card>

          {/* Section 2: Linked Cover Letter */}
          <Card className="p-5 flex flex-col gap-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent-cyan" /> Linked Cover Letter
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCover}
                isLoading={loadingCover}
                className="text-xs"
              >
                Generate for this Role
              </Button>
            </div>

            {generatedCover && (
              <div className="p-3.5 bg-surface-50 rounded-2xl border border-white/10 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Cover Letter Preview</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCover)
                      setCopiedCover(true)
                      setTimeout(() => setCopiedCover(false), 2000)
                      addToast({ type: 'success', message: 'Cover letter copied!' })
                    }}
                    className="hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedCover ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-xs text-gray-300 whitespace-pre-line max-h-40 overflow-y-auto leading-relaxed">
                  {generatedCover}
                </p>
              </div>
            )}
          </Card>

          {/* Section 3: Targeted Interview Prep */}
          <Card className="p-5 flex flex-col gap-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent-violet" /> Targeted Interview Prep
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInterview}
                isLoading={loadingInterview}
                className="text-xs"
              >
                Generate Questions
              </Button>
            </div>

            {interviewQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                {interviewQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-surface-50 rounded-xl border border-white/5 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-300">{q.category}</span>
                    </div>
                    <p className="text-white font-medium">{q.question}</p>
                    <p className="text-[11px] text-gray-400 bg-surface-100 p-2 rounded-lg border border-white/5">
                      💡 Tip: {q.model_tip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
