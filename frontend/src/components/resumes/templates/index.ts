import React from 'react'
import { ModernLinearTemplate } from './ModernLinearTemplate'
import { ExecutiveTemplate } from './ExecutiveTemplate'
import { MinimalTemplate } from './MinimalTemplate'
import { GoogleStyleTemplate } from './GoogleStyleTemplate'
import { AppleStyleTemplate } from './AppleStyleTemplate'
import { DeveloperTemplate } from './DeveloperTemplate'

export interface ResumeTemplateProps {
  resume: any
}

export const TEMPLATE_REGISTRY = [
  { id: 'modern_linear', name: 'Linear Dark', category: 'Tech', desc: 'Minimalist tech layout inspired by Linear.' },
  { id: 'executive', name: 'Executive Leadership', category: 'Executive', desc: 'Serif typography & double column header.' },
  { id: 'minimal', name: 'Ultra Minimal', category: 'Minimal', desc: 'Clean whitespace and lightweight borders.' },
  { id: 'google_style', name: 'Google Tech', category: 'Tech', desc: 'Clean sans-serif structure with top skills bar.' },
  { id: 'apple_style', name: 'Apple Minimal', category: 'Design', desc: 'Typography-driven, centered hero branding.' },
  { id: 'developer', name: 'Developer Code', category: 'Tech', desc: 'Terminal accent styling for coders.' },
]

export const getTemplateComponent = (templateId: string): React.FC<ResumeTemplateProps> => {
  switch (templateId) {
    case 'executive':
      return ExecutiveTemplate
    case 'minimal':
      return MinimalTemplate
    case 'google_style':
      return GoogleStyleTemplate
    case 'apple_style':
      return AppleStyleTemplate
    case 'developer':
      return DeveloperTemplate
    case 'modern_linear':
    default:
      return ModernLinearTemplate
  }
}
