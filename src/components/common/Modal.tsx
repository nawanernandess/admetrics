import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalCloseContext } from '@/components/common/modalContext'

const EXIT_ANIMATION_MS = 150

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  widthClassName?: string
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  widthClassName = 'max-w-lg',
}: ModalProps) {
  const [closing, setClosing] = useState(false)

  const requestClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, EXIT_ANIMATION_MS)
  }, [onClose])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  return createPortal(
    <ModalCloseContext.Provider value={requestClose}>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ${
          closing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        onClick={requestClose}
      >
        <div
          className={`w-full ${widthClassName} max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card-bg)] shadow-2xl ${
            closing ? 'animate-scale-out' : 'animate-scale-in'
          }`}
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 flex items-start justify-between border-b border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
              {subtitle ? (
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Fechar"
              className="rounded-md p-1 text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </ModalCloseContext.Provider>,
    document.body,
  )
}
