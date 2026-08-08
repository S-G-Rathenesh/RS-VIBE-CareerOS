import React from 'react'

/* ─── Theme tokens passed by each template ─── */
export interface SectionTheme {
  headingColor: string        // e.g. "text-gray-900"
  headingBorder: string       // e.g. "border-gray-300"
  textColor: string           // e.g. "text-gray-700"
  subtextColor: string        // e.g. "text-gray-500"
  accentColor: string         // e.g. "text-indigo-600"
  fontFamily: string          // e.g. "font-sans"
  pillBg: string              // e.g. "bg-gray-100"
  pillText: string            // e.g. "text-gray-700"
}

export const DEFAULT_THEME: SectionTheme = {
  headingColor: 'text-gray-900',
  headingBorder: 'border-gray-300',
  textColor: 'text-gray-700',
  subtextColor: 'text-gray-500',
  accentColor: 'text-indigo-600',
  fontFamily: 'font-sans',
  pillBg: 'bg-gray-100',
  pillText: 'text-gray-700',
}

/* ─── Summary ─── */
export const SummarySection: React.FC<{ summary?: string; theme?: SectionTheme }> = React.memo(({ summary, theme = DEFAULT_THEME }) => {
  if (!summary) return null
  return (
    <div className="flex flex-col gap-1 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Professional Summary
      </h2>
      <p className={`text-xs leading-relaxed mt-1 ${theme.textColor} ${theme.fontFamily}`}>{summary}</p>
    </div>
  )
})
SummarySection.displayName = 'SummarySection'

/* ─── Experience ─── */
export const ExperienceSection: React.FC<{ items?: any[]; theme?: SectionTheme }> = React.memo(({ items, theme = DEFAULT_THEME }) => {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-3 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Work Experience
      </h2>
      {items.map((exp: any) => (
        <div key={exp.id} className="flex flex-col gap-1 break-inside-avoid page-break-inside-avoid">
          <div className="flex justify-between items-baseline text-xs">
            <span className={`font-bold ${theme.headingColor}`}>
              {exp.position} — <span className={theme.textColor}>{exp.company}</span>
            </span>
            <span className={`text-[11px] ${theme.subtextColor}`}>{exp.duration}</span>
          </div>
          {exp.location && (
            <span className={`text-[10px] ${theme.subtextColor}`}>{exp.location}</span>
          )}
          {exp.bullets?.length > 0 && (
            <ul className={`list-disc pl-4 text-xs space-y-0.5 ${theme.textColor}`}>
              {exp.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
})
ExperienceSection.displayName = 'ExperienceSection'

/* ─── Skills ─── */
export const SkillsSection: React.FC<{ items?: any[]; theme?: SectionTheme }> = React.memo(({ items, theme = DEFAULT_THEME }) => {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-2 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Skills
      </h2>
      {items.map((cat: any) => (
        <div key={cat.id} className="flex flex-col gap-1 break-inside-avoid page-break-inside-avoid">
          <span className={`text-[11px] font-semibold ${theme.headingColor}`}>{cat.category}</span>
          <div className="flex flex-wrap gap-1.5">
            {cat.items?.map((skill: string, i: number) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${theme.pillBg} ${theme.pillText}`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
})
SkillsSection.displayName = 'SkillsSection'

/* ─── Education ─── */
export const EducationSection: React.FC<{ items?: any[]; theme?: SectionTheme }> = React.memo(({ items, theme = DEFAULT_THEME }) => {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-3 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Education
      </h2>
      {items.map((edu: any) => (
        <div key={edu.id} className="flex flex-col gap-0.5 break-inside-avoid page-break-inside-avoid">
          <div className="flex justify-between items-baseline text-xs">
            <span className={`font-bold ${theme.headingColor}`}>{edu.degree} in {edu.field_of_study}</span>
            <span className={`text-[11px] ${theme.subtextColor}`}>{edu.duration}</span>
          </div>
          <span className={`text-[11px] ${theme.textColor}`}>{edu.institution}</span>
          {edu.grade && <span className={`text-[10px] ${theme.subtextColor}`}>{edu.grade}</span>}
        </div>
      ))}
    </div>
  )
})
EducationSection.displayName = 'EducationSection'

/* ─── Projects ─── */
export const ProjectsSection: React.FC<{ items?: any[]; theme?: SectionTheme }> = React.memo(({ items, theme = DEFAULT_THEME }) => {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-3 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Projects
      </h2>
      {items.map((proj: any) => (
        <div key={proj.id} className="flex flex-col gap-1 break-inside-avoid page-break-inside-avoid">
          <div className="flex justify-between items-baseline text-xs">
            <span className={`font-bold ${theme.headingColor}`}>{proj.name}</span>
            {proj.link && (
              <a href={proj.link} target="_blank" rel="noopener noreferrer" className={`text-[10px] underline ${theme.accentColor}`}>
                {proj.link}
              </a>
            )}
          </div>
          {proj.description && <p className={`text-[11px] ${theme.textColor}`}>{proj.description}</p>}
          {proj.tech_stack?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {proj.tech_stack.map((t: string, i: number) => (
                <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${theme.pillBg} ${theme.pillText}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
})
ProjectsSection.displayName = 'ProjectsSection'

/* ─── Certificates ─── */
export const CertificatesSection: React.FC<{ items?: any[]; theme?: SectionTheme }> = React.memo(({ items, theme = DEFAULT_THEME }) => {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-2 break-inside-avoid page-break-inside-avoid">
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${theme.headingColor} ${theme.headingBorder}`}>
        Certifications
      </h2>
      {items.map((cert: any) => (
        <div key={cert.id} className="flex justify-between items-baseline text-xs break-inside-avoid page-break-inside-avoid">
          <span>
            <span className={`font-semibold ${theme.headingColor}`}>{cert.name}</span>
            {cert.issuer && <span className={`${theme.subtextColor}`}> — {cert.issuer}</span>}
          </span>
          {cert.date && <span className={`text-[11px] ${theme.subtextColor}`}>{cert.date}</span>}
        </div>
      ))}
    </div>
  )
})
CertificatesSection.displayName = 'CertificatesSection'

/* ─── Section Order Renderer ─── */
export const renderSectionsByOrder = (resume: any, theme: SectionTheme): React.ReactNode[] => {
  const order: string[] = resume.section_order || ['summary', 'experience', 'skills', 'projects', 'education', 'certificates']
  const p = resume.personal_info || {}

  return order
    .filter((key) => key !== 'personal') // personal header is always rendered separately
    .map((key) => {
      switch (key) {
        case 'summary':
          return <SummarySection key={key} summary={p.summary} theme={theme} />
        case 'experience':
          return <ExperienceSection key={key} items={resume.work_experience} theme={theme} />
        case 'skills':
          return <SkillsSection key={key} items={resume.skills} theme={theme} />
        case 'education':
          return <EducationSection key={key} items={resume.education} theme={theme} />
        case 'projects':
          return <ProjectsSection key={key} items={resume.projects} theme={theme} />
        case 'certificates':
          return <CertificatesSection key={key} items={resume.certificates} theme={theme} />
        default:
          return null
      }
    })
}
