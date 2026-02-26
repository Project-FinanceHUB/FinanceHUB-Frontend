import React from 'react'

/**
 * ResponsiveTable
 *
 * Desktop (md+):
 * - Mantém tabela tradicional (table/thead/tbody/tr/td)
 *
 * Mobile (< md):
 * - Esconde visualmente o thead (mantém acessível)
 * - Cada tr vira um "card" (border, rounded, shadow, p-4)
 * - Cada td exibe o rótulo da coluna via data-label (pseudo-elemento ::before)
 *
 * Sem duplicar HTML e sem usar window/JavaScript para trocar layout.
 */

export type ResponsiveTableColumn<Row extends Record<string, any>> = {
  key: keyof Row & string
  label: string
  headerClassName?: string
  cellClassName?: string
}

export type ResponsiveTableProps<Row extends Record<string, any>> = {
  columns: Array<ResponsiveTableColumn<Row>>
  rows: Row[]
  /**
   * Permite customizar o conteúdo da célula (ex.: badges, botões, etc.).
   */
  renderCell?: (row: Row, columnKey: ResponsiveTableColumn<Row>['key']) => React.ReactNode
  'aria-label'?: string
  className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function ResponsiveTable<Row extends Record<string, any>>({
  columns,
  rows,
  renderCell,
  className,
  ...ariaProps
}: ResponsiveTableProps<Row>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        {...ariaProps}
        className={cn(
          'min-w-full text-sm',
          // thead: visível em md+, sr-only em mobile (acessível p/ leitores de tela)
          ' [&_thead]:sr-only md:[&_thead]:not-sr-only',
          // tr: cards em mobile, linhas normais em desktop
          ' [&_tbody_tr]:block md:[&_tbody_tr]:table-row',
          ' [&_tbody_tr]:border [&_tbody_tr]:border-gray-200 [&_tbody_tr]:rounded-xl [&_tbody_tr]:shadow-sm',
          ' [&_tbody_tr]:p-4 [&_tbody_tr]:bg-white [&_tbody_tr]:mb-3',
          ' [&_tbody_tr]:transition-all [&_tbody_tr]:duration-200 [&_tbody_tr]:hover:shadow-md [&_tbody_tr]:hover:border-[var(--primary)]/20',
          ' md:[&_tbody_tr]:border-0 md:[&_tbody_tr]:rounded-none md:[&_tbody_tr]:shadow-none md:[&_tbody_tr]:p-0 md:[&_tbody_tr]:bg-transparent md:[&_tbody_tr]:mb-0',
          // td: coluna única no mobile, células na horizontal em desktop
          ' [&_tbody_td]:flex [&_tbody_td]:flex-col [&_tbody_td]:gap-1 md:[&_tbody_td]:table-cell',
          ' [&_tbody_td]:px-0 [&_tbody_td]:py-0 md:[&_tbody_td]:px-6 md:[&_tbody_td]:py-4',
          // label da coluna (data-label) antes do valor no mobile
          " [&_tbody_td]:before:content-[attr(data-label)] md:[&_tbody_td]:before:content-none",
          ' [&_tbody_td]:before:text-sm [&_tbody_td]:before:font-semibold [&_tbody_td]:before:text-gray-600',
          // head padrão em desktop
          ' md:[&_thead_tr]:bg-gradient-to-r md:[&_thead_tr]:from-gray-50 md:[&_thead_tr]:to-gray-50/50 md:[&_thead_tr]:text-gray-700',
          ' md:[&_thead_th]:font-bold md:[&_thead_th]:px-6 md:[&_thead_th]:py-4 md:[&_thead_th]:text-sm',
          ' md:[&_tbody]:divide-y md:[&_tbody]:divide-gray-100',
          ' md:[&_tbody_tr]:hover:bg-gray-50/80 md:[&_tbody_tr]:transition-colors md:[&_tbody_tr]:duration-150'
        )}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('font-semibold px-5 py-3 text-center', column.headerClassName)}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={(row as any).id ?? (row as any).key ?? index}
              className="hover:bg-gray-50/60 md:hover:bg-gray-50/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.label}
                  className={cn('px-6 py-4 text-gray-700', column.cellClassName)}
                >
                  {renderCell ? renderCell(row, column.key) : String((row as any)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

