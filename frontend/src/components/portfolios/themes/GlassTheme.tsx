import React from 'react'
import { PortfolioThemeProps } from './index'
import { Github, Linkedin, ExternalLink, Sparkles, Code2, Briefcase, GraduationCap } from 'lucide-react'
import { TechStack } from '../components/TechStack'
import { Timeline } from '../components/Timeline'

export const GlassTheme: React.FC<PortfolioThemeProps> = ({ portfolio }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-12 flex flex-col gap-12 max-w-5xl mx-auto">
      <div className="glass-panel p-10 rounded-3xl border border-white/15 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
        <div className="w-48 h-48 rounded-full bg-primary-500/20 blur-3xl absolute -top-10 -right-10 pointer-events-none" />
        <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 text-xs font-bold w-max border border-primary-500/20">
          <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Public Portfolio
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">{portfolio.title || 'My Portfolio'}</h1>
        <p className="text-xl font-medium text-primary-400">{portfolio.hero_tagline || portfolio.tagline}</p>
        <p className="text-base text-gray-300 max-w-2xl leading-relaxed">{portfolio.bio || portfolio.description}</p>
      </div>

      {portfolio.skills && portfolio.skills.length > 0 && (
        <div className="flex flex-col gap-6 glass-panel p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Code2 className="w-5 h-5 text-accent-cyan" /> Tech Stack</h2>
          <TechStack skills={portfolio.skills} />
        </div>
      )}

      {portfolio.experience && portfolio.experience.length > 0 && (
        <div className="flex flex-col gap-6 glass-panel p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-accent-pink" /> Experience</h2>
          <Timeline items={portfolio.experience.map((exp: any) => ({
            id: exp.id || Math.random().toString(),
            title: exp.position || exp.title,
            subtitle: exp.company || exp.organization,
            date: `${exp.start_date} - ${exp.end_date || 'Present'}`,
            description: exp.description
          }))} />
        </div>
      )}

      {portfolio.projects?.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Showcase Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.projects.map((proj: any, idx: number) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{proj.description}</p>
                </div>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-primary-400 hover:text-white font-semibold flex items-center gap-1">
                    Visit Project <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
