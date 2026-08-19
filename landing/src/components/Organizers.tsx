import { useInView } from '../hooks/useInView'
import { CONTACT_EMAIL } from '../constants'
import SceneBackground from './SceneBackground'
import StoreButtons from './StoreButtons'

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
    <section id="organisateurs" className="relative bg-background py-20 md:py-28 overflow-hidden">
      <SceneBackground
        src="/images/dance-coastal-sunset.png"
        imageClass="opacity-50"
        overlayClass="bg-background/55"
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Tu organises des soirées SBK ?
        </h2>
        <p className="text-secondary-text text-center mb-6 max-w-2xl mx-auto text-lg">
          LatinGo centralise la demande des danseurs locaux. Référence tes événements
          gratuitement et touche une communauté qui cherche où sortir ce week-end.
        </p>
        <p className="text-coral font-bold text-xl md:text-2xl text-center mb-12">
          Des organisateurs locaux nous ont déjà rejoints.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {benefits.map((item) => (
            <div key={item.title} className="bg-surface/90 rounded-xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-secondary-text">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center space-y-6">
          <p className="text-primary-text font-medium text-lg">
            Crée tes événements directement dans l'app — c'est gratuit.
          </p>
          <StoreButtons eventPrefix="cta_organizer" />
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
