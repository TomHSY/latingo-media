import { useInView } from '../hooks/useInView'

export default function Hero() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative min-h-screen md:min-h-[88vh] flex items-center justify-center">
      <img
        src="/images/hero-dance.png"
        alt="Ambiance soirée danse latine"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.3)] to-[rgba(15,15,20,0.95)]" />

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
          Tous les événements SBK du Pays Basque, des Landes et de Pau. En une seule app.
        </p>
        <a
          href="#inscription"
          data-event="cta_hero_click"
          className="inline-block w-full md:w-auto bg-coral text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-coral/90 transition-colors"
        >
          Rejoindre l'accès anticipé →
        </a>
      </div>
    </section>
  )
}
