import apiConfig from '../api'
import type { Mensagem, MensagemFormData } from '@/types/suporte'

const API_URL = apiConfig.baseURL

export async function getMessages(): Promise<Mensagem[]> {
  const response = await fetch(`${API_URL}/api/mensagens`)
  if (!response.ok) {
    throw new Error('Erro ao buscar mensagens')
  }
  const result = await response.json()
  return result.data || result
}

export async function createMessage(data: MensagemFormData): Promise<Mensagem> {
  const response = await fetch(`${API_URL}/api/mensagens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao criar mensagem' }))
    throw new Error(error.message || 'Erro ao criar mensagem')
  }
  const result = await response.json()
  return result.data || result
}

export async function updateMessage(id: string, data: Partial<MensagemFormData>): Promise<Mensagem> {
  const response = await fetch(`${API_URL}/api/mensagens/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao atualizar mensagem' }))
    throw new Error(error.message || 'Erro ao atualizar mensagem')
  }
  const result = await response.json()
  return result.data || result
}

export async function markMessageAsRead(id: string): Promise<Mensagem> {
  const response = await fetch(`${API_URL}/api/mensagens/${id}/read`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    throw new Error('Erro ao marcar mensagem como lida')
  }
  const result = await response.json()
  return result.data || result
}

export async function markAllMessagesAsRead(): Promise<void> {
  const response = await fetch(`${API_URL}/api/mensagens/read-all`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    throw new Error('Erro ao marcar todas as mensagens como lidas')
  }
}
