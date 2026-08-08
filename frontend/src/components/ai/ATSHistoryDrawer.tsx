import React, { useEffect, useState } from 'react'
import {
  History,
  X,
  Clock,
  TrendingUp,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface ATSHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectAudit?: (audit: any) => void
}

export const ATSHistoryDrawer: React.FC<ATSHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAudit,
}) => {
  const { addToast } = useUIStore()
  const [history, setHistory] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [histRes, trendRes]: [any, any] = await Promise.all([
        api.get('/ai/ats-history'),
        api.get('/ai/ats-trend'),
      ])

      if (histRes.success && histRes.data) {
        setHistory(histRes.data)
        if (histRes.data.length > 0) setSelectedAudit(histRes.data[0])
      }
      if (trendRes.success && trendRes.data) {
        setTrends(trendRes.data)
      }
    } catch {
      // Fallback preview
      const fallback = [
        {
          id: 'ats_1',
          company: 'Google',
          job_title: 'Staff Cloud Infrastructure Architect',
          ats_score: 91,
          match_status: 'Exceptional Fit',
          matching_keywords: ['Kubernetes', 'Go', 'GCP', 'Microservices', 'Distributed Systems'],
          missing_keywords: ['Terraform', 'Spinnaker'],
          improvement_recommendations: ['Quantify cloud migration scale and cost savings in percent.'],
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'ats_2',
          company: 'Amazon',
          job_title: 'Principal Solutions Architect',
          ats_score: 94,
          match_status: 'Exceptional Fit',
          matching_keywords: ['AWS', 'DynamoDB', 'Serverless', 'Kafka', 'System Design'],
          missing_keywords: ['EventBridge'],
          improvement_recommendations: ['Emphasize multi-region disaster recovery SLAs.'],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'ats_3',
          company: 'Microsoft',
          job_title: 'Azure Systems Engineer',
          ats_score: 86,
          match_status: 'Strong Fit',
          matching_keywords: ['Azure', 'C#', 'CI/CD', 'Docker'],
          missing_keywords: ['Bicep', 'CosmosDB'],
          improvement_recommendations: ['Include Azure cloud certifications explicitly.'],
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'ats_4',
          company: 'Zoho',
          job_title: 'Product Developer',
          ats_score: 82,
          match_status: 'Good Match',
          matching_keywords: ['Java', 'SQL', 'RESTful APIs'],
          missing_keywords: ['Zoho Creator', 'Deluge'],
          improvement_recommendations: ['Highlight full lifecycle SaaS product development.'],
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ]
      setHistory(fallback)
      setSelectedAudit(fallback[0])
      setTrends([
        { company: 'Google', score: 91, date: 'Aug 04' },
        { company: 'Amazon', score: 94, date: 'Aug 05' },
        { company: 'Microsoft', score: 86, date: 'Aug 05' },
        { company: 'Zoho', score: 82, date: 'Aug 06' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchData()
  }, [isOpen])

  const handleDelete = async (id: string) => {
    try {
      const res: any = await api.delete(`/ai/ats-history/${id}`)
      if (res.success) {
        addToast({ type: 'success', message: 'Audit report removed from history.' })
        setHistory((prev) => prev.filter((item) => (item.id || item.history_id) !== id))
        if (selectedAudit?.id === id || selectedAudit?.history_id === id) {
          setSelectedAudit(null)
        }
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete report.' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl h-full bg-surface-100 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ATS Analysis History & Score Trends
              </h2>
              <p className="text-xs text-gray-400">
                Review past resume compatibility audits, matching keywords, and target company scores.
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

        {/* Score Trend Banner */}
        {trends.length > 0 && (
          <div className="p-4 bg-surface-50 border-b border-white/10 flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Company Application Score Trends
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {trends.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-100 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[90px]">
                      {t.company}
                    </span>
                    <span className="text-[10px] text-gray-500">{t.date || 'Recent'}</span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                      t.score >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : t.score >= 80
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {t.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Split Content: History List & Selected Report Details */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left List */}
          <div className="w-80 border-r border-white/10 flex flex-col bg-surface-50/50">
            <div className="p-3 border-b border-white/10 text-xs font-semibold text-gray-300 flex justify-between">
              <span>Past Reports ({history.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="py-12 text-center text-xs text-gray-500">Loading audit history...</div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">No ATS audits recorded yet.</div>
              ) : (
                history.map((item) => {
                  const id = item.id || item.history_id
                  const isSelected = (selectedAudit?.id || selectedAudit?.history_id) === id

                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedAudit(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-primary-600/15 border-primary-500/40 shadow-glow-primary'
                          : 'bg-surface-100 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white truncate max-w-[170px]">
                            {item.company || 'Target Company'}
                          </span>
                          <span className="text-[11px] text-gray-400 truncate max-w-[170px]">
                            {item.job_title || 'Role'}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {item.ats_score}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(id)
                          }}
                          className="hover:text-rose-400 transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Details Pane */}
          <div className="flex-1 flex flex-col bg-surface-100/50 overflow-y-auto p-6 space-y-5">
            {selectedAudit ? (
              <>
                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Target Opportunity</span>
                    <span className="text-base font-bold text-white mt-0.5">
                      {selectedAudit.company} — {selectedAudit.job_title}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-lg">
                    {selectedAudit.ats_score}%
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matching Keywords (
                    {selectedAudit.matching_keywords?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAudit.matching_keywords?.map((kw: string, i: number) => (
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
                    {selectedAudit.missing_keywords?.map((kw: string, i: number) => (
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
                    <Lightbulb className="w-4 h-4 text-accent-pink" /> Improvement Recommendations:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-300 list-disc pl-4 leading-relaxed">
                    {selectedAudit.improvement_recommendations?.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-gray-500">
                Select an audit from the left to inspect detailed keyword matches.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
