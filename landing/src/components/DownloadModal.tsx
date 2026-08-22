import { useEffect, useRef } from 'react'
import StoreButtons from './StoreButtons'
import { openStore } from '../utils/store'

interface DownloadModalProps {
  open: boolean
  onClose: () => void
}

export default function DownloadModal({ open, onClose }: DownloadModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleIos = () => {
    openStore('ios')
    onClose()
  }

  const handleAndroid = () => {
    openStore('android')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#0F0F14]/80 backdrop-blur-sm" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        className="relative z-10 w-full max-w-md bg-surface rounded-2xl border border-[#2a2a35] p-6 md:p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
        >
          ✕
        </button>

        <h2 id="download-modal-title" className="text-2xl font-bold mb-2 pr-8">
          Télécharger LatinGo
        </h2>
        <p className="text-secondary-text mb-6">Tu es sur iPhone ou Android ?</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={handleIos}
            data-event="cta_navbar_download_ios"
            className="bg-background border border-[#2a2a35] rounded-xl px-4 py-5 hover:border-coral hover:bg-coral/10 transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              📱
            </span>
            <span className="font-bold block">iPhone</span>
            <span className="text-secondary-text text-sm">App Store</span>
          </button>
          <button
            type="button"
            onClick={handleAndroid}
            data-event="cta_navbar_download_android"
            className="bg-background border border-[#2a2a35] rounded-xl px-4 py-5 hover:border-coral hover:bg-coral/10 transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              🤖
            </span>
            <span className="font-bold block">Android</span>
            <span className="text-secondary-text text-sm">Google Play</span>
          </button>
        </div>

        <StoreButtons eventPrefix="cta_download_modal" size="sm" />
      </div>
    </div>
  )
}
