// Progressive enhancement for the picture boxes: the icon/image box in the wish
// form and the round profile picture on the account page. Both are a box that
// opens a popover with a file input. This adds a preview, dropping a picture,
// and choosing which part of it to keep: drag to move, zoom with the slider,
// two fingers or the scroll wheel. Only the chosen square is uploaded.
// Without this script the forms still work: pick an icon or a file and submit.
//
//   data-max-side="400"   widest the saved picture may be (default 800)
//   data-autosubmit       send the form as soon as the choice is made
import { centred, cropRect, MAX_ZOOM, pan, zoomTo } from './crop-math.js';
import { renderCrop } from './image.js';

const DEFAULT_MAX_SIDE = 800;
const KEY_STEP = 16; // view pixels per arrow-key press

for (const root of document.querySelectorAll('.appearance')) {
  const form = root.closest('form');
  const box = root.querySelector('.picker');
  const preview = box.querySelector('img');
  const menu = root.querySelector('[popover]');
  const file = root.querySelector('input[type="file"]');
  const remove = root.querySelector('input[name="tabortbild"]');
  const panel = root.querySelector('.crop');
  const view = panel.querySelector('.crop-view');
  const shown = view.querySelector('img');
  const slider = panel.querySelector('input[type="range"]');
  const maxSide = Number(root.dataset.maxSide) || DEFAULT_MAX_SIDE;
  slider.max = MAX_ZOOM;

  let source = null; // the picture being cropped, as an ImageBitmap
  let crop = null;
  let dirty = false; // the crop on screen differs from the file in the form

  // Positions the picture inside the view so that exactly the crop is visible.
  function paint() {
    const rect = cropRect(source, crop);
    const scale = view.clientWidth / rect.size;
    shown.style.width = `${source.width * scale}px`;
    shown.style.height = `${source.height * scale}px`;
    shown.style.translate = `${-rect.x * scale}px ${-rect.y * scale}px`;
    slider.value = crop.zoom;
  }

  function change(next) {
    crop = next;
    dirty = true;
    paint();
  }

  // Puts the current crop in the form and in the box.
  async function commit() {
    const image = await renderCrop(source, cropRect(source, crop), maxSide);
    const transfer = new DataTransfer();
    transfer.items.add(image);
    file.files = transfer.files;
    preview.src = URL.createObjectURL(image);
    preview.hidden = false;
    if (remove) remove.checked = false;
    dirty = false;
  }

  async function load(blob) {
    source = await createImageBitmap(blob);
    crop = centred(source);
    shown.src = URL.createObjectURL(blob);
    panel.hidden = false;
  }

  // A newly chosen picture starts as the centred square. `adjust` opens the
  // crop view straight away; without it the owner can still open it from the box.
  async function useImage(picked, adjust = true) {
    if (!picked?.type.startsWith('image/')) return;
    await load(picked);
    await commit();
    if (!adjust) return;
    dirty = true; // closing the popover is what confirms, also for an untouched crop
    if (!menu.matches(':popover-open')) menu.showPopover();
    paint();
  }

  // Back to no picture: the icon shows again.
  function clearImage() {
    file.value = '';
    preview.hidden = true;
    source = null;
    dirty = false;
    panel.hidden = true;
    if (remove) remove.checked = true;
  }

  file.addEventListener('change', () => useImage(file.files[0]));
  // "Lägg till från länk" hands over the picture it found; it is shown in the
  // box without interrupting the form that just opened.
  root.addEventListener('picker:image', (event) => useImage(event.detail, false));

  menu.addEventListener('toggle', async (event) => {
    if (event.newState === 'open') {
      // A picture saved earlier can be cropped tighter: fetch it back as the source.
      if (!source && !preview.hidden && preview.src) {
        const stored = await fetch(preview.src).then((response) => response.blob()).catch(() => null);
        if (stored) await load(stored);
      }
      if (source) paint();
      return;
    }
    // Closing the popover is "done": keep what is on screen.
    if (!source || !dirty) return;
    await commit();
    if ('autosubmit' in root.dataset) form.requestSubmit();
  });

  panel.querySelector('[data-crop-done]').addEventListener('click', () => menu.hidePopover());

  // --- Moving and zooming ---------------------------------------------------
  const pointers = new Map();
  let pinch = null; // finger distance and zoom when the second finger landed

  const spread = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  view.addEventListener('pointerdown', (event) => {
    view.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinch = pointers.size === 2 ? { spread: spread(), zoom: crop.zoom } : null;
  });

  view.addEventListener('pointermove', (event) => {
    const before = pointers.get(event.pointerId);
    if (!before || !source) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch) change(zoomTo(source, crop, (pinch.zoom * spread()) / pinch.spread));
    else change(pan(source, crop, event.clientX - before.x, event.clientY - before.y, view.clientWidth));
  });

  const release = (event) => {
    pointers.delete(event.pointerId);
    pinch = null;
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);

  view.addEventListener(
    'wheel',
    (event) => {
      if (!source) return;
      event.preventDefault();
      change(zoomTo(source, crop, crop.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1)));
    },
    { passive: false },
  );

  slider.addEventListener('input', () => source && change(zoomTo(source, crop, Number(slider.value))));

  // Arrow keys move the picture for those who do not drag.
  view.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: [KEY_STEP, 0], ArrowRight: [-KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP] }[event.key];
    if (!step || !source) return;
    event.preventDefault();
    change(pan(source, crop, step[0], step[1], view.clientWidth));
  });

  // --- Icons and dropping ---------------------------------------------------
  // Picking an icon replaces the image. Listens for click, not change, so that
  // choosing the icon that is already selected closes the popover too.
  menu.addEventListener('click', (event) => {
    if (event.target.name !== 'ikon') return;
    clearImage();
    menu.hidePopover();
  });

  // "Byt till ikon" drops the picture and brings the icons back, without closing.
  panel.querySelector('[data-crop-clear]')?.addEventListener('click', clearImage);
  // The form was reset from outside (the dialog closed): forget the picture too.
  root.addEventListener('picker:reset', clearImage);

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
