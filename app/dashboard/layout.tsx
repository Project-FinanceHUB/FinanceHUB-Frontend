'use client'

import DashboardShell from '@/components/DashboardShell'
import { DashboardProvider } from '@/context/DashboardContext'
import { ConfiguracoesProvider } from '@/context/ConfiguracoesContext'
import { HistoricoProvider } from '@/context/HistoricoContext'
import { SuporteProvider } from '@/context/SuporteContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <ConfiguracoesProvider>
        <HistoricoProvider>
          <SuporteProvider>
            <DashboardShell>{children}</DashboardShell>
          </SuporteProvider>
        </HistoricoProvider>
      </ConfiguracoesProvider>
    </DashboardProvider>
  )
}
