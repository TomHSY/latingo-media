import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const slides = [
  {
    src: '/images/screenshot-discover.jpg',
    alt: 'Découvrir les soirées SBK près de chez toi',
    caption: 'Toutes les soirées, triées par date',
  },
  {
    src: '/images/screenshot-map.jpg',
    alt: 'Carte interactive des événements',
    caption: 'Des dizaines de soirées sur la carte',
  },
  {
    src: '/images/screenshot-agenda.jpg',
    alt: 'Ton agenda danse',
    caption: 'Tes soirées favorites en un coup d\'œil',
  },
  {
    src: '/images/screenshot-radar.jpg',
    alt: 'Configurer un radar d\'alertes',
    caption: 'Alertes personnalisées par style et zone',
  },
  {
    src: '/images/screenshot-event.jpg',
    alt: 'Détail d\'un événement',
    caption: 'Toutes les infos sur chaque soirée',
  },
]

export default function Screenshots() {
  const { ref, inView } = useInView(0.1)
  const [active, setActive] = useState(0)

  const prev = () => setActive((i) => (i === 0 ? slides.length - 1 : i - 1))
  const next = () => setActive((i) => (i === slides.length - 1 ? 0 : i + 1))

  return (
    <section className="bg-surface py-14 md:py-20 overflow-hidden">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          L'app en action
        </h2>
        <p className="text-secondary-text text-center mb-10">
          De vraies soirées, de vrais lieux, dans ta région.
        </p>

        <div className="relative flex flex-col items-center">
          <div className="relative w-[320px] md:w-[360px]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-coral/15 blur-3xl scale-110" />
            <div className="relative rounded-[2.5rem] border-[6px] border-[#2a2a35] bg-[#0a0a0e] shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 bg-[#0a0a0e] z-10 flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-[#2a2a35]" />
              </div>
              <img
                src={slides[active].src}
                alt={slides[active].alt}
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          </div>

          <p className="text-secondary-text text-sm mt-6 text-center min-h-[1.25rem]">
            {slides[active].caption}
          </p>

          <div className="flex items-center gap-5 mt-5">
            <button
              type="button"
              onClick={prev}
              aria-label="Capture précédente"
              className="w-14 h-14 rounded-full bg-coral/20 border-2 border-coral text-primary-text text-xl font-bold hover:bg-coral hover:text-white transition-colors shadow-lg"
            >
              ←
            </button>

            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Capture ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === active ? 'bg-coral' : 'bg-[#2a2a35]'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Capture suivante"
              className="w-14 h-14 rounded-full bg-coral/20 border-2 border-coral text-primary-text text-xl font-bold hover:bg-coral hover:text-white transition-colors shadow-lg"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
