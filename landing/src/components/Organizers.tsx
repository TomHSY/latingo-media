import { useInView } from '../hooks/useInView'
import { CONTACT_EMAIL, PLAY_STORE_URL } from '../constants'
import SceneBackground from './SceneBackground'

const benefits = [
  {
    icon: '📣',
    title: 'Visibilité gratuite',
    description: 'Tes soirées visibles par tous les danseurs de la région.',
  },
  {
    icon: '📲',
    title: 'Ajoute tes événements',
    description: 'Crée et gère tes soirées directement depuis l\'app.',
  },
  {
    icon: '🎯',
    title: 'Audience ciblée',
    description: 'Atteins les danseurs qui cherchent activement une soirée SBK.',
  },
  {
    icon: '🤝',
    title: 'Réseau local',
    description: 'Rejoins les organisateurs du Pays Basque, des Landes et de Pau.',
  },
]

export default function Organizers() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="organisateurs" className="relative bg-background py-14 md:py-20 overflow-hidden">
      <SceneBackground
        src="/images/community-sunset.png"
        imageClass="opacity-50"
        overlayClass="bg-background/50"
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          Tu organises des soirées SBK ?
        </h2>
        <p className="text-secondary-text text-center mb-4 max-w-2xl mx-auto">
          LatinGo centralise la demande des danseurs locaux. Référence tes événements
          gratuitement et touche une communauté qui cherche où sortir ce week-end.
        </p>
        <p className="text-coral font-medium text-center mb-10">
          Des organisateurs locaux nous ont déjà rejoints.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {benefits.map((item) => (
            <div key={item.title} className="bg-surface/90 rounded-xl p-5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-secondary-text text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-event="cta_organizer_download"
            className="inline-block bg-coral text-white font-bold px-8 py-4 rounded-lg hover:bg-coral/90 transition-colors"
          >
            Télécharge l'app et crée ton premier événement →
          </a>
          <p className="text-secondary-text text-sm">
            Une question ?{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Organisateur LatinGo`}
              data-event="organizer_contact"
              className="text-coral hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
