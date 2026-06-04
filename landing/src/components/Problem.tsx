import { useInView } from '../hooks/useInView'

export default function Problem() {
  const { ref, inView } = useInView(0.1)

  const painPoints = [
    {
      emoji: '📱',
      text: 'Les événements sont éparpillés entre Facebook, Instagram et le bouche-à-oreille.',
    },
    {
      emoji: '📸',
      text: 'Tu découvres une soirée le lendemain sur les stories de quelqu\'un.',
    },
    {
      emoji: '💬',
      text: 'Tu ne sais jamais ce qui se passe ce week-end sans demander dans 4 groupes WhatsApp.',
    },
  ]

  return (
    <section className="relative bg-surface py-14 md:py-20 overflow-hidden">
      <img
        src="/images/indoor-party.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-surface/50" />

      <div
        ref={ref}
        className={`relative z-10 max-w-[640px] mx-auto px-4 transition-all duration-700 ${
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
