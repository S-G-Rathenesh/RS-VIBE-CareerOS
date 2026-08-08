import React from 'react'
import { DeveloperTheme } from './DeveloperTheme'
import { 
  CyberpunkTheme, 
  GlassTheme, 
  AppleTheme, 
  ExecutiveTheme, 
  MaterialTheme, 
  GitHubTheme, 
  VSCodeTheme, 
  CreativeTheme, 
  NeonTheme 
} from './ThemeCollection'

export interface PortfolioThemeProps {
  portfolio: any
}

export const PORTFOLIO_THEME_REGISTRY = [
  { id: 'developer_dark', name: 'Developer Dark', category: 'Tech', desc: 'Code syntax & console aesthetic.', preview_image: 'https://placehold.co/600x400/0d1117/58a6ff?text=Developer+Dark' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'Tech', desc: 'Neon grid & glow state cards.', preview_image: 'https://placehold.co/600x400/0a0a0c/00ff9f?text=Cyberpunk' },
  { id: 'glass', name: 'Glass', category: 'Design', desc: 'Vibrant backdrop blurs.', preview_image: 'https://placehold.co/600x400/312e81/c084fc?text=Glass+UI' },
  { id: 'apple', name: 'Apple Minimal', category: 'Design', desc: 'Clean typography-driven hero.', preview_image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=Apple+Minimal' },
  { id: 'executive', name: 'Executive', category: 'Professional', desc: 'Corporate navy and gold.', preview_image: 'https://placehold.co/600x400/002b5e/d4af37?text=Executive' },
  { id: 'material', name: 'Material', category: 'Design', desc: 'Shadow-driven Material UI aesthetic.', preview_image: 'https://placehold.co/600x400/6200ea/ffffff?text=Material' },
  { id: 'github', name: 'GitHub', category: 'Tech', desc: 'Markdown repository aesthetic.', preview_image: 'https://placehold.co/600x400/f6f8fa/0969da?text=GitHub' },
  { id: 'vscode', name: 'VS Code', category: 'Tech', desc: 'Editor-style split pane layout.', preview_image: 'https://placehold.co/600x400/1e1e1e/4ec9b0?text=VS+Code' },
  { id: 'creative', name: 'Creative', category: 'Design', desc: 'Vibrant organic shapes.', preview_image: 'https://placehold.co/600x400/ffebf0/ff758c?text=Creative' },
  { id: 'neon', name: 'Neon', category: 'Design', desc: '80s synthwave neon glow.', preview_image: 'https://placehold.co/600x400/090a0f/00f3ff?text=Neon' },
]

export const getPortfolioThemeComponent = (themeId: string): React.FC<PortfolioThemeProps> => {
  switch (themeId) {
    case 'developer_dark': return DeveloperTheme
    case 'cyberpunk': return CyberpunkTheme
    case 'glass': return GlassTheme
    case 'apple': return AppleTheme
    case 'executive': return ExecutiveTheme
    case 'material': return MaterialTheme
    case 'github': return GitHubTheme
    case 'vscode': return VSCodeTheme
    case 'creative': return CreativeTheme
    case 'neon': return NeonTheme
    default: return DeveloperTheme
  }
}

