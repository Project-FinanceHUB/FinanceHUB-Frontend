'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type UserAvatarDropdownProps = {
  isOpen: boolean
  onClose: () => void
  onOpenPerfil: () => void
}

export default function UserAvatarDropdown({ isOpen, onClose, onOpenPerfil }: UserAvatarDropdownProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleLogout = async () => {
    try {
      await logout()
      // Limpar qualquer estado persistente relacionado ao login
      if (typeof window !== 'undefined') {
        // Limpar sessionStorage também
        sessionStorage.clear()
        // Forçar reload para garantir que todos os estados sejam resetados
        router.push('/')
        router.refresh()
      }
      onClose()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (!isOpen) return null

  const userInitial = user?.nome?.charAt(0).toUpperCase() || 'U'
  const userRoleLabels: Record<string, string> = {
    admin: 'Administrador',
    gerente: 'Gerente',
    usuario: 'Usuário',
    cliente: 'Cliente',
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
    >
      {/* Header do dropdown */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-semibold text-sm">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.nome || 'Usuário'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </div>
            {user?.role && (
              <div className="text-xs text-[var(--primary)] font-medium mt-0.5">
                {userRoleLabels[user.role] || user.role}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            onOpenPerfil()
          }}
          className="w-full px-4 py-2.5 text-left text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Meu Perfil</span>
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}
