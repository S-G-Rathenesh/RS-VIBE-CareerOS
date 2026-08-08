import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuthStore()
  const { addToast } = useUIStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      addToast({ type: 'success', message: 'Welcome back to RS VIBE CareerOS!' })
      navigate(ROUTES.DASHBOARD)
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code
      
      if (errorCode === 'EMAIL_UNVERIFIED') {
        navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`)
        addToast({ type: 'info', message: 'Please verify your email to continue.' })
      } else if (errorCode === 'EMAIL_NOT_REGISTERED') {
        setError('No account is registered with this email. Please sign up first.')
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        setError('Incorrect email or password.')
      } else {
        setError(err.response?.data?.error?.message || err.message || 'Login failed. Please check your credentials.')
        addToast({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Login failed.' })
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
        {/* Glow accent decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <img
            src="/logo.png"
            alt="RS VIBE CareerOS Logo"
            className="w-14 h-14 object-cover rounded-2xl border border-primary-500/40 shadow-glow-primary mb-2"
          />
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-gray-400">Sign in to your RS VIBE CareerOS Career Workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

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

          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="glow" size="lg" isLoading={loading} className="w-full mt-2">
            <span>Sign In</span>
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
            text="signin_with"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary-400 hover:text-primary-300 font-semibold">
            Create Account Free
          </Link>
        </div>
      </Card>
    </div>
  )
}
