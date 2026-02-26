'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-600">
          <p className="text-center">
            © {currentYear} FinanceHub. Todos os direitos reservados.
          </p>
          <p className="text-center text-xs text-gray-500">
            Consultoria em Telecom & TI
          </p>
        </div>
      </div>
    </footer>
  )
}
