import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-gray-800',
  headingBorder: 'border-gray-200',
  textColor: 'text-gray-600',
  subtextColor: 'text-gray-400',
  accentColor: 'text-gray-700',
  fontFamily: 'font-sans',
  pillBg: 'bg-gray-50',
  pillText: 'text-gray-600',
}

export const MinimalTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-sans">
      {/* Personal Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-wide text-gray-900">{p.full_name || 'Your Name'}</h1>
        <span className="text-xs tracking-widest uppercase text-gray-500">{resume.target_role}</span>
        <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
MinimalTemplate.displayName = 'MinimalTemplate'
