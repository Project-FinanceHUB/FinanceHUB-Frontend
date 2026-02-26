'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Solicitacao, SolicitacaoFormData, SolicitacaoStatus } from '@/types/solicitacao'
import type { Company } from '@/types/company'
import MultiFileUpload from './MultiFileUpload'
import LoadingButton from './LoadingButton'
import { onlyDigits, formatCnpjDisplay } from './InputCNPJ'

/**
 * Gera um número de solicitação no formato FIN + 6 números aleatórios
 * Exemplo: FIN123456
 */
function generateSolicitacaoNumero(): string {
  const randomNumbers = Math.floor(100000 + Math.random() * 900000) // Gera número entre 100000 e 999999
  return `FIN${randomNumbers}`
}

/** Retorna o mês atual no Brasil (1–12), respeitando o fuso America/Sao_Paulo. */
function getMesAtualBrasil(): number {
  const formatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'numeric' })
  return parseInt(formatter.format(new Date()), 10)
}

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] as const

/** Limite por arquivo (Vercel: 4.5 MB no corpo da requisição; 2 MB por arquivo deixa margem para boleto + nota) */
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const MAX_FILE_SIZE_MB = 2

type SolicitacaoFormProps = {
  solicitacao?: Solicitacao
  companies: Company[]
  onSubmit: (data: SolicitacaoFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function SolicitacaoForm({ solicitacao, companies, onSubmit, onCancel, isSubmitting = false }: SolicitacaoFormProps) {
  const { user } = useAuth()
  const isEditing = !!solicitacao
  const userId = user?.effectiveOwnerId ?? user?.id ?? undefined

  const firstCompany = companies[0]

  const [formData, setFormData] = useState<SolicitacaoFormData>({
    numero: solicitacao?.numero || generateSolicitacaoNumero(),
    titulo: solicitacao?.titulo || firstCompany?.nome || '',
    origem: solicitacao?.origem ? onlyDigits(solicitacao.origem).slice(0, 14) : (firstCompany?.cnpjs?.[0] ? onlyDigits(firstCompany.cnpjs[0]).slice(0, 14) : ''),
    prioridade: solicitacao?.prioridade || 'media',
    status: solicitacao?.status || 'aberto',
    estagio: solicitacao?.estagio || 'Pendente',
    descricao: solicitacao?.descricao || '',
    mensagem: solicitacao?.mensagem || '',
    mes: solicitacao?.mes ?? getMesAtualBrasil(),
    boleto: solicitacao?.boleto || undefined,
    notaFiscal: solicitacao?.notaFiscal || undefined,
  })

  const [boletoFile, setBoletoFile] = useState<File | null>(null)
  const [notaFiscalFile, setNotaFiscalFile] = useState<File | null>(null)

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    () => companies.find((c) => c.nome === solicitacao?.titulo)?.id || firstCompany?.id || ''
  )

  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || firstCompany

  const [errors, setErrors] = useState<Partial<Record<keyof SolicitacaoFormData, string>>>({})
  const firstErrorRef = useRef<HTMLDivElement | null>(null)

  const scrollToFirstError = useCallback(() => {
    firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Só preencher/resetar o formulário quando mudar a solicitação editada (por id), não a cada re-render
  const solicitacaoIdRef = useRef<string | null>(null)
  useEffect(() => {
    const currentId = solicitacao?.id ?? null
    if (solicitacaoIdRef.current === currentId) return
    solicitacaoIdRef.current = currentId

    if (solicitacao) {
      setFormData({
        numero: solicitacao.numero,
        titulo: solicitacao.titulo,
        origem: solicitacao.origem ? onlyDigits(solicitacao.origem).slice(0, 14) : '',
        prioridade: solicitacao.prioridade,
        status: solicitacao.status,
        estagio: solicitacao.estagio,
        descricao: solicitacao.descricao || '',
        mensagem: solicitacao.mensagem || '',
        mes: solicitacao.mes ?? getMesAtualBrasil(),
      })
      setSelectedCompanyId(companies.find((c) => c.nome === solicitacao.titulo)?.id || firstCompany?.id || '')
    } else {
      setFormData((prev) => ({
        ...prev,
        numero: generateSolicitacaoNumero(),
        titulo: firstCompany?.nome || '',
        origem: firstCompany?.cnpjs?.[0] ? onlyDigits(firstCompany.cnpjs[0]).slice(0, 14) : '',
        mes: getMesAtualBrasil(),
      }))
      setSelectedCompanyId(firstCompany?.id || '')
    }
  }, [solicitacao?.id, solicitacao, companies])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SolicitacaoFormData, string>> = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Razão Social é obrigatória'
    }
    if (!formData.origem.trim()) {
      newErrors.origem = 'CNPJ é obrigatório'
    }
    if (!isEditing) {
      if (!boletoFile) newErrors.boleto = 'Anexe o boleto'
      else if (boletoFile.size > MAX_FILE_SIZE_BYTES) newErrors.boleto = `O boleto deve ter no máximo ${MAX_FILE_SIZE_MB} MB. O arquivo atual tem ${(boletoFile.size / 1024 / 1024).toFixed(1)} MB.`
      if (!notaFiscalFile) newErrors.notaFiscal = 'Anexe a nota fiscal'
      else if (notaFiscalFile.size > MAX_FILE_SIZE_BYTES) newErrors.notaFiscal = `A nota fiscal deve ter no máximo ${MAX_FILE_SIZE_MB} MB. O arquivo atual tem ${(notaFiscalFile.size / 1024 / 1024).toFixed(1)} MB.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        boleto: boletoFile ?? formData.boleto,
        notaFiscal: notaFiscalFile ?? formData.notaFiscal,
      })
    } else {
      setTimeout(scrollToFirstError, 150)
    }
  }

  const handleChange = (field: keyof SolicitacaoFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const statusOptions: Array<{ value: SolicitacaoStatus; label: string; color: string; bgColor: string }> = [
    { value: 'aberto', label: 'Aberto', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    { value: 'pendente', label: 'Pendente', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
    { value: 'aguardando_validacao', label: 'Aguardando Validação', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
    { value: 'aprovado', label: 'Aprovado', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
    { value: 'rejeitado', label: 'Rejeitado', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
    { value: 'concluido', label: 'Concluído', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
    { value: 'cancelado', label: 'Cancelado', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
    { value: 'fechado', label: 'Fechado', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' },
  ]

  const hasErrors = Object.keys(errors).length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {hasErrors && (
        <div ref={firstErrorRef} className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium" role="alert">
          Preencha todos os campos obrigatórios (empresa, CNPJ, boleto e nota fiscal).
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="empresa" className="block text-sm font-bold text-gray-900 mb-2">
            Empresa (Razão Social) <span className="text-red-500">*</span>
          </label>
          <select
            id="empresa"
            value={selectedCompanyId}
            onChange={(e) => {
              const company = companies.find((c) => c.id === e.target.value)
              setSelectedCompanyId(e.target.value)
              if (company) {
                const raw = company.cnpjs[0] ? onlyDigits(company.cnpjs[0]).slice(0, 14) : ''
                setFormData((prev) => ({
                  ...prev,
                  titulo: company.nome,
                  origem: raw,
                }))
              }
            }}
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all duration-200 ${
              errors.titulo 
                ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]'
            }`}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.nome}
              </option>
            ))}
          </select>
          {errors.titulo && (
            <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.titulo}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cnpj" className="block text-sm font-bold text-gray-900 mb-2">
            CNPJ <span className="text-red-500">*</span>
          </label>
          <select
            id="cnpj"
            value={formData.origem}
            onChange={(e) => handleChange('origem', e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none font-mono transition-all duration-200 ${
              errors.origem 
                ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]'
            }`}
          >
            {(currentCompany?.cnpjs || []).map((c) => {
              const digits = onlyDigits(c).slice(0, 14)
              const value = digits || c
              return (
                <option key={value} value={value}>
                  {formatCnpjDisplay(digits) || c}
                </option>
              )
            })}
          </select>
          {errors.origem && (
            <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.origem}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="numero" className="block text-sm font-bold text-gray-900 mb-2">
          ID (gerado automaticamente)
        </label>
        <input
          id="numero"
          type="text"
          value={formData.numero}
          className="w-full rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed font-mono"
          disabled
          readOnly
        />
      </div>

      <div className={errors.mes ? 'rounded-xl ring-2 ring-red-200 ring-offset-2 ring-offset-white p-1 -m-1' : ''}>
        <label htmlFor="mes" className="block text-sm font-bold text-gray-900 mb-1">
          Em qual mês do contrato este boleto se refere? <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Seu contrato tem 12 meses. Esse valor aparece no gráfico de progresso do contrato.
        </p>
        <select
          id="mes"
          value={formData.mes ?? getMesAtualBrasil()}
          onChange={(e) => handleChange('mes', Number(e.target.value))}
          className={`
            w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all duration-200 bg-white
            min-h-[48px] focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]
            ${errors.mes
              ? 'border-red-300 bg-red-50/50 focus:border-red-400'
              : 'border-gray-200 hover:border-gray-300 focus:border-[var(--primary)]'
            }
          `}
        >
          {NOMES_MESES.map((label, i) => (
            <option key={i + 1} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
        {errors.mes && (
          <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.mes}
          </p>
        )}
      </div>

      <input type="hidden" value={formData.titulo} readOnly />
      <input type="hidden" value={formData.origem} readOnly />

      {!isEditing && (
        <div className="space-y-5">
          <p className="text-xs text-gray-500 -mt-1 mb-1">
            Cada arquivo: no máximo {MAX_FILE_SIZE_MB} MB (PDF, JPG ou PNG). Arquivos maiores causam erro no envio.
          </p>
          <MultiFileUpload
            label="Boleto"
            files={boletoFile ? [boletoFile] : []}
            error={errors.boleto}
            required
            minFiles={1}
            maxFiles={1}
            userId={userId}
            onChange={(files) => {
              setBoletoFile(files[0] ?? null)
              if (errors.boleto) setErrors((prev) => ({ ...prev, boleto: undefined }))
            }}
          />
          <MultiFileUpload
            label="Nota Fiscal"
            files={notaFiscalFile ? [notaFiscalFile] : []}
            error={errors.notaFiscal}
            required
            minFiles={1}
            maxFiles={1}
            userId={userId}
            onChange={(files) => {
              setNotaFiscalFile(files[0] ?? null)
              if (errors.notaFiscal) setErrors((prev) => ({ ...prev, notaFiscal: undefined }))
            }}
          />
        </div>
      )}

      <div>
        <label htmlFor="mensagem" className="block text-sm font-bold text-gray-900 mb-2">
          Mensagem <span className="text-gray-500 font-normal text-xs">(Para comunicação com o suporte)</span>
        </label>
        <div className="relative">
          <textarea
            id="mensagem"
            value={formData.mensagem || ''}
            onChange={(e) => handleChange('mensagem', e.target.value)}
            rows={5}
            placeholder="Digite sua mensagem aqui. O suporte poderá visualizar e responder através deste campo."
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all duration-200 resize-y min-h-[120px] ${
              errors.mensagem 
                ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]'
            }`}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{(formData.mensagem || '').length} caracteres</span>
          </div>
        </div>
        {errors.mensagem && (
          <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.mensagem}
          </p>
        )}
      </div>

      {/* Status é definido automaticamente pela fila do SaaS; cliente não pode alterar */}
      {isEditing ? (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Status atual
          </label>
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {statusOptions.find((s) => s.value === formData.status)?.label ?? formData.status}
          </div>
          <p className="text-xs text-gray-500 mt-1">O status é gerenciado pelo suporte e pela fila do sistema.</p>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 sticky bottom-0 left-0 right-0 -mx-6 px-6 py-4 bg-white/95 backdrop-blur-sm z-10 touch-manipulation md:static md:bg-transparent md:py-0 md:-mx-0 md:px-0">
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          variant="primary"
          className="flex-1 py-3 min-h-[48px]"
        >
          {solicitacao ? (
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
              Criar solicitação
            </>
          )}
        </LoadingButton>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 min-h-[48px]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
