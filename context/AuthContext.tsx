'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as authAPI from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  nome: string
  email: string
  role: string
  /** Preenchido quando o usuário é funcionário de um gerente */
  gerenteId?: string
  /** ID do "dono" dos dados (gerente ou o próprio usuário); usado para empresas/solicitações */
  effectiveOwnerId?: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'financehub_auth_token'
const USER_KEY = 'financehub_auth_user'
const COMPANIES_KEY = 'financehub_companies'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const persistSession = (newToken: string, newUser: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
      document.cookie = `auth_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }
  }

  const clearSession = () => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(COMPANIES_KEY)
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  /** Só limpa sessão quando o erro indica token inválido/expirado (evita desconectar em falha de rede). */
  const isTokenInvalidError = (err: string | undefined): boolean => {
    if (!err) return false
    const lower = err.toLowerCase()
    return (
      lower.includes('não autorizado') ||
      lower.includes('unauthorized') ||
      lower.includes('token expirado') ||
      lower.includes('token inválido') ||
      lower.includes('token não fornecido') ||
      lower.includes('invalid token') ||
      lower.includes('sessão expirada') ||
      lower.includes('sessão inválida') ||
      lower.includes('401')
    )
  }

  // Carregar sessão ao iniciar (localStorage ou Supabase)
  useEffect(() => {
    const loadSession = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      try {
        // 1) Tentar sessão do Supabase (login com email/senha)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const validation = await authAPI.validateSession(session.access_token)
          if (validation.valid && validation.session) {
            setToken(session.access_token)
            setUser(validation.session.user)
            persistSession(session.access_token, validation.session.user)
            setIsLoading(false)
            return
          }
          if (isTokenInvalidError(validation.error)) {
            clearSession()
            return
          }
        }

        // 2) Fallback: token salvo no localStorage (ex.: sessão antiga)
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)
        if (savedToken && savedUser) {
          const validation = await authAPI.validateSession(savedToken)
          if (validation.valid && validation.session) {
            setToken(savedToken)
            setUser(validation.session.user)
            persistSession(savedToken, validation.session.user)
            setIsLoading(false)
            return
          }
          if (isTokenInvalidError(validation.error)) {
            clearSession()
          } else {
            // Falha de rede ou backend indisponível: manter sessão para não desconectar o usuário
            try {
              const parsed = JSON.parse(savedUser) as User
              setToken(savedToken)
              setUser(parsed)
            } catch {
              clearSession()
            }
          }
          return
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error)
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)
        if (savedToken && savedUser) {
          try {
            const parsed = JSON.parse(savedUser) as User
            setToken(savedToken)
            setUser(parsed)
          } catch {
            clearSession()
          }
        } else {
          clearSession()
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message
      if (msg === 'Invalid login credentials') throw new Error('E-mail ou senha incorretos.')
      if (msg === 'Email not confirmed') throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada (e spam) e clique no link enviado.')
      throw new Error(msg)
    }

    const accessToken = data.session?.access_token
    if (!accessToken) throw new Error('Erro ao obter sessão.')

    const validation = await authAPI.validateSession(accessToken)
    if (!validation.valid || !validation.session) {
      throw new Error(validation.error || 'Erro ao carregar perfil.')
    }

    setToken(accessToken)
    setUser(validation.session.user)
    persistSession(accessToken, validation.session.user)
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Erro ao fazer signOut no Supabase:', e)
    }
    try {
      if (token) await authAPI.logout(token)
    } catch (e) {
      console.error('Erro ao fazer logout no backend:', e)
    }
    clearSession()
  }

  const validateSession = async (): Promise<boolean> => {
    if (!token) return false
    try {
      const validation = await authAPI.validateSession(token)
      if (validation.valid && validation.session) {
        setUser(validation.session.user)
        persistSession(token, validation.session.user)
        return true
      }
      if (isTokenInvalidError(validation?.error)) {
        clearSession()
      }
    } catch {
      // Falha de rede: não limpar sessão para evitar desconexão indevida
    }
    return !!token && !!user
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    validateSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
