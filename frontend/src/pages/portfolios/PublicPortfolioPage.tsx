import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getPortfolioThemeComponent } from '../../components/portfolios/themes'
import api from '../../services/api'

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      // Check for local draft preview mode (e.g. preview from Builder)
      if (slug === 'preview' || slug === 'draft') {
        try {
          const draftStr = sessionStorage.getItem('portfolio_preview_draft')
          if (draftStr) {
            const draft = JSON.parse(draftStr)
            setPortfolio(draft)
            document.title = `${draft.title || 'Portfolio Preview'} | RS VIBE CareerOS`
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Failed to load preview draft from sessionStorage', e)
        }
      }

      // Public published portfolio mode
      api.get<any, any>(`/portfolios/public/${slug}`)
        .then((res) => {
          if (res.success && res.data) {
            setPortfolio(res.data)
            
            // Dynamic SEO Injection
            document.title = res.data.seo_config?.meta_title || `${res.data.title} | RS VIBE CareerOS`
            
            let metaDesc = document.querySelector('meta[name="description"]')
            if (!metaDesc) {
              metaDesc = document.createElement('meta')
              metaDesc.setAttribute('name', 'description')
              document.head.appendChild(metaDesc)
            }
            metaDesc.setAttribute('content', res.data.seo_config?.meta_description || res.data.tagline || '')
            
            // Log Analytics Event V2
            api.post(`/portfolio-analytics-v2/${res.data.id}/events`, {
              session_id: localStorage.getItem('rsvibe_visitor_session') || `sess_${Math.random().toString(36).substr(2, 9)}`,
              event_data: { event_type: 'view', path: window.location.pathname }
            }).catch(() => {})
            
            // Set session id if not exists
            if (!localStorage.getItem('rsvibe_visitor_session')) {
              localStorage.setItem('rsvibe_visitor_session', `sess_${Math.random().toString(36).substr(2, 9)}`)
            }
          } else {
            setPortfolio(null)
          }
        })
        .catch(() => {
          setPortfolio(null)
        })
        .finally(() => setLoading(false))
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white text-sm font-mono animate-pulse">
        Loading RS VIBE CareerOS Portfolio...
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-bold text-red-400 mb-4">404 - Portfolio Not Found</h1>
        <p className="text-gray-400">This portfolio does not exist or has been taken offline.</p>
        <a href="/" className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
          Return Home
        </a>
      </div>
    )
  }

  const ThemeComponent = getPortfolioThemeComponent(portfolio?.theme_id)

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white font-mono animate-pulse">Loading Theme...</div>}>
      <ThemeComponent portfolio={portfolio} />
    </Suspense>
  )
}
