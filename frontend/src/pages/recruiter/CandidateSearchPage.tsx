import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Briefcase, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { motion } from 'framer-motion'

export const CandidateSearchPage: React.FC = () => {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app we'd pass filters to the backend
    api.post<any, any>('/recruiter-hub/search', {})
      .then(res => {
        if (res.success && res.data) setCandidates(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Search className="text-primary-500" /> Candidate Search
          </h1>
          <p className="text-gray-400 mt-1">Discover top talent matching your job requirements.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <Card className="p-5 border-white/10 flex flex-col gap-6 w-full lg:w-72 shrink-0 h-max sticky top-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-white flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> Filters</h3>
            <button className="text-xs text-primary-400 font-semibold hover:text-white">Clear All</button>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Keywords</label>
            <input type="text" placeholder="e.g. React, Node.js" className="bg-surface-50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary-500" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
            <input type="text" placeholder="City or Remote" className="bg-surface-50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary-500" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Experience (Years)</label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" className="w-full bg-surface-50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary-500" />
              <span className="text-gray-500">-</span>
              <input type="number" placeholder="Max" className="w-full bg-surface-50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          
          <Button variant="primary" className="w-full mt-4">Apply Filters</Button>
        </Card>

        {/* Results */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{candidates.length} candidates found</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select className="bg-surface-50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500">
                <option value="match">AI Match Score</option>
                <option value="recent">Recently Active</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
          ) : candidates.length === 0 ? (
            <Card className="p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-white">No candidates found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search filters.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {candidates.map((c, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={c._id}
                >
                  <Card className="p-5 border-white/10 hover:border-primary-500/50 transition-colors cursor-pointer group" onClick={() => navigate(`/recruiter/workspace/${c._id}`)}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-surface-50 flex items-center justify-center text-xl font-bold text-gray-400 border border-white/10 overflow-hidden">
                          {c.avatar_url ? <img src={c.avatar_url} alt={c.full_name} className="w-full h-full object-cover"/> : c.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{c.full_name}</h3>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Briefcase className="w-3.5 h-3.5" /> Frontend Engineer
                          </p>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" /> San Francisco, CA (Remote)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                          <Star className="w-3.5 h-3.5" /> 92% Match
                        </div>
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                          View Profile <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    {c.skills && c.skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                        {c.skills.slice(0, 5).map((skill: any, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-surface-50 text-gray-300 rounded text-xs border border-white/5">
                            {skill.name}
                          </span>
                        ))}
                        {c.skills.length > 5 && (
                          <span className="px-2.5 py-1 text-gray-500 text-xs">+{c.skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
