import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import api from '../../services/api'
import { useUIStore } from '../../store/useUIStore'

export const ForgotPasswordPage: React.FC = () => {
  const { addToast } = useUIStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res: any = await api.post('/auth/forgot-password', { email })
      if (res.success) {
        setIsSuccess(true)
        addToast({ type: 'success', message: 'Request sent successfully.' })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to process request.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 border border-white/10 glass-panel">
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h2>
          <p className="text-xs text-gray-400">Enter your email address to receive password reset instructions</p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              If an account exists with this email, password reset instructions have been sent.
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Please check your email and click the link to reset your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
              <span>Send Reset Instructions</span>
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}
