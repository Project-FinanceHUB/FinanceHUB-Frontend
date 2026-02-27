'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { useConfiguracoes } from '@/context/ConfiguracoesContext'
import { usePermissions } from '@/hooks/usePermissions'
import { SkeletonCard } from '@/components/Skeleton'
import type { User, UserFormData, UserRole } from '@/types/configuracoes'
import UserModal from '@/components/UserModal'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'usuario', label: 'Usuário' },
]

export default function UsuariosPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { canAccessUserManagement, canCreateEditDeleteUsers } = usePermissions()
  const { companies } = useDashboard()
  const { users, addUser, updateUser, deleteUser, loading, error } = useConfiguracoes()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!canAccessUserManagement) {
      router.replace('/dashboard')
      return
    }
  }, [canAccessUserManagement, authLoading, router])

  /** Administrador: criar/editar/excluir qualquer um. Gerente: só editar o próprio (nome e senha). */
  const canCreateUser = canCreateEditDeleteUsers

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleRequestDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id) ?? null
    setPendingDeleteUser(user)
  }

  const handleConfirmDeleteUser = async () => {
    if (!pendingDeleteUser) return
    try {
      await deleteUser(pendingDeleteUser.id)
      setPendingDeleteUser(null)
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err)
      alert(err.message || 'Erro ao deletar usuário')
    }
  }

  const handleSaveUser = async (data: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data)
      } else {
        await addUser(data)
      }
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err)
      alert(err.message || 'Erro ao salvar usuário')
    }
  }

  const getRoleLabel = (role: UserRole) => {
    return ROLES.find((r) => r.value === role)?.label || role
  }

  if (!currentUser || !canAccessUserManagement) {
    return null
  }

  return (
    <div className="px-4 sm:px-6 py-6 md:py-8 w-full max-w-full">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Usuários</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {canCreateUser
                ? 'Cadastre funcionários como tipo \"Usuário\". Eles veem as mesmas empresas e solicitações (boletos e notas fiscais) que este administrador.'
                : 'Visualize os usuários vinculados a esta conta. Criar, editar e excluir usuários é restrito ao administrador.'}
            </p>
          </div>
        </div>
        {canCreateUser && (
          <button
            type="button"
            onClick={handleAddUser}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo usuário
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 custom:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-inner border border-gray-100">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">
            {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
          </p>
          {!searchTerm && canCreateUser && (
            <button
              type="button"
              onClick={handleAddUser}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl mt-4 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar primeiro usuário
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 custom:grid-cols-2 gap-4 md:gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl bg-white border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[var(--primary)]/20 transition-all duration-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.nome}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium text-gray-900">{getRoleLabel(user.role)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Status:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${user.ativo ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                    <span className={`font-medium ${user.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {(canCreateEditDeleteUsers || (currentUser?.role === 'gerente' && user.id === currentUser?.id)) && (
                <button
                  type="button"
                  onClick={() => handleEditUser(user)}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {currentUser?.role === 'gerente' && user.id === currentUser?.id ? 'Editar meu perfil' : 'Editar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          user={editingUser}
          isSelfEditByGerente={!!(currentUser?.role === 'gerente' && editingUser?.id === currentUser?.id)}
          companies={companies}
          onClose={() => {
            setIsModalOpen(false)
            setEditingUser(null)
          }}
          onSave={handleSaveUser}
          onDelete={editingUser && canCreateEditDeleteUsers ? () => { handleRequestDeleteUser(editingUser.id); return Promise.resolve() } : undefined}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!pendingDeleteUser}
        title="Confirmar exclusão"
        message="Esta ação é irreversível e não pode ser desfeita."
        itemDescription={pendingDeleteUser ? `usuário ${pendingDeleteUser.nome} (${pendingDeleteUser.email})` : undefined}
        onClose={() => setPendingDeleteUser(null)}
        onConfirm={handleConfirmDeleteUser}
      />
    </div>
  )
}
