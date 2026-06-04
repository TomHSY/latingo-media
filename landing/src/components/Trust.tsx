import { useInView } from '../hooks/useInView'

export default function Trust() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative bg-surface py-14 md:py-20 overflow-hidden">
      <img
        src="/images/hero-dance.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-surface/50" />

      <div
        ref={ref}
        className={`relative z-10 max-w-[600px] mx-auto px-4 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-6xl text-coral/20 font-serif mb-4">"</div>
        <blockquote className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
          Créé par un danseur du coin qui en avait marre de rater des soirées.
        </blockquote>
        <p className="text-secondary-text">
          Un projet indépendant, conçu pour la communauté SBK locale.
        </p>
      </div>
    </section>
  )
}
