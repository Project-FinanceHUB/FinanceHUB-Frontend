'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SolicitacaoModal from '@/components/SolicitacaoModal'
import SemEmpresaModal from '@/components/SemEmpresaModal'
import ConfiguracoesModal from '@/components/ConfiguracoesModal'
import NotificacoesDropdown from '@/components/NotificacoesDropdown'
import UserAvatarDropdown from '@/components/UserAvatarDropdown'
import PerfilModal from '@/components/PerfilModal'
import Footer from '@/components/Footer'
import { useDashboard } from '@/context/DashboardContext'
import { useSuporte } from '@/context/SuporteContext'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/context/ToastContext'
import FullScreenLoading from '@/components/FullScreenLoading'
import type { CompanyFormData } from '@/types/company'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function Icon({ name, className }: { name: string; className?: string }) {
  const cls = cn('w-5 h-5', className)
  switch (name) {
    case 'dashboard':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" fill="currentColor" />
        </svg>
      )
    case 'bill':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1V3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 8h7M8.5 11h7M8.5 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 18h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'bell':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" fill="currentColor" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6H10l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.6 13a7.97 7.97 0 0 0-.1 1c0 .34.03.67.1 1L3.6 16.6l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4.2l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4L19.4 15Z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'menu':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'lancamentos':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'historico':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'suporte':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'companies':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'faq':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return <span className={cls} aria-hidden="true" />
  }
}

function SidebarItem({
  icon,
  label,
  href,
  onClick,
  active,
  isCollapsed,
  onMobileClick,
}: {
  icon: string
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  isCollapsed?: boolean
  onMobileClick?: () => void
}) {
  const baseClass = cn(
    'w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative group',
    active 
      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
      : 'text-white/85 hover:text-white hover:bg-white/10 hover:shadow-md',
    isCollapsed ? 'justify-center' : 'gap-3'
  )
  const content = (
    <>
      <span className={cn('flex-shrink-0 transition-transform', active ? 'opacity-100 scale-110' : 'opacity-90 group-hover:scale-110')}>
        <Icon name={icon} />
      </span>
      {!isCollapsed && <span className="truncate font-medium">{label}</span>}
      {isCollapsed && (
        <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl font-medium">
          {label}
        </span>
      )}
      {active && !isCollapsed && (
        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
      )}
    </>
  )
  if (href) {
    return (
      <Link
        href={href}
        onClick={onMobileClick}
        className={baseClass}
        title={isCollapsed ? label : undefined}
        scroll={false}
      >
        {content}
      </Link>
    )
  }
  const handleClick = () => {
    onClick?.()
    onMobileClick?.()
  }
  return (
    <button type="button" onClick={handleClick} className={baseClass} title={isCollapsed ? label : undefined}>
      {content}
    </button>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { companies, setCompanies, addSolicitacao, companiesModalOpen, setCompaniesModalOpen, loading: contextLoading } = useDashboard()
  const { mensagens } = useSuporte()
  const { user, isLoading: authLoading } = useAuth()
  const { canAccessSettings } = usePermissions()
  const toast = useToast()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSolicitacaoModalOpen, setIsSolicitacaoModalOpen] = useState(false)
  const [isSemEmpresaModalOpen, setIsSemEmpresaModalOpen] = useState(false)
  const [isNotificacoesOpen, setIsNotificacoesOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const mensagensNaoLidas = mensagens.filter((m) => !m.lida && m.direcao === 'recebida').length

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleNotificacaoClick = () => {
    setIsNotificacoesOpen(!isNotificacoesOpen)
    setIsUserMenuOpen(false)
  }

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
    setIsNotificacoesOpen(false)
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            'flex flex-col fixed inset-y-0 bg-gradient-to-b from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] text-white transition-all duration-300 z-50 overflow-x-hidden shadow-2xl',
            'w-72',
            isMobileMenuOpen ? 'translate-x-0 rounded-r-2xl' : '-translate-x-full',
            'md:translate-x-0 md:rounded-r-2xl',
            isSidebarCollapsed ? 'md:w-20' : 'md:w-72'
          )}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className={cn('relative h-20 flex items-center border-b border-white/10 transition-all duration-300', isSidebarCollapsed ? 'md:px-3 md:justify-center px-6 gap-3' : 'px-6 gap-3')}>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 flex-shrink-0 overflow-hidden shadow-lg">
              <Image src="/logo.png" alt="FinanceHub Logo" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <div className="leading-tight">
                <div className="font-bold text-lg">FinanceHub</div>
                <div className="text-xs text-white/80 font-medium">Painel do Cliente</div>
              </div>
            )}
          </div>

          <div className={cn('relative transition-all duration-300', isSidebarCollapsed ? 'md:p-2 p-4' : 'p-4')}>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                if (companies.length === 0) {
                  setIsSemEmpresaModalOpen(true)
                } else {
                  setIsSolicitacaoModalOpen(true)
                }
              }}
              className={cn(
                'w-full inline-flex items-center rounded-xl bg-white text-[var(--primary)] font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative group min-h-[48px] touch-manipulation',
                isSidebarCollapsed ? 'md:justify-center md:px-2 md:gap-0 gap-2 px-4 py-3' : 'justify-center gap-2 px-4 py-3.5'
              )}
              title={isSidebarCollapsed ? 'Abrir nova solicitação' : undefined}
              aria-label="Abrir nova solicitação"
            >
              <Icon name="plus" className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Abrir nova solicitação</span>}
              {isSidebarCollapsed && (
                <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl">
                  Abrir nova solicitação
                </span>
              )}
            </button>
          </div>

          <nav className={cn('relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300', isSidebarCollapsed ? 'md:px-2 px-4' : 'px-4')}>
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Gestão Financeira
                </div>
              )}
              <SidebarItem icon="dashboard" label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem icon="historico" label="Histórico" href="/dashboard/historico" active={pathname === '/dashboard/historico'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem icon="companies" label="Gerenciar empresas" href="/dashboard/empresas" active={pathname === '/dashboard/empresas'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem icon="faq" label="Perguntas frequentes" href="/dashboard/faq" active={pathname === '/dashboard/faq'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className={cn('mt-auto pt-6 pb-6 space-y-2', !isSidebarCollapsed && 'border-t border-white/10')}>
              {!isSidebarCollapsed && (
                <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Conta e Suporte
                </div>
              )}
              <SidebarItem icon="suporte" label="Suporte" href="/dashboard/suporte" active={pathname === '/dashboard/suporte'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
              {canAccessSettings && (
                <SidebarItem icon="settings" label="Configurações" href="/dashboard/configuracoes" active={pathname === '/dashboard/configuracoes'} isCollapsed={isSidebarCollapsed} onMobileClick={() => setIsMobileMenuOpen(false)} />
              )}
            </div>
          </nav>
        </aside>

        <main className={cn('flex-1 transition-all duration-300 w-full flex flex-col', isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72')}>
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden md:flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[var(--primary)]/30 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
                title={isSidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
              >
                <Icon name="menu" className="w-5 h-5 text-gray-700" />
              </button>

              <div className="md:hidden flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm" 
                  aria-label="Menu"
                >
                  <Icon name="menu" className="w-5 h-5 text-gray-700" />
                </button>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center overflow-hidden shadow-lg">
                  <Image src="/logo.png" alt="FinanceHub Logo" width={40} height={40} className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Notificações */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleNotificacaoClick}
                    className={cn(
                      'relative inline-flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md',
                      isNotificacoesOpen
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-[var(--primary)]/30'
                    )}
                    aria-label="Notificações do suporte"
                    title={isMounted && mensagensNaoLidas > 0 ? `${mensagensNaoLidas} mensagem(ns) não lida(s)` : 'Notificações'}
                  >
                    <span className="text-gray-600">
                      <Icon name="bell" />
                    </span>
                    {mensagensNaoLidas > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
                        {mensagensNaoLidas}
                      </span>
                    )}
                  </button>
                  <NotificacoesDropdown isOpen={isNotificacoesOpen} onClose={() => setIsNotificacoesOpen(false)} />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleUserMenuClick}
                    className={cn(
                      'inline-flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-all duration-200 shadow-sm hover:shadow-md',
                      isUserMenuOpen
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-[var(--primary)]/30'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-semibold text-sm shadow-lg ring-2 ring-white">
                      {authLoading ? '…' : (user?.nome?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div className="hidden sm:block text-left leading-tight">
                      <div className="text-sm font-semibold text-gray-900">{authLoading ? '…' : (user?.nome || 'Usuário')}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        {authLoading ? '…' : (user?.role === 'admin' ? 'Administrador' : user?.role === 'gerente' ? 'Gerente' : user?.role === 'usuario' ? 'Usuário' : 'Cliente')}
                      </div>
                    </div>
                    <svg
                      className={cn(
                        'w-4 h-4 text-gray-400 transition-transform duration-200',
                        isUserMenuOpen && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <UserAvatarDropdown 
                    isOpen={isUserMenuOpen} 
                    onClose={() => setIsUserMenuOpen(false)}
                    onOpenPerfil={() => {
                      setIsPerfilModalOpen(true)
                      setIsUserMenuOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {children}
            {contextLoading && <FullScreenLoading />}
          </div>

          <Footer />
        </main>
      </div>

      <SolicitacaoModal
        isOpen={isSolicitacaoModalOpen}
        solicitacao={undefined}
        companies={companies}
        onClose={() => setIsSolicitacaoModalOpen(false)}
        onSubmit={async (formData) => {
          try {
            await addSolicitacao(formData)
            setIsSolicitacaoModalOpen(false)
            toast.success('Solicitação criada com sucesso!')
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Erro ao criar solicitação')
            throw e
          }
        }}
      />
      <SemEmpresaModal
        isOpen={isSemEmpresaModalOpen}
        onClose={() => setIsSemEmpresaModalOpen(false)}
      />

      <ConfiguracoesModal />
      <PerfilModal isOpen={isPerfilModalOpen} onClose={() => setIsPerfilModalOpen(false)} />
    </div>
  )
}
