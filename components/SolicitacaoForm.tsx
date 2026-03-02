'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import apiConfig from '@/lib/api'
import type { Solicitacao, SolicitacaoFormData, SolicitacaoStatus } from '@/types/solicitacao'
import type { Company } from '@/types/company'
import MultiFileUpload from './MultiFileUpload'
import LoadingButton from './LoadingButton'
import { onlyDigits, formatCnpjDisplay } from './InputCNPJ'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function formatarDataHora(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

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
  const { user, token } = useAuth()
  const toast = useToast()
  const isEditing = !!solicitacao
  const userId = user?.effectiveOwnerId ?? user?.id ?? undefined
  const [arquivoCarregando, setArquivoCarregando] = useState<'boleto' | 'nota-fiscal' | null>(null)
  const boletoInputRef = useRef<HTMLInputElement>(null)
  const notaFiscalInputRef = useRef<HTMLInputElement>(null)
  const ACCEPT_UPLOAD = '.pdf,.xml,.jpg,.jpeg,.png'

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

  const abrirArquivo = useCallback(async (tipo: 'boleto' | 'nota-fiscal', acao: 'visualizar' | 'baixar') => {
    if (!token || !solicitacao?.id) return
    setArquivoCarregando(tipo)
    try {
      const url = `${apiConfig.baseURL}/api/solicitacoes/${solicitacao.id}/arquivo/${tipo}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = typeof body?.error === 'string' ? body.error : (res.status === 404 ? 'Arquivo não encontrado' : 'Erro ao carregar o arquivo')
        throw new Error(msg)
      }
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const nomeArquivo = tipo === 'boleto' ? `boleto-${solicitacao.numero}.pdf` : `nota-fiscal-${solicitacao.numero}.pdf`
      if (acao === 'baixar') {
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = nomeArquivo
        a.click()
        URL.revokeObjectURL(objectUrl)
        toast?.success?.('Download iniciado')
      } else {
        const novaJanela = window.open(objectUrl, '_blank', 'noopener,noreferrer')
        if (!novaJanela) {
          URL.revokeObjectURL(objectUrl)
          const a = document.createElement('a')
          a.href = objectUrl
          a.download = nomeArquivo
          a.click()
          URL.revokeObjectURL(objectUrl)
          toast?.info?.('Abra o arquivo baixado para visualizar (pop-up foi bloqueado)')
        } else {
          setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
        }
      }
    } catch (e) {
      toast?.error?.(e instanceof Error ? e.message : 'Não foi possível abrir o arquivo')
    } finally {
      setArquivoCarregando(null)
    }
  }, [token, solicitacao?.id, solicitacao?.numero, toast])

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
  const sol: Solicitacao | undefined = isEditing ? solicitacao : undefined
  const temBoleto = Boolean(sol?.boletoPath ?? (typeof sol?.boleto === 'string' ? sol.boleto : false))
  const temNotaFiscal = Boolean(sol?.notaFiscalPath ?? (typeof sol?.notaFiscal === 'string' ? sol.notaFiscal : false))

  return (
    <form onSubmit={handleSubmit} className={isEditing ? 'flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm min-h-0' : 'space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm'}>
      {hasErrors && (
        <div ref={firstErrorRef} className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium mx-6 mt-6" role="alert">
          Preencha todos os campos obrigatórios (empresa, CNPJ, boleto e nota fiscal).
        </div>
      )}

      {isEditing ? (
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30 space-y-6">
          {/* Card: Informações da Solicitação (mesmo layout do modal de detalhes) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informações da Solicitação
            </h3>

            {/* Linha 1: Empresa, CNPJ, Mês */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Empresa (Razão Social) <span className="text-red-500">*</span></label>
                <select
                  id="empresa"
                  value={selectedCompanyId}
                  onChange={(e) => {
                    const company = companies.find((c) => c.id === e.target.value)
                    setSelectedCompanyId(e.target.value)
                    if (company) {
                      const raw = company.cnpjs[0] ? onlyDigits(company.cnpjs[0]).slice(0, 14) : ''
                      setFormData((prev) => ({ ...prev, titulo: company.nome, origem: raw }))
                    }
                  }}
                  className={cn('w-full rounded-xl border-2 px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-[var(--primary)]', errors.titulo ? 'border-red-300' : 'border-gray-200')}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">CNPJ <span className="text-red-500">*</span></label>
                <select
                  id="cnpj"
                  value={formData.origem}
                  onChange={(e) => handleChange('origem', e.target.value)}
                  className={cn('w-full rounded-xl border-2 px-4 py-2.5 text-sm outline-none font-mono bg-white focus:ring-2 focus:ring-[var(--primary)]', errors.origem ? 'border-red-300' : 'border-gray-200')}
                >
                  {(currentCompany?.cnpjs || []).map((c) => {
                    const digits = onlyDigits(c).slice(0, 14)
                    const value = digits || c
                    return <option key={value} value={value}>{formatCnpjDisplay(digits) || c}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mês do contrato <span className="text-red-500">*</span></label>
                <select
                  id="mes"
                  value={formData.mes ?? getMesAtualBrasil()}
                  onChange={(e) => handleChange('mes', Number(e.target.value))}
                  className={cn('w-full rounded-xl border-2 px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-[var(--primary)]', errors.mes ? 'border-red-300' : 'border-gray-200')}
                >
                  {NOMES_MESES.map((label, i) => (
                    <option key={i + 1} value={i + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linha 2: ID e Status */}
            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ID</label>
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50/80 px-4 py-2.5">
                  <span className="text-sm font-mono text-gray-700 tabular-nums">{formData.numero || '—'}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Gerado automaticamente</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50/80 px-4 py-2.5">
                  <span className="text-sm font-semibold text-gray-800">{statusOptions.find((s) => s.value === formData.status)?.label ?? formData.status}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Alterado pelo suporte</p>
              </div>
            </div>
          </div>

          {/* Card: Status de Comunicação */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Status de Comunicação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', solicitacao?.visualizado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400')}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visualizado</p>
                  <p className={cn('text-sm font-medium mt-0.5', solicitacao?.visualizado ? 'text-green-700' : 'text-gray-500')}>
                    {solicitacao?.visualizado ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', solicitacao?.respondido ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400')}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Respondido</p>
                  <p className={cn('text-sm font-medium mt-0.5', solicitacao?.respondido ? 'text-blue-700' : 'text-gray-500')}>
                    {solicitacao?.respondido ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Arquivos anexados (mesmo layout do modal de detalhes + opção de substituir) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Arquivos anexados</h3>
                <p className="text-xs text-gray-500 mt-0.5">Documentos enviados na abertura desta solicitação.</p>
              </div>
            </div>
            <input
              ref={boletoInputRef}
              type="file"
              accept={ACCEPT_UPLOAD}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && file.size <= MAX_FILE_SIZE_BYTES) {
                  setBoletoFile(file)
                  if (errors.boleto) setErrors((p) => ({ ...p, boleto: undefined }))
                } else if (file) {
                  setErrors((p) => ({ ...p, boleto: `Máximo ${MAX_FILE_SIZE_MB} MB por arquivo.` }))
                }
                e.target.value = ''
              }}
            />
            <input
              ref={notaFiscalInputRef}
              type="file"
              accept={ACCEPT_UPLOAD}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && file.size <= MAX_FILE_SIZE_BYTES) {
                  setNotaFiscalFile(file)
                  if (errors.notaFiscal) setErrors((p) => ({ ...p, notaFiscal: undefined }))
                } else if (file) {
                  setErrors((p) => ({ ...p, notaFiscal: `Máximo ${MAX_FILE_SIZE_MB} MB por arquivo.` }))
                }
                e.target.value = ''
              }}
            />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {temBoleto && (
                <div className="rounded-xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l2 2v16l-2 1-2 1-2-1-2 1-2-1-2 1-2-1V3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 8h7M8.5 12h7M8.5 16h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Boleto</p>
                      <p className="text-xs text-gray-500 mt-0.5">Documento de pagamento</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button type="button" onClick={() => abrirArquivo('boleto', 'visualizar')} disabled={arquivoCarregando !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700 disabled:opacity-60">
                          {arquivoCarregando === 'boleto' ? 'Abrindo...' : 'Visualizar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => boletoInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white text-amber-800 px-3 py-1.5 text-xs font-semibold hover:bg-amber-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Adicionar
                        </button>
                      </div>
                      {boletoFile && (
                        <p className="text-xs text-amber-800 mt-2 flex items-center gap-1.5">
                          <span className="truncate">{boletoFile.name}</span>
                          <button type="button" onClick={() => setBoletoFile(null)} className="text-amber-600 hover:underline shrink-0">Remover</button>
                        </p>
                      )}
                      {errors.boleto && <p className="text-xs text-red-600 mt-1">{errors.boleto}</p>}
                    </div>
                  </div>
                </div>
              )}
              {temNotaFiscal && (
                <div className="rounded-xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Nota fiscal</p>
                      <p className="text-xs text-gray-500 mt-0.5">Comprovante fiscal</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button type="button" onClick={() => abrirArquivo('nota-fiscal', 'visualizar')} disabled={arquivoCarregando !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-sky-700 disabled:opacity-60">
                          {arquivoCarregando === 'nota-fiscal' ? 'Abrindo...' : 'Visualizar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => notaFiscalInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white text-sky-800 px-3 py-1.5 text-xs font-semibold hover:bg-sky-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Adicionar
                        </button>
                      </div>
                      {notaFiscalFile && (
                        <p className="text-xs text-sky-800 mt-2 flex items-center gap-1.5">
                          <span className="truncate">{notaFiscalFile.name}</span>
                          <button type="button" onClick={() => setNotaFiscalFile(null)} className="text-sky-600 hover:underline shrink-0">Remover</button>
                        </p>
                      )}
                      {errors.notaFiscal && <p className="text-xs text-red-600 mt-1">{errors.notaFiscal}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Mensagem Inicial (editável) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Mensagem Inicial
            </h3>
            <div className="relative">
              <textarea
                id="mensagem"
                value={formData.mensagem || ''}
                onChange={(e) => handleChange('mensagem', e.target.value)}
                rows={5}
                placeholder="Digite sua mensagem para o suporte."
                className={cn('w-full rounded-xl border-2 px-4 py-3 text-sm outline-none resize-y min-h-[120px] bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]')}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {(formData.mensagem || '').length} caracteres
              </div>
            </div>
            {solicitacao?.dataCriacao && (
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                Enviada em {formatarDataHora(solicitacao.dataCriacao)}
              </p>
            )}
          </div>
        </div>
      ) : (
      <>
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

      <div className="space-y-5">
        <p className="text-xs text-gray-500 -mt-1 mb-1">
          {isEditing
            ? 'Para substituir um documento, envie um novo arquivo. Cada arquivo: no máximo ' + MAX_FILE_SIZE_MB + ' MB (PDF, JPG ou PNG).'
            : `Cada arquivo: no máximo ${MAX_FILE_SIZE_MB} MB (PDF, JPG ou PNG). Arquivos maiores causam erro no envio.`
          }
        </p>
        <div>
          {isEditing && temBoleto && (
            <p className="text-xs text-emerald-700 font-medium mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Boleto já anexado na abertura. Envie um novo arquivo apenas se quiser substituir.
            </p>
          )}
          <MultiFileUpload
            label="Boleto"
            files={boletoFile ? [boletoFile] : []}
            error={errors.boleto}
            required={!isEditing}
            minFiles={isEditing ? 0 : 1}
            maxFiles={1}
            userId={userId}
            onChange={(files) => {
              setBoletoFile(files[0] ?? null)
              if (errors.boleto) setErrors((prev) => ({ ...prev, boleto: undefined }))
            }}
          />
        </div>
        <div>
          {isEditing && temNotaFiscal && (
            <p className="text-xs text-emerald-700 font-medium mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nota fiscal já anexada na abertura. Envie um novo arquivo apenas se quiser substituir.
            </p>
          )}
          <MultiFileUpload
            label="Nota Fiscal"
            files={notaFiscalFile ? [notaFiscalFile] : []}
            error={errors.notaFiscal}
            required={!isEditing}
            minFiles={isEditing ? 0 : 1}
            maxFiles={1}
            userId={userId}
            onChange={(files) => {
              setNotaFiscalFile(files[0] ?? null)
              if (errors.notaFiscal) setErrors((prev) => ({ ...prev, notaFiscal: undefined }))
            }}
          />
        </div>
      </div>

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

      </>

      )}

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
