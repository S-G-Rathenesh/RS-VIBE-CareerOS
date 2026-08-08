import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: LucideIcon
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className
}) => {
  return (
    <Card className={cn('p-14 glass-panel border border-white/[0.06] flex flex-col items-center justify-center text-center', className)}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-surface-100/80 border border-white/[0.08] flex items-center justify-center text-primary-400 mb-6 shadow-glow-sm"
      >
        <Icon className="w-9 h-9" />
      </motion.div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="glow" size="md">
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-1.5" />}
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
