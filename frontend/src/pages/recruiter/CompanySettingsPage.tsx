import React, { useState, useEffect } from 'react'
import { Building, Globe, MapPin, Users, CheckCircle2, Save } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

export const CompanySettingsPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [loading, setLoading] = useState(false)
  
  const [company, setCompany] = useState({
    name: '',
    website: '',
    industry: '',
    size: '1-10',
    location: '',
    description: '',
    careers_page_url: ''
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.post('/recruiter-hub/company', company)
      addToast({ type: 'success', message: 'Company profile updated successfully!' })
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update company.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Building className="text-primary-500" /> Company Profile
          </h1>
          <p className="text-gray-400 mt-1">Manage your employer brand and settings.</p>
        </div>
        <Button variant="glow" onClick={handleSave} isLoading={loading}>
          <Save className="w-4 h-4 mr-2" /> Save Profile
        </Button>
      </div>

      <Card className="p-8 border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-6 pb-6 border-b border-white/10">
          <div className="w-24 h-24 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
            <Building className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Company Logo</h3>
            <p className="text-sm text-gray-400 mb-3">Square image, max 2MB (JPG, PNG)</p>
            <Button variant="outline" size="sm">Upload Logo</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Company Name</label>
            <input 
              type="text" 
              className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="e.g. Acme Corp"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Industry</label>
            <input 
              type="text" 
              className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              placeholder="e.g. B2B SaaS"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><Globe className="w-3 h-3"/> Website</label>
            <input 
              type="url" 
              className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              placeholder="https://acme.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><Users className="w-3 h-3"/> Company Size</label>
            <select 
              className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
              value={company.size}
              onChange={(e) => setCompany({ ...company, size: e.target.value })}
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><MapPin className="w-3 h-3"/> Headquarters / Location</label>
            <input 
              type="text" 
              className="w-full bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
              value={company.location}
              onChange={(e) => setCompany({ ...company, location: e.target.value })}
              placeholder="e.g. San Francisco, CA"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Company Description</label>
            <textarea 
              className="w-full h-32 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              placeholder="What does your company do?"
            />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white">Verification Status</h4>
            <p className="text-xs text-gray-400 mt-1">Your company account is currently pending verification. Verified companies receive a badge on their job posts and higher visibility in candidate searches.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
