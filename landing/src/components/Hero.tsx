import { useInView } from '../hooks/useInView'
import { PLAY_STORE_URL } from '../constants'

export default function Hero() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative min-h-screen md:min-h-[88vh] flex items-center justify-center">
      <img
        src="/images/hero-dance.png"
        alt="Ambiance soirée danse latine"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.2)] to-[rgba(15,15,20,0.85)]" />

      <div
        ref={ref}
        className={`relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-12 md:pt-36 md:pb-16 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="text-[28px] md:text-[48px] font-bold leading-tight mb-4">
          Trouve les soirées Salsa, Bachata et Kizomba près de chez toi.
        </h1>
        <p className="text-secondary-text text-base md:text-lg mb-8">
          Tous les événements SBK du Pays Basque, des Landes et de Pau.
          Disponible maintenant sur Android — iOS arrive très bientôt.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-event="cta_hero_play_store"
            className="inline-block w-full sm:w-auto bg-coral text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-coral/90 transition-colors"
          >
            Télécharger sur Android →
          </a>
          <a
            href="#ios"
            data-event="cta_hero_ios"
            className="inline-block w-full sm:w-auto text-secondary-text hover:text-primary-text font-medium px-4 py-2 transition-colors"
          >
            iPhone ? Sois informé en premier
          </a>
        </div>
      </div>
    </section>
  )
}
