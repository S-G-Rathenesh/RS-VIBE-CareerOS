import React, { useEffect, useState, useCallback } from 'react'
import { User, Check, Zap, CreditCard, Crown, AlertTriangle } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { MediaUploader } from '../../components/common/MediaUploader'
import { PlanCard } from '../../components/subscription/PlanCard'
import { UsageMeter } from '../../components/subscription/UsageMeter'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import api from '../../services/api'

// Razorpay type declaration for inline checkout
declare global {
  interface Window {
    Razorpay: any
  }
}

/** Dynamically load Razorpay checkout script (idempotent). */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    if (document.getElementById('razorpay-checkout-script')) return resolve()
    const script = document.createElement('script')
    script.id = 'razorpay-checkout-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.body.appendChild(script)
  })
}

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const { addToast } = useUIStore()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [visibility, setVisibility] = useState('public')
  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile')
  const [plans, setPlans] = useState<any[]>([])
  const [subStatus, setSubStatus] = useState<any>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const fetchSubscriptionData = useCallback(() => {
    api.get<any, any>('/subscription/plans')
      .then((res) => {
        if (res.success && res.data) setPlans(res.data)
      })
      .catch(() => {})

    api.get<any, any>('/subscription/me')
      .then((res) => {
        if (res.success && res.data) setSubStatus(res.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchSubscriptionData()
  }, [fetchSubscriptionData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/me', { full_name: fullName, avatar_url: avatarUrl, candidate_visibility: visibility })
      updateUser({ fullName, avatarUrl })
      addToast({ type: 'success', message: 'Profile settings updated!' })
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update profile settings.' })
    } finally {
      setSaving(false)
    }
  }

  // ----------------------------------------------------------------
  // Razorpay Checkout Flow
  // ----------------------------------------------------------------
  const handleUpgradeToGolden = async () => {
    setUpgrading(true)
    try {
      // 1. Create checkout on backend → get real Razorpay subscription
      const checkoutRes: any = await api.post('/payments/create-checkout', {
        plan_tier: 'golden',
        provider: 'razorpay',
      })

      if (!checkoutRes.success || !checkoutRes.data) {
        throw new Error(checkoutRes?.error?.message || 'Failed to create checkout session.')
      }

      const { subscription_id, razorpay_key_id, plan_name, amount, currency } = checkoutRes.data

      // 2. Load Razorpay script
      await loadRazorpayScript()

      // 3. Open Razorpay inline checkout
      const options = {
        key: razorpay_key_id,
        subscription_id: subscription_id,
        name: 'RS VIBE CareerOS',
        description: plan_name,
        amount: amount,
        currency: currency,
        prefill: {
          email: user?.email || '',
          name: user?.fullName || '',
        },
        theme: {
          color: '#eab308', // Golden
        },
        handler: async (response: any) => {
          // 4. Verify payment server-side (NEVER trust frontend alone)
          try {
            const verifyRes: any = await api.post('/payments/verify-razorpay', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verifyRes.success) {
              addToast({ type: 'success', message: '🎉 Golden Membership activated! Welcome aboard.' })
              fetchSubscriptionData()
            } else {
              addToast({
                type: 'error',
                message: verifyRes?.error?.message || 'Payment verification failed. Please contact support.',
              })
            }
          } catch (verifyErr: any) {
            addToast({
              type: 'error',
              message: verifyErr.message || 'Payment verification failed. Your payment was not processed.',
            })
          } finally {
            setUpgrading(false)
          }
        },
        modal: {
          ondismiss: () => {
            addToast({ type: 'info', message: 'Payment was cancelled.' })
            setUpgrading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: any) => {
        addToast({
          type: 'error',
          message: response?.error?.description || 'Payment failed. Please try again.',
        })
        setUpgrading(false)
      })
      rzp.open()
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to start checkout. Please try again.' })
      setUpgrading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    if (planId === 'golden') {
      handleUpgradeToGolden()
    }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const res: any = await api.post('/payments/cancel')
      if (res.success) {
        addToast({ type: 'info', message: 'Subscription will cancel at end of billing period.' })
        fetchSubscriptionData()
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to cancel subscription.' })
    } finally {
      setCancelling(false)
    }
  }

  const isGolden = subStatus?.tier === 'golden'
  const isActive = subStatus?.status === 'active'

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Subscription</h1>
          <p className="text-xs text-gray-400">Manage profile, avatar image, AI credits, and subscription plans</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-xl bg-surface-50 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-primary-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1.5" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'billing' ? 'bg-primary-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 inline mr-1.5" /> Subscription & Limits
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <Card className="p-6 border border-white/10 glass-panel flex flex-col gap-6">
          <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-400" /> Public Profile Details
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300">Profile Picture Avatar</label>
              <MediaUploader
                category="avatar"
                currentUrl={avatarUrl}
                onUploadSuccess={(url) => setAvatarUrl(url)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-surface-50 text-xs border-white/10"
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-bold text-white mb-2">Candidate Privacy Settings</h4>
              <p className="text-xs text-gray-400 mb-3">Control who can discover your profile in the Recruiter Candidate Search.</p>
              
              <div className="flex flex-col gap-3">
                <label className={`p-3 rounded-lg border ${visibility === 'public' ? 'bg-primary-500/10 border-primary-500/50' : 'bg-surface-50 border-white/10'} cursor-pointer flex items-start gap-3`}>
                  <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="mt-1" />
                  <div>
                    <span className="text-sm font-bold text-white block">Public</span>
                    <span className="text-xs text-gray-400">Anyone on RS VIBE CareerOS can view your profile and contact you. (Recommended)</span>
                  </div>
                </label>
                
                <label className={`p-3 rounded-lg border ${visibility === 'recruiter_only' ? 'bg-primary-500/10 border-primary-500/50' : 'bg-surface-50 border-white/10'} cursor-pointer flex items-start gap-3`}>
                  <input type="radio" name="visibility" value="recruiter_only" checked={visibility === 'recruiter_only'} onChange={() => setVisibility('recruiter_only')} className="mt-1" />
                  <div>
                    <span className="text-sm font-bold text-white block">Recruiters Only</span>
                    <span className="text-xs text-gray-400">Only verified recruiters can discover and message you.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-lg border ${visibility === 'private' ? 'bg-primary-500/10 border-primary-500/50' : 'bg-surface-50 border-white/10'} cursor-pointer flex items-start gap-3`}>
                  <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="mt-1" />
                  <div>
                    <span className="text-sm font-bold text-white block">Private</span>
                    <span className="text-xs text-gray-400">Your profile is hidden from all searches. You can only be contacted for jobs you explicitly apply to.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="glow" size="md" isLoading={saving} type="submit">
                <Check className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Usage Meters Overview */}
          {subStatus && (
            <Card className="p-6 border border-white/10 glass-panel flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  <h3 className="text-base font-bold text-white">Current Usage & Plan Quotas</h3>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                  isGolden
                    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                    : 'bg-primary-500/15 text-primary-300 border-primary-500/30'
                }`}>
                  {isGolden && <Crown className="w-3 h-3 inline mr-1" />}
                  {subStatus.tier === 'golden' ? 'Golden' : 'Free'} Plan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UsageMeter
                  label="Monthly AI Credits"
                  current={subStatus.ai_credits_limit - subStatus.ai_credits_remaining}
                  limit={subStatus.ai_credits_limit}
                  unit="credits"
                  color="from-accent-pink to-accent-violet"
                />
                <UsageMeter
                  label="Daily AI Usage"
                  current={subStatus.daily_credits_used || 0}
                  limit={subStatus.daily_credits_limit || 20}
                  unit="credits"
                  color="from-amber-500 to-orange-400"
                />
                <UsageMeter
                  label="Active Resumes"
                  current={subStatus.resumes_count}
                  limit={subStatus.resumes_limit}
                  color="from-primary-500 to-accent-cyan"
                />
                <UsageMeter
                  label="Portfolios Built"
                  current={subStatus.portfolios_count}
                  limit={subStatus.portfolios_limit}
                  color="from-emerald-500 to-teal-400"
                />
              </div>

              {/* Cancel option for active Golden users */}
              {isGolden && isActive && !subStatus.cancel_at_period_end && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-400">
                    {subStatus.current_period_end && (
                      <span>Next billing: {new Date(subStatus.current_period_end).toLocaleDateString()}</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={cancelling}
                    onClick={handleCancelSubscription}
                    className="!text-red-400 !border-red-500/30 hover:!bg-red-500/10"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" /> Cancel Subscription
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                priceMonthly={plan.price_monthly}
                priceYearly={plan.price_yearly}
                isCurrentPlan={subStatus?.tier === plan.id}
                cancelAtPeriodEnd={subStatus?.cancel_at_period_end}
                currentPeriodEnd={subStatus?.current_period_end}
                features={plan.features}
                currency={plan.currency || '₹'}
                isLoading={upgrading && plan.id === 'golden'}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
