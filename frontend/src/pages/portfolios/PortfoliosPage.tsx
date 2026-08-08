import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Plus, Search, ExternalLink, BarChart3, Edit, ArrowUpRight } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { PortfolioAnalyticsModal } from '../../components/portfolios/PortfolioAnalyticsModal'
import { ROUTES } from '../../constants/routes'
import api from '../../services/api'

export const PortfoliosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalyticsPortfolio, setSelectedAnalyticsPortfolio] = useState<any>(null)

  useEffect(() => {
    api.get<any, any>('/portfolios')
      .then((res) => {
        if (res.success && res.data) setPortfolios(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Portfolios</h1>
          <p className="text-xs text-gray-400">Build, customize, and publish your AI developer portfolio</p>
        </div>

        <Link to="/portfolios/builder/new">
          <Button variant="glow" size="md">
            <Plus className="w-4 h-4 mr-1" /> Create Portfolio
          </Button>
        </Link>
      </div>

      {/* Portfolios Grid */}
      {portfolios.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center gap-4 border border-dashed border-white/15">
          <div className="w-16 h-16 rounded-3xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Portfolios Created</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Create your personalized developer portfolio site with 1-click live public deployment.
          </p>
          <Link to="/portfolios/builder/new" className="mt-2">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1" /> Build Portfolio Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} interactive className="p-6 flex flex-col justify-between gap-4 border border-white/10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                    {portfolio.theme_id || 'Glass Theme'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    portfolio.is_published ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {portfolio.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg truncate">{portfolio.title}</h3>
                <span className="text-xs text-gray-400 truncate">{portfolio.tagline}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <button
                  onClick={() => setSelectedAnalyticsPortfolio(portfolio)}
                  className="text-gray-400 hover:text-white font-medium flex items-center gap-1 text-[11px]"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-primary-400" /> Analytics
                </button>
                <Link to={`/portfolios/builder/${portfolio.id}`} className="text-primary-400 hover:text-white font-medium flex items-center gap-1">
                  Edit Studio <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Dashboard Modal */}
      {selectedAnalyticsPortfolio && (
        <PortfolioAnalyticsModal
          isOpen={!!selectedAnalyticsPortfolio}
          onClose={() => setSelectedAnalyticsPortfolio(null)}
          portfolioId={selectedAnalyticsPortfolio.id}
          portfolioTitle={selectedAnalyticsPortfolio.title}
        />
      )}
    </div>
  )
}
