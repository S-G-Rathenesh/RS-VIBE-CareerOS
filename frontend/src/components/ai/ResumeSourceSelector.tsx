import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  FileText,
  UploadCloud,
  ChevronDown,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Sparkles,
  AlertCircle,
  FileCode2,
  ChevronUp,
  RefreshCw,
  FolderOpen
} from 'lucide-react'
import api from '../../services/api'
import { useUIStore } from '../../store/useUIStore'
import { buildResumeAtsText } from '../../utils/resumeTextBuilder'

export interface ResumeSourceData {
  sourceType: 'existing' | 'upload' | 'paste'
  resumeId?: string
  resumeText: string
  resumeTitle?: string
  targetRole?: string
  rawResumeObject?: any
}

interface ResumeSourceSelectorProps {
  onSourceChange: (data: ResumeSourceData) => void
  disabled?: boolean
}

export const ResumeSourceSelector: React.FC<ResumeSourceSelectorProps> = ({
  onSourceChange,
  disabled = false,
}) => {
  const { addToast } = useUIStore()

  // Tab & Selection State
  const [sourceMode, setSourceMode] = useState<'existing' | 'upload'>('existing')
  const [showAdvancedPaste, setShowAdvancedPaste] = useState(false)
  const [userResumes, setUserResumes] = useState<any[]>([])
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [selectedResumeData, setSelectedResumeData] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Upload State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    size: number
    text: string
    parsedData?: any
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual Paste State
  const [manualText, setManualText] = useState('')

  // Load existing resumes on mount
  useEffect(() => {
    fetchUserResumes()
  }, [])

  const fetchUserResumes = async () => {
    setLoadingResumes(true)
    try {
      const res: any = await api.get('/resumes')
      if (res.success && Array.isArray(res.data)) {
        setUserResumes(res.data)
        if (res.data.length > 0) {
          // Sort by updated_at or created_at descending (latest first)
          const sorted = [...res.data].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
            return dateB - dateA
          })
          const latest = sorted[0]
          setSelectedResumeId(latest.id)
          loadFullResume(latest.id)
        } else {
          setSourceMode('upload')
        }
      }
    } catch (err: any) {
      console.error('Failed to load user resumes:', err)
      setSourceMode('upload')
    } finally {
      setLoadingResumes(false)
    }
  }

  const loadFullResume = async (resumeId: string) => {
    try {
      const res: any = await api.get(`/resumes/${resumeId}`)
      if (res.success && res.data) {
        const fullData = res.data
        setSelectedResumeData(fullData)
        const atsText = buildResumeAtsText(fullData)

        onSourceChange({
          sourceType: 'existing',
          resumeId: fullData.id,
          resumeText: atsText,
          resumeTitle: fullData.title || 'Untitled Resume',
          targetRole: fullData.target_role || fullData.personal_info?.target_role,
          rawResumeObject: fullData,
        })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: 'Could not load complete resume details.' })
    }
  }

  const handleSelectResume = (resObj: any) => {
    setSelectedResumeId(resObj.id)
    setDropdownOpen(false)
    loadFullResume(resObj.id)
  }

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    const fn = file.name.toLowerCase()
    if (!fn.endsWith('.pdf') && !fn.endsWith('.docx') && !fn.endsWith('.doc')) {
      addToast({ type: 'error', message: 'Please upload a .PDF or .DOCX document.' })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res: any = await api.post('/ai/parse-resume-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.success && res.data) {
        const parsed = res.data
        const atsText = parsed.ats_text || buildResumeAtsText(parsed.resume_data)
        setUploadedFile({
          name: file.name,
          size: file.size,
          text: atsText,
          parsedData: parsed.resume_data,
        })

        onSourceChange({
          sourceType: 'upload',
          resumeText: atsText,
          resumeTitle: parsed.resume_data?.title || file.name,
          targetRole: parsed.resume_data?.target_role,
          rawResumeObject: parsed.resume_data,
        })

        addToast({ type: 'success', message: `Resume parsed: ${file.name}` })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to parse uploaded resume.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleManualTextChange = (text: string) => {
    setManualText(text)
    if (showAdvancedPaste && text.trim().length > 0) {
      onSourceChange({
        sourceType: 'paste',
        resumeText: text,
        resumeTitle: 'Manual Pasted Resume',
      })
    }
  }

  const filteredResumes = useMemo(() => {
    if (!searchQuery.trim()) return userResumes
    const q = searchQuery.toLowerCase()
    return userResumes.filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.target_role && r.target_role.toLowerCase().includes(q)) ||
        (r.personal_info?.full_name && r.personal_info.full_name.toLowerCase().includes(q))
    )
  }, [userResumes, searchQuery])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary-400" />
          Candidate Resume Source
        </label>
        <span className="text-[11px] text-gray-400">Smart Resume Input</span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => {
            setSourceMode('existing')
            if (selectedResumeData) {
              onSourceChange({
                sourceType: 'existing',
                resumeId: selectedResumeData.id,
                resumeText: buildResumeAtsText(selectedResumeData),
                resumeTitle: selectedResumeData.title,
                targetRole: selectedResumeData.target_role,
                rawResumeObject: selectedResumeData,
              })
            }
          }}
          disabled={disabled || userResumes.length === 0}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            sourceMode === 'existing'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-gray-400 hover:text-white disabled:opacity-40'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Saved Resumes {userResumes.length > 0 ? `(${userResumes.length})` : ''}
        </button>

        <button
          type="button"
          onClick={() => {
            setSourceMode('upload')
            if (uploadedFile) {
              onSourceChange({
                sourceType: 'upload',
                resumeText: uploadedFile.text,
                resumeTitle: uploadedFile.name,
                rawResumeObject: uploadedFile.parsedData,
              })
            }
          }}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            sourceMode === 'upload'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* Mode 1: Existing Saved Resume */}
      {sourceMode === 'existing' && (
        <div className="flex flex-col gap-2">
          {loadingResumes ? (
            <div className="p-5 bg-surface-50 rounded-2xl border border-white/10 flex items-center justify-center gap-2 text-xs text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-400" />
              Loading your resumes...
            </div>
          ) : userResumes.length === 0 ? (
            <div className="p-6 bg-surface-50 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2">
              <AlertCircle className="w-8 h-8 text-yellow-400 stroke-[1.5]" />
              <p className="text-xs font-semibold text-white">No saved resumes found</p>
              <p className="text-[11px] text-gray-400 max-w-xs">
                Upload your resume document or paste raw text to run AI optimization.
              </p>
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className="mt-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-500 transition-colors"
              >
                Upload Resume PDF
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Selected Resume Card with Dropdown Trigger */}
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-4 bg-surface-50 hover:bg-surface-100 transition-all rounded-2xl border border-white/10 cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {selectedResumeData?.title || 'Selected Resume'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                      <span className="truncate">
                        {selectedResumeData?.target_role || selectedResumeData?.personal_info?.target_role || 'General Role'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedResumeData?.updated_at
                          ? new Date(selectedResumeData.updated_at).toLocaleDateString()
                          : 'Recent'}
                      </span>
                      <span>•</span>
                      <span className="text-primary-300 font-mono text-[10px] uppercase">
                        {selectedResumeData?.template_id || 'modern'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-primary-400 font-medium group-hover:underline hidden sm:inline">
                    Change Resume
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface-50 rounded-2xl border border-white/10 shadow-2xl p-2 flex flex-col gap-2 max-h-72 overflow-y-auto">
                  <div className="relative p-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resumes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    {filteredResumes.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResume(res)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          res.id === selectedResumeId
                            ? 'bg-primary-600/20 border border-primary-500/30 text-white'
                            : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{res.title}</span>
                          <span className="text-[10px] text-gray-400">
                            {res.target_role || 'General'} • {res.template_id || 'linear'}
                          </span>
                        </div>
                        {res.id === selectedResumeId && (
                          <CheckCircle2 className="w-4 h-4 text-primary-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Upload Resume PDF / DOCX */}
      {sourceMode === 'upload' && (
        <div className="flex flex-col gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
            }}
            accept=".pdf,.docx,.doc"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0])
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 ${
              isDragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/10 bg-surface-50 hover:bg-surface-100'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
              <UploadCloud className="w-5 h-5" />
            </div>

            {isUploading ? (
              <div className="flex items-center gap-2 text-xs text-primary-400 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Parsing resume document with AI engine...
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {uploadedFile.name}
                </div>
                <span className="text-[11px] text-gray-400">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • Extracted {uploadedFile.text.length} chars • Click to replace
                </span>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-white">
                  Drop your resume PDF / DOCX here, or <span className="text-primary-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Extracts text and structures content instantly without permanent save
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Advanced Mode 3: Collapsible Manual Paste */}
      <div className="flex flex-col gap-2 mt-1">
        <button
          type="button"
          onClick={() => setShowAdvancedPaste(!showAdvancedPaste)}
          className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1.5 w-fit transition-colors"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Advanced: {showAdvancedPaste ? 'Hide' : 'Paste'} Raw Resume Text</span>
          {showAdvancedPaste ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvancedPaste && (
          <div className="flex flex-col gap-1.5 p-3 bg-surface-50 rounded-xl border border-white/10">
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => handleManualTextChange(e.target.value)}
              placeholder="Paste raw work experience, skills, and education text here..."
              className="w-full bg-surface-100 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            <span className="text-[10px] text-gray-500 text-right">
              {manualText.length} characters
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
