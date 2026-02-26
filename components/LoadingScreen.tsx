'use client'

import Spinner from './Spinner'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
          <Spinner size="md" className="border-white border-t-transparent" />
        </div>
        <p className="text-sm font-medium text-slate-600">Carregando...</p>
      </div>
    </div>
  )
}
