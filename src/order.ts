/**
 * Checks a requested order of wish ids against the ids the list really has.
 * Returns the order as numbers when it is exactly the same set, otherwise null,
 * so a stale or tampered request can never drop, duplicate or add a wish.
 */
export function parseOrder(input: string, currentIds: readonly number[]) {
  const requested = input.split(',').map(Number);
  if (requested.length !== currentIds.length) return null;
  if (new Set(requested).size !== requested.length) return null;
  const known = new Set(currentIds);
  return requested.every((id) => known.has(id)) ? requested : null;
}
