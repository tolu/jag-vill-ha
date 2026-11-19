import { describe, expect, it, vi } from 'vite-plus/test';
import { droppedImageUrl, droppedPicture } from '../public/js/dropped.js';

// What Chrome 157 on macOS put in the drop for a picture dragged from another tab.
const CHROME_URL = 'https://wishlistr-item-img.s3.amazonaws.com/w/749979/3563a0ad4588b5b19590746d19fb836c.jpg';
const CHROME_HTML = `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><img style="display: block;-webkit-user-select: none;margin: auto;" src="${CHROME_URL}">`;

describe('droppedImageUrl', () => {
  it('finds the picture in what Chrome drops', () => {
    expect(droppedImageUrl(CHROME_HTML, CHROME_URL)).toBe(CHROME_URL);
  });

  it('takes the picture, not the link it sits in', () => {
    const html = '<a href="https://butik.se/sak"><img alt="" src="https://cdn.butik.se/sak.jpg?w=800&amp;h=800"></a>';
    expect(droppedImageUrl(html, 'https://butik.se/sak')).toBe('https://cdn.butik.se/sak.jpg?w=800&h=800');
  });

  it('falls back to the URL list, skipping comments', () => {
    expect(droppedImageUrl('', '# from a page\r\nhttps://cdn.butik.se/sak.png')).toBe('https://cdn.butik.se/sak.png');
  });

  it('ignores addresses the server cannot fetch', () => {
    expect(droppedImageUrl('<img src="data:image/png;base64,AAAA">', 'blob:https://butik.se/1')).toBeNull();
    expect(droppedImageUrl('', '')).toBeNull();
  });
});

describe('droppedPicture', () => {
  const drop = ({ files = [], html = '', uriList = '' }) => ({
    files,
    getData: (type) => (type === 'text/html' ? html : type === 'text/uri-list' ? uriList : ''),
  });
  const answer = (blob) => async () => ({ ok: true, blob: async () => blob });

  it('uses a dropped file as it is', async () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const fetchImage = vi.fn();
    expect(await droppedPicture(drop({ files: [file] }), fetchImage)).toBe(file);
    expect(fetchImage).not.toHaveBeenCalled();
  });

  it('fetches a dropped address through our server', async () => {
    const fetchImage = vi.fn(answer(new Blob(['jpg'], { type: 'image/jpeg' })));
    const picture = await droppedPicture(drop({ html: CHROME_HTML, uriList: CHROME_URL }), fetchImage);
    expect(fetchImage).toHaveBeenCalledWith('/api/bild', expect.objectContaining({ method: 'POST' }));
    expect(fetchImage.mock.calls[0][1].body.get('bild')).toBe(CHROME_URL);
    expect(picture).toBeInstanceOf(File);
    expect(picture.type).toBe('image/jpeg');
  });

  it('gives nothing when the server could not fetch it', async () => {
    expect(await droppedPicture(drop({ uriList: CHROME_URL }), async () => ({ ok: false }))).toBeNull();
    expect(await droppedPicture(drop({ uriList: CHROME_URL }), () => Promise.reject(new Error('offline')))).toBeNull();
  });

  it('gives nothing for a drop without a picture', async () => {
    expect(await droppedPicture(drop({ uriList: 'blob:x' }), vi.fn())).toBeNull();
  });
});
