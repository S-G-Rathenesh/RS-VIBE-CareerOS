import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean
  glow?: boolean
  variant?: 'default' | 'elevated' | 'bordered'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  glow = false,
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variants = {
    default: 'glass-panel',
    elevated: 'glass-card',
    bordered: 'glass-panel border-white/10',
  }

  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        interactive && 'glass-panel-hover cursor-pointer',
        glow && 'border-primary-500/30 shadow-glow-primary',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
