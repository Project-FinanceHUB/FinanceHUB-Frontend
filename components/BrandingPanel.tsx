'use client'

export default function BrandingPanel() {
  return (
    <>
      {/* Mobile/Tablet Compact Branding */}
      <div className="lg:hidden w-full py-8 px-6 bg-gradient-to-br from-dark via-dark-light to-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-mobile" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-mobile)" />
          </svg>
          
          {/* Boleto Mobile */}
          <svg className="absolute top-4 right-4 w-24 h-32 opacity-30" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="180" height="230" rx="4" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="2"/>
            <rect x="20" y="30" width="160" height="8" fill="#D4AF37" opacity="0.5"/>
            <rect x="20" y="50" width="120" height="6" fill="#D4AF37" opacity="0.4"/>
            <rect x="20" y="70" width="140" height="6" fill="#D4AF37" opacity="0.4"/>
            <rect x="20" y="100" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
            <rect x="20" y="110" width="100" height="6" fill="#D4AF37" opacity="0.4"/>
            <rect x="20" y="130" width="80" height="6" fill="#D4AF37" opacity="0.4"/>
          </svg>

          {/* Calculadora Mobile */}
          <svg className="absolute bottom-4 left-4 w-28 h-36 opacity-30" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="160" height="200" rx="8" fill="#039a42" opacity="0.2" stroke="#039a42" strokeWidth="2"/>
            <rect x="30" y="40" width="140" height="35" rx="4" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
            <rect x="40" y="50" width="120" height="8" fill="#039a42" opacity="0.5"/>
            <rect x="40" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
            <rect x="80" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
            <rect x="120" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/50">
            <svg
              className="w-10 h-10 text-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gold">FinanceHUB</h1>
            <p className="text-sm text-gray-400">Consultoria em Telecom & TI</p>
          </div>
        </div>
      </div>

      {/* Desktop Full Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-dark via-dark-light to-dark">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        {/* Geometric Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#039a42" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Abstract Lines */}
          <path
            d="M 0 200 Q 200 100 400 200 T 800 200"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 0 400 Q 300 300 600 400 T 1200 400"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M 0 600 Q 400 500 800 600 T 1600 600"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            opacity="0.2"
          />
        </svg>
        
        {/* Boletos Background */}
        {/* Boleto 1 - Top Left */}
        <svg className="absolute top-16 left-16 w-40 h-52 opacity-30" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="180" height="230" rx="4" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="2"/>
          <rect x="20" y="30" width="160" height="8" fill="#D4AF37" opacity="0.5"/>
          <rect x="20" y="50" width="120" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="70" width="140" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="100" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="110" width="100" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="130" width="80" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="150" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="160" width="90" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="180" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="200" width="70" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="220" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
        </svg>

        {/* Boleto 2 - Top Right */}
        <svg className="absolute top-24 right-24 w-36 h-48 opacity-30 rotate-3" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="180" height="230" rx="4" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="2"/>
          <rect x="20" y="30" width="160" height="8" fill="#039a42" opacity="0.5"/>
          <rect x="20" y="50" width="100" height="6" fill="#039a42" opacity="0.4"/>
          <rect x="20" y="70" width="150" height="6" fill="#039a42" opacity="0.4"/>
          <rect x="20" y="100" width="160" height="2" fill="#039a42" opacity="0.3"/>
          <rect x="20" y="110" width="110" height="6" fill="#039a42" opacity="0.4"/>
          <rect x="20" y="130" width="90" height="6" fill="#039a42" opacity="0.4"/>
          <rect x="20" y="150" width="160" height="2" fill="#039a42" opacity="0.3"/>
          <rect x="20" y="160" width="85" height="6" fill="#039a42" opacity="0.4"/>
          <rect x="20" y="180" width="160" height="2" fill="#039a42" opacity="0.3"/>
          <rect x="20" y="200" width="75" height="6" fill="#039a42" opacity="0.4"/>
        </svg>

        {/* Boleto 3 - Bottom Left */}
        <svg className="absolute bottom-20 left-32 w-44 h-56 opacity-30 -rotate-2" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="180" height="230" rx="4" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="2"/>
          <rect x="20" y="30" width="160" height="8" fill="#D4AF37" opacity="0.5"/>
          <rect x="20" y="50" width="130" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="70" width="145" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="100" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="110" width="95" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="130" width="85" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="150" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="160" width="100" height="6" fill="#D4AF37" opacity="0.4"/>
          <rect x="20" y="180" width="160" height="2" fill="#D4AF37" opacity="0.3"/>
          <rect x="20" y="200" width="65" height="6" fill="#D4AF37" opacity="0.4"/>
        </svg>

        {/* Calculadora 1 - Middle Right */}
        <svg className="absolute top-1/3 right-16 w-48 h-56 opacity-30" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="200" rx="8" fill="#039a42" opacity="0.2" stroke="#039a42" strokeWidth="2"/>
          <rect x="30" y="40" width="140" height="35" rx="4" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="50" width="120" height="8" fill="#039a42" opacity="0.5"/>
          <rect x="40" y="65" width="80" height="6" fill="#039a42" opacity="0.4"/>
          
          {/* Botões da calculadora */}
          <rect x="40" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="80" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="120" y="100" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="135" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="80" y="135" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="120" y="135" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="170" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="80" y="170" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="120" y="170" width="30" height="25" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
        </svg>

        {/* Calculadora 2 - Middle Left */}
        <svg className="absolute top-1/2 left-20 w-44 h-52 opacity-30 rotate-6" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="200" rx="8" fill="#D4AF37" opacity="0.2" stroke="#D4AF37" strokeWidth="2"/>
          <rect x="30" y="40" width="140" height="35" rx="4" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="40" y="50" width="120" height="8" fill="#D4AF37" opacity="0.5"/>
          <rect x="40" y="65" width="75" height="6" fill="#D4AF37" opacity="0.4"/>
          
          {/* Botões da calculadora */}
          <rect x="40" y="100" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="78" y="100" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="116" y="100" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="40" y="132" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="78" y="132" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="116" y="132" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="40" y="164" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="78" y="164" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
          <rect x="116" y="164" width="28" height="24" rx="3" fill="#D4AF37" opacity="0.3" stroke="#D4AF37" strokeWidth="1"/>
        </svg>

        {/* Calculadora 3 - Bottom Right */}
        <svg className="absolute bottom-24 right-32 w-40 h-48 opacity-30 -rotate-3" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="200" rx="8" fill="#039a42" opacity="0.2" stroke="#039a42" strokeWidth="2"/>
          <rect x="30" y="40" width="140" height="35" rx="4" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="50" width="120" height="8" fill="#039a42" opacity="0.5"/>
          <rect x="40" y="65" width="90" height="6" fill="#039a42" opacity="0.4"/>
          
          {/* Botões da calculadora */}
          <rect x="40" y="100" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="76" y="100" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="112" y="100" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="130" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="76" y="130" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="112" y="130" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="40" y="160" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="76" y="160" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
          <rect x="112" y="160" width="26" height="22" rx="3" fill="#039a42" opacity="0.3" stroke="#039a42" strokeWidth="1"/>
        </svg>
        
        {/* Data Connection Nodes */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-gold rounded-full animate-pulse" />
        <div className="absolute top-40 left-40 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse delay-300" />
        <div className="absolute top-60 left-60 w-2.5 h-2.5 bg-gold rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-32 right-32 w-3 h-3 bg-[var(--primary)] rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-52 right-52 w-2 h-2 bg-gold rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-2.5 h-2.5 bg-[var(--primary)] rounded-full animate-pulse delay-200" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-2xl shadow-gold/50">
            <svg
              className="w-20 h-20 text-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Company Name */}
        <h1 className="text-5xl font-bold text-gold mb-4 text-center">
          FinanceHub
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-300 text-center mb-8 max-w-md">
          Consultoria em Telecom & TI
        </p>

        {/* Description */}
        <div className="mt-12 space-y-4 text-gray-400 text-center max-w-lg">
          <p className="text-lg">
            Plataforma completa para gestão financeira empresarial
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
              <span className="text-sm">Agrupamento de NF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
              <span className="text-sm">Controle de Boletos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
              <span className="text-sm">Relatórios Fiscais</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
