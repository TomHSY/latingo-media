import { useInView } from '../hooks/useInView'
import { events, eventsAreStale } from '../data'
import SceneBackground from './SceneBackground'
import { formatEventWhen } from '../utils/event-dates'
import StoreButtons from './StoreButtons'

const styleColors: Record<string, string> = {
  Salsa: 'bg-coral/20 text-coral',
  Bachata: 'bg-gold/20 text-gold',
  Kizomba: 'bg-purple-500/20 text-purple-300',
  Semba: 'bg-emerald-500/20 text-emerald-300',
  Zouk: 'bg-blue-500/20 text-blue-300',
}

function styleClass(style: string): string {
  return styleColors[style] ?? 'bg-surface text-secondary-text'
}

export default function EventsPreview() {
  const { ref, inView } = useInView(0.1)
  const hasPreview = events.upcoming.length > 0

  return (
    <section className="relative bg-background py-14 md:py-20 overflow-hidden">
      <SceneBackground
        src="/images/dance-social-neon.png"
        imageClass="opacity-55"
        overlayClass="bg-background/55"
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-5xl mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
          Cette semaine près de chez toi
        </h2>
        <p className="text-secondary-text text-center mb-10">
          {hasPreview
            ? "Un aperçu en direct — mis à jour chaque semaine."
            : "Télécharge l'app pour voir les prochaines soirées près de chez toi."}
        </p>

        {hasPreview ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4">
            {events.upcoming.map((event) => (
              <article
                key={event.id}
                className="w-[160px] shrink-0 snap-start bg-surface/90 rounded-xl overflow-hidden md:w-auto"
              >
                <div className="aspect-[2/1] md:aspect-[16/10] bg-[#2a2a35] relative">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      💃
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <p className="text-coral text-xs font-medium mb-1">
                    {formatEventWhen(event.startDatetime)}
                  </p>
                  <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  {event.city && (
                    <p className="text-secondary-text text-xs mb-3">{event.city}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {event.styles.map((style) => (
                      <span
                        key={style}
                        className={`text-xs px-2 py-0.5 rounded-full ${styleClass(style)}`}
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : eventsAreStale ? (
          <p className="text-secondary-text text-center max-w-md mx-auto">
            L'aperçu sera de nouveau disponible dès la prochaine mise à jour des
            événements.
          </p>
        ) : null}

        <div className="text-center mt-10">
          <StoreButtons eventPrefix="cta_events_preview" size="sm" />
        </div>
      </div>
    </section>
  )
}
