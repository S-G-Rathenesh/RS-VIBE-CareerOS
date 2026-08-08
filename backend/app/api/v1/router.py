from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, auth, users, dashboard, ai, resumes, portfolios, public, admin,
    subscription, payments, domains, organizations, universities, recruiters,
    notifications, activity, apikeys, audit, feature_flags,
    assistant, interviews, career, jobs, search,
    brand, portfolio_cms, portfolio_seo, portfolio_analytics_v2, content_studio, brand_assistant,
    recruiter_hub
)

api_router = APIRouter()

# Core endpoints
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(search.router, prefix="/search", tags=["Global Search"])

# SaaS & Billing
api_router.include_router(subscription.router, prefix="/subscription", tags=["Subscriptions"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments & Invoices"])

# AI Engine
api_router.include_router(ai.router, prefix="/ai", tags=["AI Engine"])

# AI Career Ecosystem
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Career Assistant"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["AI Interview Coach"])
api_router.include_router(career.router, prefix="/career", tags=["AI Career Intelligence"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Tracker"])
api_router.include_router(brand.router, prefix="/brand", tags=["Brand Studio"])
api_router.include_router(content_studio.router, prefix="/content-studio", tags=["Content Studio"])
api_router.include_router(brand_assistant.router, prefix="/brand-assistant", tags=["Brand Assistant"])

# Workstations
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["Portfolios"])
api_router.include_router(portfolio_cms.router, prefix="/portfolio-cms", tags=["Portfolio CMS"])
api_router.include_router(portfolio_seo.router, prefix="/portfolio-seo", tags=["Portfolio SEO"])
# Public Portfolio Engine
api_router.include_router(public.router, prefix="/public", tags=["Public Portfolio Engine"])

# Hiring Ecosystem (Phase 8)
api_router.include_router(recruiter_hub.router, prefix="/recruiter-hub", tags=["Recruiter Hub"])

# Enterprise Features
api_router.include_router(domains.router, prefix="/domains", tags=["Custom Domains"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Team Workspaces"])
api_router.include_router(universities.router, prefix="/universities", tags=["University Portal"])
api_router.include_router(recruiters.router, prefix="/recruiters", tags=["Recruiter Dashboard"])
api_router.include_router(apikeys.router, prefix="/api-keys", tags=["Developer API Keys"])

# Platform Services
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity Timeline"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(feature_flags.router, prefix="/feature-flags", tags=["Feature Flags"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Panel"])
