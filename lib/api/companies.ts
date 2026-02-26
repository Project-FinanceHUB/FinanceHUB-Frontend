import apiConfig from '../api'
import type { Company, CompanyFormData } from '@/types/company'

const API_URL = apiConfig.baseURL

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function getCompanies(token: string): Promise<Company[]> {
  const response = await fetch(`${API_URL}/api/companies`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Erro ao buscar empresas')
  }
  const result = await response.json()
  return result.data || result
}

export async function createCompany(data: CompanyFormData, token: string): Promise<Company> {
  const response = await fetch(`${API_URL}/api/companies`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao criar empresa' }))
    throw new Error(error.message || 'Erro ao criar empresa')
  }
  const result = await response.json()
  return result.data || result
}

export async function updateCompany(id: string, data: Partial<CompanyFormData>, token: string): Promise<Company> {
  const response = await fetch(`${API_URL}/api/companies/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao atualizar empresa' }))
    throw new Error(error.message || 'Erro ao atualizar empresa')
  }
  const result = await response.json()
  return result.data || result
}

export async function deleteCompany(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/companies/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao deletar empresa' }))
    throw new Error(error.message || 'Erro ao deletar empresa')
  }
}
