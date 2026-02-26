'use client'

import { useEffect } from 'react'
import type { Lancamento, LancamentoFormData, LancamentoStatus, LancamentoTipo } from '@/types/lancamento'

type LancamentoModalProps = {
  isOpen: boolean
  lancamento?: Lancamento
  onClose: () => void
  onSubmit: (data: LancamentoFormData) => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const STATUS_OPTIONS: { value: LancamentoStatus; label: string }[] = [
  { value: 'enviado', label: 'Enviado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
]

const TIPO_OPTIONS: { value: LancamentoTipo; label: string }[] = [
  { value: 'Boleto', label: 'Boleto' },
  { value: 'NF', label: 'Nota Fiscal' },
]

export default function LancamentoModal({ isOpen, lancamento, onClose, onSubmit }: LancamentoModalProps) {
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

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data: LancamentoFormData = {
      data: (form.querySelector('[name="data"]') as HTMLInputElement).value,
      horario: (form.querySelector('[name="horario"]') as HTMLInputElement).value,
      status: (form.querySelector('[name="status"]') as HTMLSelectElement).value as LancamentoStatus,
      protocolo: (form.querySelector('[name="protocolo"]') as HTMLInputElement).value.trim(),
      tipo: (form.querySelector('[name="tipo"]') as HTMLSelectElement).value as LancamentoTipo,
    }
    if (!data.protocolo) return
    onSubmit(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {lancamento ? 'Editar lançamento' : 'Novo lançamento'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lancamento-data" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                id="lancamento-data"
                name="data"
                type="date"
                required
                defaultValue={lancamento?.data}
                className={cn(
                  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
                )}
              />
            </div>
            <div>
              <label htmlFor="lancamento-horario" className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                id="lancamento-horario"
                name="horario"
                type="time"
                required
                defaultValue={lancamento?.horario}
                className={cn(
                  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lancamento-protocolo" className="block text-sm font-medium text-gray-700 mb-1">Protocolo</label>
            <input
              id="lancamento-protocolo"
              name="protocolo"
              type="text"
              required
              placeholder="Ex: BOL-2025-001234"
              defaultValue={lancamento?.protocolo}
              className={cn(
                'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lancamento-tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                id="lancamento-tipo"
                name="tipo"
                required
                defaultValue={lancamento?.tipo ?? 'Boleto'}
                className={cn(
                  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
                )}
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lancamento-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="lancamento-status"
                name="status"
                required
                defaultValue={lancamento?.status ?? 'pendente'}
                className={cn(
                  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition"
            >
              {lancamento ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
