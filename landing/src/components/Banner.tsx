import { useInView } from '../hooks/useInView'

export default function Banner() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="bg-background pt-8 pb-4 md:pt-12 md:pb-6">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <img
          src="/images/og-image.png"
          alt="LatinGo — Ne rate plus aucune soirée SBK"
          className="w-full h-auto rounded-2xl shadow-2xl"
          loading="lazy"
        />
      </div>
    </section>
  )
}
