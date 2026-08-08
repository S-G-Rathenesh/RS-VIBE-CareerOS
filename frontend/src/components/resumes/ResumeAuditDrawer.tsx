import React from 'react'
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  FileCheck, 
  Activity 
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

interface ResumeAuditDrawerProps {
  isOpen: boolean
  onClose: () => void
  auditData: any
}

export const ResumeAuditDrawer: React.FC<ResumeAuditDrawerProps> = ({ isOpen, onClose, auditData }) => {
  if (!isOpen || !auditData) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full glass-panel border-l border-white/10 p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">8-Point AI Resume Audit</h3>
              <p className="text-xs text-gray-400">Comprehensive score & improvement report</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Score Gauges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Overall Score</span>
            <span className="text-2xl font-black text-primary-400 mt-1">{auditData.overall_score}%</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">ATS Match</span>
            <span className="text-2xl font-black text-emerald-400 mt-1">{auditData.ats_score}%</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Action Verbs</span>
            <span className="text-sm font-bold text-accent-violet mt-2">{auditData.action_verb_density}</span>
          </div>
        </div>

        {/* Audit Categories Breakdown */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Evaluation Breakdown</h4>
          <div className="flex flex-col gap-2">
            {auditData.audit_categories?.map((cat: any, i: number) => (
              <div key={i} className="p-3 bg-surface-50 rounded-xl border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{cat.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold text-[10px]">
                    {cat.score}% • {cat.status}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">{cat.feedback}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords Breakdown */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Detected & Missing Keywords</h4>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {auditData.detected_keywords?.map((kw: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                  ✓ {kw}
                </span>
              ))}
              {auditData.missing_keywords?.map((kw: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 text-[10px] font-medium border border-yellow-500/20">
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Weak Bullet Points List */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Bullet Points Requiring Impact Enhancements</h4>
          <div className="flex flex-col gap-2">
            {auditData.weak_bullets?.map((wb: any, i: number) => (
              <div key={i} className="p-3 bg-surface-50 rounded-xl border border-white/5 flex flex-col gap-1 text-xs">
                <span className="text-red-300 line-through font-mono text-[11px]">"{wb.original_bullet}"</span>
                <span className="text-emerald-300 font-medium text-[11px]">✨ {wb.suggested_improvement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-white flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-accent-pink" /> Actionable Recommendations
          </h4>
          <ul className="space-y-1 text-xs text-gray-300 list-disc pl-4">
            {auditData.recommendations?.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
