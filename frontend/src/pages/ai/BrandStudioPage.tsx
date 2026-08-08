import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Edit3, Target, User, Briefcase, Mic } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'
import { motion } from 'framer-motion'

import { AIAssistantOrb } from '../../components/common/AIAssistantOrb'

export const BrandStudioPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [context, setContext] = useState('')
  const [brand, setBrand] = useState<any>({
    statement: '',
    headline: '',
    short_bio: '',
    long_bio: '',
    career_mission: '',
    career_vision: '',
    elevator_pitch: '',
    networking_intro: ''
  })

  useEffect(() => {
    api.get<any, any>('/brand')
      .then(res => {
        if (res.success && res.data) {
          setBrand(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!context.trim()) {
      addToast({ type: 'warning', message: 'Please provide some background context first.' })
      return
    }
    
    setGenerating(true)
    try {
      const res: any = await api.post('/brand/generate', { context })
      if (res.success && res.data) {
        setBrand({ ...brand, ...res.data })
        addToast({ type: 'success', message: 'Brand identity generated!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Generation failed.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/brand', brand)
      addToast({ type: 'success', message: 'Brand profile saved!' })
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-5">
          <AIAssistantOrb size="sm" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Target className="text-accent-pink w-6 h-6" /> Personal Brand Studio
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Generate and refine your professional identity.</p>
          </div>
        </div>
        <Button variant="glow" onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save Brand Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Context */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-white/10 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" /> AI Generator
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Describe your current role, achievements, and where you want to go. The AI will craft a complete brand identity.
            </p>
            <textarea
              className="w-full h-40 bg-surface-50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500 mb-4 resize-none"
              placeholder="e.g. I am a Senior Frontend Engineer with 6 years experience in React. I want to transition into a Tech Lead role focused on AI products..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <Button variant="primary" className="w-full" onClick={handleGenerate} isLoading={generating}>
              <Sparkles className="w-4 h-4 mr-2" /> Generate Brand Identity
            </Button>
          </Card>
        </div>

        {/* Brand Assets */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border-white/10">
              <label className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-2 block">Professional Headline</label>
              <input
                type="text"
                className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-lg font-bold text-white focus:border-primary-500 transition-colors"
                value={brand.headline}
                onChange={(e) => setBrand({ ...brand, headline: e.target.value })}
                placeholder="e.g. AI Systems Architect | Open Source Contributor"
              />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 border-white/10">
              <label className="text-xs font-bold text-accent-cyan uppercase tracking-wider mb-2 block">Brand Statement</label>
              <textarea
                className="w-full h-24 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-primary-500 transition-colors resize-none"
                value={brand.statement}
                onChange={(e) => setBrand({ ...brand, statement: e.target.value })}
              />
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-white/10 flex flex-col gap-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3"/> Short Bio</label>
              <textarea
                className="w-full flex-1 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 min-h-[120px]"
                value={brand.short_bio}
                onChange={(e) => setBrand({ ...brand, short_bio: e.target.value })}
              />
            </Card>
            <Card className="p-5 border-white/10 flex flex-col gap-2">
              <label className="text-xs font-bold text-accent-pink uppercase tracking-wider flex items-center gap-1"><Mic className="w-3 h-3"/> Elevator Pitch</label>
              <textarea
                className="w-full flex-1 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 min-h-[120px]"
                value={brand.elevator_pitch}
                onChange={(e) => setBrand({ ...brand, elevator_pitch: e.target.value })}
              />
            </Card>
          </div>

          <Card className="p-6 border-white/10">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Comprehensive Bio</label>
              <textarea
                className="w-full h-48 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-primary-500 transition-colors resize-none"
                value={brand.long_bio}
                onChange={(e) => setBrand({ ...brand, long_bio: e.target.value })}
              />
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-white/10 flex flex-col gap-2">
              <label className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Target className="w-3 h-3"/> Career Mission</label>
              <textarea
                className="w-full flex-1 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 min-h-[100px]"
                value={brand.career_mission}
                onChange={(e) => setBrand({ ...brand, career_mission: e.target.value })}
              />
            </Card>
            <Card className="p-5 border-white/10 flex flex-col gap-2">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><Briefcase className="w-3 h-3"/> Career Vision</label>
              <textarea
                className="w-full flex-1 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-gray-300 min-h-[100px]"
                value={brand.career_vision}
                onChange={(e) => setBrand({ ...brand, career_vision: e.target.value })}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
