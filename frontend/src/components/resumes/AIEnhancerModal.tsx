import React, { useState } from 'react'
import { Sparkles, X, Check, Copy, Wand2, RefreshCw } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

interface AIEnhancerModalProps {
  isOpen: boolean
  onClose: () => void
  initialText: string
  sectionType: string
  targetRole?: string
  onApply: (enhancedText: string) => void
}

export const AIEnhancerModal: React.FC<AIEnhancerModalProps> = ({
  isOpen,
  onClose,
  initialText,
  sectionType,
  targetRole,
  onApply,
}) => {
  const { addToast } = useUIStore()

  const [selectedTone, setSelectedTone] = useState<string>('executive')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const tones = [
    { id: 'executive', name: 'Executive', desc: 'Strategic impact & leadership metrics' },
    { id: 'technical', name: 'Technical', desc: 'Architecture precision & framework names' },
    { id: 'recruiter', name: 'Recruiter ATS', desc: 'Action verbs & concise scannability' },
    { id: 'student', name: 'Academic', desc: 'Foundational concepts & growth potential' },
    { id: 'professional', name: 'Professional', desc: 'Clean balanced corporate tone' },
  ]

  const handleEnhance = async () => {
    if (!initialText) return
    setLoading(true)
    try {
      const res: any = await api.post('/resumes/enhance-text', {
        text: initialText,
        section_type: sectionType,
        tone: selectedTone,
        target_role: targetRole || 'Software Engineer',
      })
      if (res.success && res.data) {
        setResult(res.data)
        addToast({ type: 'success', message: `Text enhanced using ${selectedTone.toUpperCase()} tone!` })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Enhancement failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    addToast({ type: 'success', message: 'Copied to clipboard!' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-2xl p-6 border border-white/15 glass-panel flex flex-col gap-6 relative shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">1-Click AI Text Enhancer</h3>
              <p className="text-xs text-gray-400">Select tone & rewrite with quantifiable impact</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selectors */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Select AI Tone</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                  selectedTone === t.id
                    ? 'bg-primary-600/90 text-white border-primary-500 shadow-glow-primary'
                    : 'bg-surface-50 text-gray-300 border-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-xs font-bold">{t.name}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Original Text Display */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">Original Text</label>
          <div className="p-3 bg-surface-50 rounded-xl border border-white/5 text-xs text-gray-300 max-h-24 overflow-y-auto">
            {initialText || 'No text provided.'}
          </div>
        </div>

        {/* Run Button */}
        <Button variant="glow" size="md" isLoading={loading} onClick={handleEnhance} className="w-full">
          <Sparkles className="w-4 h-4 mr-1" /> Generate {selectedTone.toUpperCase()} Enhancement
        </Button>

        {/* Result & Alternative Variations */}
        {result && (
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-2 p-4 bg-primary-500/10 rounded-2xl border border-primary-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-300 uppercase">Primary Enhanced Version</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopy(result.enhanced_text)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
                  </button>
                </div>
              </div>
              <p className="text-xs text-white leading-relaxed font-sans font-medium">{result.enhanced_text}</p>
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onApply(result.enhanced_text)
                    onClose()
                  }}
                >
                  <Check className="w-4 h-4 mr-1" /> Apply to Resume
                </Button>
              </div>
            </div>

            {result.alternative_variations?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400">Alternative Variation</span>
                <div className="p-3 bg-surface-50 rounded-xl border border-white/5 flex items-center justify-between text-xs text-gray-300">
                  <span className="truncate pr-4">{result.alternative_variations[0]}</span>
                  <button
                    onClick={() => {
                      onApply(result.alternative_variations[0])
                      onClose()
                    }}
                    className="text-xs font-semibold text-primary-400 hover:text-white shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
