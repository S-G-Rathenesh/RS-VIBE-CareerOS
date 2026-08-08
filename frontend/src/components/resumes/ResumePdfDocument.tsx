import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer'

/* ─── Register Google Font for professional typography ─── */
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfMZg.ttf', fontWeight: 300 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 800 },
  ],
})

/* Hyphenation callback - disable artificial word splitting */
Font.registerHyphenationCallback((word) => [word])

/* ─── Helpers to prevent duplicate or malformed combined text ─── */
const formatDegreeField = (degree?: string, fieldOfStudy?: string): string => {
  const deg = (degree || '').trim()
  const field = (fieldOfStudy || '').trim()

  if (deg && field) {
    if (deg.toLowerCase().includes(field.toLowerCase())) {
      return deg
    }
    return `${deg} in ${field}`
  }
  return deg || field || ''
}

const formatPositionCompany = (position?: string, company?: string): { posText: string; compText: string } => {
  const pos = (position || '').trim() || 'Role'
  let comp = (company || '').trim()

  if (comp && pos.toLowerCase().includes(` at ${comp.toLowerCase()}`)) {
    comp = ''
  }
  return { posText: pos, compText: comp ? ` - ${comp}` : '' }
}

/* ─── Standardized PDF StyleSheet (Flex column, no fixed heights, proper lineHeights) ─── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    color: '#1f2937',
    flexDirection: 'column',
    display: 'flex',
  },

  /* ─ Header ─ */
  headerContainer: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 800,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 1.25,
    marginBottom: 2,
  },
  headerRole: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    lineHeight: 1.35,
    marginBottom: 4,
  },
  headerContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  headerContactItem: {
    fontSize: 8,
    fontWeight: 400,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  headerDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
    marginTop: 2,
    marginBottom: 8,
  },

  /* ─ Section Containers ─ */
  sectionContainer: {
    flexDirection: 'column',
    marginBottom: 9,
  },
  sectionHeading: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    borderBottomWidth: 0.75,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2.5,
    marginBottom: 5,
    marginTop: 2,
    lineHeight: 1.3,
  },

  /* ─ Row Layouts (Headers for Exp, Edu, Proj) ─ */
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1.5,
  },
  rowHeaderLeft: {
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rowHeaderRight: {
    flexShrink: 0,
    textAlign: 'right',
  },

  /* ─ Entry Typography ─ */
  entryBlock: {
    flexDirection: 'column',
    marginBottom: 6,
  },
  entryTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.35,
  },
  entrySubtitle: {
    fontSize: 9,
    fontWeight: 400,
    color: '#374151',
    lineHeight: 1.35,
  },
  entryDuration: {
    fontSize: 8,
    fontWeight: 400,
    color: '#6b7280',
    lineHeight: 1.35,
  },
  entryLocation: {
    fontSize: 7.5,
    fontWeight: 400,
    color: '#6b7280',
    lineHeight: 1.35,
    marginBottom: 2,
  },
  entryText: {
    fontSize: 8.5,
    fontWeight: 400,
    color: '#374151',
    lineHeight: 1.45,
  },

  /* ─ Bullets ─ */
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 6,
    marginBottom: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 8,
    fontWeight: 700,
    color: '#4b5563',
    lineHeight: 1.45,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    fontWeight: 400,
    color: '#374151',
    lineHeight: 1.45,
  },

  /* ─ Skills ─ */
  skillCatBlock: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  skillCatName: {
    fontSize: 8.5,
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.35,
    marginBottom: 2,
  },
  skillPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  skillPill: {
    fontSize: 7.5,
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2.5,
    lineHeight: 1.3,
    marginRight: 4,
    marginBottom: 3,
  },

  /* ─ Projects ─ */
  projLink: {
    fontSize: 7.5,
    fontWeight: 400,
    color: '#4f46e5',
    textDecoration: 'underline',
    lineHeight: 1.35,
  },
  projTechRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    marginBottom: 1,
  },
  projTechPill: {
    fontSize: 7,
    fontWeight: 500,
    color: '#4338ca',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 2,
    lineHeight: 1.25,
    marginRight: 3,
    marginBottom: 2,
  },

  /* ─ Education ─ */
  eduInstitution: {
    fontSize: 8.5,
    fontWeight: 400,
    color: '#374151',
    lineHeight: 1.35,
  },
  eduGrade: {
    fontSize: 7.5,
    fontWeight: 400,
    color: '#6b7280',
    lineHeight: 1.35,
    marginTop: 1,
  },

  /* ─ Certifications ─ */
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  certTitleCol: {
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certName: {
    fontSize: 8.5,
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.35,
  },
  certIssuer: {
    fontSize: 8,
    fontWeight: 400,
    color: '#6b7280',
    lineHeight: 1.35,
  },
  certDate: {
    fontSize: 8,
    fontWeight: 400,
    color: '#6b7280',
    lineHeight: 1.35,
    flexShrink: 0,
    textAlign: 'right',
  },
})

/* ─── Section Renderers ─── */
const SummaryPdf: React.FC<{ summary?: string }> = ({ summary }) => {
  if (!summary?.trim()) return null
  return (
    <View style={s.sectionContainer} wrap={false}>
      <Text style={s.sectionHeading}>Professional Summary</Text>
      <Text style={s.entryText}>{summary.trim()}</Text>
    </View>
  )
}

const ExperiencePdf: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <View style={s.sectionContainer}>
      <Text style={s.sectionHeading}>Work Experience</Text>
      {items.map((exp: any, idx: number) => {
        const { posText, compText } = formatPositionCompany(exp.position, exp.company)
        return (
          <View key={exp.id || idx} style={s.entryBlock} wrap={false}>
            <View style={s.rowHeader}>
              <View style={s.rowHeaderLeft}>
                <Text style={s.entryTitle}>{posText}</Text>
                {compText ? <Text style={s.entrySubtitle}>{compText}</Text> : null}
              </View>
              {exp.duration ? (
                <View style={s.rowHeaderRight}>
                  <Text style={s.entryDuration}>{exp.duration}</Text>
                </View>
              ) : null}
            </View>

            {exp.location ? <Text style={s.entryLocation}>{exp.location}</Text> : null}

            {exp.bullets && exp.bullets.length > 0 ? (
              <View style={{ flexDirection: 'column', marginTop: 1 }}>
                {exp.bullets.map((b: string, i: number) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>-</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

const SkillsPdf: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <View style={s.sectionContainer}>
      <Text style={s.sectionHeading}>Skills</Text>
      {items.map((cat: any, idx: number) => (
        <View key={cat.id || idx} style={s.skillCatBlock} wrap={false}>
          {cat.category ? <Text style={s.skillCatName}>{cat.category}</Text> : null}
          {cat.items && cat.items.length > 0 ? (
            <View style={s.skillPillRow}>
              {cat.items.map((skill: string, i: number) => (
                <Text key={i} style={s.skillPill}>{skill}</Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const EducationPdf: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <View style={s.sectionContainer}>
      <Text style={s.sectionHeading}>Education</Text>
      {items.map((edu: any, idx: number) => {
        const degreeText = formatDegreeField(edu.degree, edu.field_of_study)
        return (
          <View key={edu.id || idx} style={s.entryBlock} wrap={false}>
            <View style={s.rowHeader}>
              <View style={s.rowHeaderLeft}>
                <Text style={s.entryTitle}>{degreeText}</Text>
              </View>
              {edu.duration ? (
                <View style={s.rowHeaderRight}>
                  <Text style={s.entryDuration}>{edu.duration}</Text>
                </View>
              ) : null}
            </View>
            {edu.institution ? <Text style={s.eduInstitution}>{edu.institution}</Text> : null}
            {edu.grade ? <Text style={s.eduGrade}>Grade / GPA: {edu.grade}</Text> : null}
          </View>
        )
      })}
    </View>
  )
}

const ProjectsPdf: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <View style={s.sectionContainer}>
      <Text style={s.sectionHeading}>Projects</Text>
      {items.map((proj: any, idx: number) => (
        <View key={proj.id || idx} style={s.entryBlock} wrap={false}>
          <View style={s.rowHeader}>
            <View style={s.rowHeaderLeft}>
              <Text style={s.entryTitle}>{proj.name}</Text>
            </View>
            {proj.link ? (
              <View style={s.rowHeaderRight}>
                <Link src={proj.link} style={s.projLink}>{proj.link}</Link>
              </View>
            ) : null}
          </View>

          {proj.description ? <Text style={s.entryText}>{proj.description}</Text> : null}

          {proj.tech_stack && proj.tech_stack.length > 0 ? (
            <View style={s.projTechRow}>
              {proj.tech_stack.map((t: string, i: number) => (
                <Text key={i} style={s.projTechPill}>{t}</Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const CertificatesPdf: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <View style={s.sectionContainer}>
      <Text style={s.sectionHeading}>Certifications</Text>
      {items.map((cert: any, idx: number) => (
        <View key={cert.id || idx} style={s.certRow} wrap={false}>
          <View style={s.certTitleCol}>
            <Text style={s.certName}>{cert.name}</Text>
            {cert.issuer ? <Text style={s.certIssuer}> - {cert.issuer}</Text> : null}
          </View>
          {cert.date ? <Text style={s.certDate}>{cert.date}</Text> : null}
        </View>
      ))}
    </View>
  )
}

/* ─── Main Document ─── */
interface ResumePdfDocumentProps {
  resume: any
}

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({ resume }) => {
  const p = resume?.personal_info || {}
  const sectionOrder: string[] = resume?.section_order || [
    'summary', 'experience', 'skills', 'projects', 'education', 'certificates',
  ]

  const contactItems = [p.email, p.phone, p.location, p.website, p.github, p.linkedin].filter(Boolean)

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        return <SummaryPdf key={key} summary={p.summary} />
      case 'experience':
        return <ExperiencePdf key={key} items={resume.work_experience} />
      case 'skills':
        return <SkillsPdf key={key} items={resume.skills} />
      case 'education':
        return <EducationPdf key={key} items={resume.education} />
      case 'projects':
        return <ProjectsPdf key={key} items={resume.projects} />
      case 'certificates':
        return <CertificatesPdf key={key} items={resume.certificates} />
      default:
        return null
    }
  }

  return (
    <Document
      title={resume?.title || 'Resume'}
      author={p.full_name || 'RS VIBE CareerOS'}
      subject={`Resume - ${resume?.target_role || 'Candidate'}`}
      keywords="resume, cv, career, ats-friendly"
      producer="RS VIBE CareerOS"
    >
      <Page size="A4" style={s.page}>
        {/* ─ Header ─ */}
        <View style={s.headerContainer}>
          <Text style={s.headerName}>{p.full_name || 'Your Name'}</Text>
          {resume?.target_role ? <Text style={s.headerRole}>{resume.target_role}</Text> : null}

          {contactItems.length > 0 && (
            <View style={s.headerContactRow}>
              {contactItems.map((item: string, i: number) => (
                <Text key={i} style={s.headerContactItem}>
                  {i > 0 ? `  |  ${item}` : item}
                </Text>
              ))}
            </View>
          )}
          <View style={s.headerDivider} />
        </View>

        {/* ─ Dynamic Sections via section_order ─ */}
        {sectionOrder
          .filter((k) => k !== 'personal')
          .map((key) => renderSection(key))}
      </Page>
    </Document>
  )
}

/**
 * Factory function that returns a Document JSX element for pdf() API.
 */
export const createResumePdfDocument = (resume: any) => {
  return <ResumePdfDocument resume={resume} />
}
