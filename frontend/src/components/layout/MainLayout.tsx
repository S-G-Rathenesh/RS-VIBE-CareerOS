import React from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { motion, AnimatePresence } from 'framer-motion'

// Routes that should NOT show the sidebar layout
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/privacy-policy', '/terms-of-service']

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useUIStore()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) || location.pathname.startsWith('/p/')
  const showSidebarLayout = isAuthenticated && !isPublicRoute

  return (
    <>
      {/* Toast Notification Container — always visible */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer p-4 rounded-xl text-sm font-medium border shadow-2xl backdrop-blur-xl flex items-center justify-between transition-colors ${
                toast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-red-950/80 border-red-500/30 text-red-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
                  : 'bg-surface-100/90 border-white/10 text-white'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span>{toast.message}</span>
                {toast.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.action!.onClick()
                      removeToast(toast.id)
                    }}
                    className="text-xs font-bold underline opacity-80 hover:opacity-100 text-left"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <span className="text-xs opacity-60 ml-4 shrink-0">✕</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showSidebarLayout ? (
        /* ═══ Authenticated Sidebar Layout ═══ */
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary-500 selection:text-white">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main id="main-content" className="flex-1 px-6 lg:px-8 py-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      ) : (
        /* ═══ Public / Unauthenticated Layout ═══ */
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-500 selection:text-white overflow-x-hidden">
          <Navbar />
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            {children}
          </main>
          {location.pathname !== '/' && (
            <footer className="border-t border-white/[0.06] glass-panel py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="RS VIBE CareerOS Logo" className="w-5 h-5 object-cover rounded-md border border-white/10" />
                  <span className="font-semibold text-white font-sans">RS VIBE CareerOS</span>
                  <span>© {new Date().getFullYear()} All rights reserved.</span>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="mailto:ratheneshsg@gmail.com" className="hover:text-white transition-colors">Contact</a>
                  <a href="https://github.com/S-G-Rathenesh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </>
  )
}
