'use client'

interface SpinnerProps {
  /** Tamanho: sm (botões), md (cards), lg (página) */
  size?: 'sm' | 'md' | 'lg'
  /** Cor: usa primary do projeto por padrão */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`rounded-full border-[var(--primary)] border-t-transparent animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
