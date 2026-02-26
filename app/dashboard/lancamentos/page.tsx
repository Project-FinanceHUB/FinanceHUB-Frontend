'use client'

import { useState, useEffect } from 'react'
import ResponsiveTable from '@/components/ResponsiveTable'
import LancamentoModal from '@/components/LancamentoModal'
import DeleteLancamentoModal from '@/components/DeleteLancamentoModal'
import { SkeletonCard, Skeleton } from '@/components/Skeleton'
import type { Lancamento, LancamentoFormData, LancamentoStatus } from '@/types/lancamento'

const STORAGE_KEY = 'financehub_lancamentos'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function formatarData(isoDate: string): string {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function formatarHorario(time: string): string {
  if (!time) return '—'
  return time.slice(0, 5)
}

function BadgeStatus({ status }: { status: LancamentoStatus }) {
  const config: Record<LancamentoStatus, { label: string; tone: 'green' | 'amber' | 'blue' | 'red' | 'gray' }> = {
    enviado: { label: 'Enviado', tone: 'blue' },
    pendente: { label: 'Pendente', tone: 'amber' },
    processado: { label: 'Processado', tone: 'green' },
    erro: { label: 'Erro', tone: 'red' },
  }
  const { label, tone } = config[status]
  const tones: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 ring-gray-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', tones[tone])}>
      {label}
    </span>
  )
}

const initialLancamentos: Lancamento[] = [
  { id: '1', data: '2025-01-15', horario: '09:30', status: 'processado', protocolo: 'BOL-2025-001234', tipo: 'Boleto' },
  { id: '2', data: '2025-01-18', horario: '14:00', status: 'enviado', protocolo: 'NF-2025-000567', tipo: 'NF' },
  { id: '3', data: '2025-01-20', horario: '11:15', status: 'pendente', protocolo: 'BOL-2025-001289', tipo: 'Boleto' },
]

export default function LancamentosPage() {
  const [mounted, setMounted] = useState(false)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return initialLancamentos
        }
      }
    }
    return initialLancamentos
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | undefined>()
  const [lancamentoToDelete, setLancamentoToDelete] = useState<Lancamento | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentos))
    }
  }, [lancamentos])

  const handleCreate = () => {
    setSelectedLancamento(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (lancamento: Lancamento) => {
    setSelectedLancamento(lancamento)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (lancamento: Lancamento) => {
    setLancamentoToDelete(lancamento)
  }

  const handleSubmit = (formData: LancamentoFormData) => {
    if (selectedLancamento) {
      setLancamentos((prev) =>
        prev.map((l) =>
          l.id === selectedLancamento.id ? { ...l, ...formData } : l
        )
      )
    } else {
      const newLancamento: Lancamento = {
        ...formData,
        id: Date.now().toString(),
      }
      setLancamentos((prev) => [newLancamento, ...prev])
    }
    setIsModalOpen(false)
    setSelectedLancamento(undefined)
  }

  const handleDeleteConfirm = () => {
    if (!lancamentoToDelete) return
    setLancamentos((prev) => prev.filter((l) => l.id !== lancamentoToDelete.id))
    setLancamentoToDelete(undefined)
  }

  /** Tipo da linha na tabela: dados do lançamento + coluna virtual "acoes" */
  type LancamentoRow = Lancamento & { acoes?: never }

  const columns: { key: keyof LancamentoRow; label: string; cellClassName?: string }[] = [
    { key: 'data', label: 'Data', cellClassName: 'font-medium text-gray-900' },
    { key: 'horario', label: 'Horário', cellClassName: 'text-gray-600' },
    { key: 'status', label: 'Status' },
    { key: 'protocolo', label: 'Protocolo', cellClassName: 'font-mono text-sm' },
    { key: 'tipo', label: 'Tipo', cellClassName: 'text-gray-700' },
    { key: 'acoes', label: 'Ações' },
  ]

  if (!mounted) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <Skeleton variant="text" height={32} width="30%" className="mb-2" />
          <Skeleton variant="text" height={20} width="50%" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 md:py-8 w-full max-w-full">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Lançamentos Financeiros</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Envios de boletos e notas fiscais: data, horário, status, protocolo e tipo (Boleto ou NF).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo lançamento
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden">
        <ResponsiveTable<LancamentoRow>
          aria-label="Tabela de lançamentos financeiros"
          columns={columns}
          rows={lancamentos}
          renderCell={(row, key) => {
            const l = row as Lancamento
            const k = key
            if (k === 'data') return formatarData(l.data)
            if (k === 'horario') return formatarHorario(l.horario)
            if (k === 'status') return <BadgeStatus status={l.status} />
            if (k === 'protocolo') return l.protocolo
            if (k === 'tipo') return l.tipo
            if (k === 'acoes') {
              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(l)}
                                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-200"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(l)}
                                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    aria-label="Excluir"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )
            }
            return null
          }}
        />
        {lancamentos.length === 0 && (
          <div className="px-5 py-12 md:py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-inner border border-gray-100">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700">Nenhum lançamento cadastrado</p>
            <p className="text-sm text-gray-500 mt-1">Clique em &quot;Novo lançamento&quot; para adicionar.</p>
          </div>
        )}
      </div>

      <LancamentoModal
        isOpen={isModalOpen}
        lancamento={selectedLancamento}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedLancamento(undefined)
        }}
        onSubmit={handleSubmit}
      />

      <DeleteLancamentoModal
        isOpen={!!lancamentoToDelete}
        protocolo={lancamentoToDelete?.protocolo ?? ''}
        onClose={() => setLancamentoToDelete(undefined)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
