'use client'

import { useEffect, useState } from 'react'
import type { Solicitacao } from '@/types/solicitacao'
import type { Company } from '@/types/company'
import SolicitacaoForm from './SolicitacaoForm'
import type { SolicitacaoFormData } from '@/types/solicitacao'

type SolicitacaoModalProps = {
  isOpen: boolean
  solicitacao?: Solicitacao
  companies: Company[]
  onClose: () => void
  onSubmit: (data: SolicitacaoFormData) => void
}

export default function SolicitacaoModal({ isOpen, solicitacao, companies, onClose, onSubmit }: SolicitacaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (!isOpen) return null

  const handleSubmit = async (data: SolicitacaoFormData) => {
    setIsSubmitting(true)
    try {
      await (onSubmit as (data: SolicitacaoFormData) => void | Promise<void>)(data)
      onClose()
    } catch {
      // Erro já tratado pelo caller (toast)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="solicitacao-modal-title">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] min-h-[50vh] md:min-h-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 id="solicitacao-modal-title" className="text-xl font-bold text-gray-900">
                {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {solicitacao ? 'Atualize as informações da solicitação' : 'Preencha os dados para criar uma nova solicitação'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-110 touch-manipulation"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 bg-gray-50/30 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <SolicitacaoForm solicitacao={solicitacao} companies={companies} onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  )
}
