'use client'

import { useEffect, useRef } from 'react'
import { useSuporte } from '@/context/SuporteContext'
import { useDashboard } from '@/context/DashboardContext'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
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

type NotificacoesDropdownProps = {
  isOpen: boolean
  onClose: () => void
}

export default function NotificacoesDropdown({ isOpen, onClose }: NotificacoesDropdownProps) {
  const { mensagens, marcarComoLida } = useSuporte()
  const { solicitacoes } = useDashboard()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const mensagensNaoLidas = mensagens
    .filter((m) => !m.lida && m.direcao === 'recebida')
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())

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

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-[500px] flex flex-col overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
        {mensagensNaoLidas.length > 0 && (
          <span className="text-xs text-gray-500">{mensagensNaoLidas.length} não lida(s)</span>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {mensagensNaoLidas.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm text-gray-500">Nenhuma notificação não lida</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mensagensNaoLidas.map((m) => (
              <div
                key={m.id}
                className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  marcarComoLida(m.id)
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{m.assunto}</div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{m.conteudo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{m.remetente}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatarDataHora(m.dataHora)}</span>
                      {m.solicitacaoId && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Solicitação #{solicitacoes.find((s) => s.id === m.solicitacaoId)?.numero ?? m.solicitacaoId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mensagensNaoLidas.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              mensagensNaoLidas.forEach((m) => marcarComoLida(m.id))
            }}
            className="w-full text-xs font-medium text-[var(--primary)] hover:text-[var(--accent)] transition"
          >
            Marcar todas como lidas
          </button>
        </div>
      )}
    </div>
  )
}
