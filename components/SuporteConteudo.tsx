'use client'

import { useState, useEffect } from 'react'
import { useSuporte } from '@/context/SuporteContext'
import { useDashboard } from '@/context/DashboardContext'
import { useAuth } from '@/context/AuthContext'
import type { MensagemFormData } from '@/types/suporte'
import type { Solicitacao } from '@/types/solicitacao'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const TABS = [
  { id: 'enviar', label: 'Enviar mensagem' },
  { id: 'solicitacoes', label: 'Solicitações' },
]

/** Status que consideram a solicitação "fechada" (não disponível para nova mensagem). */
const STATUS_FECHADOS = ['fechado', 'concluido', 'cancelado']

function BadgeStatus({ status }: { status: string }) {
  const labels: Record<string, string> = {
    aberto: 'Aberto',
    pendente: 'Pendente',
    aguardando_validacao: 'Aguardando validação',
    fechado: 'Fechado',
  }
  const tones: Record<string, string> = {
    aberto: 'bg-sky-50 text-sky-700',
    pendente: 'bg-amber-50 text-amber-800',
    aguardando_validacao: 'bg-purple-50 text-purple-700',
    fechado: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[status] ?? 'bg-gray-100')}>
      {labels[status] ?? status}
    </span>
  )
}

function BadgePrioridade({ p }: { p: string }) {
  const tones: Record<string, string> = {
    alta: 'bg-rose-50 text-rose-700',
    media: 'bg-amber-50 text-amber-800',
    baixa: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[p] ?? 'bg-gray-100')}>
      {p}
    </span>
  )
}

export default function SuporteConteudo() {
  const { addMensagem, suporteModalTab, setSuporteModalTab } = useSuporte()
  const { solicitacoes } = useDashboard()
  const { user } = useAuth()

  const remetenteNome = user?.nome || 'Você'
  const solicitacoesAbertas = solicitacoes.filter((s) => !STATUS_FECHADOS.includes(s.status))

  const [form, setForm] = useState<MensagemFormData>({
    solicitacaoId: undefined,
    direcao: 'enviada',
    assunto: '',
    conteudo: '',
    remetente: remetenteNome,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null)

  const solicitacaoValida = Boolean(form.solicitacaoId?.trim() && solicitacoesAbertas.some((s) => s.id === form.solicitacaoId))
  const camposHabilitados = solicitacaoValida

  useEffect(() => {
    if (suporteModalTab === 'historico' || suporteModalTab === 'inbox') setSuporteModalTab('enviar')
  }, [suporteModalTab, setSuporteModalTab])

  useEffect(() => {
    if (!solicitacaoValida) {
      setForm((f) => ({ ...f, assunto: '', conteudo: '' }))
    }
  }, [solicitacaoValida])

  const validate = () => {
    const err: Record<string, string> = {}
    if (!form.solicitacaoId?.trim() || !solicitacoesAbertas.some((s) => s.id === form.solicitacaoId)) {
      err.solicitacaoId = 'Selecione uma solicitação para enviar a mensagem.'
    }
    if (!form.assunto.trim()) err.assunto = 'Assunto é obrigatório'
    if (!form.conteudo.trim()) err.conteudo = 'Mensagem é obrigatória'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleEnviar = () => {
    if (!validate()) return
    addMensagem({ ...form, remetente: remetenteNome })
    setForm({ solicitacaoId: undefined, direcao: 'enviada', assunto: '', conteudo: '', remetente: remetenteNome })
    setErrors({})
  }

  const podeEnviar = solicitacaoValida && form.assunto.trim() && form.conteudo.trim()

  const inputBase = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-white border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40'
  const inputError = 'border-red-300'
  const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition'

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSuporteModalTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition',
              suporteModalTab === tab.id
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--secondary)]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {suporteModalTab === 'enviar' && (
          <div className="max-w-2xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Nova mensagem</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solicitação *</label>
              <select
                value={form.solicitacaoId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, solicitacaoId: e.target.value || undefined }))}
                disabled={solicitacoesAbertas.length === 0}
                className={cn(inputBase, solicitacoesAbertas.length === 0 && 'cursor-not-allowed bg-gray-100 opacity-80', errors.solicitacaoId && inputError)}
              >
                <option value="">
                  {solicitacoesAbertas.length === 0 ? 'Nenhuma solicitação' : '— Selecione uma solicitação —'}
                </option>
                {solicitacoesAbertas.map((t) => (
                  <option key={t.id} value={t.id}>#{t.numero} - {t.titulo}</option>
                ))}
              </select>
              {errors.solicitacaoId && <p className="mt-1 text-xs text-red-600">{errors.solicitacaoId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto *</label>
              <input
                value={form.assunto}
                onChange={(e) => setForm((f) => ({ ...f, assunto: e.target.value }))}
                disabled={!camposHabilitados}
                className={cn(inputBase, !camposHabilitados && 'cursor-not-allowed bg-gray-100 opacity-80', errors.assunto && inputError)}
                placeholder="Ex: Dúvida sobre boleto"
              />
              {errors.assunto && <p className="mt-1 text-xs text-red-600">{errors.assunto}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
              <textarea
                value={form.conteudo}
                onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                disabled={!camposHabilitados}
                className={cn(inputBase, 'min-h-[120px]', !camposHabilitados && 'cursor-not-allowed bg-gray-100 opacity-80', errors.conteudo && inputError)}
                placeholder="Digite sua mensagem..."
                rows={5}
              />
              {errors.conteudo && <p className="mt-1 text-xs text-red-600">{errors.conteudo}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleEnviar}
                disabled={!podeEnviar}
                className={cn(btnPrimary, !podeEnviar && 'opacity-60 cursor-not-allowed')}
              >
                Enviar mensagem
              </button>
            </div>
          </div>
        )}

        {suporteModalTab === 'solicitacoes' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Suas solicitações</h3>
            {solicitacoes.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">Nenhuma solicitação cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solicitacoes.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      'rounded-xl border p-4 cursor-pointer transition',
                      selectedSolicitacao?.id === t.id ? 'border-[var(--primary)] bg-[var(--secondary)]/40' : 'border-gray-200 hover:border-[var(--primary)]/50 hover:bg-gray-50'
                    )}
                    onClick={() => setSelectedSolicitacao(selectedSolicitacao?.id === t.id ? null : t)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold text-gray-900">#{t.numero} {t.titulo}</div>
                        <div className="text-xs text-gray-500 mt-0.5">CNPJ: {t.origem}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <BadgeStatus status={t.status} />
                        <BadgePrioridade p={t.prioridade} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">{t.estagio}</div>
                    {selectedSolicitacao?.id === t.id && t.descricao && (
                      <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">{t.descricao}</p>
                    )}
                    {selectedSolicitacao?.id === t.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setForm((f) => ({ ...f, solicitacaoId: t.id, assunto: `Solicitação #${t.numero} - ${t.titulo}` }))
                          setSuporteModalTab('enviar')
                        }}
                        className={cn(btnPrimary, 'mt-3 w-full')}
                      >
                        Enviar mensagem sobre esta solicitação
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
