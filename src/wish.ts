// Display rules for a wish. Pure, so they are testable without a database.

/** Stable colour for the thumb, derived from the title. */
export function thumbHue(title: string) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.codePointAt(0)!) % 360;
  return hash;
}

/** Swedish genitive: "Annas", but "Tobias" and "Max" take no extra s. */
export function possessive(name: string) {
  return /[sxz]$/i.test(name) ? name : `${name}s`;
}

/** "Se hos komplett.no": names the shop a wish links to, without the www. */
export function shopLabel(url: string) {
  try {
    return `Se hos ${new URL(url).hostname.replace(/^www\./, '')}`;
  } catch {
    return 'Se länken';
  }
}

/**
 * Whether the visitor is in Norway. Cloudflare tells us the country in
 * production; without it (local development) the browser's language decides.
 */
export function isNorwegianVisitor(country: string | null | undefined, acceptLanguage: string | null | undefined) {
  if (country) return country.toUpperCase() === 'NO';
  const preferred = (acceptLanguage ?? '').split(',')[0]!.trim().toLowerCase();
  return /^(nb|nn|no)(-|$)/.test(preferred);
}

/** Price-comparison searches for a wish. Plain links: nothing is fetched or tracked by us. */
export function priceSearchLinks(title: string, norwegian = false) {
  const query = encodeURIComponent(title.trim());
  return [
    { label: 'Sök på Prisjakt', href: `https://www.prisjakt.${norwegian ? 'no' : 'nu'}/search?query=${query}` },
    { label: 'Sök på Google Shopping', href: `https://www.google.com/search?udm=28&q=${query}` },
  ];
}
