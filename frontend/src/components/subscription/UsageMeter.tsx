import React from 'react'

interface UsageMeterProps {
  label: string
  current: number
  limit: number
  unit?: string
  color?: string
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  label,
  current,
  limit,
  unit = '',
  color = 'from-primary-500 to-accent-violet',
}) => {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 15 : Math.min(100, Math.round((current / limit) * 100))

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-gray-300">{label}</span>
        <span className="text-white">
          {current} {unit} / {isUnlimited ? '∞ Unlimited' : `${limit} ${unit}`}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-100 border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
