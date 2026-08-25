import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import { CONTACT_EMAIL } from '../constants'

const faqs = [
  {
    question: 'C\'est gratuit ?',
    answer: 'Oui, totalement gratuit pour les danseurs. Aujourd\'hui et pour toujours.',
  },
  {
    question: 'Disponible sur Android et iOS ?',
    answer: 'Oui. LatinGo est disponible sur Android (Google Play) et iOS (App Store).',
  },
  {
    question: 'Comment vous trouvez les événements ?',
    answer: 'Les organisateurs créent leurs soirées directement dans l\'app. On vérifie et on centralise tout pour que tu aies un calendrier fiable, à jour et complet.',
  },
  {
    question: 'Ma ville est-elle disponible dans l\'application ?',
    answer: `On couvre le Sud-Ouest : Pays Basque, Landes, Béarn, Pau, Tarbes, Irun et Saint-Sébastien. Ta ville n'y est pas encore ? Contacte-nous à ${CONTACT_EMAIL} — on collabore avec les organisateurs locaux pour l'intégrer.`,
  },
  {
    question: 'Comment ajouter mon événement en tant qu\'organisateur ?',
    answer: `Télécharge l'app sur Android ou iOS, crée ton compte et ajoute tes événements directement. C'est gratuit. Pour toute question : ${CONTACT_EMAIL}.`,
  },
  {
    question: 'C\'est payant pour les organisateurs ?',
    answer: 'Non. Référencer tes soirées sur LatinGo est entièrement gratuit.',
  },
  {
    question: 'Comment vous contacter ?',
    answer: `Écris-nous à ${CONTACT_EMAIL} — on répond rapidement.`,
  },
]

export default function FAQ() {
  const { ref, inView } = useInView(0.1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-surface py-14 md:py-20">
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
