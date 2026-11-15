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
