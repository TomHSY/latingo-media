import { useScrollSpy } from '../hooks/useScrollSpy'

export default function Navbar() {
  const scrolled = useScrollSpy(50)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-center">
        <a href="#" className="flex items-center gap-3">
          <img src="/images/icon.png" alt="LatinGo" className="w-16 h-16 rounded-xl" />
          <span className="font-bold text-3xl text-primary-text">LatinGo</span>
        </a>
      </div>
    </nav>
  )
}
