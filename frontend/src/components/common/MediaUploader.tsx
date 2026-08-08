import React, { useState, useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../services/api'

interface MediaUploaderProps {
  category?: 'avatar' | 'project' | 'certificate' | 'resume' | 'portfolio'
  currentUrl?: string
  onUploadSuccess: (url: string) => void
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  category = 'avatar',
  currentUrl,
  onUploadSuccess,
}) => {
  const { addToast } = useUIStore()
  const { user, updateUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(currentUrl || user?.avatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragCounter = useRef(0)

  // Synchronize preview whenever user avatarUrl or currentUrl prop updates
  useEffect(() => {
    setPreview(currentUrl || user?.avatarUrl || null)
  }, [currentUrl, user?.avatarUrl])

  const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024 // 2MB Limit

  // Client-side image validation before any upload starts
  const validateFile = (file: File): string | null => {
    const fileType = (file.type || '').toLowerCase()
    const fileName = (file.name || '').toLowerCase()

    const isAllowedType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(fileType)
    const isAllowedExt = /\.(jpg|jpeg|png|webp)$/i.test(fileName)

    if (!isAllowedType && !isAllowedExt) {
      return 'Invalid format. Only JPG, PNG, and WEBP images are supported.'
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return 'Image size must be 2 MB or less. Please choose a smaller image.'
    }

    return null
  }

  const uploadFile = async (file: File) => {
    // 1. Perform strict client-side validation
    const validationError = validateFile(file)
    if (validationError) {
      addToast({
        type: 'error',
        message: validationError
      })
      // DO NOT send request to backend or Cloudinary
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res: any = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res && res.success && res.data) {
        const rawUrl = res.data.avatar_url || res.data.url
        const cacheBustedUrl = rawUrl.includes('data:') ? rawUrl : `${rawUrl}?v=${Date.now()}`
        
        console.log('[Avatar Diagnostic 4 - Auth Store Update]', { avatarUrl: cacheBustedUrl })
        setPreview(cacheBustedUrl)
        onUploadSuccess(cacheBustedUrl)
        updateUser({ avatarUrl: cacheBustedUrl })
        
        addToast({ type: 'success', message: 'Avatar uploaded & saved to Cloudinary!' })
      } else {
        const errorMsg = res?.error?.message || 'Cloudinary upload failed.'
        addToast({ type: 'error', message: errorMsg })
      }
    } catch (err: any) {
      const displayError = err.message || 'Cloudinary upload failed.'
      addToast({ type: 'error', message: displayError })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (deleting || uploading) return

    setDeleting(true)
    try {
      const res: any = await api.delete('/users/avatar')
      if (res && res.success) {
        setPreview(null)
        onUploadSuccess('')
        updateUser({ avatarUrl: '' })
        addToast({ type: 'success', message: 'Avatar removed from Cloudinary successfully.' })
      } else {
        addToast({ type: 'error', message: res?.error?.message || 'Failed to remove avatar.' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete avatar.' })
    } finally {
      setDeleting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDraggingOver(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    dragCounter.current = 0

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      await uploadFile(droppedFiles[0])
    }
  }

  const userInitial = user?.fullName?.charAt(0).toUpperCase() || 'U'

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer flex items-center justify-between gap-4 p-4 rounded-2xl border border-dashed transition-all duration-200 select-none ${
        isDraggingOver
          ? 'bg-primary-500/20 border-primary-400 scale-[1.01] shadow-glow-primary'
          : 'bg-surface-50/60 border-white/10 hover:border-white/20 hover:bg-surface-50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading || deleting}
        className="hidden"
      />

      <div className="flex items-center gap-4 min-w-0">
        {/* Circular Avatar Preview */}
        <div className="w-16 h-16 rounded-full bg-surface-100 border border-white/15 overflow-hidden flex items-center justify-center relative shrink-0 shadow-lg group-hover:border-primary-500/40 transition-all">
          {uploading || deleting ? (
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          ) : preview ? (
            <img src={preview} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary-400">{userInitial}</span>
          )}
        </div>

        {/* Status Text & Guidelines */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Upload className={`w-4 h-4 ${isDraggingOver ? 'text-primary-300' : 'text-primary-400'}`} />
            <span className="text-xs font-semibold text-white">
              {uploading ? 'Uploading to Cloudinary...' : deleting ? 'Deleting from Cloudinary...' : isDraggingOver ? 'Drop image to upload' : 'Upload or Drag Avatar Image'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 truncate">
            {isDraggingOver ? 'Release mouse to update avatar' : 'JPG, PNG, or WEBP (Max 2MB)'}
          </p>
        </div>
      </div>

      {/* Delete Avatar Button */}
      {preview && !uploading && !deleting && (
        <button
          type="button"
          onClick={handleRemoveAvatar}
          className="p-2 rounded-xl bg-surface-100 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all shrink-0"
          title="Delete avatar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Drag Over Active Overlay Badge */}
      {isDraggingOver && (
        <div className="absolute inset-0 rounded-2xl bg-primary-500/10 backdrop-blur-xs border-2 border-primary-400 flex items-center justify-center text-xs font-bold text-primary-300 pointer-events-none">
          Drop avatar image file here
        </div>
      )}
    </div>
  )
}
