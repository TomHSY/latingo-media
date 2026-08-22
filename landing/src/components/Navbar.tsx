import { useState } from 'react'
import { useScrollSpy } from '../hooks/useScrollSpy'
import DownloadModal from './DownloadModal'
import { detectStore, openStore } from '../utils/store'

export default function Navbar() {
  const scrolled = useScrollSpy(50)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)

  const handleDownloadClick = () => {
    const platform = detectStore()
    if (platform === 'ios' || platform === 'android') {
      openStore(platform)
      return
    }
    setDownloadModalOpen(true)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-surface/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img src="/images/icon.png" alt="LatinGo" className="w-12 h-12 md:w-14 md:h-14 rounded-xl" />
            <span className="font-bold text-2xl md:text-3xl text-primary-text">LatinGo</span>
          </a>

          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <a
              href="#organisateurs"
              className="hidden sm:inline text-secondary-text hover:text-primary-text transition-colors"
            >
              Organisateurs
            </a>
            <a
              href="#faq"
              className="hidden sm:inline text-secondary-text hover:text-primary-text transition-colors"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={handleDownloadClick}
              data-event="cta_navbar_download"
              className="bg-coral text-white font-bold px-4 py-2 rounded-lg hover:bg-coral/90 transition-colors"
            >
              Télécharger
            </button>
          </div>
        </div>
      </nav>

      <DownloadModal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} />
    </>
  )
}
