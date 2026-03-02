'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SolicitacaoModal from '@/components/SolicitacaoModal'
import SemEmpresaModal from '@/components/SemEmpresaModal'
import BoletoPaymentsChart from '@/components/BoletoPaymentsChart'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { useToast } from '@/context/ToastContext'
import { useSuporte } from '@/context/SuporteContext'
import { Skeleton, SkeletonCard } from '@/components/Skeleton'
import Spinner from '@/components/Spinner'
import type { Solicitacao, SolicitacaoFormData } from '@/types/solicitacao'
import type { Company } from '@/types/company'

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
    case 'solicitacao':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'invoice':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h10l2 2v16l-2-1-2 1-2-1-2 1-2-1-2 1-2-1V5l2-2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 8h6M9 12h6M9 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
    case 'inbox':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h16v12h-4l-2 3h-4l-2-3H4V4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'bell':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6H10l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.6 13a7.97 7.97 0 0 0-.1 1c0 .34.03.67.1 1L3.6 16.6l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4.2l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4L19.4 15Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
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
      default:
      return <span className={cls} aria-hidden="true" />
    }
  }

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const { companies, solicitacoes, setSolicitacoes, addSolicitacao, loading } = useDashboard()
  const toast = useToast()
  const { mensagens } = useSuporte()
  const [mounted, setMounted] = useState(false)
  const [isSolicitacaoModalOpen, setIsSolicitacaoModalOpen] = useState(false)
  const [isSemEmpresaModalOpen, setIsSemEmpresaModalOpen] = useState(false)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Abrir modal de nova solicitação ou edição via query params (ex.: /dashboard?nova=solicitacao ou ?editar=id)
  const novaParam = searchParams.get('nova')
  const editarParam = searchParams.get('editar')
  useEffect(() => {
    if (novaParam === 'solicitacao') {
      window.history.replaceState({}, '', '/dashboard')
      if (companies.length === 0) {
        setIsSemEmpresaModalOpen(true)
      } else {
        setSelectedSolicitacao(undefined)
        setIsSolicitacaoModalOpen(true)
      }
    } else if (editarParam && solicitacoes.length > 0) {
      const sol = solicitacoes.find((s) => s.id === editarParam)
      if (sol) {
        setSelectedSolicitacao(sol)
        setIsSolicitacaoModalOpen(true)
        window.history.replaceState({}, '', '/dashboard')
      }
    }
  }, [novaParam, editarParam, solicitacoes, companies.length])

  const handleCreateSolicitacao = async (formData: SolicitacaoFormData) => {
    try {
      await addSolicitacao(formData)
      toast.success('Solicitação criada com sucesso!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar solicitação')
      throw e
    }
  }

  const handleUpdateSolicitacao = async (formData: SolicitacaoFormData) => {
    if (!selectedSolicitacao || !token) return
    try {
      const { updateSolicitacao } = await import('@/lib/api/solicitacoes')
      const updated = await updateSolicitacao(selectedSolicitacao.id, formData, token)
      // Garantir que o mês editado reflita no gráfico (mesmo se a API não retornar mes)
      const comMes = {
        ...updated,
        mes:
          updated.mes != null && updated.mes >= 1 && updated.mes <= 12
            ? updated.mes
            : (formData.mes ?? selectedSolicitacao.mes ?? 12),
      }
      setSolicitacoes((prev) =>
        prev.map((sol) => (sol.id === selectedSolicitacao.id ? comMes : sol))
      )
      setSelectedSolicitacao(undefined)
      toast.success('Solicitação atualizada com sucesso!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar solicitação')
      throw e
    }
  }

  const openCreateModal = () => {
    if (companies.length === 0) {
      setIsSemEmpresaModalOpen(true)
      return
    }
    setSelectedSolicitacao(undefined)
    setIsSolicitacaoModalOpen(true)
  }

  const handleSolicitacaoSubmit = (formData: SolicitacaoFormData) => {
    if (selectedSolicitacao) return handleUpdateSolicitacao(formData)
    return handleCreateSolicitacao(formData)
  }

  const totals = useMemo(() => {
    const comBoleto = solicitacoes.filter(
      (s) => s.boletoPath || (s.boleto && typeof s.boleto === 'string')
    )
    const boletosComBoleto = comBoleto.length
    const boletosEmAberto = comBoleto.filter(
      (s) =>
        s.status !== 'concluido' &&
        s.status !== 'fechado' &&
        s.status !== 'aprovado' &&
        s.status !== 'cancelado' &&
        s.status !== 'rejeitado'
    ).length

    const solicitacoesPendentes = solicitacoes.filter(
      (t) =>
        t.status === 'pendente' ||
        t.status === 'aguardando_validacao' ||
        t.status === 'em_andamento'
    ).length

    const mensagensNaoLidas = mensagens.filter(
      (m) => !m.lida && m.direcao === 'recebida'
    ).length

    const totalSolicitacoes = solicitacoes.length

    return {
      boletosEmAberto,
      boletosComBoleto,
      solicitacoesPendentes,
      mensagensNaoLidas,
      totalSolicitacoes,
    }
  }, [solicitacoes, mensagens])

  if (!mounted || loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <Spinner size="md" className="border-white border-t-transparent" />
          </div>
          <p className="text-sm font-medium text-slate-600">Carregando...</p>
        </div>
        {/* Headline Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <Skeleton variant="text" height={36} width="40%" className="mb-2" />
            <Skeleton variant="text" height={20} width="60%" />
          </div>
          <Skeleton variant="rounded" height={44} width={180} />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {/* Headline + Quick actions */}
            <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
                  <Icon name="solicitacao" className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Solicitações</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Visão centralizada de suporte, comunicação e pendências financeiras.</p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="group relative rounded-2xl bg-white border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[var(--primary)]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Boletos em aberto</div>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{totals.boletosEmAberto}</div>
                    {totals.boletosComBoleto > 0 && (
                      <p className="mt-1 text-xs text-emerald-700 font-semibold">
                        de {totals.boletosComBoleto} com boleto registrado
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="bill" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Considera solicitações com boleto anexado que ainda não foram concluídas.
                </div>
              </div>
              <div className="group relative rounded-2xl bg-white border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[var(--primary)]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Solicitações pendentes</div>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{totals.solicitacoesPendentes}</div>
                    {totals.totalSolicitacoes > 0 && (
                      <p className="mt-1 text-xs text-amber-700 font-semibold">
                        de {totals.totalSolicitacoes} solicitações no período
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="solicitacao" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Inclui solicitações em andamento, pendentes ou aguardando validação.
                </div>
              </div>
              <div className="group relative rounded-2xl bg-white border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[var(--primary)]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Mensagens não lidas</div>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{totals.mensagensNaoLidas}</div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 text-sky-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="inbox" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Mensagens recebidas do suporte que ainda não foram lidas no painel.
                </div>
              </div>
            </div>

            {/* Gráfico de pagamentos de boletos — atualiza ao enviar nova solicitação com boleto */}
            <div className="mt-6">
              <BoletoPaymentsChart solicitacoes={solicitacoes} />
            </div>

            {/* Link para Histórico — lista completa de solicitações */}
            <div className="mt-8 text-center">
              <Link
                href="/dashboard/historico"
                className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-[var(--primary)]/30 text-[var(--primary)] font-semibold px-6 py-3 shadow-lg hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-all duration-200"
              >
                <Icon name="historico" className="w-5 h-5" />
                Ver todas as solicitações no Histórico
              </Link>
            </div>
          </div>

      {/* FAB: abrir nova solicitação no mobile */}
      <button
        type="button"
        onClick={openCreateModal}
        className="md:hidden fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl active:scale-95 transition-all duration-200"
        aria-label="Abrir nova solicitação"
      >
        <Icon name="plus" className="w-7 h-7" />
      </button>

      {/* Modais */}
      <SolicitacaoModal
        isOpen={isSolicitacaoModalOpen}
        solicitacao={selectedSolicitacao}
        companies={companies}
        onClose={() => {
          setIsSolicitacaoModalOpen(false)
          setSelectedSolicitacao(undefined)
        }}
        onSubmit={handleSolicitacaoSubmit}
      />

      <SemEmpresaModal
        isOpen={isSemEmpresaModalOpen}
        onClose={() => setIsSemEmpresaModalOpen(false)}
      />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
