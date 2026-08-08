import React from 'react'
import { BasePortfolioLayout, ThemeStyles } from './BasePortfolioLayout'

const cyberpunkStyles: ThemeStyles = {
  container: 'bg-[#0a0a0c] text-[#00ff9f] font-mono',
  hero: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff003c]/20 via-[#0a0a0c] to-[#0a0a0c] border-b border-[#ff003c]/50 text-center shadow-[0_0_50px_rgba(255,0,60,0.2)]',
  heroTitle: 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9f] to-[#00b8ff] mb-4 drop-shadow-[0_0_10px_rgba(0,255,159,0.8)]',
  heroTagline: 'text-xl text-[#f3e600] drop-shadow-[0_0_5px_rgba(243,230,0,0.8)]',
  card: 'bg-[#050505] border border-[#ff003c] rounded-none p-6 shadow-[4px_4px_0px_#00ff9f] hover:translate-x-1 hover:-translate-y-1 transition-transform',
  cardTitle: 'text-lg font-bold text-[#f3e600] mb-2 uppercase tracking-widest',
  cardText: 'text-sm text-[#00b8ff]',
  button: 'bg-transparent border-2 border-[#00ff9f] text-[#00ff9f] hover:bg-[#00ff9f] hover:text-black px-6 py-2 rounded-none font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,159,0.5)]',
  pill: 'bg-[#ff003c] text-white border border-[#ff003c] rounded-none px-3 py-1 text-xs uppercase font-bold shadow-[2px_2px_0px_#00b8ff]',
  link: 'text-[#00ff9f] hover:text-[#f3e600] hover:underline uppercase text-xs font-bold'
}

export const CyberpunkTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={cyberpunkStyles} />
)

const glassStyles: ThemeStyles = {
  container: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white font-sans min-h-screen',
  hero: 'bg-white/5 backdrop-blur-2xl border-b border-white/10 text-center',
  heroTitle: 'text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-4',
  heroTagline: 'text-xl text-purple-200 font-light',
  card: 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all',
  cardTitle: 'text-xl font-bold text-white mb-2',
  cardText: 'text-sm text-purple-100',
  button: 'bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold border border-white/30 transition-all shadow-lg',
  pill: 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 rounded-full px-4 py-1 text-xs font-medium',
  link: 'text-pink-400 hover:text-pink-300 transition-colors'
}

export const GlassTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={glassStyles} />
)

const appleStyles: ThemeStyles = {
  container: 'bg-[#f5f5f7] text-[#1d1d1f] font-sans',
  hero: 'bg-white text-center border-b border-[#d2d2d7]',
  heroTitle: 'text-6xl font-semibold tracking-tight text-[#1d1d1f] mb-4',
  heroTagline: 'text-2xl text-[#86868b] font-medium tracking-tight',
  card: 'bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow border border-[#d2d2d7]/30',
  cardTitle: 'text-xl font-semibold text-[#1d1d1f] mb-2 tracking-tight',
  cardText: 'text-[15px] text-[#515154] leading-relaxed',
  button: 'bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3 rounded-full font-medium transition-colors',
  pill: 'bg-[#f5f5f7] text-[#1d1d1f] rounded-full px-4 py-1.5 text-xs font-medium border border-[#d2d2d7]',
  link: 'text-[#0071e3] hover:underline font-medium'
}

export const AppleTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={appleStyles} />
)

const executiveStyles: ThemeStyles = {
  container: 'bg-[#f8f9fa] text-[#212529] font-serif',
  hero: 'bg-[#002b5e] text-white border-b-4 border-[#d4af37] text-left md:text-center',
  heroTitle: 'text-5xl font-bold tracking-wide mb-4 font-serif',
  heroTagline: 'text-xl text-[#d4af37] font-serif italic',
  card: 'bg-white border-l-4 border-[#002b5e] rounded-sm p-8 shadow-md hover:shadow-lg transition-shadow',
  cardTitle: 'text-xl font-bold text-[#002b5e] mb-2 uppercase tracking-wider',
  cardText: 'text-sm text-[#495057] leading-relaxed',
  button: 'bg-[#d4af37] hover:bg-[#b5952f] text-[#002b5e] px-8 py-3 rounded-sm font-bold uppercase tracking-widest transition-colors',
  pill: 'bg-[#e9ecef] text-[#002b5e] rounded-sm px-3 py-1 text-xs font-bold uppercase',
  link: 'text-[#002b5e] hover:text-[#d4af37] font-bold underline'
}

export const ExecutiveTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={executiveStyles} />
)

const materialStyles: ThemeStyles = {
  container: 'bg-[#fafafa] text-gray-900 font-sans',
  hero: 'bg-[#6200ea] text-white text-left shadow-lg',
  heroTitle: 'text-4xl font-medium mb-2',
  heroTagline: 'text-lg text-purple-100',
  card: 'bg-white rounded-lg p-6 shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] transition-shadow duration-300',
  cardTitle: 'text-xl font-medium text-gray-900 mb-2',
  cardText: 'text-sm text-gray-600',
  button: 'bg-[#03dac6] hover:bg-[#01b4a3] text-black px-6 py-2.5 rounded shadow-md uppercase font-medium tracking-wide transition-colors',
  pill: 'bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm',
  link: 'text-[#6200ea] font-medium hover:underline'
}

export const MaterialTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={materialStyles} />
)

const githubStyles: ThemeStyles = {
  container: 'bg-white text-[#24292f] font-sans',
  hero: 'bg-[#f6f8fa] border-b border-[#d0d7de] text-left px-8',
  heroTitle: 'text-3xl font-semibold mb-2',
  heroTagline: 'text-lg text-[#57606a]',
  card: 'bg-white border border-[#d0d7de] rounded-md p-6 hover:border-[#0969da] transition-colors',
  cardTitle: 'text-base font-semibold text-[#0969da] mb-2',
  cardText: 'text-sm text-[#57606a]',
  button: 'bg-[#2da44e] hover:bg-[#2c974b] text-white px-4 py-2 rounded-md font-medium border border-[rgba(27,31,36,0.15)] shadow-sm transition-colors',
  pill: 'bg-[#ddf4ff] text-[#0969da] rounded-full px-2.5 py-0.5 text-xs font-medium',
  link: 'text-[#0969da] hover:underline'
}

export const GitHubTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={githubStyles} />
)

const vscodeStyles: ThemeStyles = {
  container: 'bg-[#1e1e1e] text-[#d4d4d4] font-mono',
  hero: 'bg-[#252526] border-b border-[#333333] text-left border-l-[3px] border-l-[#007acc]',
  heroTitle: 'text-3xl font-normal text-[#4ec9b0] mb-2',
  heroTagline: 'text-lg text-[#ce9178]',
  card: 'bg-[#252526] border border-[#333333] rounded-none p-5 hover:bg-[#2d2d30] transition-colors',
  cardTitle: 'text-base font-normal text-[#569cd6] mb-2',
  cardText: 'text-sm text-[#cccccc]',
  button: 'bg-[#007acc] hover:bg-[#005f9e] text-white px-4 py-1.5 rounded-none font-normal text-sm transition-colors',
  pill: 'bg-[#333333] text-[#dcdcaa] rounded-none px-2 py-1 text-xs',
  link: 'text-[#3794ff] hover:underline'
}

export const VSCodeTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={vscodeStyles} />
)

const creativeStyles: ThemeStyles = {
  container: 'bg-[#ffebf0] text-[#333333] font-sans',
  hero: 'bg-gradient-to-r from-[#ff9a9e] to-[#fecfef] text-center border-b-[10px] border-[#ff758c]',
  heroTitle: 'text-6xl font-black text-white drop-shadow-md mb-4',
  heroTagline: 'text-2xl text-[#ffe1e6] font-bold',
  card: 'bg-white rounded-[2rem] p-8 shadow-xl hover:-rotate-1 hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-[#ff9a9e]',
  cardTitle: 'text-2xl font-black text-[#ff758c] mb-2',
  cardText: 'text-base text-gray-600 font-medium',
  button: 'bg-[#ff758c] hover:bg-[#ff5e78] text-white px-8 py-4 rounded-full font-black shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1',
  pill: 'bg-[#fecfef] text-[#ff758c] rounded-full px-4 py-2 text-sm font-bold',
  link: 'text-[#ff758c] hover:text-[#ff5e78] font-bold border-b-2 border-[#ff758c]'
}

export const CreativeTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={creativeStyles} />
)

const neonStyles: ThemeStyles = {
  container: 'bg-[#090a0f] text-[#e0e0e0] font-sans bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]',
  hero: 'bg-transparent text-center border-b border-[#d600ff] shadow-[0_10px_20px_rgba(214,0,255,0.2)]',
  heroTitle: 'text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#d600ff] mb-4 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]',
  heroTagline: 'text-2xl text-[#ff0099] drop-shadow-[0_0_8px_rgba(255,0,153,0.8)]',
  card: 'bg-[#12141d] border-2 border-[#00f3ff] rounded-xl p-6 shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(214,0,255,0.6)] hover:border-[#d600ff] transition-all duration-300',
  cardTitle: 'text-xl font-bold text-[#00f3ff] mb-2',
  cardText: 'text-sm text-gray-300',
  button: 'bg-transparent border-2 border-[#d600ff] text-[#d600ff] hover:bg-[#d600ff] hover:text-white px-8 py-3 rounded-full font-bold shadow-[0_0_15px_rgba(214,0,255,0.5)] transition-all',
  pill: 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff] rounded-full px-3 py-1 text-xs font-bold shadow-[0_0_8px_rgba(0,243,255,0.4)]',
  link: 'text-[#ff0099] hover:text-[#d600ff] hover:underline font-bold drop-shadow-[0_0_5px_rgba(255,0,153,0.8)]'
}

export const NeonTheme: React.FC<{ portfolio: any }> = ({ portfolio }) => (
  <BasePortfolioLayout portfolio={portfolio} styles={neonStyles} />
)
