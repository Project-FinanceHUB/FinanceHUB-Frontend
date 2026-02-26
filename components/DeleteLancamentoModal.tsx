'use client'

import { useEffect } from 'react'

type DeleteLancamentoModalProps = {
  isOpen: boolean
  protocolo: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteLancamentoModal({ isOpen, protocolo, onClose, onConfirm }: DeleteLancamentoModalProps) {
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

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Excluir lançamento</h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            Tem certeza que deseja excluir o lançamento com protocolo <strong>{protocolo}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-red-700 transition"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
