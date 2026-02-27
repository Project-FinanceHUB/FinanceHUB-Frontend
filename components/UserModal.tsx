'use client'

import { useState, useEffect } from 'react'
import PasswordInput from '@/components/PasswordInput'
import type { User, UserFormData, UserRole } from '@/types/configuracoes'
import type { Company } from '@/types/company'

type UserModalProps = {
  user?: User | null
  /** Gerente editando apenas o próprio perfil: só nome e nova senha */
  isSelfEditByGerente?: boolean
  /** Lista de empresas (para vincular Gerente/Usuário à visibilidade) */
  companies?: Company[]
  onClose: () => void
  onSave: (data: UserFormData) => Promise<void>
  onDelete?: () => Promise<void>
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'usuario', label: 'Usuário' },
]

export default function UserModal({ user, isSelfEditByGerente = false, companies = [], onClose, onSave, onDelete }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    password: '',
    role: 'usuario',
    ativo: true,
    companyIds: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        role: user.role,
        ativo: user.ativo,
        password: '',
        companyIds: user.companyIds ?? [],
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        password: '',
        role: 'usuario',
        ativo: true,
        companyIds: [],
      })
    }
    setErrors({})
  }, [user])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    if (isSelfEditByGerente) {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'E-mail é obrigatório'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido'
      }
      if (!user && (!formData.password || formData.password.length < 6)) {
        newErrors.password = 'Senha é obrigatória (mínimo 6 caracteres)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        if (isSelfEditByGerente && user) {
          await onSave({ nome: formData.nome, email: user.email, password: formData.password || undefined, role: user.role, ativo: user.ativo })
        } else {
          await onSave(formData)
        }
      } catch (err: any) {
        console.error('Erro ao salvar:', err)
        alert(err.message || 'Erro ao salvar usuário')
      }
    }
  }

  const inputBase = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-white border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40'
  const inputError = 'border-red-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSelfEditByGerente ? 'Meu perfil' : user ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
                if (errors.nome) setErrors((prev) => ({ ...prev, nome: '' }))
              }}
              className={`${inputBase} ${errors.nome ? inputError : ''}`}
              placeholder="Nome completo"
            />
            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
          </div>

          {!isSelfEditByGerente && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                className={`${inputBase} ${errors.email ? inputError : ''}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          )}

          {isSelfEditByGerente ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <PasswordInput
                id="user-modal-password-self"
                value={formData.password ?? ''}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                }}
                placeholder="Deixe em branco para manter a senha atual (mín. 6 caracteres se alterar)"
                autoComplete="new-password"
                className={`${inputBase} pr-12 ${errors.password ? inputError : ''}`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
          ) : !user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                id="user-modal-password-new"
                value={formData.password ?? ''}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                }}
                placeholder="Mínimo 6 caracteres (para login do funcionário)"
                autoComplete="new-password"
                className={`${inputBase} pr-12 ${errors.password ? inputError : ''}`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
          )}

          {!isSelfEditByGerente && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  className={inputBase}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.role === 'gerente' || formData.role === 'usuario') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresas (visibilidade)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Marque as empresas que este funcionário pode usar e visualizar nas solicitações
                    (boletos, notas fiscais, etc.).
                  </p>
                  {companies.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      Nenhuma empresa cadastrada ainda. Crie empresas antes de vincular funcionários.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 space-y-1.5">
                      {companies.map((c) => {
                        const checked = (formData.companyIds ?? []).includes(c.id)
                        return (
                          <label
                            key={c.id}
                            className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-white cursor-pointer text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setFormData((prev) => {
                                  const current = prev.companyIds ?? []
                                  const next = isChecked
                                    ? [...current, c.id]
                                    : current.filter((id) => id !== c.id)
                                  return { ...prev, companyIds: next }
                                })
                              }}
                              className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span>{c.nome}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
                  className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-gray-700">Usuário ativo</span>
              </label>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition"
            >
              {isSelfEditByGerente ? 'Salvar' : user ? 'Salvar alterações' : 'Adicionar usuário'}
            </button>
            {user && onDelete && !isSelfEditByGerente && (
              <button
                type="button"
                onClick={() => onDelete()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remover
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
