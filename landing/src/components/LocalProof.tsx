import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { events } from '../data'

function Highlight({ children }: { children: ReactNode }) {
  return <span className="text-coral font-semibold">{children}</span>
}

const cities = [
  'Bayonne',
  'Anglet',
  'Biarritz',
  'Dax',
  'Hossegor',
  'Mont-de-Marsan',
  'Pau',
  'Tarbes',
  'Irun',
  'Saint-Sébastien',
]

export default function LocalProof() {
  const { ref, inView } = useInView(0.1)
  const { totalEvents, totalVenues } = events.stats

  return (
    <section className="bg-background py-14 md:py-20">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-5">
          Bienvenue dans le Sud-Ouest.
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
          {cities.map((city) => (
            <span
              key={city}
              className="bg-surface text-secondary-text px-3 py-1.5 rounded-full text-sm"
            >
              {city}
            </span>
          ))}
        </div>

        <p className="text-base md:text-lg text-secondary-text leading-relaxed mb-8 max-w-2xl mx-auto">
          De la <Highlight>Guinguette Kulunka</Highlight> à Bayonne au{' '}
          <Highlight>Soleil des Antilles</Highlight> à Bidart, jusqu'au{' '}
          <Highlight>Café Irún</Highlight> et au <Highlight>GU</Highlight> de Saint-Sébastien
          côté espagnol, sans oublier le <Highlight>New Red Lion</Highlight> à Pau.
        </p>

        <p className="text-2xl md:text-3xl font-bold text-primary-text mb-8 leading-snug">
          Plus d'une centaine de danseurs nous font déjà confiance.
        </p>

        <div className="inline-block bg-surface rounded-2xl px-6 py-4 border border-[#2a2a35]">
          <p className="text-coral font-bold text-lg mb-1">
            {totalEvents} événements · {totalVenues} lieux à venir
          </p>
          <p className="text-secondary-text text-sm">
            Sur les 30 prochains jours · mis à jour chaque semaine
          </p>
        </div>
      </div>
    </section>
  )
}
