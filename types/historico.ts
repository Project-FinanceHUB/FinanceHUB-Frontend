export type HistoricoTipo = 'boleto' | 'nota_fiscal' | 'acao_sistema'

export type HistoricoStatus = 'enviado' | 'pendente' | 'processado' | 'erro' | 'concluido' | 'cancelado'

export type HistoricoRegistro = {
  id: string
  tipo: HistoricoTipo
  categoria: string
  protocolo: string
  data: string
  horario: string
  status: HistoricoStatus
  titulo: string
  descricao?: string
  origem?: string
  cnpj?: string
  valor?: string
  observacoes?: string
  dataCriacao: string
  dataAtualizacao?: string
}

export type HistoricoFormData = Omit<HistoricoRegistro, 'id' | 'dataCriacao' | 'dataAtualizacao'>
