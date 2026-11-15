// Turns the chosen part of a picture into the file that is uploaded.
// Phone photos are several megabytes; what is shown needs a fraction of that.
import { edgeColour, outputSize } from './crop-math.js';

const SAMPLE = 32; // the picture is shrunk to this before its edge is read

/** The colour that fills the frame where the picture does not reach. */
export function fillColour(bitmap) {
  const context = new OffscreenCanvas(SAMPLE, SAMPLE).getContext('2d');
  context.drawImage(bitmap, 0, 0, SAMPLE, SAMPLE);
  return edgeColour(context.getImageData(0, 0, SAMPLE, SAMPLE).data, SAMPLE, SAMPLE);
}

/** Draws `rect` of the picture into a square JPEG no wider than `maxSide`. */
export async function renderCrop(bitmap, rect, maxSide, fill) {
  const side = outputSize(rect, maxSide);
  const canvas = new OffscreenCanvas(side, side);
  const context = canvas.getContext('2d');
  context.fillStyle = fill;
  context.fillRect(0, 0, side, side);
  context.imageSmoothingQuality = 'high';
  // The whole picture is drawn and the canvas cuts it: `rect` may reach outside
  // the picture, and a source rectangle that does is not drawn alike everywhere.
  const scale = side / rect.size;
  const placed = [-rect.x * scale, -rect.y * scale, bitmap.width * scale, bitmap.height * scale];
  // JPEG has no transparency; white is what a see-through picture sits on anyway.
  context.fillStyle = 'white';
  context.fillRect(...placed);
  context.drawImage(bitmap, ...placed);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return new File([blob], 'bild.jpg', { type: 'image/jpeg' });
}
