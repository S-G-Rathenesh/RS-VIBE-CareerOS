import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Globe,
  Sparkles,
  Briefcase,
  Settings,
  ShieldAlert,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  X,
  Palette,
  PenTool,
} from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { cn } from '../../utils/cn'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
  badge?: string
  highlight?: boolean
  role?: string
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
      { label: 'Resume Studio', icon: FileText, path: ROUTES.RESUMES },
      { label: 'Portfolio Studio', icon: Globe, path: ROUTES.PORTFOLIOS },
      { label: 'Job Tracker', icon: Briefcase, path: ROUTES.JOBS, badge: 'CRM' },
    ],
  },
  {
    title: 'AI & Career',
    items: [
      { label: 'AI Hub', icon: Sparkles, path: ROUTES.AI_HUB, highlight: true },
      { label: 'Brand Studio', icon: Palette, path: ROUTES.BRAND_STUDIO },
      { label: 'Content Studio', icon: PenTool, path: ROUTES.CONTENT_STUDIO },
      { label: 'Analytics', icon: BarChart3, path: ROUTES.CAREER_ANALYTICS },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
      { label: 'Admin Panel', icon: ShieldAlert, path: ROUTES.ADMIN, role: 'admin' },
    ],
  },
]

export const AppSidebar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  // Keyboard shortcut: [ to toggle collapse
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const active = document.activeElement
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return
        toggleSidebarCollapsed()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggleSidebarCollapsed])

  // Auto-collapse on smaller screens
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        useUIStore.getState().setSidebarCollapsed(true)
      }
    }
    handler(mql)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const sidebarWidth = sidebarCollapsed ? 72 : 256

  const renderNavItem = (item: NavItem) => {
    if (item.role && user?.role !== item.role) return null
    const Icon = item.icon
    const active = isActive(item.path)

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 768) setSidebarOpen(false)
        }}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
          active
            ? 'bg-primary-500/12 text-white sidebar-glow'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
          item.highlight && !active && 'text-accent-pink',
          sidebarCollapsed && 'justify-center px-0'
        )}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-500"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <Icon className={cn(
          'w-[18px] h-[18px] shrink-0',
          active ? 'text-primary-400' : item.highlight ? 'text-accent-pink' : 'text-gray-500 group-hover:text-gray-300'
        )} />
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
        {!sidebarCollapsed && item.badge && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-primary-500/15 text-primary-300 font-semibold border border-primary-500/20">
            {item.badge}
          </span>
        )}
        {sidebarCollapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-200 border border-white/10 text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[999] shadow-xl">
            {item.label}
          </div>
        )}
      </Link>
    )
  }

  // Desktop sidebar
  const sidebarContent = (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex h-screen sticky top-0 flex-col border-r border-white/[0.06] bg-[#0c0d14]/80 backdrop-blur-xl z-30 overflow-hidden"
    >
      {/* Header / Brand Logo + Collapse Control */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/[0.06] shrink-0 transition-all px-4',
        sidebarCollapsed ? 'justify-center gap-1' : 'justify-between gap-3'
      )}>
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.png"
            alt="RS VIBE CareerOS"
            className="w-8 h-8 rounded-lg object-cover border border-primary-500/20 group-hover:border-primary-500/40 transition-colors shrink-0"
          />
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold text-white tracking-tight truncate">
                RS VIBE <span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase -mt-0.5">
                CareerOS
              </span>
            </motion.div>
          )}
        </Link>

        {/* Floating Glass Collapse Control Button */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebarCollapsed}
            className="w-8 h-8 rounded-full bg-surface-100/90 border border-white/10 hover:border-primary-500/40 text-gray-400 hover:text-white flex items-center justify-center shadow-md hover:shadow-glow-sm transition-colors cursor-pointer"
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <PanelLeftClose className="w-4 h-4 text-primary-400" />
            </motion.div>
          </motion.button>
          
          {/* Tooltip */}
          <div className={cn(
            'absolute top-full mt-2 rounded-lg bg-surface-200 border border-white/10 text-[11px] font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[999] shadow-xl flex items-center gap-1.5 px-2.5 py-1',
            sidebarCollapsed ? 'left-full ml-2 top-0 mt-0' : 'right-0'
          )}>
            <span>{sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
            <kbd className="px-1 py-0.5 rounded bg-surface-300 border border-white/10 text-[9px] font-mono text-gray-400 font-bold">[</kbd>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"
              >
                {section.title}
              </motion.h3>
            )}
            {sidebarCollapsed && (
              <div className="h-px bg-white/[0.04] mx-2 mb-2" />
            )}
            <div className="space-y-0.5">
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-white/[0.06] mt-auto">
        <Link
          to={ROUTES.SETTINGS}
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-all group',
            sidebarCollapsed && 'justify-center p-1'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-surface-100 border border-white/10 overflow-hidden flex items-center justify-center text-primary-400 font-bold text-xs shrink-0 shadow-sm">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                {user?.email || 'Settings & Profile'}
              </span>
            </div>
          )}
        </Link>
      </div>
    </motion.aside>
  )

  // Mobile drawer
  const mobileDrawer = (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed left-0 top-0 h-full w-[280px] bg-[#0c0d14] border-r border-white/[0.06] z-50 flex flex-col overflow-y-auto"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06] shrink-0">
              <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                <img src="/logo.png" alt="RS VIBE CareerOS" className="w-8 h-8 rounded-lg object-cover border border-primary-500/20" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">RS VIBE <span className="gradient-text">AI</span></span>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase -mt-0.5">CareerOS</span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 py-4 px-3 space-y-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map(renderNavItem)}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {sidebarContent}
      {mobileDrawer}
    </>
  )
}
