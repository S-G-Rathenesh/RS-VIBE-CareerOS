import React, { useState } from 'react'
import {
  HelpCircle,
  X,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Award,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface InterviewPrepModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId?: string
  resumeText?: string
  defaultRole?: string
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  resumeText,
  defaultRole = 'Senior Software Engineer',
}) => {
  const { addToast } = useUIStore()
  const [jobTitle, setJobTitle] = useState(defaultRole)
  const [company, setCompany] = useState('Google')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [keyTopics, setKeyTopics] = useState<string[]>([])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res: any = await api.post('/ai/interview-prep', {
        resume_id: resumeId,
        resume_text: resumeText,
        job_title: jobTitle,
        company: company,
        job_description: jobDescription || undefined,
      })

      if (res.success && res.data?.questions) {
        setQuestions(res.data.questions)
        setKeyTopics(res.data.key_topics || [])
        addToast({ type: 'success', message: 'Targeted interview questions generated!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to generate interview prep.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border border-white/10 bg-surface-100 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center text-accent-pink">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Targeted AI Interview Preparation Station
              </h2>
              <p className="text-xs text-gray-400">
                Technical, behavioral, and architecture questions synthesized from your active resume.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls */}
          <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-surface-50 border border-white/5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Target Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Amazon, Meta..."
                required
              />
              <Input
                label="Target Role"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Principal Cloud Architect..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Job Description Snippet (Optional Context)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities for precision question tailoring..."
                className="w-full bg-surface-100 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-accent-pink"
              />
            </div>
            <Button type="submit" variant="glow" size="md" isLoading={loading} className="w-full">
              <Sparkles className="w-4 h-4 mr-1.5" /> Synthesize Targeted Interview Questions
            </Button>
          </form>

          {/* Key Evaluation Topics */}
          {keyTopics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-300">Key Focus Areas:</span>
              {keyTopics.map((top, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-300 text-xs font-semibold border border-primary-500/20"
                >
                  {top}
                </span>
              ))}
            </div>
          )}

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-pink uppercase tracking-wider">
                      {q.category}
                    </span>
                    <span className="text-[10px] text-gray-500">Question #{idx + 1}</span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                    <div className="p-3 bg-surface-100 rounded-xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-primary-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> What Interviewers Evaluate:
                      </span>
                      <p className="text-gray-300 leading-relaxed">{q.looking_for}</p>
                    </div>

                    <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Model Answer Tip:
                      </span>
                      <p className="text-emerald-200/90 leading-relaxed">{q.model_tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <MessageSquare className="w-10 h-10 text-gray-600 stroke-[1.5]" />
              <span>Enter your target company & role above to generate tailored interview questions.</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
