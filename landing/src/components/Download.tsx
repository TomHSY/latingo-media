import { useInView } from '../hooks/useInView'
import { PLAY_STORE_URL } from '../constants'
import SceneBackground from './SceneBackground'

export default function Download() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="telecharger" className="relative bg-surface py-14 md:py-20 overflow-hidden">
      <SceneBackground
        src="/images/dance-app-pov.png"
        imageClass="opacity-55 object-[center_20%]"
        overlayClass="bg-surface/55"
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-xl mx-auto px-4 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Télécharge LatinGo
        </h2>
        <p className="text-secondary-text mb-8">
          Gratuit sur Android. iOS arrive très bientôt.
        </p>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-event="cta_play_store"
          className="inline-block hover:opacity-90 transition-opacity"
        >
          <img
            src="https://play.google.com/intl/fr_fr/badges/static/images/badges/fr_badge_web_generic.png"
            alt="Disponible sur Google Play"
            className="h-16 md:h-20 w-auto mx-auto"
            loading="lazy"
          />
        </a>
      </div>
    </section>
  )
}
