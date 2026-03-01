'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useConfiguracoes } from '@/context/ConfiguracoesContext'
import { useToast } from '@/context/ToastContext'
import * as userAPI from '@/lib/api/users'
import Spinner from '@/components/Spinner'

/** Loading padrão do projeto: 3 barras verdes + "Carregando..." (mesmo do FullScreenLoading) */
function LoadingPadrao({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`} role="status" aria-label="Carregando">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        width={120}
        height={120}
        className="block"
        style={{ shapeRendering: 'auto' }}
        aria-hidden
      >
        <g>
          <rect fill="var(--primary, #008374)" height="40" width="15" y="30" x="17.5">
            <animate begin="-0.2s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="18;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
            <animate begin="-0.2s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="64;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
          </rect>
          <rect fill="var(--accent, #89ba16)" height="40" width="15" y="30" x="42.5">
            <animate begin="-0.1s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="20.999999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
            <animate begin="-0.1s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="58.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
          </rect>
          <rect fill="#039a42" height="40" width="15" y="30" x="67.5">
            <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="20.999999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
            <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="58.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
          </rect>
        </g>
      </svg>
      <p className="text-sm font-medium text-slate-600">Carregando...</p>
    </div>
  )
}

type PerfilModalProps = {
  isOpen: boolean
  onClose: () => void
}

/** Máscara simples para telefone (11) 99999-9999 ou (11) 9999-9999 */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function PerfilModal({ isOpen, onClose }: PerfilModalProps) {
  const { user, token, validateSession } = useAuth()
  const { profile, setProfile } = useConfiguracoes()
  const toast = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await userAPI.getMe(token)
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        cargo: data.cargo || '',
      })
      // Não atualiza profile aqui para evitar loop (effect depende de loadProfile)
    } catch {
      setFormData({
        nome: user?.nome || profile.nome || '',
        email: user?.email || profile.email || '',
        telefone: profile.telefone || '',
        cargo: profile.cargo || '',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, user?.nome, user?.email, profile.nome, profile.email, profile.telefone, profile.cargo])

  useEffect(() => {
    if (!isOpen) return
    if (token) {
      loadProfile()
    } else {
      setFormData({
        nome: user?.nome || profile.nome || '',
        email: user?.email || profile.email || '',
        telefone: profile.telefone || '',
        cargo: profile.cargo || '',
      })
    }
    // Só recarrega ao abrir o modal ou quando o token muda; evita loop ao não depender de loadProfile
  }, [isOpen, token])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTelefoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, telefone: formatPhone(value) }))
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Preencha o nome.')
      return
    }
    if (token) {
      setIsSaving(true)
      try {
        const updated = await userAPI.updateMe(token, {
          nome: formData.nome.trim(),
          telefone: formData.telefone.trim() || undefined,
          cargo: formData.cargo.trim() || undefined,
        })
        setProfile({
          ...profile,
          nome: updated.nome,
          email: updated.email,
          telefone: updated.telefone || '',
          cargo: updated.cargo || '',
        })
        await validateSession()
        toast.success('Perfil atualizado com sucesso!')
        onClose()
      } catch (err: any) {
        console.error('Erro ao salvar perfil:', err)
        toast.error(err?.message || 'Erro ao salvar perfil. Tente novamente.')
      } finally {
        setIsSaving(false)
      }
    } else {
      setProfile({
        ...profile,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo,
      })
      toast.success('Perfil atualizado com sucesso!')
      onClose()
    }
  }

  if (!isOpen) return null

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    gerente: 'Gerente',
    usuario: 'Usuário',
  }
  const currentRoleLabel = roleLabel[user?.role ?? ''] ?? user?.role ?? '—'
  const roleBadgeColor =
    user?.role === 'admin'
      ? 'bg-emerald-100 text-emerald-800'
      : user?.role === 'gerente'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-700'

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-70'
  const labelBase = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="perfil-title">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl bg-white shadow-xl ring-1 ring-gray-200/80 overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: avatar + título + função */}
        <div className="bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--accent)] px-6 pt-6 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-inner backdrop-blur">
                {(formData.nome || user?.nome || '?').trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 id="perfil-title" className="text-lg font-bold text-white tracking-tight truncate">
                  Meu Perfil
                </h2>
                <span className={`mt-1.5 inline-block rounded-lg px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor}`}>
                  {currentRoleLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/90 transition hover:bg-white/20 hover:text-white"
              aria-label="Fechar"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-gray-50/80">
              <LoadingPadrao />
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-5">
              <div>
                <label className={labelBase} htmlFor="perfil-nome">Nome</label>
                <input
                  id="perfil-nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  className={inputBase}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className={labelBase} htmlFor="perfil-email">E-mail</label>
                <input
                  id="perfil-email"
                  type="email"
                  value={formData.email}
                  className={inputBase}
                  placeholder="seu@email.com"
                  disabled
                  readOnly
                />
                <p className="mt-1.5 text-xs text-gray-500">O e-mail não pode ser alterado.</p>
              </div>

              <div>
                <label className={labelBase} htmlFor="perfil-telefone">Telefone</label>
                <input
                  id="perfil-telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleTelefoneChange(e.target.value)}
                  className={inputBase}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label className={labelBase} htmlFor="perfil-cargo">Cargo</label>
                <input
                  id="perfil-cargo"
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cargo: e.target.value }))}
                  className={inputBase}
                  placeholder="Ex: Analista, CEO"
                  autoComplete="organization-title"
                />
                <p className="mt-1.5 text-xs text-gray-500">Título ou função na empresa (opcional).</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50/30">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
