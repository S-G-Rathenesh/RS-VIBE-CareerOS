import React, { useState, useCallback } from 'react'
import {
  Sparkles,
  Bot,
  FileCheck,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Wand2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Zap,
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { ResumeSourceSelector, ResumeSourceData } from '../../components/ai/ResumeSourceSelector'
import { JobDescriptionSource } from '../../components/ai/JobDescriptionSource'
import { ATSHistoryDrawer } from '../../components/ai/ATSHistoryDrawer'
import { AIRecommendationModal } from '../../components/ai/AIRecommendationModal'
import { InterviewPrepModal } from '../../components/ai/InterviewPrepModal'
import { AIAssistantOrb } from '../../components/common/AIAssistantOrb'
import api from '../../services/api'
import { useUIStore } from '../../store/useUIStore'

export const AIHubPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [activeTab, setActiveTab] = useState<'ats' | 'summary' | 'cover'>('ats')

  // Career Modal States
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [showRecModal, setShowRecModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)

  // Unified Resume Source State
  const [resumeSource, setResumeSource] = useState<ResumeSourceData>({
    sourceType: 'existing',
    resumeText: '',
  })

  // ATS State
  const [jobDescription, setJobDescription] = useState('')
  const [loadingATS, setLoadingATS] = useState(false)
  const [atsResult, setAtsResult] = useState<any>(null)

  // Summary State
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer')
  const [skillsStr, setSkillsStr] = useState('React, FastAPI, TypeScript, MongoDB')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState('')

  // Cover Letter State
  const [fullName, setFullName] = useState('Alex Vance')
  const [companyName, setCompanyName] = useState('Acme Corp')
  const [targetRole, setTargetRole] = useState('Lead Full Stack Engineer')
  const [coverJobDesc, setCoverJobDesc] = useState('')
  const [loadingCover, setLoadingCover] = useState(false)
  const [generatedCover, setGeneratedCover] = useState('')

  // Copy State
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [copiedCover, setCopiedCover] = useState(false)

  // Handle Resume Source updates
  const handleResumeSourceChange = useCallback((source: ResumeSourceData) => {
    setResumeSource(source)

    // Pre-populate fields in other tabs if raw object exists
    if (source.rawResumeObject) {
      const obj = source.rawResumeObject
      if (obj.personal_info?.full_name) setFullName(obj.personal_info.full_name)
      if (obj.target_role || obj.personal_info?.target_role) {
        const role = obj.target_role || obj.personal_info.target_role
        setTargetRole(role)
        setJobTitle(role)
      }

      // Collect skills
      if (Array.isArray(obj.skills) && obj.skills.length > 0) {
        const allSkills: string[] = []
        for (const cat of obj.skills) {
          if (cat && typeof cat === 'object' && Array.isArray(cat.items)) {
            allSkills.push(...cat.items)
          } else if (typeof cat === 'string') {
            allSkills.push(cat)
          }
        }
        if (allSkills.length > 0) {
          setSkillsStr(allSkills.slice(0, 8).join(', '))
        }
      }
    }
  }, [])

  // ATS Match Calculation
  const handleCalculateATS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeSource.resumeText && !resumeSource.resumeId) {
      addToast({ type: 'error', message: 'Please select or upload a resume.' })
      return
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      addToast({ type: 'error', message: 'Please provide a job description (at least 10 characters).' })
      return
    }

    setLoadingATS(true)
    try {
      const payload: any = {
        job_description: jobDescription,
        target_role: resumeSource.targetRole || undefined,
      }

      if (resumeSource.sourceType === 'existing' && resumeSource.resumeId) {
        payload.resume_id = resumeSource.resumeId
      } else {
        payload.resume_text = resumeSource.resumeText
      }

      const res: any = await api.post('/ai/ats-score', payload)
      if (res.success && res.data) {
        setAtsResult(res.data)
        addToast({ type: 'success', message: 'ATS Match analysis complete!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to calculate ATS score.' })
    } finally {
      setLoadingATS(false)
    }
  }

  // Summary Generator
  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSummary(true)
    try {
      const payload: any = {
        job_title: jobTitle,
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      }
      if (resumeSource.resumeId) {
        payload.resume_id = resumeSource.resumeId
      } else if (resumeSource.resumeText) {
        payload.resume_text = resumeSource.resumeText
      }

      const res: any = await api.post('/ai/summary', payload)
      if (res.success && res.data) {
        setGeneratedSummary(res.data.summary)
        addToast({ type: 'success', message: 'Executive summary generated!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to generate summary.' })
    } finally {
      setLoadingSummary(false)
    }
  }

  // Cover Letter Generator
  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCover(true)
    try {
      const payload: any = {
        full_name: fullName,
        target_role: targetRole,
        company_name: companyName,
        job_description: coverJobDesc || jobDescription || undefined,
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      }
      if (resumeSource.resumeId) {
        payload.resume_id = resumeSource.resumeId
      } else if (resumeSource.resumeText) {
        payload.resume_text = resumeSource.resumeText
      }

      const res: any = await api.post('/ai/cover-letter', payload)
      if (res.success && res.data) {
        setGeneratedCover(res.data.cover_letter)
        addToast({ type: 'success', message: 'Tailored cover letter created!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to generate cover letter.' })
    } finally {
      setLoadingCover(false)
    }
  }

  const copyToClipboard = (text: string, isCover = false) => {
    navigator.clipboard.writeText(text)
    if (isCover) {
      setCopiedCover(true)
      setTimeout(() => setCopiedCover(false), 2000)
    } else {
      setCopiedSummary(true)
      setTimeout(() => setCopiedSummary(false), 2000)
    }
    addToast({ type: 'success', message: 'Copied to clipboard!' })
  }

  const isAtsReady =
    (Boolean(resumeSource.resumeId) || Boolean(resumeSource.resumeText)) &&
    Boolean(jobDescription.trim().length >= 10)

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-6">
          <div className="hidden lg:block shrink-0">
            <AIAssistantOrb size="md" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-pink">
              <Sparkles className="w-4 h-4 text-accent-pink" />
              AI Career Workstation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Career Suite & <span className="gradient-text">ATS Analyzer</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Seamlessly optimize your resume against any job description with zero manual copy-pasting.
            </p>
          </div>
        </div>

        {resumeSource.resumeTitle && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-50 border border-white/10 text-xs text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white truncate max-w-[180px]">
              {resumeSource.resumeTitle}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs & Career Workstation Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('ats')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'ats'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCheck className="w-4 h-4" /> ATS Match Analyzer
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-4 h-4" /> Summary Generator
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'cover'
                ? 'bg-primary-600 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" /> Cover Letter Studio
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryDrawer(true)}
            className="text-xs flex items-center gap-1.5 text-accent-cyan border-accent-cyan/30 hover:bg-accent-cyan/10"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> ATS Audit History
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecModal(true)}
            className="text-xs flex items-center gap-1.5 text-accent-violet border-accent-violet/30 hover:bg-accent-violet/10"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Career Roadmap
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => setShowInterviewModal(true)}
            className="text-xs flex items-center gap-1.5 bg-accent-pink/20 text-accent-pink border border-accent-pink/30 hover:bg-accent-pink/30"
          >
            <Zap className="w-3.5 h-3.5" /> Interview Prep
          </Button>
        </div>
      </div>

      {/* Tab 1: ATS Match Analyzer */}
      {activeTab === 'ats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Panel */}
          <Card className="p-6 flex flex-col gap-6 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-400" /> Compare Resume vs Job Description
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-300 border border-primary-500/20 font-medium">
                10 AI Credits
              </span>
            </div>

            <form onSubmit={handleCalculateATS} className="flex flex-col gap-6">
              {/* 1. Smart Resume Source Selector */}
              <ResumeSourceSelector
                onSourceChange={handleResumeSourceChange}
                disabled={loadingATS}
              />

              {/* 2. Smart Job Description Source */}
              <JobDescriptionSource
                value={jobDescription}
                onChange={setJobDescription}
                disabled={loadingATS}
              />

              {/* Submit Action */}
              <Button
                type="submit"
                variant="glow"
                size="lg"
                isLoading={loadingATS}
                disabled={!isAtsReady || loadingATS}
                className="w-full"
              >
                <span>Run AI ATS Match Audit</span>
                <Sparkles className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </Card>

          {/* Results Panel */}
          <Card className="p-6 flex flex-col gap-6 border border-white/10 min-h-[420px]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-cyan" /> ATS Audit Breakdown
            </h3>

            {atsResult ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-5 bg-surface-50 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Match Compatibility</span>
                    <span className="text-xl font-extrabold text-white mt-0.5">
                      {atsResult.match_status}
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-extrabold text-xl shadow-glow-primary">
                    {atsResult.score}%
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matching Keywords Found ({atsResult.matching_keywords?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.matching_keywords?.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missing / Recommended Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missing_keywords?.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-300 text-[11px] font-medium border border-yellow-500/20"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-accent-pink" /> Improvement Action Plan:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-300 list-disc pl-4 leading-relaxed">
                    {atsResult.improvement_recommendations?.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-16 text-center gap-3 text-gray-500">
                <Bot className="w-12 h-12 stroke-[1.5] text-gray-600" />
                <p className="text-xs max-w-xs leading-relaxed">
                  Select your resume and enter a target job description on the left to run an automated ATS match audit.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Summary Generator */}
      {activeTab === 'summary' && (
        <Card className="max-w-3xl mx-auto w-full p-8 flex flex-col gap-6 border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-accent-violet" /> Executive Summary Generator
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-medium">
              5 AI Credits
            </span>
          </div>

          <form onSubmit={handleGenerateSummary} className="flex flex-col gap-4">
            <Input
              label="Target Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Software Engineer"
              required
            />
            <Input
              label="Core Skills (Comma separated)"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="React, FastAPI, Python, MongoDB"
              required
            />
            <Button type="submit" variant="primary" size="lg" isLoading={loadingSummary}>
              <Sparkles className="w-4 h-4 mr-1" /> Generate Executive Summary
            </Button>
          </form>

          {generatedSummary && (
            <div className="mt-4 p-5 bg-surface-50 rounded-2xl border border-white/10 flex flex-col gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider">
                  AI Generated Summary
                </span>
                <button
                  onClick={() => copyToClipboard(generatedSummary)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
                </button>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed font-sans">{generatedSummary}</p>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Cover Letter Studio */}
      {activeTab === 'cover' && (
        <Card className="max-w-3xl mx-auto w-full p-8 flex flex-col gap-6 border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-pink" /> AI Cover Letter Studio
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent-pink/10 text-accent-pink border border-accent-pink/20 font-medium">
              5 AI Credits
            </span>
          </div>

          <form onSubmit={handleGenerateCoverLetter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Target Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Target Job Description (Optional context)
              </label>
              <textarea
                rows={4}
                value={coverJobDesc}
                onChange={(e) => setCoverJobDesc(e.target.value)}
                placeholder="Paste job posting snippet for targeted company alignment..."
                className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="glow" size="lg" isLoading={loadingCover} className="w-full">
                <Send className="w-4 h-4 mr-1" /> Craft Tailored Cover Letter
              </Button>
            </div>
          </form>

          {generatedCover && (
            <div className="mt-4 p-5 bg-surface-50 rounded-2xl border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent-pink uppercase tracking-wider">
                  AI Cover Letter Result
                </span>
                <button
                  onClick={() => copyToClipboard(generatedCover, true)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedCover ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
                </button>
              </div>
              <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                {generatedCover}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* ═══ Career Workstation Modals ═══ */}
      <ATSHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
      />

      <AIRecommendationModal
        isOpen={showRecModal}
        onClose={() => setShowRecModal(false)}
        resumeId={resumeSource.resumeId}
        targetRole={targetRole || jobTitle}
      />

      <InterviewPrepModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        resumeId={resumeSource.resumeId}
        resumeText={resumeSource.resumeText}
        defaultRole={targetRole || jobTitle}
      />
    </div>
  )
}
