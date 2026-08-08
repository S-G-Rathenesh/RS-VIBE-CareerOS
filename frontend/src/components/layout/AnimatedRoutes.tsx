import React, { Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MainLayout } from './MainLayout'
import { ProtectedRoute } from '../common/ProtectedRoute'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ROUTES } from '../../constants/routes'

// Lazy loaded pages are passed in as props or imported here.
// For simplicity, we just import them directly here.
import { LandingPage } from '../../pages/LandingPage'
import { LoginPage } from '../../pages/auth/LoginPage'
import { RegisterPage } from '../../pages/auth/RegisterPage'
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage'
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage'
import { NotFoundPage } from '../../pages/NotFoundPage'

// Lazy pages
const DashboardPage = React.lazy(() => import('../../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ResumesPage = React.lazy(() => import('../../pages/resumes/ResumesPage').then(m => ({ default: m.ResumesPage })))
const ResumeBuilderPage = React.lazy(() => import('../../pages/resumes/ResumeBuilderPage').then(m => ({ default: m.ResumeBuilderPage })))
const PortfoliosPage = React.lazy(() => import('../../pages/portfolios/PortfoliosPage').then(m => ({ default: m.PortfoliosPage })))
const PortfolioBuilderPage = React.lazy(() => import('../../pages/portfolios/PortfolioBuilderPage').then(m => ({ default: m.PortfolioBuilderPage })))
const AIHubPage = React.lazy(() => import('../../pages/ai/AIHubPage').then(m => ({ default: m.AIHubPage })))
const BrandStudioPage = React.lazy(() => import('../../pages/ai/BrandStudioPage').then(m => ({ default: m.BrandStudioPage })))
const ContentStudioPage = React.lazy(() => import('../../pages/ai/ContentStudioPage').then(m => ({ default: m.ContentStudioPage })))
const JobTrackerPage = React.lazy(() => import('../../pages/jobs/JobTrackerPage').then(m => ({ default: m.JobTrackerPage })))
const JobWorkspacePage = React.lazy(() => import('../../pages/jobs/JobWorkspacePage').then(m => ({ default: m.JobWorkspacePage })))
const CareerAnalyticsPage = React.lazy(() => import('../../pages/jobs/CareerAnalyticsPage').then(m => ({ default: m.CareerAnalyticsPage })))
const AdminPanelPage = React.lazy(() => import('../../pages/admin/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })))
const ProfileSettingsPage = React.lazy(() => import('../../pages/profile/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsPage })))
const RecruiterDashboardPage = React.lazy(() => import('../../pages/recruiter/RecruiterDashboardPage').then(m => ({ default: m.RecruiterDashboardPage })))
const CompanySettingsPage = React.lazy(() => import('../../pages/recruiter/CompanySettingsPage').then(m => ({ default: m.CompanySettingsPage })))
const JobManagerPage = React.lazy(() => import('../../pages/recruiter/JobManagerPage').then(m => ({ default: m.JobManagerPage })))
const HiringKanbanPage = React.lazy(() => import('../../pages/recruiter/HiringKanbanPage').then(m => ({ default: m.HiringKanbanPage })))
const CandidateSearchPage = React.lazy(() => import('../../pages/recruiter/CandidateSearchPage').then(m => ({ default: m.CandidateSearchPage })))
const CandidateWorkspacePage = React.lazy(() => import('../../pages/recruiter/CandidateWorkspacePage').then(m => ({ default: m.CandidateWorkspacePage })))

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
)

export const AnimatedRoutes: React.FC = () => {
  const location = useLocation()

  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Auth Routes */}
            <Route path={ROUTES.HOME} element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path={ROUTES.LOGIN} element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path={ROUTES.REGISTER} element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<PageTransition><VerifyEmailPage /></PageTransition>} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path={ROUTES.RESET_PASSWORD} element={<PageTransition><ResetPasswordPage /></PageTransition>} />

            {/* Protected Workspace Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.DASHBOARD} element={<PageTransition><DashboardPage /></PageTransition>} />
              <Route path={ROUTES.RESUMES} element={<PageTransition><ResumesPage /></PageTransition>} />
              <Route path="/resumes/builder/:id" element={<PageTransition><ResumeBuilderPage /></PageTransition>} />
              <Route path={ROUTES.JOBS} element={<PageTransition><JobTrackerPage /></PageTransition>} />
              <Route path="/jobs/:id" element={<PageTransition><JobWorkspacePage /></PageTransition>} />
              <Route path={ROUTES.CAREER_ANALYTICS} element={<PageTransition><CareerAnalyticsPage /></PageTransition>} />
              <Route path={ROUTES.PORTFOLIOS} element={<PageTransition><PortfoliosPage /></PageTransition>} />
              <Route path="/portfolios/builder/:id" element={<PageTransition><PortfolioBuilderPage /></PageTransition>} />
              <Route path={ROUTES.AI_HUB} element={<PageTransition><AIHubPage /></PageTransition>} />
              <Route path={ROUTES.BRAND_STUDIO} element={<PageTransition><BrandStudioPage /></PageTransition>} />
              <Route path={ROUTES.CONTENT_STUDIO} element={<PageTransition><ContentStudioPage /></PageTransition>} />
              <Route path={ROUTES.SETTINGS} element={<PageTransition><ProfileSettingsPage /></PageTransition>} />
              <Route path={ROUTES.ADMIN} element={<PageTransition><AdminPanelPage /></PageTransition>} />

              {/* Recruiter Routes */}
              <Route path={ROUTES.RECRUITER_DASHBOARD} element={<PageTransition><RecruiterDashboardPage /></PageTransition>} />
              <Route path={ROUTES.RECRUITER_COMPANY} element={<PageTransition><CompanySettingsPage /></PageTransition>} />
              <Route path={ROUTES.RECRUITER_JOBS} element={<PageTransition><JobManagerPage /></PageTransition>} />
              <Route path="/recruiter/jobs/:jobId/pipeline" element={<PageTransition><HiringKanbanPage /></PageTransition>} />
              <Route path={ROUTES.RECRUITER_SEARCH} element={<PageTransition><CandidateSearchPage /></PageTransition>} />
              <Route path="/recruiter/workspace/:candidateId" element={<PageTransition><CandidateWorkspacePage /></PageTransition>} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </MainLayout>
  )
}
