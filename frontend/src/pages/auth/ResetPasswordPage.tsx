import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, CheckCircle2 } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import api from '../../services/api'
import { useUIStore } from '../../store/useUIStore'

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useUIStore()

  const [token] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      addToast({ type: 'error', message: 'Invalid or missing reset token. Please request a new link.' })
      return
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      const res: any = await api.post('/auth/reset-password', {
        reset_token: token,
        new_password: newPassword,
      })
      if (res.success) {
        addToast({ type: 'success', message: 'Password reset successfully! Please sign in.' })
        navigate(ROUTES.LOGIN)
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Password reset failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 border border-white/10 glass-panel">
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-gray-400">Choose a new password for your account</p>
        </div>

        {!token ? (
          <div className="text-center p-4 bg-red-950/60 border border-red-500/30 rounded-xl">
            <p className="text-sm text-red-400 font-bold mb-2">Invalid or missing reset link</p>
            <p className="text-xs text-gray-300 mb-4">Please request a new password reset link from the forgot password page.</p>
            <Link to={ROUTES.FORGOT_PASSWORD}>
              <Button variant="outline" size="sm">Go to Forgot Password</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            icon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter your new password"
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
            <span>Set New Password</span>
            <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        </form>
        )}
      </Card>
    </div>
  )
}
