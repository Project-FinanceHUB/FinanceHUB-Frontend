'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import EmailInput from './EmailInput'

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim())

export default function EmailPasswordLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    const emailVal = (emailInputRef.current?.value ?? email).toString().trim()
    if (!isValidEmail(emailVal)) {
      setErro('Digite um e-mail válido.')
      return
    }
    if (!password.trim()) {
      setErro('Digite sua senha.')
      return
    }
    if (emailVal !== email) setEmail(emailVal)
    setIsLoading(true)
    try {
      await login(emailVal, password)
      router.push('/dashboard')
    } catch (err: any) {
      setErro(err.message || 'E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-light rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-6 sm:mb-8 text-center">
          Acessar conta
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Digite seu e-mail e senha para entrar
        </p>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <EmailInput
              ref={emailInputRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isValid={email.length > 0 ? isValidEmail(email) : undefined}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[var(--primary)]"
            />
          </div>
          {erro && (
            <p className="text-sm text-red-600 text-center">{erro}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
