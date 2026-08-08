import React, { useState } from 'react'
import { Briefcase, ArrowLeft, MoreHorizontal, MessageSquare, Star, Clock, Calendar } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const COLUMNS = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
]

const MOCK_CANDIDATES = [
  { id: '1', name: 'Alex Vance', role: 'Frontend Engineer', status: 'applied', match: 92, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Connor', role: 'Full Stack Developer', status: 'screening', match: 88, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'John Smith', role: 'React Specialist', status: 'interview', match: 95, avatar: 'https://i.pravatar.cc/150?u=3' },
]

export const HiringKanbanPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES)

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const candidateId = e.dataTransfer.getData('candidateId')
    setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status } : c))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -my-4 -mx-4 overflow-hidden">
      <div className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/recruiter/jobs" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Senior React Engineer <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase">Active</span>
            </h2>
            <p className="text-xs text-gray-400">Engineering • Remote</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Briefcase className="w-4 h-4 mr-2" /> Edit Job
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6 flex gap-6">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-80 flex flex-col gap-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{col.label}</h3>
              <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {candidates.filter(c => c.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[200px] rounded-xl bg-surface-50/30 p-2 border border-dashed border-white/10">
              {candidates.filter(c => c.status === col.id).map(candidate => (
                <div 
                  key={candidate.id}
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('candidateId', candidate.id)}
                  className="bg-surface-100 p-4 rounded-xl border border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full bg-surface-50 border border-white/10" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{candidate.name}</h4>
                        <p className="text-xs text-gray-400">{candidate.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs font-bold text-primary-400">
                      <Star className="w-3.5 h-3.5" /> {candidate.match}% Match
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/recruiter/workspace/${candidate.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
