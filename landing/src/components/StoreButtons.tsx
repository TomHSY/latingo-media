import { APP_STORE_URL, PLAY_STORE_URL } from '../constants'

interface StoreButtonsProps {
  layout?: 'row' | 'stack'
  size?: 'sm' | 'md'
  eventPrefix?: string
  className?: string
}

export default function StoreButtons({
  layout = 'row',
  size = 'md',
  eventPrefix = 'cta',
  className = '',
}: StoreButtonsProps) {
  const badgeHeight = size === 'sm' ? 'h-12 md:h-14' : 'h-14 md:h-16'
  const containerClass =
    layout === 'stack'
      ? 'flex flex-col items-center gap-3'
      : 'flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'

  return (
    <div className={`${containerClass} ${className}`}>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-event={`${eventPrefix}_play_store`}
        className="inline-block hover:opacity-90 transition-opacity"
      >
        <img
          src="https://play.google.com/intl/fr_fr/badges/static/images/badges/fr_badge_web_generic.png"
          alt="Disponible sur Google Play"
          className={`${badgeHeight} w-auto`}
          loading="lazy"
        />
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-event={`${eventPrefix}_app_store`}
        className="inline-block hover:opacity-90 transition-opacity"
      >
        <img
          src="/images/app-store-badge-fr.svg"
          alt="Télécharger dans l'App Store"
          className={`${badgeHeight} w-auto`}
          loading="lazy"
        />
      </a>
    </div>
  )
}
