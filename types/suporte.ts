export type MensagemDirecao = 'enviada' | 'recebida'

export type Mensagem = {
  id: string
  solicitacaoId?: string
  direcao: MensagemDirecao
  assunto: string
  conteudo: string
  remetente: string
  dataHora: string
  lida: boolean
  anexo?: string
}

export type MensagemFormData = Omit<Mensagem, 'id' | 'dataHora' | 'lida'>
