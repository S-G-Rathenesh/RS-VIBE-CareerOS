import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  Sparkles, 
  Briefcase,
  Settings, 
  ShieldAlert, 
  Layers, 
  UserCheck, 
  BarChart3 
} from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../utils/cn'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { sidebarOpen } = useUIStore()

  const isActive = (path: string) => location.pathname.startsWith(path)

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'My Resumes', icon: FileText, path: ROUTES.RESUMES },
    { label: 'Job Tracker', icon: Briefcase, path: ROUTES.JOBS, badge: 'CRM' },
    { label: 'My Portfolios', icon: Globe, path: ROUTES.PORTFOLIOS },
    { label: 'AI Suite', icon: Sparkles, path: ROUTES.AI_HUB, highlight: true },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
    { label: 'Admin Panel', icon: ShieldAlert, path: ROUTES.ADMIN, role: 'admin' },
  ]

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/10 glass-panel flex flex-col justify-between p-4 transition-all duration-300">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Career Workspace
          </h3>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary-600/90 text-white shadow-glow-primary'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                    item.highlight && !active && 'text-accent-pink hover:text-accent-pink'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', item.highlight && 'text-accent-pink')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Quick Career Suite
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2 p-2 bg-surface-50/50 rounded-xl border border-white/5">
            <Link to={ROUTES.JOBS} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <span className="text-[10px] text-gray-400 block">Kanban CRM</span>
              <span className="text-xs font-bold text-primary-400">Tracker</span>
            </Link>
            <Link to={ROUTES.CAREER_ANALYTICS} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <span className="text-[10px] text-gray-400 block">AI Insights</span>
              <span className="text-xs font-bold text-emerald-400">Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-3 bg-surface-50/80 rounded-xl border border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-300 font-bold text-xs">
          AI
        </div>
        <div className="flex flex-col truncate">
          <span className="text-xs font-medium text-white truncate">Career Operating System</span>
          <span className="text-[10px] text-emerald-400 font-semibold truncate">Active Cloud CRM</span>
        </div>
      </div>
    </aside>
  )
}
