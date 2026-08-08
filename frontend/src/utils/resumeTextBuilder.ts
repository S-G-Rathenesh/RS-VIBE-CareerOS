/**
 * Client-Side Resume ATS Text Builder.
 * Converts structured resume data into standardized ATS plain text.
 */
export function buildResumeAtsText(resume: any): string {
  if (!resume || typeof resume !== 'object') return ''

  const sections: string[] = []

  // 1. Personal Information & Header
  const personal = resume.personal_info || {}
  const name = personal.full_name || resume.title || 'Candidate'
  const targetRole = resume.target_role || ''
  const email = personal.email || ''
  const phone = personal.phone || ''
  const location = personal.location || ''
  const website = personal.website || ''
  const github = personal.github || ''
  const linkedin = personal.linkedin || ''

  const headerLines: string[] = [name.toUpperCase()]
  if (targetRole) headerLines.push(targetRole.toUpperCase())

  const contactItems = [email, phone, location, website, github, linkedin].filter(Boolean)
  if (contactItems.length > 0) {
    headerLines.push(contactItems.join(' | '))
  }

  sections.push(headerLines.join('\n'))

  // 2. Professional Summary
  const summary = personal.summary || resume.summary || ''
  if (summary && summary.trim()) {
    sections.push(`PROFESSIONAL SUMMARY\n${summary.trim()}`)
  }

  // 3. Work Experience
  const workItems = resume.work_experience || resume.experience || []
  if (Array.isArray(workItems) && workItems.length > 0) {
    const expLines: string[] = ['WORK EXPERIENCE']
    for (const exp of workItems) {
      if (!exp || typeof exp !== 'object') continue
      const pos = exp.position || exp.title || 'Role'
      const comp = exp.company || exp.organization || ''
      const duration = exp.duration || exp.dates || ''
      const expLoc = exp.location || ''

      let titleLine = [pos, comp].filter(Boolean).join(' - ')
      if (duration) titleLine += ` (${duration})`
      expLines.push(titleLine)

      if (expLoc) expLines.push(expLoc)

      const bullets = Array.isArray(exp.bullets)
        ? exp.bullets
        : typeof exp.bullets === 'string'
        ? [exp.bullets]
        : []

      for (const b of bullets) {
        if (b && String(b).trim()) {
          expLines.push(`- ${String(b).trim()}`)
        }
      }
      expLines.push('')
    }
    sections.push(expLines.join('\n').trim())
  }

  // 4. Skills
  const skills = resume.skills || []
  if (Array.isArray(skills) && skills.length > 0) {
    const skillLines: string[] = ['SKILLS']
    for (const cat of skills) {
      if (cat && typeof cat === 'object') {
        const catName = cat.category || 'Technical Skills'
        const items = Array.isArray(cat.items) ? cat.items.filter(Boolean) : []
        if (items.length > 0) {
          skillLines.push(`${catName}: ${items.join(', ')}`)
        }
      } else if (typeof cat === 'string' && cat.trim()) {
        skillLines.push(`- ${cat.trim()}`)
      }
    }
    sections.push(skillLines.join('\n').trim())
  }

  // 5. Projects
  const projects = resume.projects || []
  if (Array.isArray(projects) && projects.length > 0) {
    const projLines: string[] = ['PROJECTS']
    for (const proj of projects) {
      if (!proj || typeof proj !== 'object') continue
      const projName = proj.name || proj.title || 'Project'
      const projLink = proj.link || proj.url || ''
      const projDesc = proj.description || proj.summary || ''
      const tech = Array.isArray(proj.tech_stack)
        ? proj.tech_stack.filter(Boolean)
        : []

      let pHeader = projName
      if (projLink) pHeader += ` (${projLink})`
      projLines.push(pHeader)

      if (projDesc) projLines.push(`- ${projDesc}`)
      if (tech.length > 0) projLines.push(`  Technologies: ${tech.join(', ')}`)
      projLines.push('')
    }
    sections.push(projLines.join('\n').trim())
  }

  // 6. Education
  const education = resume.education || []
  if (Array.isArray(education) && education.length > 0) {
    const eduLines: string[] = ['EDUCATION']
    for (const edu of education) {
      if (!edu || typeof edu !== 'object') continue
      const degree = edu.degree || 'Degree'
      const field = edu.field_of_study || edu.major || ''
      const inst = edu.institution || edu.university || edu.school || ''
      const eduDur = edu.duration || edu.dates || ''
      const grade = edu.grade || edu.gpa || ''

      let degStr = degree
      if (field && !degree.toLowerCase().includes(field.toLowerCase())) {
        degStr = `${degree} in ${field}`
      }

      let eduHeader = [degStr, inst].filter(Boolean).join(' - ')
      if (eduDur) eduHeader += ` (${eduDur})`
      eduLines.push(eduHeader)

      if (grade) eduLines.push(`Grade / GPA: ${grade}`)
      eduLines.push('')
    }
    sections.push(eduLines.join('\n').trim())
  }

  // 7. Certifications
  const certs = resume.certificates || resume.certifications || []
  if (Array.isArray(certs) && certs.length > 0) {
    const certLines: string[] = ['CERTIFICATIONS']
    for (const cert of certs) {
      if (!cert || typeof cert !== 'object') continue
      const certName = cert.name || cert.title || 'Certification'
      const issuer = cert.issuer || cert.organization || ''
      const date = cert.date || cert.year || ''

      let cLine = certName
      if (issuer) cLine += ` - ${issuer}`
      if (date) cLine += ` (${date})`
      certLines.push(`- ${cLine}`)
    }
    sections.push(certLines.join('\n').trim())
  }

  return sections.filter((s) => s.trim().length > 0).join('\n\n')
}
