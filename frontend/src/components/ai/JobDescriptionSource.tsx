import React, { useState, useRef } from 'react'
import {
  Briefcase,
  UploadCloud,
  FileText,
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  Trash2,
} from 'lucide-react'
import api from '../../services/api'
import { useUIStore } from '../../store/useUIStore'

interface JobDescriptionSourceProps {
  value: string
  onChange: (text: string) => void
  disabled?: boolean
}

export const JobDescriptionSource: React.FC<JobDescriptionSourceProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { addToast } = useUIStore()
  const [tab, setTab] = useState<'paste' | 'upload'>('paste')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    const fn = file.name.toLowerCase()
    if (!fn.endsWith('.pdf') && !fn.endsWith('.docx') && !fn.endsWith('.doc') && !fn.endsWith('.txt')) {
      addToast({ type: 'error', message: 'Please upload a .PDF, .DOCX, or .TXT file.' })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res: any = await api.post('/ai/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.success && res.data?.raw_text) {
        const text = res.data.raw_text
        onChange(text)
        setUploadedFileName(file.name)
        addToast({ type: 'success', message: `Job description extracted from ${file.name}` })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to extract text from job description file.' })
    } finally {
      setIsUploading(false)
    }
  }

  const clearUploadedFile = () => {
    setUploadedFileName(null)
    onChange('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-accent-cyan" />
          Target Job Description
        </label>
        <span className="text-[11px] text-gray-400">Posting Requirements</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setTab('paste')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            tab === 'paste'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Paste Text
        </button>

        <button
          type="button"
          onClick={() => setTab('upload')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            tab === 'upload'
              ? 'bg-primary-600 text-white shadow-glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* Option A: Paste Text */}
      {tab === 'paste' && (
        <div className="flex flex-col gap-1.5">
          <textarea
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Paste target job posting requirements, responsibilities, and qualifications..."
            className="w-full bg-surface-50 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
          <div className="flex justify-between items-center text-[10px] text-gray-500">
            <span>Minimum 10 characters required</span>
            <span>{value.length} characters</span>
          </div>
        </div>
      )}

      {/* Option B: Upload Document */}
      {tab === 'upload' && (
        <div className="flex flex-col gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
            }}
            accept=".pdf,.docx,.doc,.txt"
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
            <div className="w-10 h-10 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center text-accent-pink">
              <FileCheck2 className="w-5 h-5" />
            </div>

            {isUploading ? (
              <div className="flex items-center gap-2 text-xs text-primary-400 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Extracting text from job posting document...
              </div>
            ) : uploadedFileName ? (
              <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 bg-surface-100 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{uploadedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearUploadedFile()
                  }}
                  className="p-1 hover:text-red-400 text-gray-400 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-white">
                  Drop Job Description PDF / DOCX here, or <span className="text-primary-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Parses document and feeds text directly into ATS match engine
                </p>
              </>
            )}
          </div>

          {value && uploadedFileName && (
            <div className="p-3 bg-surface-50 rounded-xl border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Extracted Job Description Preview ({value.length} chars)
              </span>
              <p className="text-xs text-gray-300 line-clamp-3 font-mono leading-relaxed">
                {value}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
