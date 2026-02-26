'use client'

import { useEffect, useState } from 'react'
import { useHistorico } from '@/context/HistoricoContext'
import type { HistoricoRegistro, HistoricoFormData, HistoricoTipo, HistoricoStatus } from '@/types/historico'

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

function formatarData(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function BadgeStatus({ status }: { status: HistoricoStatus }) {
  const tones: Record<string, string> = {
    enviado: 'bg-sky-50 text-sky-700 ring-sky-200',
    pendente: 'bg-amber-50 text-amber-800 ring-amber-200',
    processado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    erro: 'bg-rose-50 text-rose-700 ring-rose-200',
    concluido: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelado: 'bg-gray-100 text-gray-700 ring-gray-200',
  }
  const opt = STATUS_OPTS.find((s) => s.value === status)
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', tones[status] ?? 'bg-gray-100 text-gray-700')}>
      {opt?.label ?? status}
    </span>
  )
}

function BadgeTipo({ tipo }: { tipo: HistoricoTipo }) {
  const tones: Record<string, string> = {
    boleto: 'bg-amber-50 text-amber-800',
    nota_fiscal: 'bg-blue-50 text-blue-700',
    acao_sistema: 'bg-gray-100 text-gray-700',
  }
  const opt = TIPOS.find((t) => t.value === tipo)
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tipo] ?? 'bg-gray-100')}>
      {opt?.label ?? tipo}
    </span>
  )
}

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

export default function HistoricoModal() {
  const {
    registros,
    addRegistro,
    updateRegistro,
    deleteRegistro,
    syncFromLancamentos,
    historicoModalOpen,
    setHistoricoModalOpen,
    selectedRegistroId,
    setSelectedRegistroId,
  } = useHistorico()

  const [filtroTipo, setFiltroTipo] = useState<HistoricoTipo | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<HistoricoStatus | 'todos'>('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [form, setForm] = useState<HistoricoFormData>(defaultForm)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (historicoModalOpen) {
      document.body.style.overflow = 'hidden'
      syncFromLancamentos()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [historicoModalOpen, syncFromLancamentos])

  useEffect(() => {
    if (!historicoModalOpen) {
      setForm(defaultForm)
      setIsCreating(false)
      setEditingId(null)
      setSelectedRegistroId(null)
      setErrors({})
    }
  }, [historicoModalOpen, setSelectedRegistroId])

  if (!historicoModalOpen) return null

  const handleClose = () => setHistoricoModalOpen(false)

  const filtered = registros.filter((r) => {
    if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false
    if (filtroStatus !== 'todos' && r.status !== filtroStatus) return false
    if (filtroBusca.trim()) {
      const q = filtroBusca.toLowerCase()
      return (
        r.protocolo.toLowerCase().includes(q) ||
        r.titulo.toLowerCase().includes(q) ||
        (r.descricao ?? '').toLowerCase().includes(q) ||
        (r.origem ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const selectedRegistro = selectedRegistroId ? registros.find((r) => r.id === selectedRegistroId) : null

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
    if (editingId) {
      updateRegistro(editingId, data)
      setEditingId(null)
    } else {
      addRegistro(data)
    }
    setForm(defaultForm)
    setIsCreating(false)
    setErrors({})
  }

  const handleEdit = (r: HistoricoRegistro) => {
    setEditingId(r.id)
    setSelectedRegistroId(r.id)
    setForm({
      tipo: r.tipo,
      categoria: r.categoria,
      protocolo: r.protocolo,
      data: r.data,
      horario: r.horario,
      status: r.status,
      titulo: r.titulo,
      descricao: r.descricao ?? '',
      origem: r.origem ?? '',
      cnpj: r.cnpj ?? '',
      valor: r.valor ?? '',
      observacoes: r.observacoes ?? '',
    })
    setIsCreating(false)
    setErrors({})
  }

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Excluir este registro do histórico?')) return
    deleteRegistro(id)
    if (selectedRegistroId === id) setSelectedRegistroId(null)
    if (editingId === id) {
      setEditingId(null)
      setForm(defaultForm)
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
    setIsCreating(false)
    setEditingId(null)
    setSelectedRegistroId(null)
    setErrors({})
  }

  const inputBase = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-white border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40'
  const inputError = 'border-red-300'
  const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition'
  const btnSecondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Histórico completo</h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 overflow-hidden min-h-0">
          {/* Lista */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => syncFromLancamentos()}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Sincronizar com lançamentos
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsCreating(true); setForm({ ...defaultForm, tipo: 'boleto' }) }}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  + Novo registro
                </button>
              </div>
              <input
                type="text"
                placeholder="Buscar por protocolo, título..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className={cn(inputBase, 'py-2')}
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as HistoricoTipo | 'todos')}
                  className={cn(inputBase, 'py-1.5 text-xs w-auto')}
                >
                  <option value="todos">Todos os tipos</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as HistoricoStatus | 'todos')}
                  className={cn(inputBase, 'py-1.5 text-xs w-auto')}
                >
                  <option value="todos">Todos os status</option>
                  {STATUS_OPTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 && (
                <li className="text-sm text-gray-500 py-4">Nenhum registro encontrado.</li>
              )}
              {filtered.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition',
                    selectedRegistroId === r.id ? 'border-[var(--primary)] bg-[var(--secondary)]/40' : 'border-gray-200'
                  )}
                  onClick={() => { setSelectedRegistroId(r.id); setEditingId(null); setIsCreating(false) }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">{r.titulo}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                        <BadgeTipo tipo={r.tipo} />
                        <BadgeStatus status={r.status} />
                        <span className="text-xs text-gray-500 font-mono">{r.protocolo}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatarData(r.data)} às {r.horario}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(r) }}
                        className="w-7 h-7 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[rgba(3,154,66,0.08)] flex items-center justify-center"
                        title="Editar"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                        className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                        title="Excluir"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Painel direito: detalhe ou formulário */}
          <div className="p-4 sm:p-5 overflow-y-auto">
            {(isCreating || editingId) ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">{editingId ? 'Editar registro' : 'Novo registro'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                  <div className="grid grid-cols-2 gap-3">
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
                      className={cn(inputBase, 'min-h-[80px]')}
                      placeholder="Descrição ou detalhes do registro"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                      className={cn(inputBase, 'min-h-[60px]')}
                      placeholder="Observações adicionais"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleSave} className={btnPrimary}>
                      {editingId ? 'Salvar alterações' : 'Adicionar'}
                    </button>
                    <button type="button" onClick={resetForm} className={btnSecondary}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedRegistro ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Registro completo</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Protocolo</dt>
                    <dd className="font-mono text-gray-900 mt-0.5">{selectedRegistro.protocolo}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Tipo / Status</dt>
                    <dd className="mt-0.5 flex gap-2">
                      <BadgeTipo tipo={selectedRegistro.tipo} />
                      <BadgeStatus status={selectedRegistro.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Data e horário</dt>
                    <dd className="text-gray-900 mt-0.5">{formatarData(selectedRegistro.data)} às {selectedRegistro.horario}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Título</dt>
                    <dd className="text-gray-900 mt-0.5">{selectedRegistro.titulo}</dd>
                  </div>
                  {selectedRegistro.descricao && (
                    <div>
                      <dt className="text-gray-500 font-medium">Descrição</dt>
                      <dd className="text-gray-900 mt-0.5">{selectedRegistro.descricao}</dd>
                    </div>
                  )}
                  {selectedRegistro.origem && (
                    <div>
                      <dt className="text-gray-500 font-medium">Origem / CNPJ</dt>
                      <dd className="text-gray-900 mt-0.5 font-mono">{selectedRegistro.origem}</dd>
                    </div>
                  )}
                  {selectedRegistro.valor && (
                    <div>
                      <dt className="text-gray-500 font-medium">Valor</dt>
                      <dd className="text-gray-900 mt-0.5 font-semibold">{selectedRegistro.valor}</dd>
                    </div>
                  )}
                  {selectedRegistro.observacoes && (
                    <div>
                      <dt className="text-gray-500 font-medium">Observações</dt>
                      <dd className="text-gray-900 mt-0.5">{selectedRegistro.observacoes}</dd>
                    </div>
                  )}
                  {selectedRegistro.dataAtualizacao && (
                    <div>
                      <dt className="text-gray-500 font-medium">Última atualização</dt>
                      <dd className="text-gray-900 mt-0.5 text-xs">{new Date(selectedRegistro.dataAtualizacao).toLocaleString('pt-BR')}</dd>
                    </div>
                  )}
                </dl>
                <button
                  type="button"
                  onClick={() => handleEdit(selectedRegistro)}
                  className={cn(btnPrimary, 'mt-4')}
                >
                  Editar registro
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">Selecione um registro ou crie um novo.</p>
                <button
                  type="button"
                  onClick={() => { setIsCreating(true); setForm({ ...defaultForm, tipo: 'boleto' }) }}
                  className={cn(btnPrimary, 'mt-4')}
                >
                  + Novo registro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
