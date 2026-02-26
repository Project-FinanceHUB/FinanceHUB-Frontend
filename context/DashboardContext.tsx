'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Solicitacao, SolicitacaoFormData } from '@/types/solicitacao'
import type { Company } from '@/types/company'
import { useAuth } from '@/context/AuthContext'
import * as companyAPI from '@/lib/api/companies'
import * as solicitacoesAPI from '@/lib/api/solicitacoes'

const COMPANIES_KEY = 'financehub_companies'

type DashboardContextValue = {
  companies: Company[]
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>
  solicitacoes: Solicitacao[]
  setSolicitacoes: React.Dispatch<React.SetStateAction<Solicitacao[]>>
  addSolicitacao: (formData: SolicitacaoFormData) => Promise<void>
  refetchSolicitacoes: () => Promise<void>
  refetchCompanies: () => Promise<void>
  companiesModalOpen: boolean
  setCompaniesModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  error: string | null
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [solicitacoesLoading, setSolicitacoesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [companiesModalOpen, setCompaniesModalOpen] = useState(false)

  const loadSolicitacoes = useCallback(async () => {
    if (!token) {
      setSolicitacoes([])
      setSolicitacoesLoading(false)
      return
    }
    setSolicitacoes([])
    try {
      setSolicitacoesLoading(true)
      const { solicitacoes: list } = await solicitacoesAPI.getSolicitacoes(token, { page: 1, limit: 500 })
      setSolicitacoes(list)
    } catch (err: any) {
      console.error('Erro ao carregar solicitações da API:', err)
      setSolicitacoes([])
    } finally {
      setSolicitacoesLoading(false)
    }
  }, [token])

  const loadCompanies = useCallback(async () => {
    if (!token) {
      setCompanies([])
      setCompaniesLoading(false)
      if (typeof window !== 'undefined') localStorage.removeItem(COMPANIES_KEY)
      return
    }
    setError(null)
    setCompanies([])
    try {
      setCompaniesLoading(true)
      const data = await companyAPI.getCompanies(token)
      setCompanies(data || [])
      if (typeof window !== 'undefined' && data?.length) {
        localStorage.setItem(COMPANIES_KEY, JSON.stringify(data))
      }
    } catch (err: any) {
      console.error('Erro ao carregar empresas da API:', err)
      setCompanies([])
      setError('Erro ao carregar empresas. Conecte-se ao backend.')
    } finally {
      setCompaniesLoading(false)
    }
  }, [token])

  // Ao trocar de usuário ou fazer logout: limpar imediatamente para não exibir dados de outro usuário
  useEffect(() => {
    setCompanies([])
    setSolicitacoes([])
    if (typeof window !== 'undefined') localStorage.removeItem(COMPANIES_KEY)
  }, [token])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCompanies()
    } else {
      setCompaniesLoading(false)
    }
  }, [loadCompanies])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadSolicitacoes()
    }
  }, [loadSolicitacoes])

  // Sincronizar empresas com localStorage quando mudarem (apenas quando vierem da API)
  useEffect(() => {
    if (typeof window !== 'undefined' && companies.length > 0) {
      localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies))
    }
  }, [companies])

  const loading = companiesLoading || solicitacoesLoading

  const addSolicitacao = useCallback(
    async (formData: SolicitacaoFormData) => {
      if (!token) throw new Error('Sessão expirada. Faça login novamente.')
      const nova = await solicitacoesAPI.createSolicitacao(formData, token)
      // Garantir que o mês selecionado no formulário reflita no gráfico (mesmo se a API ainda não retornar mes)
      const comMes = {
        ...nova,
        mes: nova.mes != null && nova.mes >= 1 && nova.mes <= 12 ? nova.mes : (formData.mes ?? 12),
      }
      setSolicitacoes((prev) => [comMes, ...prev])
    },
    [token]
  )

  const value: DashboardContextValue = {
    companies,
    setCompanies,
    solicitacoes,
    setSolicitacoes,
    addSolicitacao,
    refetchSolicitacoes: loadSolicitacoes,
    refetchCompanies: loadCompanies,
    companiesModalOpen,
    setCompaniesModalOpen,
    loading,
    error,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
