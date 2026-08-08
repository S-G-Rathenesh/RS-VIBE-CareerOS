import React, { useEffect, useState } from 'react'
import { Sparkles, Clock, Zap, X, ArrowDownLeft } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import api from '../../services/api'

interface AICreditDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const AICreditDrawer: React.FC<AICreditDrawerProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen, onClose)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      api.get<any, any>('/ai/credits/history')
        .then((res) => {
          if (res.success && res.data) setData(res.data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md h-full glass-panel border-l border-white/10 flex flex-col p-6 shadow-2xl relative animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-pink" />
            <h2 className="text-lg font-bold text-white">AI Credit Balance & History</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credit Quota Header */}
        <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-primary-950/60 via-surface-50 to-surface-50 border border-primary-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining Balance</span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-bold text-[10px]">
              {data?.tier || 'FREE'} PLAN
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{data?.credits_remaining ?? 0}</span>
            <span className="text-xs text-gray-400">/ {data?.monthly_limit ?? 50} Monthly Credits</span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-pink to-accent-violet transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(((data?.credits_remaining ?? 0) / (data?.monthly_limit ?? 50)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Action Cost Matrix Info */}
        <div className="flex flex-col gap-2 mb-6">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Action Credit Costs</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-50 border border-white/5 flex justify-between">
              <span className="text-gray-400">ATS Audit</span>
              <span className="font-bold text-white">10 credits</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-50 border border-white/5 flex justify-between">
              <span className="text-gray-400">Cover Letter</span>
              <span className="font-bold text-white">5 credits</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-50 border border-white/5 flex justify-between">
              <span className="text-gray-400">Text Enhancer</span>
              <span className="font-bold text-white">3 credits</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-50 border border-white/5 flex justify-between">
              <span className="text-gray-400">Mock Interview</span>
              <span className="font-bold text-white">20 credits</span>
            </div>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary-400" /> Recent Usage Ledger
          </h3>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading credit history...</div>
            ) : data?.recent_transactions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No AI usage recorded yet.</div>
            ) : (
              data?.recent_transactions?.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-surface-50 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{tx.action_type}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[180px]">
                        {tx.prompt_summary}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-red-400">-{tx.credits_deducted} credits</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
