'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import HeroSection from '@/components/HeroSection'
import LoginPage from '@/components/LoginPage'

function HomeContent() {
  const searchParams = useSearchParams()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // Se houver parâmetro 'login' na URL, mostrar página de login
    if (searchParams?.get('login') === 'true') {
      setShowLogin(true)
    }
  }, [searchParams])

  if (showLogin) {
    return <LoginPage />
  }

  return <HeroSection />
}

export default function Home() {
  return (
    <Suspense fallback={<HeroSection />}>
      <HomeContent />
    </Suspense>
  )
}
