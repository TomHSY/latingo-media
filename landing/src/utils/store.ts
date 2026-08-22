import { APP_STORE_URL, PLAY_STORE_URL } from '../constants'

export type StorePlatform = 'ios' | 'android' | 'unknown'

export function detectStore(): StorePlatform {
  if (typeof navigator === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  const isIos =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (isIos) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'unknown'
}

export function getStoreUrl(platform: Exclude<StorePlatform, 'unknown'>): string {
  return platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL
}

export function openStore(platform: Exclude<StorePlatform, 'unknown'>): void {
  const url = getStoreUrl(platform)
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) window.location.assign(url)
}
