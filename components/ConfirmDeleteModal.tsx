'use client'

import { useEffect, useState } from 'react'
import LoadingButton from './LoadingButton'

export type ConfirmDeleteModalProps = {
  isOpen: boolean
  /** Título do modal (ex: "Confirmar exclusão") */
  title?: string
  /** Mensagem principal. Padrão: informa que a ação é irreversível. */
  message?: string
  /** Identificação do item a ser excluído (ex: "Solicitação #123", "usuário João (joao@email.com)"). Opcional. */
  itemDescription?: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

const DEFAULT_TITLE = 'Confirmar exclusão'
const DEFAULT_MESSAGE = 'Esta ação é irreversível e não pode ser desfeita.'

export default function ConfirmDeleteModal({
  isOpen,
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  itemDescription,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsDeleting(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg
              className="w-6 h-6 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <h3 id="confirm-delete-title" className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            {itemDescription ? (
              <>
                Tem certeza que deseja excluir <strong>{itemDescription}</strong>? {message}
              </>
            ) : (
              message
            )}
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 min-h-[44px]"
            >
              Cancelar
            </button>
            <LoadingButton
              type="button"
              onClick={handleConfirm}
              isLoading={isDeleting}
              variant="danger"
              className="flex-1 py-2.5 min-h-[44px]"
            >
              Confirmar exclusão
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  )
}
