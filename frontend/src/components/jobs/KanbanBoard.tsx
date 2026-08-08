import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  MoreVertical,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

export interface JobCardData {
  id: string
  company: string
  job_title: string
  status: string
  salary?: string
  location?: string
  ats_score?: number
  resume_version_name?: string
  recruiter_name?: string
  application_date?: string
  follow_up_date?: string
  tags?: string[]
}

interface KanbanBoardProps {
  board: Record<string, JobCardData[]>
  onBoardChange: (newBoard: Record<string, JobCardData[]>) => void
  onNewJob: (defaultStatus: string) => void
}

const COLUMNS = [
  { id: 'draft', title: 'Drafts', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  { id: 'applied', title: 'Applied', color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
  { id: 'assessment', title: 'Assessment', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'interview', title: 'Interviewing', color: 'text-accent-pink', bg: 'bg-accent-pink/10', border: 'border-accent-pink/20' },
  { id: 'offer', title: 'Offer Received', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'rejected', title: 'Archived / Rejected', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 'accepted', title: 'Offer Accepted 🎉', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
]

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onBoardChange,
  onNewJob,
}) => {
  const { addToast } = useUIStore()
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [draggedSourceCol, setDraggedSourceCol] = useState<string | null>(null)

  const handleDragStart = (cardId: string, sourceCol: string) => {
    setDraggedCardId(cardId)
    setDraggedSourceCol(sourceCol)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetCol: string) => {
    if (!draggedCardId || !draggedSourceCol || draggedSourceCol === targetCol) {
      setDraggedCardId(null)
      setDraggedSourceCol(null)
      return
    }

    const card = board[draggedSourceCol]?.find((c) => c.id === draggedCardId)
    if (!card) return

    // Optimistically update board state
    const updatedSource = board[draggedSourceCol].filter((c) => c.id !== draggedCardId)
    const updatedTarget = [{ ...card, status: targetCol }, ...(board[targetCol] || [])]

    const newBoard = {
      ...board,
      [draggedSourceCol]: updatedSource,
      [targetCol]: updatedTarget,
    }

    onBoardChange(newBoard)
    setDraggedCardId(null)
    setDraggedSourceCol(null)

    try {
      await api.put(`/jobs/${draggedCardId}/status?status_val=${targetCol}`, {})
      addToast({
        type: 'success',
        message: `Moved ${card.company} to ${targetCol.replace('_', ' ').toUpperCase()}`,
      })
    } catch (err: any) {
      addToast({ type: 'error', message: 'Failed to update application status' })
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[680px]">
      {COLUMNS.map((col) => {
        const cards = board[col.id] || []
        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className="flex-shrink-0 w-80 flex flex-col gap-3 rounded-2xl bg-surface-50/50 p-3.5 border border-white/5"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.color} border ${col.border}`}>
                  {cards.length}
                </span>
              </div>
              <button
                onClick={() => onNewJob(col.id)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title={`Add job to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards Container */}
            <div className="flex flex-col gap-3 min-h-[120px]">
              {cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id, col.id)}
                  className="p-4 rounded-2xl bg-surface-100/90 border border-white/10 hover:border-primary-500/50 transition-all cursor-grab active:cursor-grabbing group shadow-md hover:shadow-xl relative flex flex-col gap-3"
                >
                  {/* Top row: Company & ATS badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors truncate max-w-[170px]">
                        {card.company}
                      </span>
                      <span className="text-[11px] text-gray-400 truncate max-w-[170px]">
                        {card.job_title}
                      </span>
                    </div>

                    {card.ats_score !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          card.ats_score >= 90
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        }`}
                      >
                        {card.ats_score}% ATS
                      </span>
                    )}
                  </div>

                  {/* Metadata: Location / Salary / Version */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    {card.location && (
                      <span className="flex items-center gap-1 bg-surface-50 px-2 py-0.5 rounded-md border border-white/5">
                        <MapPin className="w-2.5 h-2.5 text-gray-500" /> {card.location}
                      </span>
                    )}
                    {card.salary && (
                      <span className="flex items-center gap-1 bg-surface-50 px-2 py-0.5 rounded-md border border-white/5 text-emerald-400 font-semibold">
                        {card.salary}
                      </span>
                    )}
                    {card.resume_version_name && (
                      <span className="flex items-center gap-1 bg-accent-violet/10 text-accent-violet px-2 py-0.5 rounded-md border border-accent-violet/20 font-medium truncate max-w-[150px]">
                        <FileText className="w-2.5 h-2.5" /> {card.resume_version_name}
                      </span>
                    )}
                  </div>

                  {/* Footer: Date & Workspace Link */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {card.application_date
                        ? new Date(card.application_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : 'Active'}
                    </span>

                    <Link
                      to={`/jobs/${card.id}`}
                      className="text-primary-400 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                    >
                      Workspace <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {cards.length === 0 && (
                <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[11px] text-gray-500">
                  Drop applications here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
