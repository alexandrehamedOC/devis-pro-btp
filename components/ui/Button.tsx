'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, children, className = '', ...props }, ref) => {
    const cls = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ')

    return (
      <button ref={ref} className={cls} disabled={disabled || loading} {...props}>
        {loading && <Spinner size={14} color={variant === 'primary' ? '#fff' : 'var(--accent)'} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
