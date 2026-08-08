import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')

  const { verifyEmail, resendOTP } = useAuthStore()
  const { addToast } = useUIStore()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.LOGIN)
    }
  }, [email, navigate])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pasteData.length > 0) {
      const newOtp = [...otp]
      pasteData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      const nextFocus = Math.min(pasteData.length, 5)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await verifyEmail(email!, code)
      addToast({ type: 'success', message: 'Email verified successfully!' })
      navigate(ROUTES.DASHBOARD)
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !email) return
    setError('')
    setResending(true)
    try {
      await resendOTP(email)
      addToast({ type: 'success', message: 'A new code has been sent to your email.' })
      setCooldown(60)
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 border border-white/10 shadow-2xl glass-panel relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-violet flex items-center justify-center text-white shadow-glow-primary mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email</h2>
          <p className="text-sm text-gray-400 mt-2">
            We've sent a 6-digit verification code to <br/>
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{1}"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
              />
            ))}
          </div>

          <Button type="submit" variant="glow" size="lg" isLoading={loading} className="w-full">
            <span>Verify Email</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
          <p>Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
          </button>
        </div>
      </Card>
    </div>
  )
}
