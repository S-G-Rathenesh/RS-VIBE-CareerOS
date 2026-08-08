import React, { useState } from 'react'
import { Globe, X, Check, Sparkles, Share2, Search, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface PortfolioPublishModalProps {
  isOpen: boolean
  onClose: () => void
  portfolio: any
  onSave: (updatedPortfolio: any) => void
}

export const PortfolioPublishModal: React.FC<PortfolioPublishModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onSave,
}) => {
  const { addToast } = useUIStore()

  const [slug, setSlug] = useState(portfolio?.slug || 'my-portfolio')
  const [isPublished, setIsPublished] = useState(portfolio?.is_published ?? true)
  const [metaTitle, setMetaTitle] = useState(portfolio?.title || 'My Career Portfolio')
  const [metaDesc, setMetaDesc] = useState(portfolio?.tagline || 'Professional Developer & Engineer')
  const [saving, setSaving] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePublish = async () => {
    setSaving(true)
    try {
      const updated = {
        ...portfolio,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        is_published: isPublished,
        title: metaTitle,
        tagline: metaDesc,
      }
      if (portfolio?.id) {
        await api.put(`/portfolios/${portfolio.id}`, updated)
      } else {
        const res = await api.post<any, any>('/portfolios', updated)
        if (res.success && res.data) {
          updated.id = res.data.id
          window.history.replaceState(null, '', `/portfolios/builder/${updated.id}`)
        }
      }
      
      const domain = window.location.origin
      setPublishedUrl(`${domain}/p/${updated.slug}`)
      
      addToast({ type: 'success', message: 'Portfolio published successfully!' })
      onSave(updated)
      // Do not close immediately, show success state
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to publish portfolio.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl)
      addToast({ type: 'success', message: 'Link copied to clipboard!' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-lg p-6 border border-white/15 glass-panel flex flex-col gap-6 relative shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Publishing & SEO Studio</h3>
              <p className="text-xs text-gray-400">Configure custom URL slug & Open Graph preview</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {publishedUrl ? (
          <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Portfolio Published Live!</h3>
              <p className="text-sm text-gray-400">Your career portfolio is now publicly accessible.</p>
            </div>
            
            <div className="flex flex-col w-full gap-3 mt-2">
              <div className="flex items-center w-full bg-surface-50 border border-white/10 rounded-xl p-1 overflow-hidden">
                <div className="px-3 text-xs text-gray-400 truncate flex-1 font-mono text-left">
                  {publishedUrl}
                </div>
                <Button variant="primary" size="sm" onClick={handleCopyLink} className="shrink-0 rounded-lg">
                  Copy Link
                </Button>
              </div>
              <a 
                href={publishedUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Portfolio
                </Button>
              </a>
            </div>
            
            <Button variant="ghost" className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Custom Slug Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Custom URL Slug</label>
          <div className="flex items-center gap-2">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              icon={<LinkIcon className="w-4 h-4 text-primary-400" />}
              className="bg-surface-50 text-xs font-mono border-white/10"
            />
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Live URL: {window.location.origin}/p/{slug || 'username'}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            Subdomain Ready: https://{slug || 'username'}.rsvibe.app
          </span>
        </div>

        {/* SEO Meta Tags */}
        <div className="flex flex-col gap-3 p-4 bg-surface-50 rounded-2xl border border-white/5">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-primary-400" /> Search Engine Optimization (SEO)
          </span>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400">Meta Title Tag</label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="bg-surface-100 text-xs border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400">Meta Description</label>
            <textarea
              rows={2}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full bg-surface-100 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Open Graph Card Preview Simulator */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">Social Card Preview (LinkedIn / Twitter)</span>
          <div className="p-3 glass-panel rounded-xl border border-white/10 flex flex-col gap-1">
            <div className="h-20 bg-gradient-to-r from-primary-900 to-surface-100 rounded-lg flex items-center justify-center text-primary-400 text-xs font-bold">
              RS VIBE CareerOS Social Card Preview
            </div>
            <span className="text-xs font-bold text-white mt-1 truncate">{metaTitle}</span>
            <span className="text-[11px] text-gray-400 line-clamp-1">{metaDesc}</span>
            <span className="text-[9px] text-gray-500 uppercase font-mono">exploreme.ai</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="glow" size="sm" isLoading={saving} onClick={handlePublish}>
            <Check className="w-4 h-4 mr-1" /> Save & Publish Live
          </Button>
        </div>
        </>
        )}
      </Card>
    </div>
  )
}
