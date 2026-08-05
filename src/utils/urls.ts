/** Append a cache-busting query param so CDNs/browsers fetch the latest image. */
export function cacheBustUrl(url: string, version?: string | number): string {
  const v = version ?? Date.now();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(v))}`;
}
