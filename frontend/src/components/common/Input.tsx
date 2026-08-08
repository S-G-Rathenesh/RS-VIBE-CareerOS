import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-gray-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center group">
          {icon && (
            <div className="absolute left-3.5 text-gray-500 group-focus-within:text-primary-400 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-surface-50/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-gray-500',
              'focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/40 focus:bg-surface-50',
              'transition-all duration-200',
              'hover:border-white/15',
              icon && 'pl-10',
              error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400 font-medium ml-1">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
