import React, { useState, useEffect } from 'react'
import { Sparkles, Linkedin, Twitter, FileText, Send, Clock, Plus, Loader2, Save, Edit3 } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { AIAssistantOrb } from '../../components/common/AIAssistantOrb'

export const ContentStudioPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [posts, setPosts] = useState<any[]>([])
  
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [tone, setTone] = useState('professional')
  const [generatedContent, setGeneratedContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res: any = await api.get('/content-studio')
      if (res && res.success) {
        setPosts(Array.isArray(res.data) ? res.data : [])
      } else if (Array.isArray(res)) {
        setPosts(res)
      } else {
        setPosts([])
      }
    } catch (e: any) {
      if (e?.status === 404 || e?.code === 'NOT_FOUND') {
        setPosts([])
      } else {
        addToast({ type: 'error', message: e?.message || 'Failed to load posts.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return addToast({ type: 'warning', message: 'Enter a topic first.' })
    
    setGenerating(true)
    try {
      const res: any = await api.post('/content-studio/generate', { topic, platform, tone })
      if (res.success && res.data) {
        setGeneratedContent(res.data)
        addToast({ type: 'success', message: 'Content generated!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Generation failed.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSavePost = async () => {
    if (!generatedContent.trim()) return
    setSaving(true)
    try {
      const payload = {
        topic,
        platform,
        tone,
        content: generatedContent
      }
      const res: any = await api.post('/content-studio', payload)
      if (res.success && res.data) {
        addToast({ type: 'success', message: 'Post saved to drafts!' })
        setPosts([res.data, ...posts])
        setGeneratedContent('')
        setTopic('')
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-5">
          <AIAssistantOrb size="sm" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Send className="text-primary-500 w-6 h-6" /> Content Studio
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Generate multi-platform content to build your personal brand.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="p-6 border-white/10 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" /> Create Post
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Platform</label>
                <div className="flex gap-2">
                  <button onClick={() => setPlatform('linkedin')} className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-2 border transition-colors ${platform === 'linkedin' ? 'bg-[#0a66c2]/20 border-[#0a66c2] text-[#0a66c2]' : 'bg-surface-50 border-white/5 text-gray-400 hover:text-white'}`}>
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </button>
                  <button onClick={() => setPlatform('twitter')} className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-2 border transition-colors ${platform === 'twitter' ? 'bg-[#1da1f2]/20 border-[#1da1f2] text-[#1da1f2]' : 'bg-surface-50 border-white/5 text-gray-400 hover:text-white'}`}>
                    <Twitter className="w-4 h-4" /> Twitter/X
                  </button>
                  <button onClick={() => setPlatform('blog')} className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-2 border transition-colors ${platform === 'blog' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-surface-50 border-white/5 text-gray-400 hover:text-white'}`}>
                    <FileText className="w-4 h-4" /> Blog
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tone</label>
                <select 
                  className="w-full bg-surface-50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="thought_leader">Thought Leader / Visionary</option>
                  <option value="casual">Casual / Conversational</option>
                  <option value="enthusiastic">Enthusiastic / Celebratory</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Topic / Prompt</label>
                <textarea
                  className="w-full h-32 bg-surface-50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="e.g. I just shipped a new feature using React 19 and Framer Motion. It improved performance by 30%..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <Button variant="glow" className="w-full" onClick={handleGenerate} isLoading={generating}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Content
              </Button>
            </div>
          </Card>
        </div>

        {/* Content Workspace */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AnimatePresence>
            {generatedContent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="p-6 border-primary-500/30 bg-primary-900/10 shadow-glow-primary">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Generated Draft
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setGeneratedContent('')}>Discard</Button>
                      <Button variant="primary" size="sm" onClick={handleSavePost} isLoading={saving}>
                        <Save className="w-3 h-3 mr-1" /> Save to Library
                      </Button>
                    </div>
                  </div>
                  <textarea
                    className="w-full min-h-[200px] bg-black/20 border border-white/5 rounded-lg p-4 text-sm text-gray-200 focus:outline-none focus:border-primary-500"
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Content Library
            </h2>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500"/></div>
            ) : posts.length === 0 ? (
              <Card className="p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <FileText className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-white">No content yet</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">Generate some posts using the AI on the left to start building your content library.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {posts.map((post, idx) => (
                  <Card key={post.id || idx} className="p-5 border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.type === 'linkedin' ? <Linkedin className="w-4 h-4 text-[#0a66c2]" /> : 
                         post.type === 'twitter' ? <Twitter className="w-4 h-4 text-[#1da1f2]" /> : 
                         <FileText className="w-4 h-4 text-primary-400" />}
                        <span className="text-xs font-bold text-gray-300 uppercase">{post.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-gray-400">{post.status}</span>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
