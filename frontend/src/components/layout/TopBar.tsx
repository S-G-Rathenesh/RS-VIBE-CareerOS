import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, LogOut, Menu } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { NotificationsPopover } from '../common/NotificationsPopover'

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.RESUMES]: 'Resume Studio',
  [ROUTES.PORTFOLIOS]: 'Portfolio Studio',
  [ROUTES.JOBS]: 'Job Tracker',
  [ROUTES.AI_HUB]: 'AI Hub',
  [ROUTES.BRAND_STUDIO]: 'Brand Studio',
  [ROUTES.CONTENT_STUDIO]: 'Content Studio',
  [ROUTES.CAREER_ANALYTICS]: 'Career Analytics',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.ADMIN]: 'Admin Panel',
  [ROUTES.RECRUITER_DASHBOARD]: 'Recruiter Dashboard',
  [ROUTES.RECRUITER_COMPANY]: 'Company Settings',
  [ROUTES.RECRUITER_JOBS]: 'Job Manager',
  [ROUTES.RECRUITER_SEARCH]: 'Candidate Search',
}

export const TopBar: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { setSidebarOpen } = useUIStore()

  const currentTitle = PAGE_TITLES[location.pathname] || 'Workspace'

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-6 border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-xl">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-white tracking-tight">{currentTitle}</h1>
        </div>
      </div>

      {/* Center: Search trigger */}
      <button
        onClick={() => {
          const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
          window.dispatchEvent(event)
        }}
        className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-50/50 border border-white/[0.06] text-xs text-gray-400 hover:border-primary-500/30 hover:text-gray-300 transition-all w-64 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          Search...
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-surface-200/80 border border-white/[0.06] text-[10px] font-mono font-medium text-gray-500">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <NotificationsPopover />
        <Link
          to={ROUTES.SETTINGS}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-surface-100 border border-white/10 overflow-hidden flex items-center justify-center text-primary-400 font-bold text-xs shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-white hidden lg:inline max-w-[100px] truncate">
            {user?.fullName || 'User'}
          </span>
        </Link>
        <button
          onClick={() => logout()}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
