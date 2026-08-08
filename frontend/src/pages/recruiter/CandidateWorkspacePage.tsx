import React, { useState, useEffect } from 'react'
import { ArrowLeft, Mail, Calendar, FileText, CheckCircle2, User, Star, ExternalLink, Globe } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Link, useParams } from 'react-router-dom'

export const CandidateWorkspacePage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>()
  const [activeTab, setActiveTab] = useState('resume')

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -my-4 -mx-4 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/recruiter/search" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
              AV
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Alex Vance
              </h2>
              <p className="text-xs text-gray-400">Frontend Engineer • Remote</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" /> Message
          </Button>
          <Button variant="glow" size="sm">
            <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 glass-panel border-r border-white/10 flex flex-col p-4 gap-2">
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === 'resume' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('resume')}
          >
            <FileText className="w-4 h-4" /> Resume & ATS
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === 'portfolio' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Globe className="w-4 h-4" /> Portfolio Site
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === 'match' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('match')}
          >
            <Star className="w-4 h-4" /> AI Match Report
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === 'notes' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('notes')}
          >
            <User className="w-4 h-4" /> Notes & Activity
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-50 p-6 overflow-y-auto">
          {activeTab === 'match' && (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 shadow-glow-emerald">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-black text-black">
                    92%
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Strong Match</h2>
                    <p className="text-sm text-gray-400">Alex is an excellent fit for the Senior React Engineer role.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">Strengths</h3>
                    <ul className="flex flex-col gap-2">
                      {['Extensive React & TypeScript experience', 'Built highly scalable UIs', 'Strong open source contributions'].map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Weaknesses / Missing</h3>
                    <ul className="flex flex-col gap-2">
                      {['No mention of GraphQL', 'Less experience with cloud infrastructure'].map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          </div>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 border-white/10">
                <h3 className="text-sm font-bold text-white mb-4">AI Recruiter Assistant</h3>
                <div className="bg-surface-50 rounded-xl p-4 border border-white/5 text-sm text-gray-300 mb-4">
                  Based on this candidate's profile, I suggest focusing the technical interview on their state management architecture and how they handle performance in large React applications.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Generate Interview Questions</Button>
                  <Button variant="outline" size="sm">Draft Email</Button>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'resume' && (
            <div className="max-w-3xl mx-auto">
              <Card className="p-8 border-white/10 min-h-screen">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Alex Vance</h1>
                    <p className="text-primary-400 mt-1">Senior Frontend Engineer</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>alex.vance@example.com</p>
                    <p>San Francisco, CA</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Passionate frontend engineer with 6+ years of experience building scalable web applications. Specialist in React, TypeScript, and modern frontend tooling.
                    </p>
                  </div>
                  
                  {/* More mock resume content would go here */}
                  <div className="h-64 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-500">
                    Resume content viewer placeholder
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
