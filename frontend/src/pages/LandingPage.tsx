import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  FileText,
  Globe,
  Bot,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Award,
  Compass,
  Briefcase,
  BarChart3,
  Users,
  Code2,
  Cpu,
  Database,
  Layers,
  Star,
  Github,
  MessageSquare,
  Check,
  Terminal,
  Activity,
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { AIAssistantOrb } from '../components/common/AIAssistantOrb'
import { ROUTES } from '../constants/routes'

// Feature Items Data
const FEATURES = [
  {
    icon: FileText,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/20',
    title: 'AI Resume Studio',
    description: 'Build high-converting ATS resumes with modular sections, real-time font tweaking, and instant side-by-side live PDF preview.',
  },
  {
    icon: Globe,
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/20',
    title: '1-Click Portfolio Studio',
    description: 'Transform career data into interactive developer portfolio websites with custom domain mapping, 10+ themes, and visitor analytics.',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    title: 'ATS Optimization Engine',
    description: 'Instant keyword match analysis against target job descriptions. Get actionable bullet point rewrite suggestions to pass recruiter filters.',
  },
  {
    icon: Sparkles,
    color: 'text-accent-pink',
    bgColor: 'bg-accent-pink/10',
    borderColor: 'border-accent-pink/20',
    title: 'AI Career Workstation',
    description: 'All-in-one suite with cover letter writers, personal brand bio generators, LinkedIn content studio, and executive summaries.',
  },
  {
    icon: Users,
    color: 'text-accent-violet',
    bgColor: 'bg-accent-violet/10',
    borderColor: 'border-accent-violet/20',
    title: 'Recruiter Candidate Hub',
    description: 'Verified recruiter search platform with candidate privacy controls, candidate profile discovery, and direct message outreach.',
  },
  {
    icon: Award,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    title: 'AI Interview Simulator',
    description: 'Simulate HR, Technical, and STAR behavioral interview questions with real-time feedback, strength breakdown, and sample answers.',
  },
  {
    icon: Briefcase,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    title: 'Job Tracker CRM',
    description: 'Kanban job application tracking pipeline with status updates, interview schedules, salary notes, and contact logs.',
  },
  {
    icon: BarChart3,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/20',
    title: 'Career Analytics',
    description: 'Track your ATS match score progression across target companies, visitor hits on published portfolios, and application response rates.',
  },
]

// Workflow Pipeline Steps
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Build Parent Resume',
    description: 'Import LinkedIn profile or structured data into our modular AI builder.',
    icon: FileText,
    color: 'text-primary-400',
  },
  {
    step: '02',
    title: 'Run ATS Audit',
    description: 'Match your resume against target job postings to hit 90%+ compatibility.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
  },
  {
    step: '03',
    title: 'Publish Portfolio Site',
    description: 'Deploy a live developer portfolio with 1-click custom domain publishing.',
    icon: Globe,
    color: 'text-accent-cyan',
  },
  {
    step: '04',
    title: 'Track Applications',
    description: 'Manage interview pipelines and follow-ups in your personal job CRM.',
    icon: Briefcase,
    color: 'text-accent-pink',
  },
]

// Tech Stack Items
const TECH_STACK = [
  { name: 'React 19', category: 'Frontend UI', icon: Code2 },
  { name: 'FastAPI', category: 'Backend Engine', icon: Cpu },
  { name: 'MongoDB', category: 'Database', icon: Database },
  { name: 'Python 3.12', category: 'Async Services', icon: Terminal },
  { name: 'TypeScript', category: 'Type Safety', icon: Layers },
  { name: 'Framer Motion', category: 'Animations', icon: Sparkles },
  { name: 'Groq / OpenAI', category: 'AI Provider', icon: Bot },
  { name: 'Tailwind CSS', category: 'Design System', icon: Zap },
]

// Testimonials Data
const TESTIMONIALS = [
  {
    quote: 'RS VIBE CareerOS helped me tailor my resume for a Senior Staff Engineer role. The ATS audit boosted my match score from 68% to 94% instantly!',
    role: 'Senior Full Stack Engineer',
    company: 'FinTech Enterprise',
    stars: 5,
  },
  {
    quote: 'Publishing my portfolio site took 2 minutes. Recruiters loved the interactive live preview and custom domain mapping.',
    role: 'Lead Frontend Developer',
    company: 'Series B Tech Startup',
    stars: 5,
  },
  {
    quote: 'The Candidate Hub made finding verified tech talent effortless. Being able to inspect ATS score breakdowns saves hours per week.',
    role: 'Technical Talent Recruiter',
    company: 'Global Talent Network',
    stars: 5,
  },
]

// Prompts for AI Assistant Showcase
const AI_PROMPTS = [
  'Run ATS Audit against target Job Description',
  'Rewrite bullet point using STAR method',
  'Generate 1-click live Portfolio Website',
  'Simulate System Design Interview Questions',
]

export const LandingPage: React.FC = () => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0)

  return (
    <div className="flex flex-col gap-24 py-6 overflow-x-hidden selection:bg-primary-500 selection:text-white">
      {/* ═══ 1. HERO SECTION (SPLIT LAYOUT) ═══ */}
      <section className="relative pt-6 pb-12">
        {/* Background Ambient Glow Effects */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-30 right-10 w-80 h-80 bg-accent-violet/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column: Heading & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-100/90 border border-white/10 shadow-glow-primary text-xs font-medium text-gray-300 w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>RS VIBE CareerOS 2.0 • AI Career Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Build Resumes & Portfolios <br />
              <span className="gradient-text">Powered by AI Precision.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
              The all-in-one career operating system with real-time ATS scoring, automated portfolio publishing, mock interview coaching, and recruiter discovery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={ROUTES.REGISTER}>
                <Button variant="glow" size="lg" className="shadow-glow-primary">
                  <span>Start Building Free</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="secondary" size="lg" className="border-white/15">
                  <Sparkles className="w-4 h-4 mr-2 text-primary-400" />
                  Explore Career Hub
                </Button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-gray-400 border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free tier available
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant PDF & Web export
              </span>
            </div>
          </motion.div>

          {/* Right Column: Interactive AI Command Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="w-full glass-card p-6 sm:p-8 rounded-3xl border border-white/15 relative shadow-2xl flex flex-col gap-6">
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <AIAssistantOrb size="sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Command Center</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active & Monitoring
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-primary-500/15 text-primary-300 text-[10px] font-mono font-bold border border-primary-500/20">
                  ATS Match Engine
                </span>
              </div>

              {/* Simulated Live ATS Score Card */}
              <div className="p-4 rounded-2xl bg-surface-100/90 border border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-300">Target Role: Senior Full Stack Engineer</span>
                  <span className="text-xs font-extrabold text-emerald-400">96% High Match</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-surface-200 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '96%' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary-500 via-accent-violet to-emerald-400 rounded-full shadow-glow-primary"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                  <span>Keywords Matched: 18/19</span>
                  <span>ATS Format Check: Passed</span>
                </div>
              </div>

              {/* Floating Feature Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-50 border border-white/10 flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-primary-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">Parent Resume</span>
                    <span className="text-[10px] text-gray-400">v2.4 Updated</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-50 border border-white/10 flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-accent-cyan shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">Live Portfolio</span>
                    <span className="text-[10px] text-emerald-400">Published</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. ANIMATED STATS SECTION ═══ */}
      <section className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col gap-1 items-center text-center"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight gradient-text">50K+</span>
            <span className="text-xs text-gray-400 font-medium">Resumes & Portfolios Built</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col gap-1 items-center text-center"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">98%</span>
            <span className="text-xs text-gray-400 font-medium">ATS Screen Success Rate</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col gap-1 items-center text-center"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-accent-pink tracking-tight">120+</span>
            <span className="text-xs text-gray-400 font-medium">Countries & Tech Hubs</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col gap-1 items-center text-center"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-primary-400 tracking-tight">24/7</span>
            <span className="text-xs text-gray-400 font-medium">AI Career Intelligence</span>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. CORE FEATURES GRID (8 GLASS CARDS) ═══ */}
      <section className="max-w-7xl mx-auto w-full flex flex-col gap-12">
        <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">
            Unified Platform Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered For Modern Career Growth
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            A comprehensive suite of intelligent career tools designed to turn your experience into job offers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card interactive className="p-6 flex flex-col gap-4 h-full border border-white/10">
                  <div className={`w-12 h-12 rounded-2xl ${feature.bgColor} ${feature.borderColor} border flex items-center justify-center ${feature.color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-bold text-white">{feature.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ═══ 4. INTERACTIVE CONNECTED WORKFLOW PIPELINE ═══ */}
      <section className="max-w-7xl mx-auto w-full glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 flex flex-col gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
            Seamless Candidate Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How RS VIBE CareerOS Works
          </h2>
          <p className="text-sm text-gray-400">
            From raw resume data to live published portfolio and recruiter matches in 4 automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-100/70 border border-white/10 relative">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-white/20">{step.step}</span>
                  <div className="p-2 rounded-xl bg-surface-50 border border-white/10 text-primary-400">
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ 5. AI ASSISTANT SPOTLIGHT ═══ */}
      <section className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-card p-8 sm:p-12 rounded-3xl border border-white/10">
          {/* Left Visual Orb */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center gap-4">
            <AIAssistantOrb size="lg" />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Intelligent Career Assistant</h3>
              <p className="text-xs text-gray-400">Context-aware AI trained for engineering & product hiring</p>
            </div>
          </div>

          {/* Right Prompt Chips */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-pink">
                AI Capability Spotlight
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Conversational AI Assistant At Your Service
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Click any suggestion prompt below to explore how RS VIBE CareerOS enhances your professional assets in real time.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {AI_PROMPTS.map((prompt, idx) => (
                <motion.div
                  key={prompt}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedPromptIndex(idx)}
                  className={`p-4 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    selectedPromptIndex === idx
                      ? 'bg-primary-500/15 border-primary-500/40 text-white shadow-glow-sm'
                      : 'bg-surface-50/80 border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    {prompt}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. TECHNOLOGY STACK GRID ═══ */}
      <section className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">
            Engineered For Scale
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Powered By Modern Tech Architecture</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TECH_STACK.map((tech) => {
            const Icon = tech.icon
            return (
              <div key={tech.name} className="p-4 rounded-2xl bg-surface-100/50 border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-surface-50 text-primary-400 border border-white/10">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{tech.name}</span>
                  <span className="text-[10px] text-gray-500 truncate">{tech.category}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Candidate Success
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Trusted By Tech Professionals Worldwide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="p-6 border border-white/10 glass-card flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">"{t.quote}"</p>
              </div>

              <div className="flex flex-col border-t border-white/10 pt-3">
                <span className="text-xs font-bold text-white">{t.role}</span>
                <span className="text-[10px] text-gray-500">{t.company}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ 8. FOOTER ═══ */}
      <footer className="border-t border-white/10 pt-16 pb-8 bg-[#07080c]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="RS VIBE CareerOS" className="w-8 h-8 rounded-lg object-cover border border-primary-500/30" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">RS VIBE <span className="gradient-text">AI</span></span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest -mt-0.5">CareerOS</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              The next-generation AI career operating system powering high-converting resumes, developer portfolios, ATS match optimization, and recruiter discovery.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Platform</span>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <Link to={ROUTES.RESUMES} className="hover:text-white transition-colors">Resume Studio</Link>
              <Link to={ROUTES.PORTFOLIOS} className="hover:text-white transition-colors">Portfolio Studio</Link>
              <Link to={ROUTES.AI_HUB} className="hover:text-white transition-colors">AI Career Hub</Link>
              <Link to={ROUTES.JOBS} className="hover:text-white transition-colors">Job Tracker CRM</Link>
            </div>
          </div>

          {/* Col 3: Resources */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Resources</span>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <a href="/docs" className="hover:text-white transition-colors">API Documentation</a>
              <Link to={ROUTES.BRAND_STUDIO} className="hover:text-white transition-colors">Brand Studio</Link>
              <Link to={ROUTES.CONTENT_STUDIO} className="hover:text-white transition-colors">Content Studio</Link>
              <Link to={ROUTES.CAREER_ANALYTICS} className="hover:text-white transition-colors">Career Analytics</Link>
            </div>
          </div>

          {/* Col 4: Account & Social */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Account</span>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">Sign In</Link>
              <Link to={ROUTES.REGISTER} className="hover:text-white transition-colors">Create Free Account</Link>
              <Link to={ROUTES.SETTINGS} className="hover:text-white transition-colors">Settings & Subscription</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} RS VIBE CareerOS. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
