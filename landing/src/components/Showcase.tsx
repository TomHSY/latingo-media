import { useInView } from '../hooks/useInView'

export default function Showcase() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="bg-background py-20 md:py-28">
      <div
        ref={ref}
        className={`max-w-[600px] mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-coral/20 blur-3xl" />
          <img
            src="/images/screenshot-discover.png"
            alt="LatinGo — Découvrez toutes les soirées SBK"
            className="relative w-full h-auto rounded-2xl shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
