export type SolicitacaoStatus = 
  | 'aberto' 
  | 'pendente' 
  | 'em_andamento' 
  | 'aguardando_validacao' 
  | 'aprovado' 
  | 'rejeitado' 
  | 'concluido' 
  | 'cancelado' 
  | 'fechado'
export type SolicitacaoPriority = 'baixa' | 'media' | 'alta'
export type SolicitacaoStage = 'Pendente' | 'Em revisão' | 'Aguardando validação' | 'Fechado'

export type Solicitacao = {
  id: string
  numero: string
  titulo: string
  origem: string
  prioridade: SolicitacaoPriority
  status: SolicitacaoStatus
  estagio: SolicitacaoStage
  descricao?: string
  mensagem?: string
  /** Mês do contrato (1-12) para refletir no gráfico de boletos */
  mes?: number
  boleto?: File | string
  notaFiscal?: File | string
  /** Caminho do boleto no servidor (retornado pela API) */
  boletoPath?: string
  notaFiscalPath?: string
  visualizado?: boolean
  visualizadoEm?: string
  respondido?: boolean
  respondidoEm?: string
  dataCriacao?: string
  dataAtualizacao?: string
}

export type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>
