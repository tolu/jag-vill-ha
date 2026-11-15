// Display rules for a wish on the public list. Pure, so they are testable
// without a database.

type WishFacts = {
  quantity: number;
  price: number | null;
  note: string | null;
};

/** How many of a wish are still free; never negative. */
export function remaining(quantity: number, reserved: number) {
  return Math.max(0, quantity - reserved);
}

export function isTaken(quantity: number, reserved: number) {
  return remaining(quantity, reserved) === 0;
}

/** "1 899 kr" – Swedish grouping with a non-breaking space. */
export function formatPrice(price: number) {
  return `${price.toLocaleString('sv-SE')} kr`;
}

/** The grey line under the title: note or stock first, then price. */
export function metaLine(wish: WishFacts, reserved: number) {
  const parts: string[] = [];
  if (wish.quantity > 1) {
    const left = remaining(wish.quantity, reserved);
    parts.push(left === wish.quantity ? `${wish.quantity} st` : `${left} av ${wish.quantity} kvar`);
  }
  if (wish.note) parts.push(wish.note);
  if (wish.price !== null) {
    parts.push(wish.quantity > 1 ? `${formatPrice(wish.price)}/st` : formatPrice(wish.price));
  }
  return parts.join(' · ');
}

/** Stable colour for the placeholder thumb, derived from the title. */
export function thumbHue(title: string) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.codePointAt(0)!) % 360;
  return hash;
}

/** Swedish genitive: "Annas", but "Tobias" and "Max" take no extra s. */
export function possessive(name: string) {
  return /[sxz]$/i.test(name) ? name : `${name}s`;
}
