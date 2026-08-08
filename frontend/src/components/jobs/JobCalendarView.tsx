import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Video,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

export interface CalendarEvent {
  id: string
  application_id: string
  title: string
  type: 'APPLICATION' | 'INTERVIEW' | 'DEADLINE' | 'FOLLOW_UP'
  date: string
  company?: string
  status?: string
  meeting_link?: string
}

interface JobCalendarViewProps {
  events: CalendarEvent[]
}

export const JobCalendarView: React.FC<JobCalendarViewProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return events.filter((ev) => {
      try {
        const d = new Date(ev.date)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
      } catch {
        return false
      }
    })
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptySlots = Array.from({ length: firstDayIndex }, (_, i) => i)

  return (
    <Card className="p-6 border border-white/10 flex flex-col gap-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-gray-400">
              Track upcoming interviews, assessment deadlines, and follow-up milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} className="px-2.5">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="px-2.5">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-gray-400 border-b border-white/5 pb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptySlots.map((slot) => (
          <div key={`empty-${slot}`} className="h-28 rounded-xl bg-surface-50/20 border border-white/5 opacity-30" />
        ))}

        {daysArray.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year

          return (
            <div
              key={`day-${day}`}
              className={`h-28 rounded-xl p-2 border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-primary-950/30 border-primary-500/50 shadow-glow-primary'
                  : 'bg-surface-50/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    isToday ? 'text-primary-400 font-extrabold' : 'text-gray-300'
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-surface-100 text-gray-400 font-semibold border border-white/10">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Day Events Stack */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[72px] pr-0.5">
                {dayEvents.map((ev) => {
                  let bg = 'bg-primary-500/20 text-primary-300 border-primary-500/30'
                  let Icon = Briefcase

                  if (ev.type === 'INTERVIEW') {
                    bg = 'bg-accent-pink/20 text-accent-pink border-accent-pink/30 font-bold'
                    Icon = Video
                  } else if (ev.type === 'DEADLINE') {
                    bg = 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    Icon = AlertCircle
                  } else if (ev.type === 'FOLLOW_UP') {
                    bg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    Icon = Clock
                  }

                  return (
                    <Link
                      key={ev.id}
                      to={ev.application_id ? `/jobs/${ev.application_id}` : '#'}
                      className={`text-[9px] px-1.5 py-0.5 rounded-md border truncate flex items-center gap-1 hover:scale-102 transition-transform ${bg}`}
                      title={ev.title}
                    >
                      <Icon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{ev.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
