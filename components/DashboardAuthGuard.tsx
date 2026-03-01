'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import FullScreenLoading from '@/components/FullScreenLoading'

/**
 * Redireciona para a página de login quando o usuário não está autenticado.
 * Só redireciona após o carregamento da sessão para evitar flash indevido.
 */
export default function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isLoading } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isLoading) return
    if (!token) {
      router.replace('/?login=true')
    }
  }, [isLoading, token, router])

  if (isLoading) {
    return <FullScreenLoading />
  }

  if (!token) {
    return <FullScreenLoading />
  }

  return <>{children}</>
}
