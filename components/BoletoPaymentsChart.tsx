'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from './Skeleton'
import type { Solicitacao } from '@/types/solicitacao'

export type BoletoStatus = 'pago' | 'pendente' | 'vencido'

type StatusFilter = Record<BoletoStatus, boolean>

export interface MonthBoletoData {
  mes: string
  pago: number
  pendente: number
  vencido: number
}

const COLORS = {
  pago: '#10B981',     // verde esmeralda (sucesso)
  pendente: '#F59E0B', // âmbar/laranja (atenção)
  vencido: '#EF4444',  // vermelho (alerta)
}

// Nomes dos meses (igual ao formulário "Nova solicitação")
const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Dados mock de quantidade de boletos/notas por status ao longo de 12 meses (sem valores financeiros)
const MOCK_DATA: MonthBoletoData[] = [
  { mes: 'Janeiro',   pago: 4,  pendente: 2, vencido: 0 },
  { mes: 'Fevereiro', pago: 5,  pendente: 1, vencido: 1 },
  { mes: 'Março',     pago: 6,  pendente: 2, vencido: 0 },
  { mes: 'Abril',     pago: 5,  pendente: 1, vencido: 1 },
  { mes: 'Maio',      pago: 7,  pendente: 2, vencido: 0 },
  { mes: 'Junho',     pago: 6,  pendente: 3, vencido: 1 },
  { mes: 'Julho',     pago: 8,  pendente: 1, vencido: 0 },
  { mes: 'Agosto',    pago: 8,  pendente: 2, vencido: 1 },
  { mes: 'Setembro',  pago: 7,  pendente: 1, vencido: 0 },
  { mes: 'Outubro',   pago: 9,  pendente: 2, vencido: 1 },
  { mes: 'Novembro',  pago: 8,  pendente: 2, vencido: 0 },
  { mes: 'Dezembro',  pago: 10, pendente: 0, vencido: 0 },
]

/** Mapeia status da solicitação para status do boleto no gráfico */
function statusToBoletoStatus(status: Solicitacao['status']): BoletoStatus {
  if (status === 'concluido' || status === 'fechado' || status === 'aprovado') return 'pago'
  if (status === 'rejeitado' || status === 'cancelado') return 'vencido'
  return 'pendente'
}

/** Gera rótulos dos 12 meses do contrato (Janeiro a Dezembro), igual ao formulário "Nova solicitação" */
function getLast12MonthsLabels(): string[] {
  return [...NOMES_MESES]
}

/** Constrói dados do gráfico a partir das solicitações que possuem boleto */
function buildChartDataFromSolicitacoes(solicitacoes: Solicitacao[]): MonthBoletoData[] {
  const labels = getLast12MonthsLabels()
  const now = new Date()
  const months: MonthBoletoData[] = labels.map((mes, idx) => ({
    mes,
    pago: 0,
    pendente: 0,
    vencido: 0,
  }))

  const comBoleto = solicitacoes.filter((s) => s.boletoPath || (s.boleto && typeof s.boleto === 'string'))
  if (comBoleto.length === 0) return months

  // Mês 12 = atual, Mês 11 = um mês atrás, ...
  const getMonthIndex = (dateStr: string | undefined): number => {
    if (!dateStr) return 11
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return 11
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (diffMonths < 0) return 11
    if (diffMonths > 11) return 0
    return 11 - diffMonths
  }

  for (const s of comBoleto) {
    // Usar o mês selecionado na solicitação (1-12) ou derivar da data de criação
    const mesNum = s.mes != null ? Number(s.mes) : NaN
    const idx =
      !Number.isNaN(mesNum) && mesNum >= 1 && mesNum <= 12
        ? mesNum - 1
        : getMonthIndex(s.dataCriacao)
    const row = months[idx]
    if (!row) continue
    const status = statusToBoletoStatus(s.status)
    if (status === 'pago') {
      row.pago += 1
    } else if (status === 'pendente') {
      row.pendente += 1
    } else {
      row.vencido += 1
    }
  }

  return months
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; dataKey: string }>
  label?: string
  chartData?: MonthBoletoData[]
}

function CustomTooltip({ active, payload, label, chartData }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null

  const dataSource = chartData ?? MOCK_DATA
  const data = dataSource.find((d) => d.mes === label)
  if (!data) return null

  const totalMes = data.pago + data.pendente + data.vencido

  return (
    <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-xl min-w-[220px]">
      <div className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
        {label}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            Pagos
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {data.pago} boletos/notas
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
            Pendentes
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {data.pendente} boletos/notas
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
            Vencidos
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {data.vencido} boletos/notas
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs font-medium text-gray-500">
        Total do mês:{' '}
        <span className="text-gray-700 tabular-nums">
          {totalMes}
        </span>{' '}
        boletos/notas
      </div>
    </div>
  )
}

const FILTER_OPTIONS: { key: BoletoStatus; label: string; color: string }[] = [
  { key: 'pago', label: 'Pagos', color: COLORS.pago },
  { key: 'pendente', label: 'Pendentes', color: COLORS.pendente },
  { key: 'vencido', label: 'Vencidos', color: COLORS.vencido },
]

type BoletoPaymentsChartProps = {
  /** Solicitações com boleto enviado; quando informado, o gráfico é atualizado com base nelas */
  solicitacoes?: Solicitacao[]
}

export default function BoletoPaymentsChart({ solicitacoes = [] }: BoletoPaymentsChartProps) {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>({
    pago: true,
    pendente: true,
    vencido: true,
  })

  const chartData = useMemo(() => {
    const fromSolicitacoes = buildChartDataFromSolicitacoes(solicitacoes)
    const hasRealData = solicitacoes.some((s) => s.boletoPath || (s.boleto && typeof s.boleto === 'string'))
    return hasRealData ? fromSolicitacoes : MOCK_DATA
  }, [solicitacoes])

  const chartDataWithTotal = useMemo(
    () =>
      chartData.map((item) => ({
        ...item,
        total: item.pago + item.pendente + item.vencido,
      })),
    [chartData]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFilter = (key: BoletoStatus) => {
    setFilter((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden">
      <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-start">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 tracking-tight md:text-lg">
              Boletos e Notas por Status (12 meses)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Evolução da quantidade de boletos/notas por status (sem valores financeiros).
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-gray-700">Exibir na série:</span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-md:grid max-md:grid-cols-3 max-md:gap-2 max-md:w-full">
              {FILTER_OPTIONS.map(({ key, label, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFilter(key)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 max-md:min-h-[44px] ${
                    filter[key]
                      ? 'text-white border-current shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={filter[key] ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 bg-current opacity-90"
                    aria-hidden
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:block" aria-hidden />
        </div>
      </div>
      <div className="p-5 md:p-6 pt-4">
        <div className="h-[340px] w-full min-h-[300px] min-w-[200px]">
          {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={300}>
            <ComposedChart
              data={chartDataWithTotal}
              margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: '#4b5563', fontFamily: 'inherit' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4b5563', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, 'dataMax']}
                label={{
                  value: 'Qtd. de boletos/notas',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fill: '#6b7280', fontSize: 11, fontFamily: 'inherit' },
                }}
              />
              <Tooltip content={<CustomTooltip chartData={chartData} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (
                  <span className="text-xs font-medium text-gray-600">{value}</span>
                )}
                iconType="circle"
                iconSize={8}
                align="center"
              />
              {filter.pago && (
                <Bar
                  dataKey="pago"
                  name="Pagos"
                  fill={COLORS.pago}
                  barSize={18}
                  radius={[6, 6, 6, 6]}
                />
              )}
              {filter.pendente && (
                <Bar
                  dataKey="pendente"
                  name="Pendentes"
                  fill={COLORS.pendente}
                  barSize={18}
                  radius={[6, 6, 6, 6]}
                />
              )}
              {filter.vencido && (
                <Bar
                  dataKey="vencido"
                  name="Vencidos"
                  fill={COLORS.vencido}
                  barSize={18}
                  radius={[6, 6, 6, 6]}
                />
              )}
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, stroke: '#0f172a', fill: '#ffffff' }}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full space-y-4">
              <Skeleton variant="rounded" height={24} width="60%" />
              <Skeleton variant="rounded" height={280} width="100%" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
