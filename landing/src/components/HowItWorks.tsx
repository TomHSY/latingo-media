import { useInView } from '../hooks/useInView'

const steps = [
  { number: 1, title: 'Ouvre l\'app', description: 'Découvre la carte des événements autour de toi.' },
  { number: 2, title: 'Filtre', description: 'Par style, date ou distance.' },
  { number: 3, title: 'Danse', description: 'Plus jamais de soirée ratée.' },
]

export default function HowItWorks() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative bg-surface py-14 md:py-20 overflow-hidden">
      <img
        src="/images/community-sunset.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-surface/50" />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Simple comme 1, 2, 3.
        </h2>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px border-t-2 border-dashed border-secondary-text/30" />

          {steps.map((step) => (
            <div key={step.number} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{step.number}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-secondary-text">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
