'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginForm from './LoginForm'
import BrandingPanel from './BrandingPanel'
import Footer from './Footer'
import Spinner from './Spinner'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const cadastroSucesso = searchParams?.get('cadastro')

  useEffect(() => {
    if (cadastroSucesso === 'sucesso') {
      // Mostrar mensagem de sucesso temporariamente
      const timer = setTimeout(() => {
        // Mensagem já será mostrada pelo componente
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [cadastroSucesso])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel - Branding */}
        <BrandingPanel />
        
        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[var(--background)]">
          <div className="w-full max-w-md">
            {cadastroSucesso === 'sucesso' && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  ✅ Conta criada com sucesso! Faça login para continuar.
                </p>
              </div>
            )}
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-col lg:flex-row flex-1">
          <BrandingPanel />
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[var(--background)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                <Spinner size="md" className="border-white border-t-transparent" />
              </div>
              <p className="text-sm font-medium text-slate-600">Carregando...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
