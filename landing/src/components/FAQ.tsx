import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const faqs = [
  {
    question: 'C\'est gratuit ?',
    answer: 'Oui, totalement gratuit pour les danseurs. Aujourd\'hui et pour toujours.',
  },
  {
    question: 'C\'est quoi l\'accès anticipé ?',
    answer: 'L\'app est fonctionnelle et déjà utilisée par des danseurs de la région. On ouvre l\'accès progressivement pour garantir la meilleure expérience et intégrer vos retours. Les premiers inscrits reçoivent leur accès en priorité.',
  },
  {
    question: 'Quand sort la version officielle ?',
    answer: 'L\'app est déjà disponible en accès anticipé sur Android. Le lancement officiel (ouvert à tous, iOS inclus) est prévu prochainement. Inscris-toi pour ne pas rater l\'ouverture.',
  },
  {
    question: 'Android et iPhone ?',
    answer: 'L\'accès anticipé est actuellement sur Android (via le Play Store). La version iPhone est en cours de développement et arrive très bientôt. En t\'inscrivant maintenant, tu seras prioritaire dès la sortie iOS.',
  },
  {
    question: 'Comment vous trouvez les événements ?',
    answer: 'On regroupe les sources locales (réseaux sociaux, organisateurs, bouche-à-oreille) et on vérifie chaque événement manuellement.',
  },
  {
    question: 'Je suis organisateur, comment référencer mes événements ?',
    answer: 'Écris-nous à contact@latingo.fr — on les ajoute gratuitement. C\'est rapide et ça donne de la visibilité à tes soirées auprès de toute la communauté.',
  },
]

export default function FAQ() {
  const { ref, inView } = useInView(0.1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-background py-14 md:py-20">
      <div
        ref={ref}
        className={`max-w-2xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
          Questions fréquentes
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surface rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                data-event={`faq_expand_${i}`}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-surface/80 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span>{faq.question}</span>
                <span className="text-secondary-text text-xl ml-4 flex-shrink-0">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-4 text-secondary-text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
