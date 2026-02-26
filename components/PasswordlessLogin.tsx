'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EmailInput from './EmailInput'
import { useAuth } from '@/context/AuthContext'
import * as authAPI from '@/lib/api/auth'

interface PasswordlessLoginProps {
  email: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack?: () => void
}

export default function PasswordlessLogin({ email, onEmailChange }: PasswordlessLoginProps) {
  const router = useRouter()
  const { login } = useAuth()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [erroEmail, setErroEmail] = useState('')
  const [erroCodigo, setErroCodigo] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim())
  }

  const enviarCodigo = async () => {
    setErroEmail('')
    const input = emailInputRef.current
    const emailValue = (input?.value ?? email ?? '').toString().trim()
    
    if (!isValidEmail(emailValue)) {
      setErroEmail('Digite um e-mail válido para continuar.')
      return
    }
    
    if (emailValue !== email) {
      onEmailChange({ target: { value: emailValue } } as React.ChangeEvent<HTMLInputElement>)
    }
    
    setIsSending(true)
    
    try {
      console.log('Enviando código para:', emailValue)
      const result = await authAPI.sendAuthCode(emailValue)
      console.log('Código enviado com sucesso:', result)
      
      setEmailEnviado(emailValue)
      setCodeSent(true)
      setCountdown(60)
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao enviar código:', error)
      const errorMessage = error.message || 'Erro ao enviar código. Verifique a conexão com o backend.'
      setErroEmail(errorMessage)
    } finally {
      // Sempre resetar o estado de loading
      setIsSending(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return

    setIsVerifying(true)
    setErroCodigo('')
    
    try {
      console.log('[PasswordlessLogin] Verificando código...')
      await login(emailEnviado || email, code)
      console.log('[PasswordlessLogin] Login bem-sucedido, redirecionando...')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('[PasswordlessLogin] Erro ao verificar código:', error)
      setErroCodigo(error.message || 'Código inválido. Tente novamente.')
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    setCodeSent(false)
    setCode('')
    setErroCodigo('')
    await enviarCodigo()
  }

  const handleChangeEmail = () => {
    setCodeSent(false)
    setCode('')
  }

  if (codeSent) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-light rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2 text-center">
            Verifique seu e-mail
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Enviamos um código de 6 dígitos para <br />
            <span className="font-semibold text-gray-900">{emailEnviado || email}</span>
          </p>

          {/* Code Input Form */}
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificação
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(value)
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[var(--primary)]"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Digite o código de 6 dígitos
              </p>
              {erroCodigo && (
                <p className="text-xs text-red-600 mt-2 text-center">{erroCodigo}</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={code.length !== 6 || isVerifying}
              className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)] transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isVerifying ? 'Verificando...' : 'Verificar código'}
            </button>

            {/* Resend Code & Change Email */}
            <div className="text-center space-y-2">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Não recebeu o código?
                </p>
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Reenviar em {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors font-medium"
                  >
                    Reenviar código
                  </button>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Alterar e-mail
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-light rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-6 sm:mb-8 text-center">
          Acessar conta
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Digite seu e-mail e enviaremos um código de verificação
        </p>

        {/* Link para Cadastro */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a
              href="/cadastro"
              className="text-[var(--primary)] hover:text-[var(--accent)] font-medium transition-colors"
            >
              Criar conta
            </a>
          </p>
        </div>

        <div
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              enviarCodigo()
            }
          }}
        >
          <div>
            <EmailInput
              ref={emailInputRef}
              value={email}
              onChange={onEmailChange}
              isValid={email.length > 0 ? isValidEmail(email) : undefined}
            />
          </div>

          {erroEmail && (
            <p className="text-sm text-red-600 text-center">{erroEmail}</p>
          )}
          <button
            type="button"
            onClick={enviarCodigo}
            disabled={isSending}
            className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Enviando...' : 'Enviar código'}
          </button>
        </div>
      </div>
    </div>
  )
}
