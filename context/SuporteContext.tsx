'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Mensagem, MensagemFormData } from '@/types/suporte'
import * as messageAPI from '@/lib/api/messages'

const MENSAGENS_KEY = 'financehub_suporte_mensagens'

const initialMensagens: Mensagem[] = [
  {
    id: '1',
    solicitacaoId: '1',
    direcao: 'recebida',
    assunto: 'Atualização da sua solicitação #1',
    conteudo: 'Olá! Sua solicitação foi atualizada e está em análise. Em breve retornaremos com mais informações sobre o processamento.',
    remetente: 'Suporte FinanceHub',
    dataHora: new Date(Date.now() - 3600000).toISOString(),
    lida: false,
  },
  {
    id: '2',
    solicitacaoId: '4',
    direcao: 'enviada',
    assunto: 'Dúvida sobre boleto',
    conteudo: 'Preciso de esclarecimentos sobre o vencimento do boleto referente à empresa Atlas Engenharia.',
    remetente: 'Você',
    dataHora: new Date(Date.now() - 86400000).toISOString(),
    lida: true,
  },
  {
    id: '3',
    direcao: 'recebida',
    assunto: 'Bem-vindo ao Suporte',
    conteudo: 'Obrigado por entrar em contato. Nossa equipe está pronta para ajudá-lo. Responderemos em até 24h úteis.',
    remetente: 'Suporte FinanceHub',
    dataHora: new Date(Date.now() - 86400000 * 5).toISOString(),
    lida: true,
  },
]

type SuporteContextValue = {
  mensagens: Mensagem[]
  addMensagem: (data: MensagemFormData) => Promise<void>
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  suporteModalOpen: boolean
  setSuporteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  suporteModalTab: string
  setSuporteModalTab: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  error: string | null
}

const SuporteContext = createContext<SuporteContextValue | null>(null)

export function SuporteProvider({ children }: { children: ReactNode }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suporteModalOpen, setSuporteModalOpen] = useState(false)
  const [suporteModalTab, setSuporteModalTab] = useState('enviar')

  // Carregar mensagens da API
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await messageAPI.getMessages()
        setMensagens(data.length > 0 ? data : initialMensagens)
        // Sincronizar com localStorage como backup
        if (typeof window !== 'undefined') {
          localStorage.setItem(MENSAGENS_KEY, JSON.stringify(data.length > 0 ? data : initialMensagens))
        }
      } catch (err: any) {
        console.error('Erro ao carregar mensagens da API:', err)
        // Fallback para localStorage se API falhar
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem(MENSAGENS_KEY)
            if (saved) {
              setMensagens(JSON.parse(saved))
            } else {
              setMensagens(initialMensagens)
            }
          } catch {
            setMensagens(initialMensagens)
          }
        } else {
          setMensagens(initialMensagens)
        }
        setError('Erro ao carregar mensagens. Usando dados locais.')
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      loadMessages()
    } else {
      setMensagens(initialMensagens)
      setLoading(false)
    }
  }, [])

  // Sincronizar mensagens com localStorage quando mudarem
  useEffect(() => {
    if (typeof window !== 'undefined' && mensagens.length > 0) {
      localStorage.setItem(MENSAGENS_KEY, JSON.stringify(mensagens))
    }
  }, [mensagens])

  const addMensagem = useCallback(async (data: MensagemFormData) => {
    try {
      const nova = await messageAPI.createMessage(data)
      const normalizada = data.direcao === 'enviada' ? { ...nova, lida: true } : nova
      setMensagens((prev) => [normalizada, ...prev])
      // Atualizar localStorage
      if (typeof window !== 'undefined') {
        const updated = [normalizada, ...mensagens]
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
    } catch (err: any) {
      console.error('Erro ao criar mensagem:', err)
      // Fallback para localStorage (mensagens enviadas já são "lidas" por quem enviou)
      const now = new Date().toISOString()
      const nova: Mensagem = {
        ...data,
        id: Date.now().toString(),
        dataHora: now,
        lida: data.direcao === 'enviada',
      }
      setMensagens((prev) => [nova, ...prev])
      if (typeof window !== 'undefined') {
        const updated = [nova, ...mensagens]
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
      throw err
    }
  }, [mensagens])

  const marcarComoLida = useCallback(async (id: string) => {
    try {
      await messageAPI.markMessageAsRead(id)
      setMensagens((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lida: true } : m))
      )
      // Atualizar localStorage
      if (typeof window !== 'undefined') {
        const updated = mensagens.map((m) => (m.id === id ? { ...m, lida: true } : m))
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
    } catch (err: any) {
      console.error('Erro ao marcar mensagem como lida:', err)
      // Fallback para localStorage
      setMensagens((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lida: true } : m))
      )
      if (typeof window !== 'undefined') {
        const updated = mensagens.map((m) => (m.id === id ? { ...m, lida: true } : m))
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
    }
  }, [mensagens])

  const marcarTodasComoLidas = useCallback(async () => {
    try {
      await messageAPI.markAllMessagesAsRead()
      setMensagens((prev) => prev.map((m) => ({ ...m, lida: true })))
      // Atualizar localStorage
      if (typeof window !== 'undefined') {
        const updated = mensagens.map((m) => ({ ...m, lida: true }))
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
    } catch (err: any) {
      console.error('Erro ao marcar todas como lidas:', err)
      // Fallback para localStorage
      setMensagens((prev) => prev.map((m) => ({ ...m, lida: true })))
      if (typeof window !== 'undefined') {
        const updated = mensagens.map((m) => ({ ...m, lida: true }))
        localStorage.setItem(MENSAGENS_KEY, JSON.stringify(updated))
      }
    }
  }, [mensagens])

  const value: SuporteContextValue = {
    mensagens,
    addMensagem,
    marcarComoLida,
    marcarTodasComoLidas,
    suporteModalOpen,
    setSuporteModalOpen,
    suporteModalTab,
    setSuporteModalTab,
    loading,
    error,
  }

  return (
    <SuporteContext.Provider value={value}>{children}</SuporteContext.Provider>
  )
}

export function useSuporte() {
  const ctx = useContext(SuporteContext)
  if (!ctx) throw new Error('useSuporte must be used within SuporteProvider')
  return ctx
}
