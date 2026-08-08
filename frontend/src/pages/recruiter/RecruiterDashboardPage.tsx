import React, { useState, useEffect } from 'react'
import { Briefcase, Users, MessageSquare, Plus, ArrowRight, Activity, Search } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Link, useNavigate } from 'react-router-dom'

export const RecruiterDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Recruiter Hub
          </h1>
          <p className="text-gray-400 mt-1">Manage jobs, discover top talent, and track your hiring pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/recruiter/company')}>
            Company Settings
          </Button>
          <Button variant="primary" onClick={() => navigate('/recruiter/jobs/new')}>
            <Plus className="w-4 h-4 mr-2" /> Post a Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-white/5 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">12</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Jobs</p>
        </Card>
        
        <Card className="p-6 border-white/5 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">148</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">New Candidates</p>
        </Card>
        
        <Card className="p-6 border-white/5 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">8</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Interviews Today</p>
        </Card>
        
        <Card className="p-6 border-white/5 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-pink/20 text-accent-pink flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">5</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unread Messages</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Search */}
        <Card className="p-6 border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-400" /> Discover Talent
            </h2>
          </div>
          <p className="text-sm text-gray-400">Search millions of candidates instantly with AI-powered matching.</p>
          <div className="flex gap-2 mt-2">
            <input 
              type="text" 
              placeholder="e.g. Senior Frontend Engineer React" 
              className="flex-1 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500"
            />
            <Button variant="glow" onClick={() => navigate('/recruiter/search')}>
              Search
            </Button>
          </div>
        </Card>

        {/* Recent Jobs */}
        <Card className="p-6 border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent-cyan" /> Recent Job Posts
            </h2>
            <Link to="/recruiter/jobs" className="text-sm font-semibold text-primary-400 hover:text-white flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-colors" onClick={() => navigate(`/recruiter/jobs/${i}/pipeline`)}>
                <div>
                  <h4 className="text-sm font-bold text-white">Senior Software Engineer</h4>
                  <p className="text-xs text-gray-400">Engineering • Remote</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">24</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Applied</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
