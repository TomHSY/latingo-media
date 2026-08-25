import { useInView } from '../hooks/useInView'
import StoreButtons from './StoreButtons'

export default function Hero() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative min-h-screen md:min-h-[88vh] flex items-center justify-center">
      <img
        src="/images/hero-dance.png"
        alt="Ambiance soirée danse latine"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#0F0F14]/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.55)] via-[rgba(15,15,20,0.78)] to-[rgba(15,15,20,0.95)]" />

      <div
        ref={ref}
        className={`relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-12 md:pt-36 md:pb-16 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="text-[28px] md:text-[48px] font-bold leading-tight mb-4">
          Toutes les soirées SBK du Sud-Ouest, en une seule app
        </h1>
        <p className="text-secondary-text text-base md:text-lg mb-3">
          Découvre les événements salsa, bachata et kizomba près de chez toi.
          Disponible sur Android et iOS.
        </p>
        <p className="text-coral font-semibold text-base md:text-lg mb-8">
          3 secondes pour savoir où sortir ce soir.
        </p>

        <StoreButtons eventPrefix="cta_hero" />
      </div>
    </section>
  )
}
