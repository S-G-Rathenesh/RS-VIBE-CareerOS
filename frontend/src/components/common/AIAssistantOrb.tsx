import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface AIAssistantOrbProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AIAssistantOrb: React.FC<AIAssistantOrbProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={cn('relative flex items-center justify-center pointer-events-none select-none', sizeMap[size], className)}
    >
      {/* Outer Glow Ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-accent-violet to-accent-pink blur-xl"
      />

      {/* Rotating Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-1 rounded-full border border-primary-400/30 border-dashed"
      />

      {/* Rotating Ring 2 (counter) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2.5 rounded-full border border-accent-pink/25 border-dashed"
      />

      {/* Core Glowing Sphere */}
      <div className="relative w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-primary-600 via-accent-violet to-accent-pink shadow-glow-primary flex items-center justify-center overflow-hidden">
        {/* Inner Shimmer Light */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
        />
        {/* Center Pupil Core */}
        <motion.div
          animate={{ scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]"
        />
      </div>

      {/* Floating Particles */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4], y: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#06b6d4]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3], x: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-1 left-3 w-1.5 h-1.5 rounded-full bg-accent-pink shadow-[0_0_6px_#ec4899]"
      />
    </motion.div>
  )
}
