'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailInput from './EmailInput'
import PasswordInput from './PasswordInput'
import { useAuth } from '@/context/AuthContext'
import * as authAPI from '@/lib/api/auth'

export default function SignupForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso(false)

    if (!nome.trim()) {
      setErro('Nome é obrigatório')
      return
    }
    if (!isValidEmail(email)) {
      setErro('Digite um e-mail válido')
      return
    }
    if (!password || password.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await authAPI.register({
        nome: nome.trim(),
        email: email.trim(),
        password,
      })

      setSucesso(true)
      try {
        await login(email.trim(), password)
        router.push('/dashboard')
      } catch (loginErr) {
        router.push('/?login=true&cadastro=sucesso')
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.'
      setErro(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sucesso) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-light rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Entrando na plataforma...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-light rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2 text-center">
          Criar conta
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Preencha os dados para criar sua conta
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[var(--primary)]"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Email */}
          <div>
            <EmailInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isValid={email.length > 0 ? isValidEmail(email) : undefined}
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha (Mínimo 6 caracteres)
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-[var(--primary)]"
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !nome.trim() || !isValidEmail(email) || !password || password.length < 6}
            className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>

          {/* Link para Login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <a
                href="/"
                className="text-[var(--primary)] hover:text-[var(--accent)] font-medium transition-colors"
              >
                Fazer login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
