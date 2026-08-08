import React, { useState } from 'react'
import { Globe, Check, RefreshCw, X, ShieldCheck, AlertCircle, Copy } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface CustomDomainModalProps {
  isOpen: boolean
  portfolioId: string
  portfolioSlug: string
  onClose: () => void
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  isOpen,
  portfolioId,
  portfolioSlug,
  onClose,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose)
  const { addToast } = useUIStore()

  const [domainInput, setDomainInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [domainRecord, setDomainRecord] = useState<any>(null)

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainInput.trim()) return

    setSubmitting(true)
    try {
      const res = await api.post<any, any>('/domains/add', {
        portfolio_id: portfolioId,
        domain: domainInput,
      })
      if (res.success && res.data) {
        setDomainRecord(res.data)
        addToast({ type: 'success', message: 'Domain record created! Please configure DNS.' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to add custom domain.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyDNS = async () => {
    if (!domainRecord?.id) return
    setVerifying(true)
    try {
      const res = await api.post<any, any>(`/domains/${domainRecord.id}/verify`, {})
      if (res.success && res.data) {
        setDomainRecord({
          ...domainRecord,
          verified: res.data.verified,
          ssl_status: res.data.ssl_status,
        })
        addToast({ type: 'success', message: res.data.message })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'DNS verification failed.' })
    } finally {
      setVerifying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div ref={modalRef} className="w-full max-w-lg">
        <Card className="p-6 border border-white/15 glass-panel flex flex-col gap-6 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent-cyan" />
              <h2 className="text-lg font-bold text-white">Connect Custom Domain</h2>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!domainRecord ? (
            <form onSubmit={handleAddDomain} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Custom Domain Name</label>
                <Input
                  placeholder="e.g. johndoe.dev or resume.johndoe.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="bg-surface-50 text-xs border-white/10 font-mono"
                />
                <span className="text-[10px] text-gray-400">
                  Pro and Enterprise accounts can map apex domains or subdomains.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="glow" size="sm" isLoading={submitting} type="submit">
                  Connect Domain
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Domain Status Banner */}
              <div className="p-4 rounded-xl bg-surface-50 border border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-white">{domainRecord.domain}</span>
                  <span className="text-[10px] text-gray-400">Mapped to /p/{portfolioSlug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      domainRecord.verified
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {domainRecord.verified ? '● Live Verified' : 'DNS Pending'}
                  </span>
                </div>
              </div>

              {/* DNS Configuration Table */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Required DNS Record</span>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between border-b border-white/10 pb-2 text-[10px] text-gray-400 uppercase">
                    <span>Type</span>
                    <span>Host / Name</span>
                    <span>Target Value</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span className="text-primary-400 font-bold">CNAME</span>
                    <span>@ / www</span>
                    <span className="text-accent-cyan flex items-center gap-1">
                      cname.exploreme.ai
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Controls */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setDomainRecord(null)}>
                  Remove
                </Button>
                <Button variant="glow" size="sm" isLoading={verifying} onClick={handleVerifyDNS}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Check DNS Status
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
