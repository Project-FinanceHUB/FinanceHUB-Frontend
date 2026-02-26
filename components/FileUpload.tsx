'use client'

import { useRef, useState, useId } from 'react'

type FileUploadProps = {
  label: string
  accept: string
  file: File | null
  error?: string
  required?: boolean
  onChange: (file: File | null) => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function FileUpload({
  label,
  accept,
  file,
  error,
  required = false,
  onChange,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (selectedFile: File | null) => {
    if (selectedFile) {
      // Valida extensão do arquivo
      const allowedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase())
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
      const mimeType = selectedFile.type.toLowerCase()

      // Verifica se a extensão ou o tipo MIME está na lista permitida
      const isValidExtension = allowedExtensions.some((ext) => {
        const normalizedExt = ext.toLowerCase()
        return (
          fileExtension === normalizedExt ||
          mimeType.includes(normalizedExt.replace('.', '')) ||
          (normalizedExt === '.jpg' && mimeType.includes('jpeg')) ||
          (normalizedExt === '.jpeg' && mimeType.includes('jpeg'))
        )
      })

      if (!isValidExtension) {
        alert(
          `Tipo de arquivo não permitido. Formatos aceitos: ${allowedExtensions
            .map((ext) => ext.replace('.', '').toUpperCase())
            .join(', ')}`
        )
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
    }
    onChange(selectedFile)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    handleFile(selectedFile)
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (isDragging) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0] || null
    handleFile(droppedFile)
  }

  const formatList = accept.split(',').map((ext) => ext.replace('.', '').toUpperCase())

  return (
    <div className="relative">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
        <label className="text-sm font-semibold text-gray-800 tracking-tight">
          {label} {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
        <span className="flex items-center gap-1.5 flex-wrap">
          {formatList.map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center rounded-md bg-gray-100/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 tracking-wide"
            >
              {ext}
            </span>
          ))}
        </span>
      </div>

      <div
        className={cn(
          'group relative rounded-xl border border-dashed transition-all duration-300 ease-out overflow-hidden min-h-[52px]',
          !file && 'cursor-pointer',
          error
            ? 'border-red-200 bg-red-50/40 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.15)]'
            : isDragging
              ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-2 ring-[var(--primary)]/20 ring-inset'
              : file
                ? 'border-emerald-200/70 bg-emerald-50/30 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]'
                : 'border-gray-200/90 bg-gradient-to-b from-gray-50/50 to-white hover:border-[var(--primary)]/30 hover:from-[var(--primary)]/[0.04] hover:to-white',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={label}
        />

        {!file ? (
          <label
            htmlFor={inputId}
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 px-4 py-4 min-h-[52px] cursor-pointer touch-manipulation"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100/80 text-gray-500 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors duration-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Toque para anexar ou arraste aqui
            </span>
          </label>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors duration-200"
                aria-label="Substituir arquivo"
                title="Substituir arquivo"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                aria-label="Remover arquivo"
                title="Remover arquivo"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-medium" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
