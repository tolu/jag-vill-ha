// Progressive enhancement for the picture boxes: the icon/image box in the wish
// form and the round profile picture on the account page. Both are a box that
// opens a popover with a file input; this adds preview, drop and downscaling.
// Without this script the forms still work: pick an icon or a file and submit.
//
//   data-max-side="400"   longest side after downscaling (default 800)
//   data-autosubmit       send the form as soon as a picture is chosen
import { downscale } from './image.js';

const DEFAULT_MAX_SIDE = 800;

for (const root of document.querySelectorAll('.appearance')) {
  const form = root.closest('form');
  const box = root.querySelector('.picker');
  const preview = box.querySelector('img');
  const menu = root.querySelector('[popover]');
  const file = root.querySelector('input[type="file"]');
  const remove = root.querySelector('input[name="tabortbild"]');
  const maxSide = Number(root.dataset.maxSide) || DEFAULT_MAX_SIDE;

  async function useImage(picked) {
    if (!picked?.type.startsWith('image/')) return;
    const image = await downscale(picked, maxSide);
    const transfer = new DataTransfer();
    transfer.items.add(image);
    file.files = transfer.files;
    preview.src = URL.createObjectURL(image);
    preview.hidden = false;
    if (remove) remove.checked = false;
    menu.hidePopover();
    if ('autosubmit' in root.dataset) form.requestSubmit();
  }

  file.addEventListener('change', () => useImage(file.files[0]));
  // "Lägg till från länk" hands over the picture it found on the page.
  root.addEventListener('picker:image', (event) => useImage(event.detail));

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
