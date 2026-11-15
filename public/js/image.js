// Turns the chosen part of a picture into the file that is uploaded.
// Phone photos are several megabytes; what is shown needs a fraction of that.
import { outputSize } from './crop-math.js';

/** Draws `rect` of the picture into a square JPEG no wider than `maxSide`. */
export async function renderCrop(bitmap, rect, maxSide) {
  const side = outputSize(rect, maxSide);
  const canvas = new OffscreenCanvas(side, side);
  const context = canvas.getContext('2d');
  // JPEG has no transparency; white is what a see-through picture sits on anyway.
  context.fillStyle = 'white';
  context.fillRect(0, 0, side, side);
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, rect.x, rect.y, rect.size, rect.size, 0, 0, side, side);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return new File([blob], 'bild.jpg', { type: 'image/jpeg' });
}
