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
