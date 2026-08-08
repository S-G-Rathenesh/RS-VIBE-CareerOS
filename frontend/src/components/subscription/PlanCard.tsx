import React from 'react'
import { Check, Crown, Zap } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

interface PlanCardProps {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  isYearly?: boolean
  isCurrentPlan: boolean
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: string | null
  features: string[]
  currency?: string
  isLoading?: boolean
  onSelectPlan: (planId: string) => void
}

export const PlanCard: React.FC<PlanCardProps> = ({
  id,
  name,
  description,
  priceMonthly,
  isCurrentPlan,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  features,
  currency = '₹',
  isLoading = false,
  onSelectPlan,
}) => {
  const isGolden = id === 'golden'
  const isFree = id === 'free'

  const price = priceMonthly

  const getButtonText = () => {
    if (isCurrentPlan) {
      if (isGolden && cancelAtPeriodEnd) {
        return 'Cancels at Period End'
      }
      return 'Current Active Plan'
    }
    
    if (isGolden) {
      return 'Upgrade to Golden'
    }
    
    return 'Free Plan'
  }

  return (
    <Card
      className={`p-6 flex flex-col justify-between gap-6 border relative transition-all duration-300 ${
        isGolden
          ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-950/40 via-surface-50 to-surface-50 shadow-[0_0_30px_rgba(234,179,8,0.15)]'
          : 'border-white/10 glass-panel'
      }`}
    >
      {isGolden && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
          <Crown className="w-3 h-3 fill-current" /> Golden Membership
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white">{name}</h3>
            {isGolden && <Crown className="w-5 h-5 text-yellow-400" />}
          </div>
          <p className="text-xs text-gray-400 min-h-[36px]">{description}</p>
        </div>

        <div className="flex items-baseline gap-1 pt-2 border-t border-white/10">
          <span className="text-4xl font-black text-white">
            {isFree ? 'Free' : `${currency}${price}`}
          </span>
          {!isFree && (
            <span className="text-xs text-gray-400 font-medium">/ month</span>
          )}
        </div>

        {/* Active subscription status */}
        {isCurrentPlan && isGolden && (
          <div className="flex flex-col gap-1">
            {cancelAtPeriodEnd ? (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                ⚠ Cancels on {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : 'period end'}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                ✓ Active
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-4">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Features Included:</span>
          {features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isGolden ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary-500/20 text-primary-400'
              }`}>
                <Check className="w-3 h-3" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant={isCurrentPlan ? 'outline' : isGolden ? 'glow' : 'outline'}
        size="md"
        disabled={isCurrentPlan || isLoading || (!isCurrentPlan && isFree)}
        isLoading={isLoading}
        onClick={() => onSelectPlan(id)}
        className={`w-full mt-4 ${isGolden && !isCurrentPlan ? '!bg-gradient-to-r !from-yellow-500 !to-amber-600 hover:!from-yellow-400 hover:!to-amber-500 !text-black !font-bold' : ''}`}
      >
        {isLoading ? 'Processing...' : getButtonText()}
      </Button>
    </Card>
  )
}
