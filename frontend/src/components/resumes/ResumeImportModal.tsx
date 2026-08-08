import React, { useState } from 'react'
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

interface ResumeImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { addToast } = useUIStore()

  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [step, setStep] = useState<string>('')
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  if (!isOpen) return null

  const processSelectedFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      addToast({ type: 'error', message: 'Please select a valid PDF or DOCX file.' })
      return
    }
    setFile(selectedFile)
    addToast({ type: 'info', message: `Selected file: ${selectedFile.name}` })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processSelectedFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      processSelectedFile(droppedFiles[0])
    }
  }

  const handleImport = async () => {
    if (!file) return
    setParsing(true)
    setStep('Extracting document text & metadata...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setTimeout(() => setStep('Running AI Entity Extraction...'), 1500)
      setTimeout(() => setStep('Structuring Experience, Skills & Education...'), 3000)

      const res: any = await api.post('/resumes/import', formData)

      if (res.success && res.data) {
        addToast({ type: 'success', message: 'Resume imported & parsed successfully!' })
        onClose()
        navigate(`/resumes/builder/${res.data.id}`)
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to parse resume document.' })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <Card className="w-full max-w-lg p-6 border border-white/15 glass-panel flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Import PDF or DOCX Resume</h3>
              <p className="text-xs text-gray-400">Auto-extract candidate details into builder</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Upload Dropzone */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-primary-400 bg-primary-500/20 scale-[1.02]'
              : 'border-white/20 hover:border-primary-500/50 bg-surface-50/50'
          }`}
        >
          <FileText className={`w-10 h-10 mb-2 transition-colors ${isDraggingOver ? 'text-primary-300' : 'text-primary-400'}`} />
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-white">{file.name}</span>
              <span className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-white">
                {isDraggingOver ? 'Drop resume file to upload' : 'Click or drag resume file here'}
              </span>
              <span className="text-xs text-gray-400">Supports .PDF and .DOCX files up to 10MB</span>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            disabled={parsing}
            className="hidden"
          />
        </label>

        {parsing && (
          <div className="flex items-center gap-3 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl text-xs text-primary-300 animate-pulse">
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{step}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={parsing}>
            Cancel
          </Button>
          <Button variant="glow" size="sm" isLoading={parsing} disabled={!file} onClick={handleImport}>
            <Sparkles className="w-4 h-4 mr-1" /> Start AI Parsing
          </Button>
        </div>
      </Card>
    </div>
  )
}
