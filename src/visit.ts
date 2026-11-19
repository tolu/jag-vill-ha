// What counts as a visit to a list. Pure, so it is tested. Nothing about the
// visitor is kept: the answer is yes or no, and a yes adds one to that day.

// Link previews, crawlers and scripts: they fetch the page, nobody reads it.
const NOT_A_PERSON =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|embed|curl|wget|python|node|headless|lighthouse|monitor/i;

type Request = {
  isOwner: boolean;
  /** The list's own address, "/gorel". */
  path: string;
  userAgent: string | undefined;
  /** `Sec-Purpose`, which a browser sets when it loads a page ahead of time. */
  purpose: string | undefined;
  referer: string | undefined;
};

export function countsAsVisit({ isOwner, path, userAgent, purpose, referer }: Request) {
  if (isOwner) return false;
  if (!userAgent || NOT_A_PERSON.test(userAgent)) return false;
  if (purpose?.includes('prefetch')) return false;
  // She is already on the list: reserving or undoing sends her back to it, and
  // that is the same visit, not a new one.
  if (referer && URL.canParse(referer) && new URL(referer).pathname === path) return false;
  return true;
}
