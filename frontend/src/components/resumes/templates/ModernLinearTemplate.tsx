import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-gray-900',
  headingBorder: 'border-gray-300',
  textColor: 'text-gray-700',
  subtextColor: 'text-gray-500',
  accentColor: 'text-indigo-600',
  fontFamily: 'font-sans',
  pillBg: 'bg-indigo-50',
  pillText: 'text-indigo-700',
}

export const ModernLinearTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-sans">
      {/* Personal Header */}
      <div className="flex flex-col border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight">{p.full_name || 'Your Name'}</h1>
        <span className="text-sm font-bold text-indigo-600 uppercase">{resume.target_role}</span>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
          {p.github && <span>{p.github}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
ModernLinearTemplate.displayName = 'ModernLinearTemplate'
