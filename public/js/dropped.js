// What a picture dragged from another web page leaves in a drop. Safari hands
// over the file; Chrome only the page's HTML for the <img> and a URL, so the
// picture has to be fetched by address.

const ENTITIES = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };

/**
 * The address of a dropped picture, or null. The <img> in `html` comes first:
 * for a picture inside a link, `uriList` holds the link, not the picture.
 */
export function droppedImageUrl(html, uriList) {
  const src = /<img\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(html ?? '');
  const fromHtml = src && (src[1] ?? src[2]).replace(/&(?:amp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity]);
  const fromList = (uriList ?? '').split(/\r?\n/).find((line) => line && !line.startsWith('#'));
  for (const candidate of [fromHtml, fromList]) {
    if (/^https?:\/\//i.test(candidate?.trim() ?? '')) return candidate.trim();
  }
  return null;
}

/**
 * A picture on another site, as a File, or null. It comes through our own
 * server: the shop would not let the browser read it.
 */
export async function fetchPicture(url, fetchImage = fetch) {
  const body = new FormData();
  body.set('bild', url);
  const response = await fetchImage('/api/bild', { method: 'POST', body }).catch(() => null);
  if (!response?.ok) return null;
  const blob = await response.blob();
  return new File([blob], 'bild', { type: blob.type });
}

/** The picture in a drop, as a File, or null. A dropped file is used as it is. */
export async function droppedPicture(dataTransfer, fetchImage = fetch) {
  if (dataTransfer.files.length) return dataTransfer.files[0];
  const url = droppedImageUrl(dataTransfer.getData('text/html'), dataTransfer.getData('text/uri-list'));
  return url ? fetchPicture(url, fetchImage) : null;
}
