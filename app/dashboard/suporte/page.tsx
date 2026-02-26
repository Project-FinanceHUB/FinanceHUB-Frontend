'use client'

import SuporteConteudo from '@/components/SuporteConteudo'

export default function SuportePage() {
  return (
    <div className="px-4 sm:px-6 py-6 md:py-8 w-full max-w-full">
      <div className="mb-6 md:mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Suporte</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Envie mensagens ao suporte vinculadas a uma solicitação ou consulte suas solicitações, status e prioridade.
          </p>
        </div>
      </div>

      <SuporteConteudo />
    </div>
  )
}
