/**
 * API de usuários.
 *
 * Controle de acesso no back-end (obrigatório para evitar acessos indevidos):
 *
 * - GET /api/users (listar): permitido para role "admin" e "gerente". "usuario" → 403.
 * - POST /api/users (criar): permitido apenas para role "admin". "gerente" e "usuario" → 403.
 * - PUT /api/users/:id (atualizar): permitido apenas para role "admin". "gerente" e "usuario" → 403.
 * - DELETE /api/users/:id (excluir): permitido apenas para role "admin". "gerente" e "usuario" → 403.
 * - GET /api/users/me, PUT /api/users/me: qualquer usuário autenticado (perfil próprio).
 */
import apiConfig from '../api'
import type { User, UserFormData } from '@/types/configuracoes'

const API_URL = apiConfig.baseURL

/** Dados do perfil retornados pelo backend (inclui telefone e cargo) */
export type ProfileResponse = {
  id: string
  nome: string
  email: string
  role: string
  telefone?: string
  cargo?: string
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

/** Busca perfil do usuário logado (requer token) */
export async function getMe(token: string): Promise<ProfileResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: authHeaders(token),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Erro ao carregar perfil')
    }
    const result = await response.json()
    return result.data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err?.name === 'AbortError') throw new Error('Tempo esgotado. Tente novamente.')
    throw err
  }
}

/** Atualiza perfil do usuário logado (nome, telefone, cargo - e-mail não é alterado) */
export async function updateMe(
  token: string,
  data: { nome?: string; telefone?: string; cargo?: string }
): Promise<ProfileResponse> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as Record<string, unknown>
    const details = err.details as Array<{ message?: string }> | undefined
    const firstDetail = Array.isArray(details) && details[0] ? details[0].message : undefined
    const message =
      (err.message as string) ||
      (err.error as string) ||
      firstDetail ||
      (response.status === 401 ? 'Sessão expirada. Faça login novamente.' : 'Erro ao atualizar perfil.')
    throw new Error(message)
  }
  const result = await response.json()
  return result.data
}

export async function getUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Sessão expirada. Faça login novamente.' : 'Erro ao buscar usuários')
  }
  const result = await response.json()
  return result.data || result
}

export async function createUser(data: UserFormData, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({ error: 'Erro ao processar resposta' }))

  if (!response.ok) {
    if (result.details && Array.isArray(result.details) && result.details.length > 0) {
      throw new Error(result.details[0].message || result.error || 'Dados inválidos')
    }
    throw new Error(result.error || result.message || 'Erro ao criar usuário')
  }

  return result.data || result
}

export async function updateUser(id: string, data: Partial<UserFormData>, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao atualizar usuário' }))
    throw new Error(error.message || 'Erro ao atualizar usuário')
  }
  const result = await response.json()
  return result.data || result
}

export async function deleteUser(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao deletar usuário' }))
    throw new Error(error.message || 'Erro ao deletar usuário')
  }
}
