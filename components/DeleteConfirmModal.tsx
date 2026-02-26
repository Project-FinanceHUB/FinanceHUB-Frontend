'use client'

import ConfirmDeleteModal from './ConfirmDeleteModal'

type DeleteConfirmModalProps = {
  isOpen: boolean
  solicitacaoNumero: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

/** Modal de confirmação de exclusão de solicitação. Usa o padrão ConfirmDeleteModal. */
export default function DeleteConfirmModal({
  isOpen,
  solicitacaoNumero,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      title="Confirmar exclusão"
      message="Esta ação é irreversível e não pode ser desfeita."
      itemDescription={`Solicitação #${solicitacaoNumero}`}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}
