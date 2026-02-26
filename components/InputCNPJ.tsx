'use client'

import { useCallback, useImperativeHandle, useRef, forwardRef } from 'react'

const MASK = '00.000.000/0000-00'
const MAX_DIGITS = 14

/**
 * Aplica a máscara 00.000.000/0000-00 a uma string de apenas dígitos.
 * Retorna apenas o trecho formatado até o último dígito (ex.: "123" -> "12.3", "12345678000190" -> "12.345.678/0001-90").
 */
function formatCnpj(digits: string): string {
  if (digits.length === 0) return ''
  let i = 0
  let out = ''
  for (let k = 0; k < MASK.length && i < digits.length; k++) {
    if (MASK[k] === '0') {
      out += digits[i++] ?? ''
    } else {
      out += MASK[k]
    }
  }
  return out
}

/**
 * Extrai apenas os dígitos de uma string (aceita valor já formatado ou colado sem formatação).
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Formata 14 dígitos para exibição 00.000.000/0000-00. Útil para exibir em listas. */
export function formatCnpjDisplay(digits: string): string {
  return digits.length === MAX_DIGITS ? formatCnpj(digits) : digits
}

export type InputCNPJProps = {
  /** Valor interno: apenas 14 dígitos. Controlado. */
  value: string
  /** Callback com o valor apenas numérico (máx. 14 dígitos). */
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  /** Classes CSS adicionais no input. */
  className?: string
  /** Se true, mostra mensagem quando há valor mas não tem 14 dígitos. */
  showValidationMessage?: boolean
  /** Mensagem quando valor incompleto (ex.: "CNPJ deve ter 14 dígitos"). */
  validationMessage?: string
  'aria-label'?: string
  autoComplete?: string
}

export type InputCNPJRef = {
  focus: () => void
  blur: () => void
}

const InputCNPJ = forwardRef<InputCNPJRef, InputCNPJProps>(function InputCNPJ(
  {
    value,
    onChange,
    placeholder = '00.000.000/0000-00',
    id,
    name,
    disabled = false,
    className = '',
    showValidationMessage = true,
    validationMessage = 'CNPJ deve ter 14 dígitos',
    'aria-label': ariaLabel,
    autoComplete = 'off',
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }))

  const rawValue = onlyDigits(value)
  const displayValue = rawValue.length > 0 ? formatCnpj(rawValue) : ''
  const isValid = rawValue.length === MAX_DIGITS
  const showInvalid = showValidationMessage && rawValue.length > 0 && !isValid

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = onlyDigits(e.target.value).slice(0, MAX_DIGITS)
      onChange(next)
    },
    [onChange]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') {
      if (key === 'a' && (e.ctrlKey || e.metaKey)) return
      if (key === 'c' && (e.ctrlKey || e.metaKey)) return
      if (key === 'v' && (e.ctrlKey || e.metaKey)) return
      if (key === 'x' && (e.ctrlKey || e.metaKey)) return
      if (!/^\d$/.test(key)) e.preventDefault()
    }
  }, [])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = onlyDigits(e.clipboardData.getData('text')).slice(0, MAX_DIGITS)
      onChange(pasted)
    },
    [onChange]
  )

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        maxLength={MASK.length}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        id={id}
        name={name}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={showInvalid ? true : undefined}
        className={className}
      />
      {showInvalid && (
        <p className="mt-1.5 text-xs text-amber-700 font-medium flex items-center gap-1" role="status">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationMessage}
        </p>
      )}
    </div>
  )
})

export default InputCNPJ
