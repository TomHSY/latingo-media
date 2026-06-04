import { useInView } from '../hooks/useInView'

const features = [
  {
    icon: '🗺️',
    title: 'Tout sur une carte',
    description: 'Soirées, stages, festivals — géolocalisés autour de toi.',
  },
  {
    icon: '🎵',
    title: 'Filtre par style',
    description: 'Salsa, Bachata, Kizomba — ou les trois.',
  },
  {
    icon: '🔔',
    title: 'Alertes personnalisées',
    description: 'Reçois une notification quand un événement match tes critères.',
  },
]

export default function Features() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="bg-background py-14 md:py-20">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Une seule app. Toutes les soirées.
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Feature cards */}
          <div className="space-y-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-surface rounded-xl p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-secondary-text">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* App screenshots */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-surface">
              <img
                src="/images/screenshot-map.jpg"
                alt="Vue carte des événements LatinGo"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-surface">
              <img
                src="/images/screenshot-radar.jpg"
                alt="Configuration des alertes LatinGo"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-surface">
              <img
                src="/images/screenshot-discover.png"
                alt="Flux d'événements LatinGo"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
