'use client'

import { useEffect, useState } from 'react'
import type { Solicitacao } from '@/types/solicitacao'
import type { Mensagem } from '@/types/suporte'
import { useSuporte } from '@/context/SuporteContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import apiConfig from '@/lib/api'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'gray' | 'green' | 'amber' | 'blue' | 'red' | 'purple' | 'indigo' | 'emerald' | 'slate' }) {
  const tones: Record<typeof tone, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  }

  return (
    <span className={cn('inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold border shadow-sm', tones[tone])}>
      {children}
    </span>
  )
}

type SolicitacaoDetalhesModalProps = {
  isOpen: boolean
  solicitacao: Solicitacao | null
  onClose: () => void
  /** Chamado quando o usuário solicita excluir a solicitação (abre o modal de confirmação no pai). */
  onRequestDelete?: (solicitacao: Solicitacao) => void
}

function formatarDataHora(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  if (d.toDateString() === hoje.toDateString()) {
    return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (d.toDateString() === ontem.toDateString()) {
    return `Ontem às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatarData(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SolicitacaoDetalhesModal({ isOpen, solicitacao, onClose, onRequestDelete }: SolicitacaoDetalhesModalProps) {
  const { mensagens } = useSuporte()
  const { token } = useAuth()
  const toast = useToast()
  const [mensagensSolicitacao, setMensagensSolicitacao] = useState<Mensagem[]>([])
  const [arquivoCarregando, setArquivoCarregando] = useState<'boleto' | 'nota-fiscal' | null>(null)

  useEffect(() => {
    if (isOpen && solicitacao) {
      document.body.style.overflow = 'hidden'
      // Filtrar mensagens relacionadas a esta solicitação
      const mensagensRelacionadas = mensagens.filter(
        (m) => m.solicitacaoId === solicitacao.id
      )
      // Ordenar por data (mais recente primeiro)
      const ordenadas = [...mensagensRelacionadas].sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      )
      setMensagensSolicitacao(ordenadas)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, solicitacao, mensagens])

  if (!isOpen || !solicitacao) return null

  const temBoleto = Boolean(solicitacao.boletoPath || (solicitacao.boleto && typeof solicitacao.boleto === 'string'))
  const temNotaFiscal = Boolean(solicitacao.notaFiscalPath || (solicitacao.notaFiscal && typeof solicitacao.notaFiscal === 'string'))
  const temArquivos = temBoleto || temNotaFiscal

  const abrirArquivo = async (tipo: 'boleto' | 'nota-fiscal', acao: 'visualizar' | 'baixar') => {
    if (!token || !solicitacao?.id) return
    setArquivoCarregando(tipo)
    try {
      const url = `${apiConfig.baseURL}/api/solicitacoes/${solicitacao.id}/arquivo/${tipo}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = typeof body?.error === 'string' ? body.error : (res.status === 404 ? 'Arquivo não encontrado' : 'Erro ao carregar o arquivo')
        throw new Error(msg)
      }
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const nomeArquivo = tipo === 'boleto' ? `boleto-${solicitacao.numero}.pdf` : `nota-fiscal-${solicitacao.numero}.pdf`

      if (acao === 'baixar') {
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = nomeArquivo
        a.click()
        URL.revokeObjectURL(objectUrl)
        toast?.success?.('Download iniciado')
      } else {
        const novaJanela = window.open(objectUrl, '_blank', 'noopener,noreferrer')
        if (!novaJanela) {
          URL.revokeObjectURL(objectUrl)
          const a = document.createElement('a')
          a.href = objectUrl
          a.download = nomeArquivo
          a.click()
          URL.revokeObjectURL(objectUrl)
          toast?.info?.('Abra o arquivo baixado para visualizar (pop-up foi bloqueado)')
        } else {
          setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível abrir o arquivo'
      toast?.error?.(msg)
    } finally {
      setArquivoCarregando(null)
    }
  }

  const statusTone: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'purple' | 'indigo' | 'emerald' | 'red' | 'slate'> = {
    aberto: 'green',
    pendente: 'amber',
    em_andamento: 'purple',
    aguardando_validacao: 'indigo',
    aprovado: 'emerald',
    rejeitado: 'red',
    concluido: 'green',
    cancelado: 'gray',
    fechado: 'slate',
  }

  const statusLabel: Record<string, string> = {
    aberto: 'Aberto',
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    aguardando_validacao: 'Aguardando Validação',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    fechado: 'Fechado',
  }

  const prioridadeLabel: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
  }

  const prioridadeTone: Record<string, 'green' | 'amber' | 'red'> = {
    baixa: 'green',
    media: 'amber',
    alta: 'red',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7Z" />
                <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes da Solicitação #{solicitacao.numero}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Visualize o progresso e histórico completo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <div className="space-y-6">
            {/* Informações Principais */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informações da Solicitação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Razão Social</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{solicitacao.titulo}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CNPJ</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">{solicitacao.origem}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <Badge tone={statusTone[solicitacao.status] || 'gray'}>
                      {statusLabel[solicitacao.status] || solicitacao.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridade</label>
                  <div className="mt-1">
                    <Badge tone={prioridadeTone[solicitacao.prioridade] || 'gray'}>
                      {prioridadeLabel[solicitacao.prioridade] || solicitacao.prioridade}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estágio</label>
                  <p className="text-sm text-gray-900 mt-1">{solicitacao.estagio}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data de Criação</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {solicitacao.dataCriacao ? formatarDataHora(solicitacao.dataCriacao) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status de Visualização e Resposta */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Status de Comunicação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    solicitacao.visualizado 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visualizado</p>
                    <p className={`text-sm font-medium mt-0.5 ${
                      solicitacao.visualizado ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {solicitacao.visualizado ? 'Sim' : 'Não'}
                    </p>
                    {solicitacao.visualizadoEm && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatarDataHora(solicitacao.visualizadoEm)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    solicitacao.respondido 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Respondido</p>
                    <p className={`text-sm font-medium mt-0.5 ${
                      solicitacao.respondido ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {solicitacao.respondido ? 'Sim' : 'Não'}
                    </p>
                    {solicitacao.respondidoEm && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatarDataHora(solicitacao.respondidoEm)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Arquivos anexados na abertura da solicitação */}
            {temArquivos && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Arquivos anexados</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Documentos enviados na abertura desta solicitação</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {temBoleto && (
                    <div className="group relative rounded-xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 hover:border-amber-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200/80 transition-colors">
                          <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l2 2v16l-2 1-2 1-2-1-2 1-2-1-2 1-2-1V3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 8h7M8.5 12h7M8.5 16h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Boleto</p>
                          <p className="text-xs text-gray-500 mt-0.5">Documento de pagamento</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => abrirArquivo('boleto', 'visualizar')}
                              disabled={arquivoCarregando !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {arquivoCarregando === 'boleto' ? 'Abrindo...' : 'Visualizar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirArquivo('boleto', 'baixar')}
                              disabled={arquivoCarregando !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white text-amber-800 px-3 py-1.5 text-xs font-semibold hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Baixar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {temNotaFiscal && (
                    <div className="group relative rounded-xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 hover:border-sky-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-200/80 transition-colors">
                          <svg className="w-6 h-6 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Nota fiscal</p>
                          <p className="text-xs text-gray-500 mt-0.5">Comprovante fiscal</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => abrirArquivo('nota-fiscal', 'visualizar')}
                              disabled={arquivoCarregando !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {arquivoCarregando === 'nota-fiscal' ? 'Abrindo...' : 'Visualizar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirArquivo('nota-fiscal', 'baixar')}
                              disabled={arquivoCarregando !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white text-sky-800 px-3 py-1.5 text-xs font-semibold hover:bg-sky-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Baixar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensagem Inicial */}
            {solicitacao.mensagem && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Mensagem Inicial
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {solicitacao.mensagem}
                  </p>
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    Enviada em {solicitacao.dataCriacao ? formatarDataHora(solicitacao.dataCriacao) : '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Histórico de Mensagens */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico de Comunicação
                {mensagensSolicitacao.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
                    {mensagensSolicitacao.length}
                  </span>
                )}
              </h3>
              {mensagensSolicitacao.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-xs text-gray-500 mt-1">O histórico de comunicação aparecerá aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mensagensSolicitacao.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`rounded-lg border p-4 ${
                        mensagem.direcao === 'recebida'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            mensagem.direcao === 'recebida'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          }`}>
                            {mensagem.direcao === 'recebida' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{mensagem.remetente}</p>
                            <p className="text-xs text-gray-500">{mensagem.assunto}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatarDataHora(mensagem.dataHora)}</p>
                          {mensagem.lida && (
                            <div className="flex items-center gap-1 mt-1 text-green-600">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">Lida</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-2">
                        {mensagem.conteudo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Descrição (se houver) */}
            {solicitacao.descricao && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descrição Adicional
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {solicitacao.descricao}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <div>
            {onRequestDelete && (
              <button
                type="button"
                onClick={() => onRequestDelete(solicitacao)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Excluir solicitação
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
