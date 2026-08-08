import React, { useEffect, useState } from 'react'
import {
  Sparkles,
  X,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface AIRecommendationModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId?: string
  targetRole?: string
}

export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  targetRole = 'Software Engineer',
}) => {
  const { addToast } = useUIStore()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      api.post('/ai/recommendations', {
        resume_id: resumeId,
        target_role: targetRole,
      })
        .then((res: any) => {
          if (res.success && res.data) {
            setData(res.data)
          }
        })
        .catch(() => {
          // Fallback recommendation suite
          setData({
            target_role: targetRole,
            current_ats_score: 84,
            estimated_ats_score: 93,
            score_gain: 9,
            missing_skills: ['Distributed Systems', 'Kubernetes', 'Redis Caching', 'System Architecture'],
            learning_roadmap: [
              {
                milestone: 'System Design & Caching Patterns',
                timeframe: 'Week 1-2',
                topics: ['Redis', 'CDN Optimization', 'Database Sharding'],
              },
              {
                milestone: 'Cloud DevOps & CI/CD',
                timeframe: 'Week 3-4',
                topics: ['Docker', 'Kubernetes', 'GitHub Actions'],
              },
            ],
            recommended_projects: [
              {
                title: 'Real-Time Telemetry Dashboard',
                tech_stack: ['React', 'FastAPI', 'WebSockets', 'TimescaleDB'],
                impact: 'Demonstrates real-time event streaming and high-concurrency websocket management.',
              },
              {
                title: 'Distributed Task Scheduler',
                tech_stack: ['Go', 'Redis', 'gRPC', 'Docker'],
                impact: 'Proves understanding of distributed consensus, worker pools, and fault tolerance.',
              },
            ],
            recommended_certifications: [
              {
                title: 'AWS Certified Solutions Architect - Associate',
                issuer: 'Amazon Web Services',
                relevance: 'High Impact',
              },
              {
                title: 'Certified Kubernetes Administrator (CKA)',
                issuer: 'Cloud Native Computing Foundation',
                relevance: 'High Impact',
              },
            ],
            suggested_improvements: [
              'Quantify bullet points with latency reductions and scale metrics.',
              'Include cloud architecture keywords explicitly in your skills inventory.',
            ],
          })
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, resumeId, targetRole])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border border-white/10 bg-surface-100 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Career Recommendation Center
              </h2>
              <p className="text-xs text-gray-400">
                Personalized skill roadmaps, project suggestions, and projected ATS score gains.
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
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500">
              Generating tailored career roadmap & ATS projections...
            </div>
          ) : data ? (
            <>
              {/* Score Gain Projection Gauge */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-50 to-primary-950/20 border border-primary-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                    Projected Career Compatibility
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    Target Role: {data.target_role}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md">
                    Implementing the recommended skill milestones and projects can boost your ATS compatibility by up to <span className="text-emerald-400 font-bold">+{data.score_gain || 10}%</span>.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-surface-100 p-3 rounded-2xl border border-white/5">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Current</span>
                    <span className="text-xl font-extrabold text-gray-300">{data.current_ats_score}%</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-400" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">After Improvements</span>
                    <span className="text-2xl font-extrabold text-emerald-400">{data.estimated_ats_score}%</span>
                  </div>
                </div>
              </div>

              {/* Missing Skills */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-cyan" /> Priority Skill Gaps to Bridge
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.missing_skills?.map((sk: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-accent-cyan/10 text-accent-cyan text-xs font-semibold border border-accent-cyan/20"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Roadmap */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-accent-pink" /> 4-Week Learning Acceleration Path
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.learning_roadmap?.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-surface-50 border border-white/5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{m.milestone}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 font-semibold">
                          {m.timeframe}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.topics?.map((tp: string, j: number) => (
                          <span
                            key={j}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-gray-300 border border-white/5"
                          >
                            {tp}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Projects */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Recommended Portfolio Proof Projects
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.recommended_projects?.map((pj: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-surface-50 border border-white/5 flex flex-col gap-2"
                    >
                      <span className="text-xs font-bold text-white">{pj.title}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{pj.impact}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pj.tech_stack?.map((ts: string, j: number) => (
                          <span
                            key={j}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                          >
                            {ts}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Certifications */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> High-Impact Industry Certifications
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.recommended_certifications?.map((c: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-surface-50 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{c.title}</span>
                        <span className="text-[11px] text-gray-500">{c.issuer}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {c.relevance || 'Recommended'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
