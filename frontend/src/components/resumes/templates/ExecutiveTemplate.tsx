import React from 'react'
import { ResumeTemplateProps } from './index'
import { renderSectionsByOrder, SectionTheme } from './ResumeSections'

const THEME: SectionTheme = {
  headingColor: 'text-gray-900',
  headingBorder: 'border-gray-300',
  textColor: 'text-gray-800',
  subtextColor: 'text-gray-500',
  accentColor: 'text-amber-800',
  fontFamily: 'font-sans',
  pillBg: 'bg-amber-50',
  pillText: 'text-amber-900',
}

export const ExecutiveTemplate: React.FC<ResumeTemplateProps> = React.memo(({ resume }) => {
  const p = resume.personal_info || {}
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl rounded-sm p-12 flex flex-col gap-6 font-serif">
      {/* Personal Header */}
      <div className="flex justify-between items-end border-b-4 border-amber-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{p.full_name || 'Your Name'}</h1>
          <span className="text-sm font-semibold text-amber-800 tracking-widest uppercase">{resume.target_role}</span>
        </div>
        <div className="text-right text-xs text-gray-600 flex flex-col">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>

      {/* Dynamic sections driven by section_order */}
      {renderSectionsByOrder(resume, THEME)}
    </div>
  )
})
ExecutiveTemplate.displayName = 'ExecutiveTemplate'
