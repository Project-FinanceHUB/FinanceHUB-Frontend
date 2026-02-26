'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import SolicitacaoDetalhesModal from '@/components/SolicitacaoDetalhesModal'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'
import Spinner from '@/components/Spinner'
import type { Solicitacao } from '@/types/solicitacao'
import type { HistoricoTipo } from '@/types/historico'
import * as solicitacoesAPI from '@/lib/api/solicitacoes'

/** Status de solicitação conforme definido no backend (FinanceHUB-Back) */
type SolicitacaoStatusBackend = 'aberto' | 'pendente' | 'aguardando_validacao' | 'fechado'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type HistoricoRow = {
  id: string
  tipo: HistoricoTipo | 'solicitacao'
  protocolo: string
  data: string
  horario: string
  /** Status da solicitação (valores do backend) */
  status: string
  titulo: string
  descricao?: string
  origem?: string
  solicitacao?: Solicitacao
}

const TIPOS: { value: HistoricoTipo | 'solicitacao'; label: string }[] = [
  { value: 'solicitacao', label: 'Solicitação' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'acao_sistema', label: 'Ação do Sistema' },
]

/** Opções de status conforme backend (src/types/solicitacao.ts) */
const STATUS_OPTS: { value: SolicitacaoStatusBackend; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aguardando_validacao', label: 'Aguardando validação' },
  { value: 'fechado', label: 'Fechado' },
]

function solicitacaoToRow(s: Solicitacao): HistoricoRow {
  const dataHora = s.dataCriacao ? new Date(s.dataCriacao) : new Date()
  const data = dataHora.toISOString().slice(0, 10)
  const horario = dataHora.toTimeString().slice(0, 5)
  return {
    id: s.id,
    tipo: 'solicitacao',
    protocolo: s.numero,
    data,
    horario,
    status: s.status ?? 'aberto',
    titulo: s.titulo || `Solicitação ${s.numero}`,
    descricao: s.descricao || s.estagio || undefined,
    origem: s.origem,
    solicitacao: s,
  }
}

function formatarData(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function getStatusLabel(status: string): string {
  return STATUS_OPTS.find((s) => s.value === status)?.label ?? status.replace(/_/g, ' ')
}

function BadgeStatus({ status }: { status: string }) {
  const tones: Record<string, string> = {
    aberto: 'bg-sky-50/90 text-sky-700 border border-sky-200/60',
    pendente: 'bg-amber-50/90 text-amber-800 border border-amber-200/60',
    aguardando_validacao: 'bg-purple-50/90 text-purple-700 border border-purple-200/60',
    fechado: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/60',
  }
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold tracking-tight', tones[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200/60')}>
      {getStatusLabel(status)}
    </span>
  )
}

function BadgeTipo({ tipo }: { tipo: HistoricoRow['tipo'] }) {
  const tones: Record<string, string> = {
    solicitacao: 'bg-[var(--secondary)]/80 text-[var(--primary)] border border-[var(--primary)]/30',
    boleto: 'bg-amber-50/90 text-amber-800 border border-amber-200/60',
    nota_fiscal: 'bg-blue-50/90 text-blue-700 border border-blue-200/60',
    acao_sistema: 'bg-slate-100/90 text-slate-600 border border-slate-200/60',
  }
  const opt = TIPOS.find((t) => t.value === tipo)
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold tracking-tight', tones[tipo] ?? 'bg-slate-100 text-slate-600 border border-slate-200/60')}>
      {opt?.label ?? tipo}
    </span>
  )
}

export default function HistoricoPage() {
  const { token } = useAuth()
  const { solicitacoes, setSolicitacoes } = useDashboard()

  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<HistoricoTipo | 'solicitacao' | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<SolicitacaoStatusBackend | 'todos'>('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [solicitacaoDetalhes, setSolicitacaoDetalhes] = useState<Solicitacao | null>(null)
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<HistoricoRow | null>(null)

  const registros = useMemo(() => solicitacoes.map(solicitacaoToRow), [solicitacoes])

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = useMemo(() => registros.filter((r) => {
    if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false
    if (filtroStatus !== 'todos' && r.status !== filtroStatus) return false
    if (filtroBusca.trim()) {
      const q = filtroBusca.toLowerCase()
      return (
        r.protocolo.toLowerCase().includes(q) ||
        r.titulo.toLowerCase().includes(q) ||
        (r.descricao ?? '').toLowerCase().includes(q) ||
        (r.origem ?? '').toLowerCase().includes(q)
      )
    }
    return true
  }), [registros, filtroTipo, filtroStatus, filtroBusca])

  const handleRequestDelete = (r: HistoricoRow) => {
    setPendingDeleteRecord(r)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteRecord || !token) return
    const id = pendingDeleteRecord.id
    setDeletingId(id)
    setPendingDeleteRecord(null)
    try {
      await solicitacoesAPI.deleteSolicitacao(id, token)
      setSolicitacoes((prev) => prev.filter((s) => s.id !== id))
      if (solicitacaoDetalhes?.id === id) setSolicitacaoDetalhes(null)
    } catch (e) {
      console.error(e)
      if (typeof window !== 'undefined') window.alert('Não foi possível excluir. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleVerDetalhes = (r: HistoricoRow) => {
    if (r.solicitacao) setSolicitacaoDetalhes(r.solicitacao)
  }

  const handleCloseModal = () => {
    setSolicitacaoDetalhes(null)
  }

  const inputBase = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-shadow duration-200'

  return (
    <div className="px-4 sm:px-6 py-8 w-full max-w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Histórico</h1>
            <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
              Boletos e notas fiscais já enviados: protocolos, datas, status e registro completo de ações.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 md:mb-8 rounded-2xl bg-white border border-gray-200/80 p-4 md:p-6 shadow-xl shadow-gray-200/50 w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Campo de Busca */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por protocolo, título, descrição..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className={cn(inputBase, 'pl-11 pr-4 py-2.5')}
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-2">
            {/* Filtro Tipo */}
            <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as HistoricoTipo | 'solicitacao' | 'todos')}
                className={cn(inputBase, 'pl-11 pr-10 py-2.5 text-sm appearance-none cursor-pointer bg-white')}
              >
                <option value="todos">Todos os tipos</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Filtro Status */}
            <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as SolicitacaoStatusBackend | 'todos')}
                className={cn(inputBase, 'pl-11 pr-10 py-2.5 text-sm appearance-none cursor-pointer bg-white')}
              >
                <option value="todos">Todos os status</option>
                {STATUS_OPTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroBusca.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroTipo('todos' as const)
                  setFiltroStatus('todos')
                  setFiltroBusca('')
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroBusca.trim()) && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">Filtros ativos:</span>
              {filtroBusca.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Busca: "{filtroBusca}"
                  <button
                    type="button"
                    onClick={() => setFiltroBusca('')}
                    className="hover:text-blue-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filtroTipo !== 'todos' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Tipo: {TIPOS.find(t => t.value === filtroTipo)?.label}
                  <button
                    type="button"
                    onClick={() => setFiltroTipo('todos')}
                    className="hover:text-amber-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filtroStatus !== 'todos' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Status: {getStatusLabel(filtroStatus)}
                  <button
                    type="button"
                    onClick={() => setFiltroStatus('todos')}
                    className="hover:text-emerald-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Layout principal: Lista */}
      <div className="w-full max-w-full">
        <div className="w-full max-w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Registros {mounted ? <span className="text-[var(--primary)]">({filtered.length})</span> : ''}
            </h2>
          </div>
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto w-full max-w-full rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
              {!mounted ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                    <Spinner size="md" className="border-white border-t-transparent" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Carregando...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner border border-gray-100">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-700">Nenhuma solicitação encontrada.</p>
                  <p className="text-sm text-gray-500 mt-1">Ajuste os filtros ou abra uma solicitação pelo Dashboard.</p>
                </div>
              ) : (
                <>
                  {/* Cards para Mobile e Tablet */}
                  <div className="lg:hidden space-y-3 w-full p-4">
                    {filtered.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-200 w-full p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 truncate">{r.titulo}</div>
                            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                              <BadgeTipo tipo={r.tipo} />
                              <BadgeStatus status={r.status} />
                              <span className="text-xs text-slate-500 font-mono">{r.protocolo}</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                              {formatarData(r.data)} às {r.horario}
                            </div>
                            {r.descricao && (
                              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{r.descricao}</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleVerDetalhes(r) }}
                              className="w-9 h-9 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors duration-200"
                              title="Ver detalhes"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deletingId !== r.id && handleRequestDelete(r) }}
                              disabled={deletingId === r.id}
                              className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 min-w-[44px] min-h-[44px]"
                              title="Excluir"
                            >
                              {deletingId === r.id ? (
                                <Spinner size="sm" className="border-red-500 border-t-transparent" />
                              ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tabela para Desktop (acima de 1024px) */}
                  <div className="hidden lg:block overflow-x-auto w-full max-w-full">
                    <table className="w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Título
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Tipo / Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Protocolo
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Data / Horário
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-5 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider w-28">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filtered.map((r) => (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-50/70 transition-colors duration-150"
                          >
                            <td className="px-5 py-3.5">
                              <div className="text-sm font-semibold text-slate-900">{r.titulo}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <BadgeTipo tipo={r.tipo} />
                                <BadgeStatus status={r.status} />
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-slate-500 font-mono">{r.protocolo}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-sm text-slate-900">
                                {formatarData(r.data)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {r.horario}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-sm text-slate-600 max-w-xs truncate" title={r.descricao || undefined}>
                                {r.descricao || '—'}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleVerDetalhes(r) }}
                                  className="w-9 h-9 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors duration-200"
                                  title="Ver detalhes"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); deletingId !== r.id && handleRequestDelete(r) }}
                                  disabled={deletingId === r.id}
                                  className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 min-w-[44px] min-h-[44px]"
                                  title="Excluir"
                                >
                                  {deletingId === r.id ? (
                                    <Spinner size="sm" className="border-red-500 border-t-transparent" />
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Solicitação */}
      <SolicitacaoDetalhesModal
        isOpen={!!solicitacaoDetalhes}
        solicitacao={solicitacaoDetalhes}
        onClose={handleCloseModal}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={!!pendingDeleteRecord}
        title="Confirmar exclusão"
        message="Esta ação é irreversível e não pode ser desfeita."
        itemDescription={pendingDeleteRecord ? `Solicitação #${pendingDeleteRecord.protocolo} (${pendingDeleteRecord.titulo})` : undefined}
        onClose={() => setPendingDeleteRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
