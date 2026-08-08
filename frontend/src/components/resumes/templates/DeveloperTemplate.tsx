import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-white',
  headingBorder: 'border-emerald-500/40',
  textColor: 'text-slate-300',
  subtextColor: 'text-slate-500',
  accentColor: 'text-emerald-400',
  fontFamily: 'font-mono',
  pillBg: 'bg-emerald-900/40',
  pillText: 'text-emerald-300',
}

export const DeveloperTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-slate-900 text-slate-100 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-mono">
      {/* Personal Header — Terminal Style */}
      <div className="flex flex-col border-b border-emerald-500/40 pb-4">
        <div className="text-emerald-400 text-xs">// candidate_profile.json</div>
        <h1 className="text-3xl font-bold text-white mt-1">{p.full_name || 'Your Name'}</h1>
        <span className="text-xs text-emerald-400">role: "{resume.target_role}"</span>
        <div className="flex gap-4 text-[11px] text-slate-400 mt-2">
          {p.email && <span>contact: "{p.email}"</span>}
          {p.location && <span>loc: "{p.location}"</span>}
          {p.github && <span>gh: "{p.github}"</span>}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
DeveloperTemplate.displayName = 'DeveloperTemplate'
