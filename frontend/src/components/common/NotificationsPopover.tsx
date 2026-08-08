import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, X, ExternalLink } from 'lucide-react'
import { Card } from './Card'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  is_read: boolean
  created_at: string
  action_url?: string
}

export const NotificationsPopover: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get<any, any>('/notifications')
      if (res.success && res.data) {
        setNotifications(res.data)
        setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (err) {
      // Silently fail on background polling
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {})
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all', {})
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAction = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id)
    if (n.action_url) {
      navigate(n.action_url)
      setIsOpen(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-[400px] flex flex-col z-50 shadow-2xl border border-white/10 glass-panel overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <span className="font-bold text-sm text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] uppercase font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <Bell className="w-6 h-6 opacity-20" />
                No new notifications
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex flex-col gap-1 p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${
                      !n.is_read ? 'bg-primary-500/5' : ''
                    }`}
                    onClick={() => handleAction(n)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-semibold ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                        {n.title}
                      </span>
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                    </div>
                    <span className="text-[11px] text-gray-400 leading-tight">
                      {n.message}
                    </span>
                    <span className="text-[9px] text-gray-500 uppercase font-medium mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
