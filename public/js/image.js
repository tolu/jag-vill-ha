// Shared by the wish picture and the profile picture.
// Phone photos are several megabytes; what is shown needs a fraction of that.
export async function downscale(picked, maxSide) {
  if (picked.type === 'image/gif') return picked;
  const bitmap = await createImageBitmap(picked);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && picked.size < 300_000) return picked;
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return new File([blob], 'bild.jpg', { type: 'image/jpeg' });
}
