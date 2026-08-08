import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserIcon, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, googleLogin } = useAuthStore()
  const { addToast } = useUIStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await register(fullName, email, password)
      addToast({ type: 'success', message: 'Account created! Please check your email for the verification code.' })
      navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code
      if (errorCode === 'EMAIL_ALREADY_REGISTERED') {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError(err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.')
        addToast({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Registration failed.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return
    setLoading(true)
    setError('')
    try {
      await googleLogin(credentialResponse.credential)
      addToast({ type: 'success', message: 'Signed in with Google successfully!' })
      navigate(ROUTES.DASHBOARD)
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 border border-white/10 shadow-2xl glass-panel relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-violet/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-violet via-primary-600 to-accent-pink flex items-center justify-center text-white shadow-glow-accent mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-gray-400">Join RS VIBE CareerOS & build your standout career profile</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Vance"
            icon={<UserIcon className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] text-gray-400 font-medium">Included on Free Tier:</span>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Unlimited AI Resumes
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> 1 Published Portfolio
              </span>
            </div>
          </div>

          <Button type="submit" variant="glow" size="lg" isLoading={loading} className="w-full mt-2">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="relative flex items-center py-4 mt-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="flex justify-center w-full mt-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google authentication failed.')}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary-400 hover:text-primary-300 font-semibold">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}
