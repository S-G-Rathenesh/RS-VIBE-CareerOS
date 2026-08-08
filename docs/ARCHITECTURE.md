# ExploreMe AI Architecture

ExploreMe AI is designed as a modern, decoupled Monolith/Micro-services hybrid.

## High-Level Architecture

### Frontend (React 18 / Vite)
- **State Management**: Zustand for global UI, Auth, and Theme states.
- **Routing**: React Router v6 with `React.lazy` and Suspense for code splitting.
- **Styling**: Tailwind CSS combined with Framer Motion for highly optimized, beautiful UIs.
- **Data Fetching**: Axios instances configured with interceptors to automatically append JWTs and handle refresh logic.

### Backend (FastAPI / Python 3.10)
- **Framework**: FastAPI provides extremely high performance, async capabilities, and automatic OpenAPI generation.
- **Database Layer**: Motor (Async PyMongo). All models are strongly typed using Pydantic schemas.
- **AI Engine Layer**: The `ai_service.py` connects to the Groq API (Llama 3) to execute heavy NLP tasks like ATS matching, resume summarization, and interview coaching.
- **Security**: 
  - JWT Authentication
  - SlowAPI Rate Limiting
  - Helmet-like Security Headers Middleware
- **Observability**: `structlog` for structured JSON logs that can be ingested by Datadog or ELK.

## Database Schema Highlights
- **users**: Stores authentication and role metadata (`candidate`, `recruiter`, `admin`).
- **resumes**: Parent-child relationship structure (Base Resumes -> Targeted Versions).
- **portfolios**: Multi-tenant CMS data storing theme, layout, and SEO overrides.
- **companies & job_posts**: Core tables for the Recruiter side of the marketplace.
- **hiring_pipeline**: A pivot table connecting candidates to jobs with specific kanban status flags.

## AI Integrations
All AI calls flow through a unified `Groq` service. Prompts are constructed using context variables passed from the user's database records (e.g., merging Resume JSON with Job Description text).
