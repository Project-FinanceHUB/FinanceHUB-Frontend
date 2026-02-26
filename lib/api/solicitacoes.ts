import apiConfig from '../api'
import type { Solicitacao, SolicitacaoFormData } from '@/types/solicitacao'

const API_URL = apiConfig.baseURL

export type SolicitacoesListResponse = {
  solicitacoes: Solicitacao[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function normalizeSolicitacao(raw: Record<string, unknown>): Solicitacao {
  return {
    id: String(raw.id ?? ''),
    numero: String(raw.numero ?? ''),
    titulo: String(raw.titulo ?? ''),
    origem: String(raw.origem ?? ''),
    prioridade: (raw.prioridade as Solicitacao['prioridade']) ?? 'media',
    status: (raw.status as Solicitacao['status']) ?? 'aberto',
    estagio: (raw.estagio as Solicitacao['estagio']) ?? 'Pendente',
    descricao: raw.descricao != null ? String(raw.descricao) : undefined,
    mensagem: raw.mensagem != null ? String(raw.mensagem) : undefined,
    mes: raw.mes != null ? Number(raw.mes) : undefined,
    visualizado: raw.visualizado === true,
    visualizadoEm: raw.visualizadoEm != null ? String(raw.visualizadoEm) : undefined,
    respondido: raw.respondido === true,
    respondidoEm: raw.respondidoEm != null ? String(raw.respondidoEm) : undefined,
    dataCriacao: raw.dataCriacao != null ? String(raw.dataCriacao) : raw.createdAt != null ? String(raw.createdAt) : undefined,
    dataAtualizacao: raw.dataAtualizacao != null ? String(raw.dataAtualizacao) : raw.updatedAt != null ? String(raw.updatedAt) : undefined,
    boletoPath: raw.boletoPath != null ? String(raw.boletoPath) : undefined,
    notaFiscalPath: raw.notaFiscalPath != null ? String(raw.notaFiscalPath) : undefined,
  }
}

export async function getSolicitacoes(
  token: string,
  params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }
): Promise<SolicitacoesListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page != null) searchParams.set('page', String(params.page))
  if (params?.limit != null) searchParams.set('limit', String(params.limit))
  if (params?.status) searchParams.set('status', params.status)
  if (params?.search) searchParams.set('search', params.search)

  const url = `${API_URL}/api/solicitacoes${searchParams.toString() ? `?${searchParams}` : ''}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg =
      typeof err?.message === 'string'
        ? err.message
        : typeof err?.error === 'string'
          ? err.error
          : Array.isArray(err?.details)
            ? err.details.join('. ')
            : response.statusText || 'Erro ao buscar solicitações'
    throw new Error(msg || 'Erro ao buscar solicitações')
  }
  const result = await response.json()

  const list = result.solicitacoes ?? result.data ?? result
  const arr = Array.isArray(list) ? list : []
  const pagination = result.pagination ?? {
    page: 1,
    limit: 100,
    total: arr.length,
    totalPages: 1,
  }

  return {
    solicitacoes: arr.map((s: Record<string, unknown>) => normalizeSolicitacao(s)),
    pagination,
  }
}

export async function createSolicitacao(formData: SolicitacaoFormData, token: string): Promise<Solicitacao> {
  const body = new FormData()
  body.append('titulo', formData.titulo)
  body.append('origem', formData.origem)
  body.append('prioridade', formData.prioridade ?? 'media')
  body.append('status', formData.status ?? 'aberto')
  body.append('estagio', formData.estagio ?? 'Pendente')
  if (formData.mes != null && formData.mes >= 1 && formData.mes <= 12) {
    body.append('mes', String(formData.mes))
  }
  if (formData.descricao) body.append('descricao', formData.descricao)
  if (formData.mensagem) body.append('mensagem', formData.mensagem)

  if (formData.boleto instanceof File) {
    body.append('boleto', formData.boleto)
  }
  if (formData.notaFiscal instanceof File) {
    body.append('notaFiscal', formData.notaFiscal)
  }

  const response = await fetch(`${API_URL}/api/solicitacoes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Arquivos muito grandes. Cada arquivo (boleto e nota fiscal) deve ter no máximo 2 MB. Reduza o tamanho ou use PDFs/imagens menores.')
    }
    const err = await response.json().catch(() => ({}))
    const msg =
      typeof err?.message === 'string'
        ? err.message
        : typeof err?.error === 'string'
          ? err.error
          : Array.isArray(err?.details)
            ? err.details.join('. ')
            : response.statusText || 'Erro ao criar solicitação'
    throw new Error(msg || 'Erro ao criar solicitação')
  }
  const result = await response.json()
  const data = result.data ?? result
  return normalizeSolicitacao(data)
}

export async function updateSolicitacao(
  id: string,
  formData: Partial<SolicitacaoFormData>,
  token: string
): Promise<Solicitacao> {
  const body = new FormData()
  if (formData.titulo != null) body.append('titulo', formData.titulo)
  if (formData.origem != null) body.append('origem', formData.origem)
  if (formData.prioridade != null) body.append('prioridade', formData.prioridade)
  if (formData.status != null) body.append('status', formData.status)
  if (formData.estagio != null) body.append('estagio', formData.estagio)
  if (formData.mes != null && formData.mes >= 1 && formData.mes <= 12) {
    body.append('mes', String(formData.mes))
  }
  if (formData.descricao != null) body.append('descricao', formData.descricao)
  if (formData.mensagem != null) body.append('mensagem', formData.mensagem)
  if (formData.boleto instanceof File) body.append('boleto', formData.boleto)
  if (formData.notaFiscal instanceof File) body.append('notaFiscal', formData.notaFiscal)

  const response = await fetch(`${API_URL}/api/solicitacoes/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg =
      typeof err?.message === 'string'
        ? err.message
        : typeof err?.error === 'string'
          ? err.error
          : Array.isArray(err?.details)
            ? err.details.join('. ')
            : response.statusText || 'Erro ao atualizar solicitação'
    throw new Error(msg || 'Erro ao atualizar solicitação')
  }
  const result = await response.json()
  const data = result.data ?? result
  return normalizeSolicitacao(data)
}

export async function deleteSolicitacao(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/solicitacoes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg =
      typeof err?.message === 'string'
        ? err.message
        : typeof err?.error === 'string'
          ? err.error
          : Array.isArray(err?.details)
            ? err.details.join('. ')
            : response.statusText || 'Erro ao excluir solicitação'
    throw new Error(msg || 'Erro ao excluir solicitação')
  }
}
