import apiConfig from '../api'

const API_URL = apiConfig.baseURL

export interface SendCodeResponse {
  message: string
  expiresIn: number
  code?: string // Apenas em desenvolvimento
}

export interface VerifyCodeResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    nome: string
    email: string
    role: string
  }
  message?: string
  error?: string
}

export interface ValidateSessionResponse {
  valid: boolean
  session?: {
    id: string
    userId: string
    token: string
    expiresAt: string
    user: {
      id: string
      nome: string
      email: string
      role: string
    }
  }
  error?: string
}

/**
 * Envia código de verificação por email
 */
export async function sendAuthCode(email: string): Promise<SendCodeResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos de timeout

  try {
    const response = await fetch(`${API_URL}/api/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `Erro ${response.status}: ${response.statusText}` }
      }
      throw new Error(errorData.message || errorData.error || 'Erro ao enviar código')
    }

    return response.json()
  } catch (error: any) {
    clearTimeout(timeoutId)
    const msg = `Backend não está respondendo. Verifique a URL em NEXT_PUBLIC_API_URL (atual: ${API_URL})`
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error(msg)
    }
    if (error.message) {
      throw error
    }
    throw new Error(`Erro de conexão. URL da API: ${API_URL}`)
  }
}

/**
 * Verifica código e cria sessão
 */
export async function verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos de timeout

  try {
    console.log('[Auth] Verificando código:', { email, code: code.substring(0, 2) + '****' })
    
    const response = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json().catch(() => ({ error: 'Erro ao processar resposta' }))

    console.log('[Auth] Resposta da verificação:', { status: response.status, success: data.success })

    if (!response.ok) {
      const errorMsg = data.error || data.message || data.details?.[0]?.message || 'Erro ao verificar código'
      console.error('[Auth] Erro na verificação:', errorMsg)
      throw new Error(errorMsg)
    }

    if (!data.success || !data.token || !data.user) {
      console.error('[Auth] Resposta inválida:', data)
      throw new Error(data.error || 'Resposta inválida do servidor')
    }

    console.log('[Auth] Código verificado com sucesso!')
    return data
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('[Auth] Erro ao verificar código:', error)
    const msg = `Backend não está respondendo. Verifique a URL em NEXT_PUBLIC_API_URL (atual: ${API_URL})`
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw new Error(msg)
    }
    if (error.message) {
      throw error
    }
    throw new Error(`Erro de conexão. URL da API: ${API_URL}`)
  }
}

/**
 * Valida token de sessão
 */
export async function validateSession(token: string): Promise<ValidateSessionResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

  try {
    const response = await fetch(
      `${API_URL}/api/auth/validate?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao validar sessão' }))
      return {
        valid: false,
        error: error.error || 'Erro ao validar sessão',
      }
    }

    return response.json()
  } catch (err: any) {
    clearTimeout(timeoutId)
    // Falha de rede (backend fora, CORS, etc.): não lançar, retornar sessão inválida
    if (err?.name === 'AbortError' || err?.name === 'TypeError') {
      const isProductionUrl = /^https:\/\//i.test(API_URL)
      const hint = isProductionUrl
        ? ' Verifique se o back está no ar e se FRONTEND_URL está configurado no projeto do back na Vercel.'
        : ` Defina NEXT_PUBLIC_API_URL na Vercel e faça Redeploy.`
      return {
        valid: false,
        error: `Backend indisponível (${API_URL}).${hint}`,
      }
    }
    return { valid: false, error: err?.message || 'Erro ao validar sessão' }
  }
}

/**
 * Cadastro pelo backend: conta criada já confirmada, sem e-mail de confirmação.
 */
export async function register(data: {
  nome: string
  email: string
  password: string
  role?: 'admin' | 'gerente' | 'usuario'
}): Promise<{ success: boolean; message: string; user: { id: string; nome: string; email: string; role: string } }> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json().catch(() => ({ error: 'Erro ao processar resposta' }))
  if (!response.ok) throw new Error(result.error || result.message || 'Erro ao criar conta')
  return result
}

/**
 * Sincroniza perfil após cadastro com Supabase Auth (email/senha).
 */
export async function syncProfile(token: string, data: { nome: string; role?: string }): Promise<{ user: { id: string; nome: string; email: string; role: string } }> {
  const response = await fetch(`${API_URL}/api/auth/sync-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erro ao sincronizar perfil' }))
    throw new Error(err.error || err.message || 'Erro ao sincronizar perfil')
  }
  return response.json()
}

/**
 * Faz logout
 */
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao fazer logout' }))
    throw new Error(error.message || error.error || 'Erro ao fazer logout')
  }
}
