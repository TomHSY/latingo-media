import { useInView } from '../hooks/useInView'
import { events } from '../data'

const cities = [
  'Bayonne', 'Anglet', 'Biarritz', 'Saint-Jean-de-Luz',
  'Dax', 'Capbreton', 'Hossegor', 'Mont-de-Marsan',
  'Pau', 'Tarbes',
  'San Sebastian', 'Irun',
]

export default function LocalProof() {
  const { ref, inView } = useInView(0.1)
  const { totalEvents, totalVenues } = events.stats

  return (
    <section className="bg-surface py-14 md:py-20">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Déjà actif dans ta région.
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {cities.map((city) => (
            <span
              key={city}
              className="bg-background text-secondary-text px-4 py-2 rounded-full text-sm"
            >
              {city}
            </span>
          ))}
        </div>

        <p className="text-secondary-text italic mb-2">
          Nouvelles villes ajoutées chaque semaine.
        </p>
        <p className="text-coral font-bold text-lg">
          {totalEvents} événements · {totalVenues} lieux
        </p>
        <p className="text-secondary-text text-xs mt-2">
          Mis à jour quotidiennement
        </p>
      </div>
    </section>
  )
}
