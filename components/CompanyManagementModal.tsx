'use client'

import { useEffect, useState } from 'react'
import type { Company, CompanyFormData } from '@/types/company'

type CompanyManagementModalProps = {
  isOpen: boolean
  companies: Company[]
  onClose: () => void
  onCreate: (data: CompanyFormData) => void
  onUpdate: (id: string, data: CompanyFormData) => void
  onDelete: (id: string) => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function CompanyManagementModal({
  isOpen,
  companies,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CompanyManagementModalProps) {
  const [showFullModal, setShowFullModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cnpjs, setCnpjs] = useState<string[]>([''])
  const [errors, setErrors] = useState<{ nome?: string; cnpjs?: string }>()

  useEffect(() => {
    if (!isOpen) {
      setShowFullModal(false)
      setEditingId(null)
      setNome('')
      setCnpjs([''])
      setErrors(undefined)
      return
    }

    // Quando abrir, mostra diretamente o modal completo
    setShowFullModal(true)

    // Se houver empresas, carrega a primeira para edição rápida
    if (companies.length > 0 && editingId === null) {
      const first = companies[0]
      setEditingId(first.id)
      setNome(first.nome)
      setCnpjs(first.cnpjs.length ? first.cnpjs : [''])
    }
  }, [isOpen, companies, editingId])

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

  if (!isOpen || !showFullModal) return null

  const resetForm = () => {
    setEditingId(null)
    setNome('')
    setCnpjs([''])
    setErrors(undefined)
  }

  const handleSelectCompany = (company: Company) => {
    setEditingId(company.id)
    setNome(company.nome)
    setCnpjs(company.cnpjs.length ? company.cnpjs : [''])
    setErrors(undefined)
  }

  const handleAddCnpjField = () => {
    setCnpjs((prev) => [...prev, ''])
  }

  const handleChangeCnpj = (index: number, value: string) => {
    setCnpjs((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  const handleRemoveCnpj = (index: number) => {
    setCnpjs((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const trimmedCnpjs = cnpjs.map((c) => c.trim()).filter(Boolean)
    const newErrors: { nome?: string; cnpjs?: string } = {}
    if (!nome.trim()) newErrors.nome = 'Nome da empresa é obrigatório'
    if (trimmedCnpjs.length === 0) newErrors.cnpjs = 'Informe ao menos um CNPJ válido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const data: CompanyFormData = {
      nome: nome.trim(),
      cnpjs: cnpjs.map((c) => c.trim()).filter(Boolean),
      ativo: true,
    }
    if (editingId) {
      onUpdate(editingId, data)
    } else {
      onCreate(data)
    }
    resetForm()
    onClose()
  }

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Tem certeza que deseja remover esta empresa?')) {
      return
    }
    onDelete(id)
    if (editingId === id) {
      resetForm()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Completo */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Gerenciar empresas
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Cadastre e gerencie empresas e CNPJs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 overflow-hidden bg-gray-50/30">
          {/* Lista de empresas */}
          <div className="p-5 overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Empresas cadastradas</h3>
                <p className="text-xs text-gray-500 mt-0.5">Selecione uma empresa para editar</p>
              </div>
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">
                {companies.length}
              </span>
            </div>

            {companies.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Nenhuma empresa cadastrada ainda
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Use o formulário ao lado para criar a primeira
                </p>
              </div>
            )}

            <ul className="space-y-2.5">
              {companies.map((company) => (
                <li
                  key={company.id}
                  className={cn(
                    'group relative rounded-xl border-2 px-4 py-3.5 text-sm flex items-start justify-between gap-3 cursor-pointer transition-all duration-200',
                    editingId === company.id
                      ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 shadow-md shadow-[var(--primary)]/10'
                      : 'border-gray-200 bg-white hover:border-[var(--primary)]/30 hover:bg-gray-50 hover:shadow-sm'
                  )}
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      {editingId === company.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                          {company.nome}
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {company.cnpjs.map((cnpj) => (
                            <div key={cnpj} className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded inline-block">
                              {cnpj}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(company.id)
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    aria-label="Remover empresa"
                    title="Remover empresa"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulário de empresa */}
          <div className="p-5 overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingId ? 'Editar empresa' : 'Nova empresa'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId ? 'Atualize as informações da empresa' : 'Preencha os dados para criar uma nova empresa'}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--accent)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--primary)]/5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Nova empresa
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-sm outline-none bg-white transition-all duration-200',
                    errors?.nome 
                      ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]'
                  )}
                  placeholder="Ex: Empresa Exemplo LTDA"
                />
                {errors?.nome && (
                  <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.nome}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    CNPJs <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCnpjField}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--accent)] transition-colors px-2.5 py-1 rounded-lg hover:bg-[var(--primary)]/5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar CNPJ
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cnpjs.map((cnpj, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={cnpj}
                        onChange={(e) => handleChangeCnpj(index, e.target.value)}
                        className={cn(
                          'flex-1 rounded-xl border-2 px-4 py-3 text-sm outline-none bg-white font-mono transition-all duration-200',
                          errors?.cnpjs 
                            ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                            : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]'
                        )}
                        placeholder="12.345.678/0001-90"
                      />
                      {cnpjs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCnpj(index)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                          aria-label="Remover CNPJ"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors?.cnpjs && (
                  <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.cnpjs}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white px-5 py-3 text-sm font-bold shadow-lg hover:bg-[var(--accent)] hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingId ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar alterações
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Criar empresa
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

