'use client'

import { useRef, useState, useId } from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const ACCEPT_LIST = '.pdf,.xml,.jpg,.jpeg,.png'

function isValidFile(file: File): boolean {
  const allowed = ACCEPT_LIST.split(',').map((ext) => ext.trim().toLowerCase())
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  const mime = file.type.toLowerCase()
  return allowed.some((e) => {
    const n = e.toLowerCase()
    return ext === n || mime.includes(n.replace('.', '')) || (n === '.jpg' && mime.includes('jpeg')) || (n === '.jpeg' && mime.includes('jpeg'))
  })
}

/** Gera hash de preview (12 caracteres) para exibição no formato user_{userId}_{hash}.{ext} */
function previewHash(file: File, index: number): string {
  const str = `${file.name}-${file.size}-${index}-${file.lastModified}`
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(16).slice(0, 12).padEnd(12, '0')
}

function getDisplayFileName(file: File, index: number, userId?: string): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  if (!userId) return file.name
  const hash = previewHash(file, index)
  return `user_${userId}_${hash}.${ext}`
}

type MultiFileUploadProps = {
  label: string
  files: File[]
  error?: string
  required?: boolean
  minFiles?: number
  /** Máximo de arquivos (ex.: 1 para campo único). Quando definido, substitui ao invés de acrescentar. */
  maxFiles?: number
  /** ID do usuário para nomeação padronizada: user_{userId}_{hash}.{ext} */
  userId?: string
  onChange: (files: File[]) => void
}

export default function MultiFileUpload({
  label,
  files,
  error,
  required = false,
  minFiles = 2,
  maxFiles,
  userId,
  onChange,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)

  const applyLimit = (next: File[]): File[] =>
    maxFiles != null ? next.slice(-maxFiles) : next

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const valid = selected.filter(isValidFile)
    const invalid = selected.filter((f) => !isValidFile(f))
    if (invalid.length > 0) {
      alert(`Alguns arquivos não são permitidos. Aceitos: PDF, XML, JPG, JPEG, PNG.`)
    }
    if (valid.length > 0) onChange(applyLimit([...files, ...valid]))
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files ?? [])
    const valid = dropped.filter(isValidFile)
    if (valid.length > 0) onChange(applyLimit([...files, ...valid]))
    e.dataTransfer.clearData()
  }

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const formatList = ACCEPT_LIST.split(',').map((e) => e.replace('.', '').toUpperCase())

  return (
    <div className="relative">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
        <label className="text-sm font-semibold text-gray-800 tracking-tight">
          {label} {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
        <span className="flex items-center gap-1.5 flex-wrap">
          {formatList.map((ext) => (
            <span key={ext} className="inline-flex items-center rounded-md bg-gray-100/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 tracking-wide">
              {ext}
            </span>
          ))}
        </span>
      </div>

      <div
        className={cn(
          'rounded-xl border border-dashed transition-all duration-300 overflow-hidden min-h-[52px]',
          error ? 'border-red-200 bg-red-50/40' : isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-2 ring-[var(--primary)]/20 ring-inset' : 'border-gray-200/90 bg-gradient-to-b from-gray-50/50 to-white hover:border-[var(--primary)]/30'
        )}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPT_LIST}
          multiple
          onChange={handleSelect}
          className="sr-only"
          aria-label={label}
        />
        <label
          htmlFor={inputId}
          className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 px-4 py-4 min-h-[52px] cursor-pointer touch-manipulation"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100/80 text-gray-500 group-hover:bg-[var(--primary)]/10 transition-colors duration-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <span className="text-sm text-gray-500 font-medium">
            Toque para anexar ou arraste aqui — {label.toLowerCase()}
            {maxFiles === 1 ? ' (1 arquivo)' : ` (mín. ${minFiles} arquivos)`}
          </span>
        </label>

        {files.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-white/50">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {getDisplayFileName(file, index, userId)}
                  </p>
                  <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Remover arquivo"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-medium" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
