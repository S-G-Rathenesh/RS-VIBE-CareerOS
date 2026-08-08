import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-gray-900',
  headingBorder: 'border-gray-200',
  textColor: 'text-gray-700',
  subtextColor: 'text-gray-400',
  accentColor: 'text-gray-600',
  fontFamily: 'font-sans',
  pillBg: 'bg-gray-100',
  pillText: 'text-gray-700',
}

export const AppleStyleTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-sans">
      {/* Personal Header — Centered Apple Style */}
      <div className="flex flex-col items-center text-center border-b border-gray-200 pb-6 gap-1">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">{p.full_name || 'Your Name'}</h1>
        <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">{resume.target_role}</span>
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2">
          {[p.email, p.phone, p.location].filter(Boolean).join(' • ')}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
AppleStyleTemplate.displayName = 'AppleStyleTemplate'
