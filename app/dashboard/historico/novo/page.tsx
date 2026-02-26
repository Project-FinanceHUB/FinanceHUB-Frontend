'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHistorico } from '@/context/HistoricoContext'
import type { HistoricoFormData, HistoricoTipo, HistoricoStatus } from '@/types/historico'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const TIPOS: { value: HistoricoTipo; label: string }[] = [
  { value: 'boleto', label: 'Boleto' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'acao_sistema', label: 'Ação do Sistema' },
]

const STATUS_OPTS: { value: HistoricoStatus; label: string }[] = [
  { value: 'enviado', label: 'Enviado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

const defaultForm: HistoricoFormData = {
  tipo: 'boleto',
  categoria: 'Boleto',
  protocolo: '',
  data: new Date().toISOString().slice(0, 10),
  horario: new Date().toTimeString().slice(0, 5),
  status: 'pendente',
  titulo: '',
  descricao: '',
  origem: '',
  cnpj: '',
  valor: '',
  observacoes: '',
}

export default function NovoRegistroPage() {
  const router = useRouter()
  const { addRegistro } = useHistorico()

  const [form, setForm] = useState<HistoricoFormData>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const err: Record<string, string> = {}
    if (!form.protocolo.trim()) err.protocolo = 'Protocolo é obrigatório'
    if (!form.titulo.trim()) err.titulo = 'Título é obrigatório'
    if (!form.data.trim()) err.data = 'Data é obrigatória'
    if (!form.horario.trim()) err.horario = 'Horário é obrigatório'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const cat = form.tipo === 'boleto' ? 'Boleto' : form.tipo === 'nota_fiscal' ? 'Nota Fiscal' : 'Ação'
    const data = { ...form, categoria: form.categoria || cat }
    addRegistro(data)
    router.push('/dashboard/historico')
  }

  const handleCancel = () => {
    router.push('/dashboard/historico')
  }

  const inputBase = 'w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200'
  const inputError = 'border-red-300 bg-red-50/50'

  return (
    <div className="px-4 sm:px-6 py-6 w-full max-w-full">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 md:mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 min-h-[44px] rounded-xl px-2 -ml-2 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para histórico
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Novo registro</h1>
              <p className="text-sm text-gray-500 mt-0.5">Adicione um novo registro ao histórico.</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
            <h2 className="text-base font-bold text-gray-900">Dados do registro</h2>
            <p className="text-xs text-gray-500 mt-0.5">Preencha os campos obrigatórios.</p>
          </div>
          <div className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => {
                    const v = e.target.value as HistoricoTipo
                    setForm((f) => ({
                      ...f,
                      tipo: v,
                      categoria: v === 'boleto' ? 'Boleto' : v === 'nota_fiscal' ? 'Nota Fiscal' : 'Ação',
                    }))
                  }}
                  className={inputBase}
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as HistoricoStatus }))}
                  className={inputBase}
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protocolo *</label>
              <input
                value={form.protocolo}
                onChange={(e) => setForm((f) => ({ ...f, protocolo: e.target.value }))}
                className={cn(inputBase, errors.protocolo && inputError)}
                placeholder="Ex: BOL-2025-001234"
              />
              {errors.protocolo && <p className="mt-1 text-xs text-red-600">{errors.protocolo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className={cn(inputBase, errors.titulo && inputError)}
                placeholder="Ex: Boleto - BOL-2025-001234"
              />
              {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  className={cn(inputBase, errors.data && inputError)}
                />
                {errors.data && <p className="mt-1 text-xs text-red-600">{errors.data}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                <input
                  type="time"
                  value={form.horario}
                  onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
                  className={cn(inputBase, errors.horario && inputError)}
                />
                {errors.horario && <p className="mt-1 text-xs text-red-600">{errors.horario}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                className={cn(inputBase, 'min-h-[100px]')}
                placeholder="Descrição ou detalhes do registro"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origem / CNPJ</label>
                <input
                  value={form.origem || form.cnpj}
                  onChange={(e) => setForm((f) => ({ ...f, origem: e.target.value, cnpj: e.target.value }))}
                  className={inputBase}
                  placeholder="Ex: 12.345.678/0001-90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  className={inputBase}
                  placeholder="Ex: R$ 1.250,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                className={cn(inputBase, 'min-h-[80px]')}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-5 py-3 text-sm font-bold shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl transition-all duration-200"
              >
                Adicionar registro
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
