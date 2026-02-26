'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SemEmpresaModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SemEmpresaModal({ isOpen, onClose }: SemEmpresaModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleCriarEmpresa = () => {
    onClose()
    router.push('/dashboard/empresas')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="sem-empresa-modal-title">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 id="sem-empresa-modal-title" className="text-xl font-bold text-gray-900 mb-2">
            Cadastre uma empresa
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Primeiro crie uma empresa para poder abrir a solicitação. Acesse o menu Empresas, cadastre sua empresa e depois volte aqui para criar a solicitação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleCriarEmpresa}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-5 py-3 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar empresa
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center min-h-[44px] rounded-xl border-2 border-gray-200 bg-white text-gray-700 px-5 py-3 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
