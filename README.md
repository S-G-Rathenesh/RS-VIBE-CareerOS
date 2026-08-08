# ExploreMe AI 🚀
**The Ultimate AI-Powered Career Operating System**

ExploreMe AI is an enterprise-grade SaaS platform designed to revolutionize the hiring ecosystem for both candidates and recruiters. It bridges the gap between job seekers and employers by providing a unified, AI-driven platform for building resumes, creating portfolios, managing job applications, and sourcing talent.

---

## 🌟 Key Features

### For Candidates
*   **AI Resume Builder**: Create ATS-optimized resumes with an interactive drag-and-drop builder.
*   **Smart Portfolio Generator**: Generate stunning, SEO-ready personal websites powered by a custom CMS.
*   **Job Tracker (CRM)**: Manage your entire application pipeline, interviews, and follow-ups in a centralized workspace.
*   **AI Interview Coach**: Practice and prepare with intelligent, context-aware interview simulations.
*   **ATS Match Analyzer**: Evaluate your resume against real Job Descriptions and receive actionable feedback.

### For Recruiters
*   **Recruiter Dashboard**: Manage active job postings, monitor applicants, and track your pipeline.
*   **Candidate Discovery**: Leverage a robust search engine with real-time filters and AI match scores.
*   **Hiring Kanban**: Visually track applicants across different stages (Applied → Screening → Interview → Offer).
*   **Recruiter AI Assistant**: Automatically evaluate candidate strengths/weaknesses and generate tailored interview questions.

---

## 🏗️ Architecture & Tech Stack

### Frontend
*   **React 18** (Vite)
*   **Zustand** (State Management)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **React Router v6** (Navigation & Lazy Loading)

### Backend
*   **FastAPI** (Python 3.10+)
*   **MongoDB & Motor** (Async NoSQL Database)
*   **Groq API** (Llama 3 LLM for AI Features)
*   **Cloudinary** (Media & Asset Storage)
*   **Pytest** (API Testing)

### Infrastructure & CI/CD
*   **Vercel** (Frontend Hosting)
*   **Render** (Backend Hosting)
*   **GitHub Actions** (CI/CD Pipelines)
*   **Playwright** (End-to-End Testing)

---

## 📚 Documentation
Detailed guides are available in the `/docs` directory:
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB URI
- Groq API Key
- Cloudinary Credentials

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env # Fill in your environment variables
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env # Fill in your environment variables
npm run dev
```

---

## 🛡️ Security & Enterprise Readiness
*   **Role-Based Access Control (RBAC)**: Secure routing for Admins, Candidates, and Recruiters.
*   **Rate Limiting**: Integrated `slowapi` to prevent abuse.
*   **Structured Logging**: `structlog` implemented for robust observability.
*   **Automated Testing**: Comprehensive Pytest and Playwright suites.

---

## 📄 License
This project is licensed under the MIT License.
