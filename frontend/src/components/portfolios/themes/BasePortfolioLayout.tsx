import React, { useState, useEffect } from 'react'
import { motion, Variants } from 'framer-motion'
import { ExternalLink, Github, Mail, Linkedin, Twitter, Globe, MapPin, Calendar, Check, Copy, ArrowUp, Briefcase, Award, Languages, Compass, Download, Phone, Bookmark, Sparkles, User } from 'lucide-react'

export interface ThemeStyles {
  container: string
  hero: string
  heroTitle: string
  heroTagline: string
  card: string
  cardTitle: string
  cardText: string
  button: string
  pill: string
  link: string
}

interface BasePortfolioLayoutProps {
  portfolio: any
  styles: ThemeStyles
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15 } }
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20 } }
}

// Canonical Avatar Resolver with strict fallback order
export const getCanonicalAvatar = (portfolio: any) => {
  if (!portfolio) return ''
  return (
    portfolio.hero?.profile_image ||
    portfolio.about?.profile_image ||
    portfolio.about?.avatar_url ||
    portfolio.avatar_url ||
    portfolio.user?.avatar_url ||
    portfolio.user?.avatarUrl ||
    ''
  )
}

export const BasePortfolioLayout: React.FC<BasePortfolioLayoutProps> = ({ portfolio, styles }) => {
  const [copiedEmail, setCopiedEmail] = useState(false)

  if (!portfolio) return null

  const tConfig = portfolio.theme_config || {}
  const fontClass = tConfig.font_family === 'serif' ? 'font-serif' : tConfig.font_family === 'mono' ? 'font-mono' : 'font-sans'
  const radiusClass = tConfig.border_radius === 'none' ? 'rounded-none' : tConfig.border_radius === 'sm' ? 'rounded-sm' : tConfig.border_radius === 'lg' ? 'rounded-2xl' : tConfig.border_radius === 'full' ? 'rounded-[3rem]' : 'rounded-lg'
  const layout = portfolio.hero?.alignment || tConfig.layout_variant || 'center'

  // Canonical Avatar
  const canonicalAvatar = getCanonicalAvatar(portfolio)

  // Hero Fields
  const heroName = portfolio.hero?.name || portfolio.title || portfolio.about?.full_name || portfolio.user?.full_name || 'Portfolio'
  const heroTitle = portfolio.hero?.title || portfolio.about?.professional_title || portfolio.hero_tagline || portfolio.tagline || ''
  const heroShortTagline = portfolio.hero?.short_tagline || portfolio.hero_tagline || portfolio.tagline || ''
  const heroBg = portfolio.hero?.background_url || ''
  
  const primaryCtaLabel = portfolio.hero?.primary_cta?.label || portfolio.cta_text || 'Get In Touch'
  const primaryCtaLink = portfolio.hero?.primary_cta?.link || portfolio.cta_link || '#contact'
  
  const secondaryCtaLabel = portfolio.hero?.secondary_cta?.label || 'View Projects'
  const secondaryCtaLink = portfolio.hero?.secondary_cta?.link || '#projects'

  const showResumeDownload = portfolio.hero?.show_resume_download ?? true
  const showSocialIcons = portfolio.hero?.show_social_icons ?? true

  // About Me Fields
  const aboutHeading = portfolio.about?.section_title || portfolio.about?.title || 'About Me'
  const aboutBiography = portfolio.about?.biography || portfolio.about?.bio || portfolio.bio || ''
  const aboutPersonalStory = portfolio.about?.personal_story || portfolio.personal_story || ''
  const aboutCareerObjective = portfolio.about?.career_objective || portfolio.career_objective || ''
  const aboutLocation = portfolio.about?.location || portfolio.location || portfolio.contact?.location || ''
  const aboutAvailability = portfolio.about?.availability || portfolio.availability || ''
  const aboutYearsExp = portfolio.about?.years_experience || portfolio.years_experience || ''
  const aboutLanguages = portfolio.about?.languages || portfolio.languages || ''
  const aboutInterests = portfolio.about?.interests || portfolio.interests || ''
  const aboutProfileImage = portfolio.about?.profile_image || portfolio.about?.avatar_url || canonicalAvatar

  const hasAboutMeContent = Boolean(
    aboutBiography || aboutPersonalStory || aboutCareerObjective || aboutLocation || aboutAvailability || aboutYearsExp || aboutLanguages || aboutInterests || aboutProfileImage
  )

  // Contact Fields
  const contactEmail = portfolio.contact?.email || portfolio.social_links?.email || portfolio.email || portfolio.user?.email || ''
  const contactPhone = portfolio.contact?.phone || portfolio.phone || ''
  const contactLocation = portfolio.contact?.location || portfolio.location || aboutLocation || ''
  const contactWebsite = portfolio.social_links?.website || portfolio.website || ''
  const contactLinkedin = portfolio.social_links?.linkedin || ''
  const contactGithub = portfolio.social_links?.github || ''
  const contactTwitter = portfolio.social_links?.twitter || ''
  const resumeUrl = portfolio.contact?.resume_url || portfolio.resume_url || ''

  // Smooth Scroll and Action Handler
  const handleCtaClick = (e: React.MouseEvent, link: string, fallbackTargetId: string) => {
    e.preventDefault()
    const targetLink = link || fallbackTargetId

    if (targetLink.startsWith('#')) {
      const targetId = targetLink.replace('#', '')
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    if (targetLink.startsWith('mailto:') || targetLink.startsWith('tel:')) {
      window.location.href = targetLink
      return
    }

    if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
      window.open(targetLink, '_blank', 'noopener,noreferrer')
      return
    }

    const element = document.getElementById(targetLink)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.open(targetLink, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyEmail = () => {
    if (contactEmail) {
      navigator.clipboard.writeText(contactEmail)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Diagnostic Log
  useEffect(() => {
    console.log('[Portfolio Renderer Sync Audit]', {
      CanonicalAvatar: !!canonicalAvatar,
      Hero: { name: heroName, title: heroTitle, tagline: heroShortTagline, bg: !!heroBg },
      About: { heading: aboutHeading, bio: !!aboutBiography, story: !!aboutPersonalStory, obj: !!aboutCareerObjective },
      Contact: { email: contactEmail, phone: contactPhone, location: contactLocation, website: contactWebsite, linkedin: !!contactLinkedin, github: !!contactGithub }
    })
  }, [portfolio])

  return (
    <div className={`min-h-screen ${styles.container} ${fontClass} transition-colors duration-500 relative`}>
      <style>{`
        :root { --portfolio-accent: ${tConfig.accent_color || '#6366f1'}; }
      `}</style>
      
      {/* 1. HERO SECTION (#hero) */}
      <motion.header 
        id="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        className={`w-full py-24 px-6 md:px-12 ${styles.hero} ${layout === 'split' ? 'min-h-[80vh] flex items-center justify-center' : 'flex flex-col items-center justify-center'}`}
      >
        <div className={`max-w-6xl mx-auto w-full flex ${layout === 'split' ? 'flex-col md:flex-row items-center justify-between gap-12' : 'flex-col items-center text-center'}`}>
          {layout === 'split' && canonicalAvatar && (
             <motion.div initial={{ scale: 0.8, opacity: 0, x: -50 }} animate={{ scale: 1, opacity: 1, x: 0 }} transition={{ type: 'spring', bounce: 0.5 }} className="w-full md:w-1/2 flex justify-center">
               <img src={canonicalAvatar} alt={heroName} className={`w-64 h-64 md:w-80 md:h-80 object-cover shadow-2xl border-4 border-white/10 ${radiusClass}`} />
             </motion.div>
          )}

          <div className={`w-full ${layout === 'split' ? 'md:w-1/2 text-left' : 'flex flex-col items-center'}`}>
            {layout !== 'split' && canonicalAvatar && (
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                src={canonicalAvatar} 
                alt={heroName} 
                className={`w-32 h-32 object-cover shadow-xl border-4 border-white/10 mb-8 ${tConfig.border_radius === 'full' ? 'rounded-full' : radiusClass}`}
              />
            )}
            
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${styles.heroTitle} ${layout === 'center' ? 'text-center text-5xl md:text-6xl' : ''}`}
              style={{ color: tConfig.accent_color }}
            >
              {heroName}
            </motion.h1>

            {heroTitle && (
              <motion.h2
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xl md:text-2xl font-bold opacity-90 mt-2 mb-3"
              >
                {heroTitle}
              </motion.h2>
            )}

            {heroShortTagline && (
              <motion.p 
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`${styles.heroTagline} max-w-2xl text-base md:text-lg opacity-85 ${layout === 'split' ? 'text-left' : 'text-center'}`}
              >
                {heroShortTagline}
              </motion.p>
            )}

            {/* Hero Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`flex flex-wrap gap-4 mt-8 ${layout === 'split' ? 'justify-start' : 'justify-center'}`}
            >
              {primaryCtaLabel && (
                <button 
                  onClick={(e) => handleCtaClick(e, primaryCtaLink, '#contact')}
                  className={`${styles.button} ${radiusClass} font-bold px-6 py-3 shadow-lg flex items-center gap-2 cursor-pointer`}
                >
                  <Mail className="w-4 h-4 inline" /> {primaryCtaLabel}
                </button>
              )}
              {secondaryCtaLabel && (
                <button 
                  onClick={(e) => handleCtaClick(e, secondaryCtaLink, '#projects')}
                  className={`bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 ${radiusClass} border border-white/20 transition-all flex items-center gap-2 cursor-pointer`}
                >
                  <Briefcase className="w-4 h-4 inline" /> {secondaryCtaLabel}
                </button>
              )}
              {showResumeDownload && resumeUrl && (
                <a 
                  href={resumeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className={`bg-primary-600/30 hover:bg-primary-600/50 text-white font-medium px-5 py-3 ${radiusClass} border border-primary-500/40 transition-all flex items-center gap-2`}
                >
                  <Download className="w-4 h-4" /> Download Resume
                </a>
              )}
            </motion.div>

            {/* Social Icons */}
            {showSocialIcons && (contactGithub || contactLinkedin || contactTwitter || contactWebsite) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`flex flex-wrap gap-3 mt-6 ${layout === 'split' ? 'justify-start' : 'justify-center'}`}
              >
                {contactGithub && (
                  <a href={contactGithub} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {contactLinkedin && (
                  <a href={contactLinkedin} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10" title="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {contactTwitter && (
                  <a href={contactTwitter} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10" title="Twitter/X">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {contactWebsite && (
                  <a href={contactWebsite} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10" title="Website">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-32">
        
        {/* 2. ABOUT ME SECTION (#about) */}
        {hasAboutMeContent ? (
          <motion.section 
            id="about"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full"
          >
            <h2 className="text-4xl font-bold mb-12 opacity-90 text-center relative">
              <span className="relative z-10">{aboutHeading}</span>
              <div className="absolute w-24 h-2 bottom-0 left-1/2 -translate-x-1/2 opacity-30 -z-10" style={{ backgroundColor: tConfig.accent_color }}></div>
            </h2>

            {/* Main Premium Glass Container Card */}
            <motion.div 
              variants={childVariants}
              className="p-8 md:p-10 rounded-3xl bg-surface-50/70 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 relative overflow-hidden"
            >
              {/* Ambient Background Glow */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: tConfig.accent_color || '#6366f1' }} />
              
              <div className={`grid grid-cols-1 ${aboutProfileImage ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-8 items-start relative z-10`}>
                {aboutProfileImage && (
                  <motion.div variants={childVariants} className="lg:col-span-4 flex justify-center lg:justify-start">
                    <div className="relative group w-full max-w-[280px]">
                      <img 
                        src={aboutProfileImage} 
                        alt={aboutHeading} 
                        className={`w-full h-64 md:h-72 object-cover shadow-2xl border-4 border-white/15 ${radiusClass} transform group-hover:scale-[1.02] transition-transform duration-300`} 
                      />
                    </div>
                  </motion.div>
                )}

                <div className={`${aboutProfileImage ? 'lg:col-span-8' : 'col-span-1'} flex flex-col gap-8`}>
                  {/* Biography Block */}
                  {aboutBiography && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-primary-400">
                        <User className="w-4 h-4 text-primary-400" />
                        <span>Biography</span>
                      </div>
                      <p className="text-lg md:text-xl leading-relaxed text-gray-100 font-normal opacity-95 whitespace-pre-line">
                        {aboutBiography}
                      </p>
                    </div>
                  )}

                  {/* Personal Story Block */}
                  {aboutPersonalStory && (
                    <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Personal Story & Journey</span>
                      </div>
                      <p className="text-base md:text-lg leading-relaxed text-gray-200 opacity-90 whitespace-pre-line">
                        {aboutPersonalStory}
                      </p>
                    </div>
                  )}

                  {/* Career Objective Block */}
                  {aboutCareerObjective && (
                    <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>Career Objective</span>
                      </div>
                      <p className="text-base md:text-lg leading-relaxed text-gray-200 opacity-90">
                        {aboutCareerObjective}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Responsive Information Cards Below Glass Card */}
            <motion.div variants={childVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
              {aboutLocation && (
                <div className="bg-surface-50/50 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1">
                  <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Location</span>
                    <span className="text-xs md:text-sm font-bold text-white truncate">{aboutLocation}</span>
                  </div>
                </div>
              )}

              {aboutAvailability && (
                <div className="bg-surface-50/50 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Status</span>
                    <span className="text-xs md:text-sm font-bold text-white truncate">{aboutAvailability}</span>
                  </div>
                </div>
              )}

              {aboutYearsExp && (
                <div className="bg-surface-50/50 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Experience</span>
                    <span className="text-xs md:text-sm font-bold text-white truncate">{aboutYearsExp}</span>
                  </div>
                </div>
              )}

              {aboutLanguages && (
                <div className="bg-surface-50/50 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Languages</span>
                    <span className="text-xs md:text-sm font-bold text-white truncate">{aboutLanguages}</span>
                  </div>
                </div>
              )}

              {aboutInterests && (
                <div className="bg-surface-50/50 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1">
                  <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Interests</span>
                    <span className="text-xs md:text-sm font-bold text-white truncate">{aboutInterests}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.section>
        ) : (
          <section id="about" className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-gray-400 text-sm">
            No biography or About Me details added yet.
          </section>
        )}

        {/* 3. EXPERIENCE TIMELINE (#experience) */}
        {portfolio.experience?.length > 0 && (
          <motion.section 
            id="experience"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl font-bold mb-12 opacity-90 text-center relative">
              <span className="relative z-10">Experience</span>
              <div className="absolute w-24 h-2 bottom-0 left-1/2 -translate-x-1/2 opacity-30 -z-10" style={{ backgroundColor: tConfig.accent_color }}></div>
            </h2>
            <div className="relative border-l-2 border-white/10 ml-4 md:ml-1/2 flex flex-col gap-12">
              {portfolio.experience.map((exp: any, i: number) => (
                <motion.div variants={childVariants} key={i} className="relative pl-8 md:pl-0 w-full">
                  <div className="absolute w-4 h-4 rounded-full -left-[9px] md:left-1/2 md:-translate-x-[9px] top-1 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: tConfig.accent_color }}></div>
                  <div className={`md:w-1/2 flex flex-col ${i % 2 === 0 ? 'md:pr-12 md:text-right md:ml-0' : 'md:pl-12 md:ml-auto md:text-left'} `}>
                    <div className={`${styles.card} ${radiusClass} hover:-translate-y-1 transition-transform relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-full h-1 opacity-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: tConfig.accent_color }}></div>
                      
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`${styles.cardTitle} text-xl`}>{exp.position || exp.role}</h3>
                        {exp.is_current && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                            Current Role
                          </span>
                        )}
                      </div>
                      
                      <p className={`font-semibold opacity-80 ${styles.cardText} text-lg`}>{exp.company}</p>
                      
                      <div className={`flex items-center gap-4 opacity-60 mt-2 mb-4 text-xs font-mono ${i % 2 === 0 ? 'md:justify-end' : 'justify-start'}`}>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {exp.duration || exp.dates}</span>
                        {exp.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {exp.location}</span>}
                      </div>

                      {exp.description && (
                        <p className={`opacity-85 ${styles.cardText} mb-3 text-sm leading-relaxed`}>{exp.description}</p>
                      )}

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className={`list-disc list-inside space-y-1 opacity-80 text-sm ${styles.cardText} ${i % 2 === 0 ? 'md:list-none' : ''}`}>
                          {exp.bullets.map((bullet: string, j: number) => (
                            <li key={j}>{bullet}</li>
                          ))}
                        </ul>
                      )}

                      {(exp.tech_stack || exp.technologies) && (exp.tech_stack || exp.technologies).length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 mt-4 ${i % 2 === 0 ? 'md:justify-end' : 'justify-start'}`}>
                          {(exp.tech_stack || exp.technologies).map((tech: string, j: number) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 4. PROJECTS GALLERY (#projects) */}
        {portfolio.projects?.length > 0 && (
          <motion.section 
            id="projects"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl font-bold mb-12 opacity-90 text-center relative">
              <span className="relative z-10">Projects</span>
              <div className="absolute w-24 h-2 bottom-0 left-1/2 -translate-x-1/2 opacity-30 -z-10" style={{ backgroundColor: tConfig.accent_color }}></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolio.projects.map((proj: any, i: number) => (
                <motion.div variants={childVariants} whileHover={{ y: -8, scale: 1.02 }} key={i} className={`${styles.card} ${radiusClass} flex flex-col h-full overflow-hidden group border-transparent hover:border-current transition-all duration-300`} style={{ borderColor: tConfig.accent_color }}>
                  {(proj.image_url || proj.image) && (
                    <div className="w-full h-56 -mt-6 -mx-6 mb-6 overflow-hidden relative">
                      <img src={proj.image_url || proj.image} alt={proj.title || proj.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {(proj.is_featured || proj.featured) && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Featured Project
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`${styles.cardTitle} text-2xl`}>{proj.title || proj.name}</h3>
                    {proj.category && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono uppercase font-bold border border-white/10 shrink-0">
                        {proj.category}
                      </span>
                    )}
                  </div>

                  <p className={`opacity-80 mb-6 flex-1 ${styles.cardText} text-base leading-relaxed`}>{proj.description}</p>
                  
                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {proj.tech_stack.map((tech: string, j: number) => (
                        <span key={j} className={`${styles.pill} ${radiusClass}`}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-auto pt-4 border-t border-white/10">
                    {(proj.github_link || proj.github) && (
                      <a href={proj.github_link || proj.github} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 ${radiusClass} transition-colors ${styles.link}`}>
                        <Github className="w-5 h-5" /> <span className="font-medium">Code</span>
                      </a>
                    )}
                    {(proj.live_link || proj.link) && (
                      <a href={proj.live_link || proj.link} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 ${radiusClass} transition-colors ${styles.link}`}>
                        <ExternalLink className="w-5 h-5" /> <span className="font-medium">Live Demo</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 5. SKILLS VISUALIZATION (#skills) */}
        {portfolio.skills?.length > 0 && (
          <motion.section 
            id="skills"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl font-bold mb-12 opacity-90 text-center relative">
              <span className="relative z-10">Skills & Tech Stack</span>
              <div className="absolute w-24 h-2 bottom-0 left-1/2 -translate-x-1/2 opacity-30 -z-10" style={{ backgroundColor: tConfig.accent_color }}></div>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {portfolio.skills.map((skill: any, i: number) => {
                const skillName = typeof skill === 'string' ? skill : skill.name || skill.title || ''
                const skillCategory = typeof skill === 'object' ? skill.category : null
                const skillLevel = typeof skill === 'object' ? skill.level : null

                if (!skillName) return null

                return (
                  <motion.div 
                    variants={childVariants} 
                    whileHover={{ scale: 1.08, y: -4 }} 
                    key={i} 
                    className={`px-5 py-3 font-semibold text-sm ${styles.pill} ${radiusClass} shadow-lg cursor-default border-2 hover:border-current transition-all flex items-center gap-2`} 
                    style={{ borderColor: tConfig.accent_color }}
                  >
                    <span>{skillName}</span>
                    {skillLevel && <span className="text-[10px] font-mono opacity-70">({skillLevel})</span>}
                    {skillCategory && <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 font-mono uppercase">{skillCategory}</span>}
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* 6. EDUCATION & CERTIFICATES (#education / #certificates) */}
        {(portfolio.education?.length > 0 || portfolio.certificates?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {portfolio.education?.length > 0 && (
              <motion.section 
                id="education"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl font-bold mb-8 opacity-90 relative">Education</h2>
                <div className="flex flex-col gap-6">
                  {portfolio.education.map((edu: any, i: number) => (
                    <motion.div variants={childVariants} key={i} className={`${styles.card} ${radiusClass}`}>
                      <h3 className={styles.cardTitle}>{edu.degree}</h3>
                      <p className={`opacity-80 font-medium ${styles.cardText}`}>{edu.institution}</p>
                      {edu.field_of_study && <p className="text-xs text-primary-400 mt-1 font-medium">{edu.field_of_study}</p>}
                      
                      <div className="flex items-center gap-4 text-xs opacity-60 mt-2 font-mono">
                        {edu.duration && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {edu.duration}</span>}
                        {edu.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {edu.location}</span>}
                        {edu.gpa && <span className="text-emerald-400 font-bold">GPA: {edu.gpa}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
            
            {portfolio.certificates?.length > 0 && (
              <motion.section 
                id="certificates"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl font-bold mb-8 opacity-90">Certificates</h2>
                <div className="flex flex-col gap-6">
                  {portfolio.certificates.map((cert: any, i: number) => (
                    <motion.div variants={childVariants} key={i} className={`${styles.card} ${radiusClass} group flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={styles.cardTitle}>{cert.name}</h3>
                          {(cert.url || cert.link) && (
                            <a href={cert.url || cert.link} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-white p-1" title="View Certificate">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className={`opacity-80 font-medium ${styles.cardText}`}>{cert.issuer}</p>
                        {cert.date && <p className="text-xs font-mono opacity-60 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {cert.date}</p>}
                        {cert.credential_id && <p className="text-[10px] font-mono opacity-50 mt-1">ID: {cert.credential_id}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}

        {/* 7. CONTACT SECTION (#contact) - Fully Synchronized */}
        <motion.section 
          id="contact"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto w-full text-center mb-20 p-8 rounded-3xl bg-surface-50/40 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          {canonicalAvatar && (
            <motion.div variants={childVariants} className="flex justify-center mb-6">
              <img 
                src={canonicalAvatar} 
                alt={heroName} 
                className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-4 border-white/20 shadow-xl"
              />
            </motion.div>
          )}

          <motion.h2 variants={childVariants} className="text-4xl md:text-5xl font-black mb-2 opacity-95">
            Let's Connect
          </motion.h2>
          
          <motion.p variants={childVariants} className="text-lg font-semibold text-primary-400 mb-6">
            {heroName} {heroTitle ? `• ${heroTitle}` : ''}
          </motion.p>

          <motion.p variants={childVariants} className="opacity-70 mb-8 max-w-xl mx-auto text-base">
            Interested in working together, discussing new opportunities, or learning more about my projects?
          </motion.p>
          
          {/* Contact Details Grid */}
          <motion.div variants={childVariants} className="flex flex-wrap justify-center gap-4 mb-8 text-sm font-medium">
            {contactEmail && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="font-mono text-xs">{contactEmail}</span>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs">{contactPhone}</span>
              </div>
            )}
            {contactLocation && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs">{contactLocation}</span>
              </div>
            )}
            {contactWebsite && (
              <a href={contactWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono">Website</span>
              </a>
            )}
          </motion.div>

          {/* Contact Actions Row */}
          <motion.div variants={childVariants} className="flex flex-wrap items-center justify-center gap-4">
            {contactEmail && (
              <button 
                onClick={handleCopyEmail}
                className={`flex items-center gap-2 px-6 py-3 ${styles.button} ${radiusClass} font-bold text-sm justify-center cursor-pointer shadow-lg`}
              >
                {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedEmail ? 'Email Copied!' : 'Copy Email'}
              </button>
            )}

            {contactEmail && (
              <a 
                href={`mailto:${contactEmail}`}
                className={`flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 ${radiusClass} border border-white/20 text-sm font-semibold transition-all`}
              >
                <Mail className="w-4 h-4" /> Send Email
              </a>
            )}

            {contactLinkedin && (
              <a href={contactLinkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/15 ${radiusClass} border border-white/10 text-sm font-medium transition-all`}>
                <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn
              </a>
            )}

            {contactGithub && (
              <a href={contactGithub} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/15 ${radiusClass} border border-white/10 text-sm font-medium transition-all`}>
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}

            {contactTwitter && (
              <a href={contactTwitter} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/15 ${radiusClass} border border-white/10 text-sm font-medium transition-all`}>
                <Twitter className="w-4 h-4 text-sky-400" /> Twitter/X
              </a>
            )}

            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" download className={`flex items-center gap-2 px-6 py-3 bg-primary-600/30 hover:bg-primary-600/50 ${radiusClass} border border-primary-500/40 text-sm font-semibold transition-all`}>
                <Download className="w-4 h-4 text-primary-400" /> Resume PDF
              </a>
            )}
          </motion.div>
        </motion.section>
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white shadow-xl z-50 transition-colors cursor-pointer"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>

      {/* Footer */}
      <footer className={`w-full py-12 text-center opacity-70 border-t border-white/5 ${styles.hero}`}>
        <p className="text-sm font-medium">© {new Date().getFullYear()} {heroName}. All rights reserved.</p>
        <p className="text-xs mt-2 opacity-40 font-mono tracking-wider uppercase">Powered by RS VIBE CareerOS</p>
      </footer>
    </div>
  )
}
