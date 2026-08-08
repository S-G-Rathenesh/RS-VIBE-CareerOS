import React, { useState, useEffect } from 'react'
import { Briefcase, MapPin, Search, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export const JobManagerPage: React.FC = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    // In a real app we'd fetch the recruiter's company_id first
    api.get<any, any>('/recruiter-hub/jobs?company_id=demo')
      .then(res => {
        if (res.success && res.data) setJobs(res.data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-primary-500" /> Job Posts
          </h1>
          <p className="text-gray-400 mt-1">Manage your active listings and track applicants.</p>
        </div>
        <Button variant="glow" onClick={() => navigate('/recruiter/jobs/new')}>
          <Plus className="w-4 h-4 mr-2" /> Create Job Post
        </Button>
      </div>

      <Card className="p-6 border-white/10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-surface-50 border border-white/10 rounded-lg px-3 py-2 w-full md:max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-surface-50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500">
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-3">Job Title</th>
                <th className="p-3">Location / Type</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Applicants</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock Jobs for MVP since we don't have jobs yet */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <p className="text-sm font-bold text-white">Senior React Engineer</p>
                  <p className="text-xs text-gray-400">Engineering</p>
                </td>
                <td className="p-3">
                  <p className="text-sm text-gray-300 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400"/> Remote</p>
                  <p className="text-xs text-gray-500">Full-time</p>
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Published</span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => navigate('/recruiter/jobs/1/pipeline')} className="text-sm font-bold text-white hover:text-primary-400 transition-colors">
                    24
                  </button>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
