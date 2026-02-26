'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmailInput from './EmailInput'
import PasswordInput from './PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import * as authAPI from '@/lib/api/auth'

export default function HeroSection() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showEmConstrucao, setShowEmConstrucao] = useState(false)
  const [loginErro, setLoginErro] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Signup states
  const [nome, setNome] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [erroSignup, setErroSignup] = useState('')
  const [sucessoSignup, setSucessoSignup] = useState(false)
  const nomeInputRef = useRef<HTMLInputElement>(null)
  const signupModalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showLogin && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }
  }, [showLogin])

  useEffect(() => {
    if (showSignup && nomeInputRef.current) {
      setTimeout(() => {
        nomeInputRef.current?.focus()
      }, 100)
    }
  }, [showSignup])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        resetLoginState()
        setShowLogin(false)
      }
      if (signupModalRef.current && !signupModalRef.current.contains(e.target as Node)) {
        setShowSignup(false)
      }
    }

    if (showLogin || showSignup) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (!showLogin && !showSignup && !showGallery && !showEmConstrucao) {
        document.body.style.overflow = ''
      }
    }
  }, [showLogin, showSignup, showGallery, showEmConstrucao])

  useEffect(() => {
    if (!showGallery && !showEmConstrucao) {
      document.body.style.overflow = ''
    }
  }, [showGallery, showEmConstrucao])

  useEffect(() => {
    if (!isAuthenticated) {
      setEmail('')
      setPassword('')
      setLoginErro('')
      setShowLogin(false)
      setShowSignup(false)
    }
  }, [isAuthenticated])

  const resetLoginState = () => {
    setEmail('')
    setPassword('')
    setLoginErro('')
  }

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim())

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginErro('')
    const emailVal = email.trim()
    if (!isValidEmail(emailVal)) {
      setLoginErro('Digite um e-mail válido.')
      return
    }
    if (!password.trim()) {
      setLoginErro('Digite sua senha.')
      return
    }
    setIsLoginLoading(true)
    try {
      await login(emailVal, password)
      toast.success('Login realizado com sucesso!')
      resetLoginState()
      setShowLogin(false)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err.message || 'E-mail ou senha incorretos. Tente novamente.'
      setLoginErro(msg)
      toast.error(msg)
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroSignup('')
    setSucessoSignup(false)
    if (!nome.trim()) {
      setErroSignup('Nome é obrigatório')
      return
    }
    if (!isValidEmail(signupEmail)) {
      setErroSignup('Digite um e-mail válido')
      return
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErroSignup('A senha deve ter no mínimo 6 caracteres')
      return
    }
    setIsSubmitting(true)
    try {
      await authAPI.register({
        nome: nome.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      })
      toast.success('Conta criada! Entrando...')
      setSucessoSignup(true)
      try {
        await login(signupEmail.trim(), signupPassword)
        setShowSignup(false)
        setSucessoSignup(false)
        setNome('')
        setSignupEmail('')
        setSignupPassword('')
        router.push('/dashboard')
      } catch (loginErr) {
        toast.info('Conta criada. Faça login para entrar.')
        setShowSignup(false)
        setSucessoSignup(false)
        setNome('')
        setSignupEmail('')
        setSignupPassword('')
        router.push('/?login=true&cadastro=sucesso')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.'
      setErroSignup(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: 'Boletos',
      description: 'Gestão completa de boletos',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: 'Notas Fiscais',
      description: 'Controle de documentos fiscais',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Rastreabilidade',
      description: 'Histórico completo de envios',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      title: 'Pagamentos',
      description: 'Acompanhamento financeiro',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Segurança',
      description: 'Dados protegidos e seguros',
      gradient: 'from-[var(--primary)] to-[var(--accent)]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
      title: 'Suporte',
      description: 'Atendimento dedicado',
      gradient: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/3 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">FinanceHub</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                resetLoginState()
                setShowSignup(false)
                setShowGallery(false)
                setShowLogin(true)
                setTimeout(() => {
                  emailInputRef.current?.focus()
                }, 100)
              }}
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setShowLogin(false)
                setShowGallery(false)
                setShowSignup(true)
                setTimeout(() => {
                  nomeInputRef.current?.focus()
                }, 100)
              }}
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-6 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl shadow-lg hover:bg-[var(--accent)] transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Cadastro
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--primary)]/20">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestão Financeira
              <span className="block text-[var(--primary)] mt-2">Simplificada e Segura</span>
            </h1>

            {/* Description */}
            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-4">
                FinanceHub é uma plataforma SaaS para gestão financeira de clientes dentro de contratos empresariais, centralizando boletos, notas fiscais, pagamentos, histórico de envios e suporte em um único painel moderno e seguro.
              </p>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                A solução foi projetada para oferecer transparência financeira, organização e rastreabilidade, permitindo que clientes acompanhem toda a sua vida financeira durante o período contratual.
              </p>
            </div>


            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!showLogin && !showSignup && !showGallery && !showEmConstrucao && (
                <button
                  onClick={() => {
                    setShowEmConstrucao(true)
                    document.body.style.overflow = 'hidden'
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--primary)] text-lg font-semibold rounded-xl border-2 border-[var(--primary)] shadow-lg hover:bg-[var(--primary)]/5 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <span>Conheça a Plataforma</span>
                </button>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 max-md:shadow-md hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden text-center"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Animated Border Gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
                
                {/* Icon Container */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mx-auto`}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {feature.icon}
                </div>
                
                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-200 group-hover:bg-[var(--primary)] group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-24 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[var(--primary)] mb-2">100%</div>
                <div className="text-sm text-gray-600">Seguro e Confiável</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--primary)] mb-2">24/7</div>
                <div className="text-sm text-gray-600">Disponibilidade</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--primary)] mb-2">100%</div>
                <div className="text-sm text-gray-600">Transparência</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200">
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 scale-100"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                resetLoginState()
                setShowLogin(false)
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* Modal Content - Login com e-mail e senha */}
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Acessar conta
                </h2>
                <p className="text-sm text-gray-600">
                  Digite seu e-mail e senha para entrar
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {loginErro && (
                  <p className="text-sm text-red-600 text-center">{loginErro}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-xl shadow-lg hover:bg-[var(--accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoginLoading ? 'Entrando...' : 'Entrar'}
                </button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        resetLoginState()
                        setShowLogin(false)
                        setShowSignup(true)
                      }}
                      className="text-[var(--primary)] hover:text-[var(--accent)] font-medium transition-colors"
                    >
                      Criar conta
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200">
          <div
            ref={signupModalRef}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 scale-100"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-8">
              {sucessoSignup ? (
                <>
                  {/* Success State */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Conta criada com sucesso!
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Redirecionando para o login...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Signup Form */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Criar conta
                    </h2>
                    <p className="text-sm text-gray-600">
                      Preencha os dados para criar sua conta
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    {/* Nome */}
                    <div>
                      <label htmlFor="signup-nome" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo
                      </label>
                      <input
                        ref={nomeInputRef}
                        type="text"
                        id="signup-nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all bg-white text-gray-900 placeholder-gray-400 border-gray-300"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <EmailInput
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        isValid={signupEmail.length > 0 ? isValidEmail(signupEmail) : undefined}
                      />
                    </div>

                    {/* Senha */}
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Senha (Mínimo 6 caracteres)
                      </label>
                      <PasswordInput
                        id="signup-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        minLength={6}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    {/* Erro */}
                    {erroSignup && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-sm text-red-600 text-center">{erroSignup}</p>
                      </div>
                    )}

                    {/* Botão Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !nome.trim() || !isValidEmail(signupEmail)}
                      className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-xl shadow-lg hover:bg-[var(--accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                    </button>

                    {/* Link para Login */}
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            resetLoginState()
                            setShowSignup(false)
                            setShowLogin(true)
                          }}
                          className="text-[var(--primary)] hover:text-[var(--accent)] font-medium transition-colors"
                        >
                          Fazer login
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Em Construção */}
      {showEmConstrucao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 scale-100">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowEmConstrucao(false)
                document.body.style.overflow = ''
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Em Construção
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estamos trabalhando para trazer uma experiência completa de demonstração da plataforma. Em breve você poderá conhecer todas as funcionalidades do FinanceHub!
              </p>

              <button
                onClick={() => {
                  setShowEmConstrucao(false)
                  document.body.style.overflow = ''
                }}
                className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-xl shadow-lg hover:bg-[var(--accent)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200">
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Conheça a Plataforma</h2>
              <button
                onClick={() => {
                  setShowGallery(false)
                  document.body.style.overflow = ''
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Gallery Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dashboard Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Dashboard Financeiro</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600">Visualize gráficos e indicadores financeiros em tempo real</p>
                </div>

                {/* Boletos Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Gestão de Boletos</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Boletos</h3>
                  <p className="text-sm text-gray-600">Gerencie pagamentos, pendências e vencimentos</p>
                </div>

                {/* Notas Fiscais Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Notas Fiscais</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notas Fiscais</h3>
                  <p className="text-sm text-gray-600">Controle completo de documentos fiscais</p>
                </div>

                {/* Histórico Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Histórico</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Histórico</h3>
                  <p className="text-sm text-gray-600">Acompanhe todo o histórico de transações</p>
                </div>

                {/* Suporte Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Suporte</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Suporte</h3>
                  <p className="text-sm text-gray-600">Sistema completo de tickets e atendimento</p>
                </div>

                {/* Configurações Preview */}
                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-video bg-white rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Configurações</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Configurações</h3>
                  <p className="text-sm text-gray-600">Gerencie usuários e preferências da conta</p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-lg text-gray-700 mb-4">
                  Pronto para começar? Crie sua conta agora mesmo!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setShowGallery(false)
                      setShowSignup(true)
                      document.body.style.overflow = 'hidden'
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl shadow-lg hover:bg-[var(--accent)] transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <span>Criar Conta</span>
                  </button>
                  <button
                    onClick={() => {
                      resetLoginState()
                      setShowGallery(false)
                      setShowLogin(true)
                      document.body.style.overflow = 'hidden'
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--primary)] font-semibold rounded-xl border-2 border-[var(--primary)] shadow-lg hover:bg-[var(--primary)]/5 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <span>Fazer Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">FinanceHub</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                Plataforma SaaS para gestão financeira de clientes dentro de contratos empresariais, centralizando boletos, notas fiscais, pagamentos e suporte em um único painel moderno e seguro.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-[var(--primary)] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-[var(--primary)] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-[var(--primary)] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Produto e Suporte: no mobile lado a lado para economizar espaço */}
            <div className="grid grid-cols-2 gap-6 md:contents">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Produto</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Funcionalidades
                    </a>
                  </li>
                  <li>
                    <a href="#sobre" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Sobre
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Suporte</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#contato" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Contato
                    </a>
                  </li>
                  <li>
                    <a href="#ajuda" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Central de Ajuda
                    </a>
                  </li>
                  <li>
                    <a href="#privacidade" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#termos" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                      Termos de Uso
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                © {new Date().getFullYear()} FinanceHub. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">Consultoria em Telecom & TI</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
