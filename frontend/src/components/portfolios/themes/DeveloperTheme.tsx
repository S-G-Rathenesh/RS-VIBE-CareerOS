import React from 'react'
import { BasePortfolioLayout, ThemeStyles } from './BasePortfolioLayout'

const developerStyles: ThemeStyles = {
  container: 'bg-[#0d1117] text-gray-300 font-mono',
  hero: 'bg-[#0d1117] border-b border-[#30363d] text-center',
  heroTitle: 'text-4xl font-bold text-[#c9d1d9] mb-4',
  heroTagline: 'text-xl text-[#8b949e]',
  card: 'bg-[#161b22] border border-[#30363d] rounded-md p-6 shadow-sm hover:border-[#8b949e] transition-colors',
  cardTitle: 'text-lg font-bold text-[#58a6ff] mb-2',
  cardText: 'text-sm text-[#8b949e]',
  button: 'bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md font-medium border border-[rgba(240,246,252,0.1)] transition-colors',
  pill: 'bg-[#1f6feb] bg-opacity-10 text-[#58a6ff] border border-[#1f6feb] border-opacity-30 rounded-full px-3 py-1 text-xs',
  link: 'text-[#58a6ff] hover:underline'
}

export const DeveloperTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={developerStyles} />
)
