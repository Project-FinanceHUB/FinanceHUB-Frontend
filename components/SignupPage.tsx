'use client'

import SignupForm from './SignupForm'
import BrandingPanel from './BrandingPanel'
import Footer from './Footer'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel - Branding */}
        <BrandingPanel />
        
        {/* Right Panel - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[var(--background)]">
          <SignupForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}
