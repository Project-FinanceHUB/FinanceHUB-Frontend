'use client'

import { forwardRef, useRef, useState, useEffect } from 'react'

interface EmailInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isValid?: boolean
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (el: T | null) => {
    refs.forEach((r) => {
      if (typeof r === 'function') r(el)
      else if (r) (r as React.MutableRefObject<T | null>).current = el
    })
  }
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput({ value, onChange, isValid }, ref) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const checkAutofill = () => {
      if (input.value && input.value !== value) {
        onChange({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
    checkAutofill()
    const t = setTimeout(checkAutofill, 100)
    const t2 = setTimeout(checkAutofill, 500)
    const t3 = setTimeout(checkAutofill, 1000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
        E-mail
      </label>
      <div className="relative">
        <input
          ref={mergeRefs(inputRef, ref)}
          type="email"
          id="login-email"
          name="email"
          autoComplete="email"
          data-email-input
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="seu@email.com"
          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-teal"
        />
      </div>
    </div>
  )
})

export default EmailInput
