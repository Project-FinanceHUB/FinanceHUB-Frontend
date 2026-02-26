'use client'

import { useState } from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const FAQ_ITEMS = [
  {
    id: 'solicitacoes',
    pergunta: 'O que são solicitações e como criar uma?',
    resposta: 'Solicitações são os registros que você envia para a FinanceHub (boletos, notas fiscais e outras demandas). Para criar: use "Abrir nova solicitação" no menu ou o botão flutuante no celular. Preencha empresa (razão social), CNPJ, o mês do contrato (Janeiro a Dezembro), descrição e anexe o boleto e a nota fiscal. Você pode editar ou ver detalhes pela tabela do Dashboard ou pela página Histórico.',
  },
  {
    id: 'empresas',
    pergunta: 'Como gerencio minhas empresas e CNPJs?',
    resposta: 'Em "Empresas" no menu você cadastra e edita empresas (razão social e um ou mais CNPJs). Ao criar uma solicitação, a empresa escolhida preenche automaticamente razão social e CNPJ. Mantenha os dados atualizados para evitar erros nos envios.',
  },
  {
    id: 'historico',
    pergunta: 'Onde vejo o histórico de envios?',
    resposta: 'A página "Histórico" mostra todas as solicitações já enviadas, com número do protocolo, data e status. Use os filtros por status (Aberto, Pendente, Em andamento, Concluído) e a busca por protocolo, título ou descrição. Clique em um registro para ver detalhes, editar ou excluir.',
  },
  {
    id: 'boletos',
    pergunta: 'Como envio e acompanho boletos?',
    resposta: 'Ao criar uma solicitação, anexe o boleto e a nota fiscal e informe o mês do contrato (Janeiro a Dezembro). No Dashboard, o gráfico "Pagamentos de Boletos" mostra a evolução dos 12 meses por status (Pagos, Pendentes, Vencidos). Você pode filtrar as séries exibidas no gráfico conforme as suas solicitações.',
  },
  {
    id: 'suporte',
    pergunta: 'Como entro em contato com o suporte?',
    resposta: 'Acesse "Suporte" no menu (em Conta e Suporte). Lá você pode enviar mensagens ao atendimento e vinculá-las a uma solicitação específica. As respostas aparecem nos detalhes da solicitação correspondente. O ícone de notificação no topo da tela avisa quando há novas mensagens não lidas.',
  },
  {
    id: 'dashboard',
    pergunta: 'O que aparece no Dashboard?',
    resposta: 'O Dashboard exibe: (1) cards de resumo — Boletos em aberto, Solicitações pendentes e Mensagens não lidas; (2) gráfico de Pagamentos de Boletos (12 meses do contrato) com filtros por status; (3) tabela de solicitações com busca, filtros e opção de exibir 10, 20, 30 ou 50 itens. Na tabela você abre detalhes, edita ou exclui solicitações.',
  },
  {
    id: 'configuracoes',
    pergunta: 'Como altero meus dados ou configurações?',
    resposta: 'Use "Configurações" no menu (em Conta e Suporte) para alterar dados da conta e preferências. O ícone do seu avatar no canto superior direito abre o perfil e a opção de sair da conta.',
  },
]

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('w-5 h-5 text-gray-500 transition-transform duration-200', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null)

  return (
    <div className="px-4 sm:px-6 py-6 md:py-8 w-full max-w-full">
      <div className="mb-6 md:mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Perguntas frequentes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tire dúvidas sobre solicitações, mês do contrato, gráfico de boletos, empresas, histórico e suporte.
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className={cn(
                  'border-b border-gray-100 last:border-b-0',
                  isOpen && 'bg-gray-50/50'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 pr-2">{item.pergunta}</span>
                  <ChevronDown open={isOpen} />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200 ease-out',
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-5 pb-4 pt-0 text-sm text-gray-600 leading-relaxed">
                    {item.resposta}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
