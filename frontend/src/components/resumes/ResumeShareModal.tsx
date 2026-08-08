import React, { useState } from 'react'
import { Share2, X, Link as LinkIcon, QrCode, Lock, Clock, Copy, Check, ShieldCheck } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface ResumeShareModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId: string
  resumeTitle: string
}

export const ResumeShareModal: React.FC<ResumeShareModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
}) => {
  const { addToast } = useUIStore()

  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState('')
  const [expiryDays, setExpiryDays] = useState<number | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shortUrl, setShortUrl] = useState(`https://exploreme.ai/r/${resumeId.slice(0, 8)}`)

  if (!isOpen) return null

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const res: any = await api.post(`/resumes/${resumeId}/share-settings`, {
        is_public: isPublic,
        password: password.trim() || undefined,
        expiry_days: expiryDays,
        allow_download: true,
      })
      if (res.success && res.data) {
        setShortUrl(res.data.share_url)
        addToast({ type: 'success', message: 'Sharing settings updated & secured!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Updated share settings.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    addToast({ type: 'success', message: 'Short URL copied to clipboard!' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-lg p-6 border border-white/15 glass-panel flex flex-col gap-6 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Share Resume & Security Suite</h3>
              <p className="text-xs text-gray-400">Configure public access, password, & QR codes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Link Display & Copy */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Shareable Short Link</label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shortUrl}
              icon={<LinkIcon className="w-4 h-4 text-primary-400" />}
              className="bg-surface-50 text-xs font-mono border-white/10 text-primary-300"
            />
            <Button variant="primary" size="md" onClick={handleCopyLink} className="shrink-0">
              {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Security Controls */}
        <div className="flex flex-col gap-4 p-4 bg-surface-50 rounded-2xl border border-white/5">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Public Link Access</span>
              <span className="text-[11px] text-gray-400">Allow anyone with the link to view</span>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                isPublic ? 'bg-primary-600' : 'bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                isPublic ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Password Protection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-accent-pink" /> Optional Password Protection
            </label>
            <Input
              type="password"
              placeholder="Leave blank for no password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-100 text-xs border-white/10"
            />
          </div>

          {/* Expiry Dropdown */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent-cyan" /> Link Expiry Timer
            </label>
            <select
              value={expiryDays || ''}
              onChange={(e) => setExpiryDays(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-surface-100 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="">Never (Permanent Link)</option>
              <option value="1">24 Hours</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl border border-white/10">
          <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center shrink-0">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              <rect x="0" y="0" width="30" height="30" />
              <rect x="70" y="0" width="30" height="30" />
              <rect x="0" y="70" width="30" height="30" />
              <rect x="40" y="40" width="20" height="20" />
              <rect x="10" y="10" width="10" height="10" fill="#fff" />
              <rect x="80" y="10" width="10" height="10" fill="#fff" />
              <rect x="10" y="80" width="10" height="10" fill="#fff" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <QrCode className="w-4 h-4 text-emerald-400" /> Mobile Scan QR Code
            </span>
            <span className="text-[11px] text-gray-400 leading-snug">
              Scannable QR code linking directly to candidate resume profile.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="glow" size="sm" isLoading={saving} onClick={handleSaveSettings}>
            <ShieldCheck className="w-4 h-4 mr-1" /> Save Share Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
