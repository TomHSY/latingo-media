import { useInView } from '../hooks/useInView'

export default function Problem() {
  const { ref, inView } = useInView(0.1)

  const painPoints = [
    {
      emoji: '💬',
      text: 'Tu scrolles 4 groupes WhatsApp, 2 pages Facebook et les stories Instagram — et tu rates quand même une soirée.',
    },
    {
      emoji: '📸',
      text: 'Tu découvres une soirée géniale… le lendemain matin, sur les stories de quelqu\'un.',
    },
    {
      emoji: '📱',
      text: 'Chaque week-end, la même question : « Il y a quoi ce soir ? » — sans réponse claire.',
    },
  ]

  return (
    <section className="bg-surface py-14 md:py-20">
      <div
        ref={ref}
        className={`max-w-[640px] mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Tu rates des soirées. C'est normal.
        </h2>

        <div className="space-y-6">
          {painPoints.map((point, i) => (
            <p key={i} className="text-base md:text-lg text-secondary-text leading-relaxed">
              <span className="mr-3 text-xl">{point.emoji}</span>
              {point.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
