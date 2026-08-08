import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, FileText, Globe, LayoutDashboard, Settings, LogOut, User, Command, Search, Briefcase } from 'lucide-react'
import { Button } from '../common/Button'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { NotificationsPopover } from '../common/NotificationsPopover'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const navLinks = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Resumes', path: ROUTES.RESUMES, icon: FileText },
    { label: 'Job Tracker', path: ROUTES.JOBS, icon: Briefcase },
    { label: 'Portfolios', path: ROUTES.PORTFOLIOS, icon: Globe },
    { label: 'AI Hub', path: ROUTES.AI_HUB, icon: Sparkles },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="RS VIBE CareerOS Logo"
            className="w-9 h-9 object-cover rounded-xl shadow-glow-primary group-hover:scale-105 transition-transform border border-primary-500/30 shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              RS VIBE CareerOS <span className="gradient-text font-black">AI</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase -mt-1">
              Career Platform
            </span>
          </div>
        </Link>

        {/* Global Search / Cmd+K Trigger */}
        {isAuthenticated && (
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              window.dispatchEvent(event)
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-50 border border-white/10 text-xs text-gray-400 hover:border-primary-500/50 hover:text-white transition-all w-64 justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary-400" /> Search or command...
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 text-[10px] font-mono font-semibold text-gray-300">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30 shadow-glow-primary'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${active ? 'text-primary-400' : 'text-gray-400'}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Auth / Profile Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <Link to={ROUTES.SETTINGS} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-surface-100 border border-white/15 overflow-hidden flex items-center justify-center text-primary-400 font-bold text-xs">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0) || 'U'
                  )}
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white hidden lg:inline">
                  {user?.fullName || 'User'}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="glow" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
