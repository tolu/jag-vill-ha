// Progressive enhancement for the icon/image box in the wish form.
// Without this script the form still works: pick an icon or a file and submit.
const MAX_SIDE = 800;

for (const root of document.querySelectorAll('.appearance')) {
  const form = root.closest('form');
  const box = root.querySelector('.picker');
  const preview = box.querySelector('img');
  const menu = root.querySelector('[popover]');
  const file = root.querySelector('input[type="file"]');
  const remove = root.querySelector('input[name="tabortbild"]');

  async function useImage(picked) {
    if (!picked?.type.startsWith('image/')) return;
    const image = await downscale(picked);
    const transfer = new DataTransfer();
    transfer.items.add(image);
    file.files = transfer.files;
    preview.src = URL.createObjectURL(image);
    preview.hidden = false;
    if (remove) remove.checked = false;
    menu.hidePopover();
  }

  file.addEventListener('change', () => useImage(file.files[0]));

  // Picking an icon replaces the image. Listens for click, not change, so that
  // choosing the icon that is already selected closes the popover too.
  menu.addEventListener('click', (event) => {
    if (event.target.name !== 'ikon') return;
    file.value = '';
    preview.hidden = true;
    if (remove) remove.checked = true;
    menu.hidePopover();
  });

  // The whole form is the drop target; the box only shows where it lands.
  form.addEventListener('dragover', (event) => {
    event.preventDefault();
    box.dataset.drop = '';
  });
  form.addEventListener('dragleave', () => delete box.dataset.drop);
  form.addEventListener('drop', (event) => {
    event.preventDefault();
    delete box.dataset.drop;
    useImage(event.dataTransfer.files[0]);
  });
}

// Phone photos are several megabytes; a list thumbnail needs a fraction of that.
async function downscale(picked) {
  if (picked.type === 'image/gif') return picked;
  const bitmap = await createImageBitmap(picked);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && picked.size < 300_000) return picked;
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return new File([blob], 'bild.jpg', { type: 'image/jpeg' });
}
