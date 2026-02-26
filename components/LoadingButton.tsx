'use client'

import Spinner from './Spinner'

interface LoadingButtonProps {
  isLoading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export default function LoadingButton({
  isLoading = false,
  children,
  className = '',
  disabled = false,
  variant = 'primary',
  type = 'button',
  onClick,
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'

  const variantClasses = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--accent)] shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)]/5',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
  }

  const spinnerColor = variant === 'primary' || variant === 'danger' ? 'border-white border-t-transparent' : 'border-[var(--primary)] border-t-transparent'

  if (isLoading) {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${className} cursor-wait`}
        aria-busy="true"
      >
        <Spinner size="sm" className={spinnerColor} />
        <span className="opacity-90">{children}</span>
      </div>
    )
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
