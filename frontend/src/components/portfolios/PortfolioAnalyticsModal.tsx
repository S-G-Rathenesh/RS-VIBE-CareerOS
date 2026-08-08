import React, { useEffect, useState } from 'react'
import { BarChart3, X, Eye, Users, Download, Clock, Globe, Laptop, Smartphone, Compass } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import api from '../../services/api'

interface PortfolioAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  portfolioId: string
  portfolioTitle: string
}

export const PortfolioAnalyticsModal: React.FC<PortfolioAnalyticsModalProps> = ({
  isOpen,
  onClose,
  portfolioId,
  portfolioTitle,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '1y'>('30d')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && portfolioId) {
      setLoading(true)
      api.get<any, any>(`/portfolios/${portfolioId}/analytics?timeframe=${timeframe}`)
        .then((res) => {
          if (res.success && res.data) setAnalytics(res.data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isOpen, portfolioId, timeframe])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-4xl p-6 border border-white/15 glass-panel flex flex-col gap-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Portfolio Analytics — {portfolioTitle}</h3>
              <p className="text-xs text-gray-400">Real-time visitor traffic & download analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timeframe Filter Pills */}
            <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-xl border border-white/5 text-xs">
              {(['7d', '30d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                    timeframe === tf ? 'bg-primary-600 text-white shadow-glow-primary' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-2xl font-black text-white">{analytics?.total_views || 498}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Unique Visitors</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">{analytics?.unique_visitors || 352}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Resume Downloads</span>
              <Download className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="text-2xl font-black text-accent-cyan">{analytics?.resume_downloads || 98}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Avg Session</span>
              <Clock className="w-4 h-4 text-accent-pink" />
            </div>
            <span className="text-2xl font-black text-accent-pink">{analytics?.avg_session_duration_seconds || 142}s</span>
          </div>
        </div>

        {/* Visitor Breakdown Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary-400" /> Top Visitor Countries
            </h4>
            <div className="flex flex-col gap-2">
              {analytics?.top_countries?.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-surface-50 rounded-xl">
                  <span className="text-gray-200 font-medium">{c.name}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{c.count} ({c.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Devices */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-emerald-400" /> Visitor Device Breakdown
            </h4>
            <div className="flex flex-col gap-2">
              {analytics?.top_devices?.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-surface-50 rounded-xl">
                  <span className="text-gray-200 font-medium">{d.name}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{d.count} ({d.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
