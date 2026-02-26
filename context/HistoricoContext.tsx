'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { HistoricoRegistro, HistoricoFormData } from '@/types/historico'
import type { Lancamento } from '@/types/lancamento'

const HISTORICO_KEY = 'financehub_historico'
const LANCAMENTOS_KEY = 'financehub_lancamentos'

function lancamentoToRegistro(l: Lancamento, idx: number): HistoricoRegistro {
  const now = new Date().toISOString()
  return {
    id: `lanc-${l.id}`,
    tipo: l.tipo === 'Boleto' ? 'boleto' : 'nota_fiscal',
    categoria: l.tipo,
    protocolo: l.protocolo,
    data: l.data,
    horario: l.horario,
    status: l.status as HistoricoRegistro['status'],
    titulo: `${l.tipo} - ${l.protocolo}`,
    descricao: `${l.tipo} enviado em ${l.data} às ${l.horario}`,
    dataCriacao: now,
    dataAtualizacao: now,
  }
}

type HistoricoContextValue = {
  registros: HistoricoRegistro[]
  addRegistro: (data: HistoricoFormData) => void
  updateRegistro: (id: string, data: Partial<HistoricoFormData>) => void
  deleteRegistro: (id: string) => void
  syncFromLancamentos: () => void
  historicoModalOpen: boolean
  setHistoricoModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedRegistroId: string | null
  setSelectedRegistroId: React.Dispatch<React.SetStateAction<string | null>>
}

const HistoricoContext = createContext<HistoricoContextValue | null>(null)

const initialRegistros: HistoricoRegistro[] = [
  {
    id: '1',
    tipo: 'boleto',
    categoria: 'Boleto',
    protocolo: 'BOL-2025-001234',
    data: '2025-01-15',
    horario: '09:30',
    status: 'processado',
    titulo: 'Boleto - BOL-2025-001234',
    descricao: 'Boleto processado com sucesso.',
    origem: '12.345.678/0001-90',
    valor: 'R$ 1.250,00',
    dataCriacao: '2025-01-15T09:30:00.000Z',
    dataAtualizacao: '2025-01-15T09:30:00.000Z',
  },
  {
    id: '2',
    tipo: 'nota_fiscal',
    categoria: 'Nota Fiscal',
    protocolo: 'NF-2025-000567',
    data: '2025-01-18',
    horario: '14:00',
    status: 'enviado',
    titulo: 'Nota Fiscal - NF-2025-000567',
    descricao: 'NF enviada para processamento.',
    origem: '23.456.789/0001-01',
    valor: 'R$ 3.400,00',
    dataCriacao: '2025-01-18T14:00:00.000Z',
    dataAtualizacao: '2025-01-18T14:00:00.000Z',
  },
  {
    id: '3',
    tipo: 'acao_sistema',
    categoria: 'Ação',
    protocolo: 'ACT-2025-000001',
    data: '2025-01-20',
    horario: '11:15',
    status: 'concluido',
    titulo: 'Login no sistema',
    descricao: 'Acesso realizado com sucesso (login com e-mail e senha).',
    dataCriacao: '2025-01-20T11:15:00.000Z',
    dataAtualizacao: '2025-01-20T11:15:00.000Z',
  },
]

export function HistoricoProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<HistoricoRegistro[]>(() => {
    if (typeof window === 'undefined') return initialRegistros
    try {
      const saved = localStorage.getItem(HISTORICO_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return initialRegistros
  })
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false)
  const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORICO_KEY, JSON.stringify(registros))
    }
  }, [registros])

  const syncFromLancamentos = useCallback(() => {
    setRegistros((prev) => {
      try {
        const saved = localStorage.getItem(LANCAMENTOS_KEY)
        if (!saved) return prev
        const lancamentos: Lancamento[] = JSON.parse(saved)
        const protocolosExistentes = new Set(prev.map((r) => r.protocolo))
        const novos = lancamentos
          .filter((l) => !protocolosExistentes.has(l.protocolo))
          .map((l) => lancamentoToRegistro(l, 0))
        if (novos.length === 0) return prev
        return [...novos, ...prev]
      } catch {
        return prev
      }
    })
  }, [])

  const addRegistro = useCallback((data: HistoricoFormData) => {
    const now = new Date().toISOString()
    const novo: HistoricoRegistro = {
      ...data,
      id: Date.now().toString(),
      dataCriacao: now,
      dataAtualizacao: now,
    }
    setRegistros((prev) => [novo, ...prev])
  }, [])

  const updateRegistro = useCallback((id: string, data: Partial<HistoricoFormData>) => {
    const now = new Date().toISOString()
    setRegistros((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...data, dataAtualizacao: now } : r
      )
    )
  }, [])

  const deleteRegistro = useCallback((id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const value: HistoricoContextValue = {
    registros,
    addRegistro,
    updateRegistro,
    deleteRegistro,
    syncFromLancamentos,
    historicoModalOpen,
    setHistoricoModalOpen,
    selectedRegistroId,
    setSelectedRegistroId,
  }

  return (
    <HistoricoContext.Provider value={value}>{children}</HistoricoContext.Provider>
  )
}

export function useHistorico() {
  const ctx = useContext(HistoricoContext)
  if (!ctx) throw new Error('useHistorico must be used within HistoricoProvider')
  return ctx
}
