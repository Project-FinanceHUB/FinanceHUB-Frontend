/**
 * Configuração da API
 * A URL da API é definida através da variável de ambiente NEXT_PUBLIC_API_URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiConfig = {
  baseURL: API_URL,
  endpoints: {
    health: `${API_URL}/api/health`,
    solicitacoes: `${API_URL}/api/solicitacoes`,
  },
}

/**
 * Função helper para fazer requisições à API
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export default apiConfig
