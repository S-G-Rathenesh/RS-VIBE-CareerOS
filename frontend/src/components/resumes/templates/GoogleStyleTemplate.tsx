import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-gray-900',
  headingBorder: 'border-gray-200',
  textColor: 'text-gray-700',
  subtextColor: 'text-gray-500',
  accentColor: 'text-blue-600',
  fontFamily: 'font-sans',
  pillBg: 'bg-blue-50',
  pillText: 'text-blue-700',
}

export const GoogleStyleTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-sans">
      {/* Personal Header */}
      <div className="flex flex-col border-b-2 border-blue-600 pb-3">
        <h1 className="text-3xl font-bold text-gray-900">{p.full_name || 'Your Name'}</h1>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{resume.target_role}</span>
        <div className="flex gap-3 text-xs text-gray-600 mt-1">
          {[p.email, p.phone, p.location].filter(Boolean).join(' | ')}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
GoogleStyleTemplate.displayName = 'GoogleStyleTemplate'
