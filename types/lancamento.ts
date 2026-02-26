export type LancamentoTipo = 'Boleto' | 'NF'

export type LancamentoStatus = 'enviado' | 'pendente' | 'processado' | 'erro'

export type Lancamento = {
  id: string
  data: string // YYYY-MM-DD
  horario: string // HH:mm
  status: LancamentoStatus
  protocolo: string
  tipo: LancamentoTipo
}

export type LancamentoFormData = Omit<Lancamento, 'id'>
