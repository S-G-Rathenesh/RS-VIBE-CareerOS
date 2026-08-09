import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatedRoutes } from './components/layout/AnimatedRoutes'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { AccessibilityProvider } from './components/common/AccessibilityProvider'
import { SkipToContent } from './components/common/SkipToContent'
import { CommandPalette } from './components/common/CommandPalette'
import { useAuthStore } from './store/useAuthStore'
import { useDevToolsDeterrence } from './hooks/useDevToolsDeterrence'

// Lazy Loaded Workstation Pages (Public ones)
const PublicPortfolioPage = lazy(() => import('./pages/portfolios/PublicPortfolioPage').then(m => ({ default: m.PublicPortfolioPage })))

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

export const App: React.FC = () => {
  const { fetchCurrentUser } = useAuthStore()
  
  // Enable production devtools deterrence
  useDevToolsDeterrence()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  return (
    <AccessibilityProvider>
      <SkipToContent />
      <BrowserRouter>
        <CommandPalette />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Standalone Portfolio Route */}
            <Route path="/p/:slug" element={<PublicPortfolioPage />} />

            {/* Main App Layout with Transitions */}
            <Route path="*" element={<AnimatedRoutes />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AccessibilityProvider>
  )
}

export default App
