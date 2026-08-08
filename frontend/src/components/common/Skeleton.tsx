import React from 'react'
import { cn } from '../../utils/cn'

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-xl skeleton-shimmer border border-white/[0.04]',
        className
      )}
    />
  )
}
