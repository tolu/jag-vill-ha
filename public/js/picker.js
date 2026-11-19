// Progressive enhancement for the picture boxes: the icon/image box in the wish
// form and the round profile picture on the account page. Both are a box that
// opens a modal dialog with a file input. This adds a preview, dropping a picture,
// and choosing which part of it to keep: drag to move, zoom with the slider,
// two fingers or the scroll wheel. The picture may be moved partly out of the
// frame and zoomed out until all of it fits; what is left empty takes the
// colour of the picture's edge. Only the chosen square is uploaded.
// Without this script the forms still work: pick an icon or a file and submit.
//
//   data-max-side="400"   widest the saved picture may be (default 800)
//   data-autosubmit       send the form as soon as the choice is made; a value
//                         is sent along as `intent`, so the server can tell
import { centred, cropRect, MAX_ZOOM, minZoom, pan, whole, zoomTo } from './crop-math.js';
import { droppedPicture } from './dropped.js';
import { fillColour, renderCrop } from './image.js';

const DEFAULT_MAX_SIDE = 800;
const KEY_STEP = 16; // view pixels per arrow-key press
const ZOOM_STEP = 1.25; // per press on − or +

for (const root of document.querySelectorAll('.appearance')) {
  const form = root.closest('form');
  const box = root.querySelector('.picker');
  const preview = box.querySelector('img');
  const menu = root.querySelector('dialog.picture-dialog');
  const file = root.querySelector('input[type="file"]');
  const remove = root.querySelector('input[name="tabortbild"]');
  const panel = root.querySelector('.crop');
  const view = panel.querySelector('.crop-view');
  const shown = view.querySelector('img');
  const slider = panel.querySelector('input[type="range"]');
  const wholeButton = panel.querySelector('[data-crop-whole]');
  // Where a failed drop is explained: beside the box, and in the dialog that covers it
  const statuses = root.querySelectorAll('.picture-status');
  const say = (text) => statuses.forEach((line) => (line.textContent = text));
  const maxSide = Number(root.dataset.maxSide) || DEFAULT_MAX_SIDE;
  slider.max = MAX_ZOOM;

  let source = null; // the picture being cropped, as an ImageBitmap
  let crop = null;
  let fill = 'white'; // what shows where the picture does not reach
  let dirty = false; // the crop on screen differs from the file in the form
  let changed = false; // a picture or icon was chosen since the form was last sent
  let cleared = 0; // counts "Ta bort", so a picture fetched back late does not undo it
  let before = null; // the choice as it was when the dialog opened
  let confirmed = false; // closed by "Klar" or an icon, not by Escape or beside it
  let working = Promise.resolve(); // a chosen picture still being read and cut

  // Positions the picture inside the view so that exactly the crop is visible.
  function paint() {
    const rect = cropRect(source, crop);
    const scale = view.clientWidth / rect.size;
    shown.style.width = `${source.width * scale}px`;
    shown.style.height = `${source.height * scale}px`;
    shown.style.translate = `${-rect.x * scale}px ${-rect.y * scale}px`;
    slider.value = crop.zoom;
    // "Visa hela bilden" only where it would change something
    const all = whole(source);
    wholeButton.hidden = Math.abs(crop.zoom - all.zoom) < 1e-3 && Math.abs(crop.cx - all.cx) < 0.5 && Math.abs(crop.cy - all.cy) < 0.5;
  }

  function change(next) {
    crop = next;
    dirty = true;
    paint();
  }

  // Puts the current crop in the form and in the box.
  async function commit() {
    const image = await renderCrop(source, cropRect(source, crop), maxSide, fill);
    const transfer = new DataTransfer();
    transfer.items.add(image);
    file.files = transfer.files;
    preview.src = URL.createObjectURL(image);
    preview.hidden = false;
    if (remove) remove.checked = false;
    dirty = false;
    changed = true;
  }

  // Sends the form by itself, if it asks for that and has something new to send.
  function autosubmit() {
    if (!changed || !('autosubmit' in root.dataset)) return;
    // A field that is not filled in right stops it; "Spara" sends everything later.
    if (!form.reportValidity()) return;
    changed = false;
    const intent =
      root.dataset.autosubmit && Object.assign(document.createElement('input'), { type: 'hidden', name: 'intent', value: root.dataset.autosubmit });
    if (intent) form.append(intent);
    form.requestSubmit();
    // The form's data is taken at once; a later "Spara" must not send this along.
    intent?.remove();
  }

  async function load(blob) {
    source = await createImageBitmap(blob);
    crop = centred(source);
    fill = fillColour(source);
    view.style.background = fill;
    slider.min = minZoom(source);
    shown.src = URL.createObjectURL(blob);
    panel.hidden = false;
  }

  // A newly chosen picture starts as the centred square. `adjust` opens the
  // crop view straight away; without it the owner can still open it from the box.
  // Says whether it was a picture that could be used.
  async function useImage(picked, adjust = true) {
    if (!picked?.type.startsWith('image/')) return false;
    await load(picked);
    await commit();
    if (!adjust) {
      if (menu.open) paint();
      return true;
    }
    dirty = true; // "Klar" confirms it, also an untouched crop
    if (!menu.open) menu.showModal();
    paint();
    // The file input went away with "Välj en bild": keep the keyboard on the picture.
    view.focus();
    return true;
  }

  // Back to no picture: the icon shows again.
  function clearImage() {
    cleared += 1;
    file.value = '';
    preview.hidden = true;
    source = null;
    dirty = false;
    changed = true;
    panel.hidden = true;
    if (remove) remove.checked = true;
  }

  file.addEventListener('change', () => {
    say('');
    working = useImage(file.files[0]);
  });
  // "Byt bild" opens the same file input that "Välj en bild" wraps.
  menu.querySelector('[data-pick]').addEventListener('click', () => file.click());
  // "Lägg till från länk" hands over the picture it found; it is shown in the
  // box without interrupting the form that just opened.
  root.addEventListener('picker:image', (event) => useImage(event.detail, false));

  // The box opens the dialog by its command, also without script. This runs
  // before the command does: a picture saved earlier shows its frame from the
  // start, not the icons for a moment. A frame later the dialog is open and the
  // frame can be measured. (Not the dialog's toggle event: Safari 18 has none.)
  const stored = () => !source && !preview.hidden && preview.src;
  box.addEventListener('click', () => {
    before = remember();
    confirmed = false;
    if (stored()) panel.hidden = false;
    requestAnimationFrame(async () => {
      if (!menu.open) return;
      if (stored()) {
        const ticket = cleared;
        const blob = await fetch(preview.src)
          .then((response) => response.blob())
          .catch(() => null);
        if (cleared !== ticket) return; // "Ta bort" was pressed while it was on its way
        if (blob) await load(blob);
        else panel.hidden = true;
      }
      if (source) paint();
    });
  });

  // Only "Klar" or picking an icon keeps what was done in the dialog. Escape or
  // a press beside it puts everything back as it was when it opened, so a
  // picture removed by mistake is not gone.
  function remember() {
    return {
      files: file.files,
      src: preview.getAttribute('src'),
      hidden: preview.hidden,
      remove: remove?.checked,
      icon: menu.querySelector('input[name="ikon"]:checked'),
      source,
      crop,
      fill,
      shown: shown.getAttribute('src'),
      panel: panel.hidden,
      changed,
    };
  }

  function restore(was) {
    cleared += 1; // a stored picture still on its way is not wanted any more
    file.files = was.files;
    if (was.src) preview.src = was.src;
    else preview.removeAttribute('src');
    preview.hidden = was.hidden;
    if (remove) remove.checked = was.remove;
    if (was.icon) was.icon.checked = true;
    ({ source, crop, fill, changed } = was);
    if (was.shown) shown.src = was.shown;
    view.style.background = fill;
    if (source) slider.min = minZoom(source);
    panel.hidden = was.panel;
    dirty = false;
  }

  menu.querySelector('button[command="close"]').addEventListener('click', () => (confirmed = true));

  menu.addEventListener('close', async () => {
    // "Klar" pressed while a big photo is still being read: wait for it first.
    await working;
    if (before && !confirmed) {
      restore(before);
      before = null;
      return;
    }
    before = null;
    confirmed = false;
    if (source && dirty) await commit();
    autosubmit();
  });

  // A turned phone or a resized window changes the frame: draw the crop anew.
  new ResizeObserver(() => source && menu.open && paint()).observe(view);

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

  // − and + for those who would rather click than slide.
  for (const button of panel.querySelectorAll('[data-zoom]')) {
    const factor = button.dataset.zoom === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP;
    button.addEventListener('click', () => source && change(zoomTo(source, crop, crop.zoom * factor)));
  }

  panel.querySelector('[data-crop-whole]').addEventListener('click', () => source && change(whole(source)));

  // Arrow keys move the picture for those who do not drag.
  view.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: [KEY_STEP, 0], ArrowRight: [-KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP] }[event.key];
    if (!step || !source) return;
    event.preventDefault();
    change(pan(source, crop, step[0], step[1], view.clientWidth));
  });

  // --- Icons and dropping ---------------------------------------------------
  // Picking an icon replaces the image. Listens for click, not change, so that
  // choosing the icon that is already selected closes the dialog too. Arrow
  // keys also click the radio they land on: moving through the icons must not
  // close the dialog, so after an arrow key "Klar" or Space confirms. (Not
  // event.detail: Safari gives 0 for a mouse click on the label too.)
  let byArrow = false;
  menu.addEventListener('keydown', (event) => (byArrow = event.key.startsWith('Arrow')));
  menu.addEventListener('pointerdown', () => (byArrow = false));
  menu.addEventListener('click', (event) => {
    if (event.target.name !== 'ikon' || byArrow) return;
    clearImage();
    confirmed = true;
    menu.close();
  });

  // "Ta bort" drops the picture and brings the choices back, without closing.
  menu.querySelector('[data-crop-clear]')?.addEventListener('click', clearImage);
  // The form was reset from outside (the dialog closed): forget the picture too.
  root.addEventListener('picker:reset', clearImage);

  // The whole form is the drop target, the open dialog too; the box and the
  // "Välj en bild" card show where it lands. Text fields keep their own drops:
  // a link dragged into "Länk" is a link, not a picture.
  const ownDrop = (event) => event.target.closest?.('input:not([type="file"]), textarea');
  form.addEventListener('dragover', (event) => {
    if (ownDrop(event)) return;
    event.preventDefault();
    root.dataset.drop = '';
  });
  form.addEventListener('dragleave', () => delete root.dataset.drop);
  // A dropped picture is used as it is, centred; the box opens the frame for
  // those who want to adjust it. Where a choice is saved at once, a drop on the
  // form is a choice too; one on the open dialog is sent when it closes.
  form.addEventListener('drop', async (event) => {
    delete root.dataset.drop;
    if (ownDrop(event)) return;
    event.preventDefault();
    say('');
    box.ariaBusy = 'true';
    try {
      const picked = await droppedPicture(event.dataTransfer);
      if (!(await useImage(picked, false))) {
        say('Den bilden gick inte att hämta. Spara den på datorn och välj den sedan.');
        return;
      }
      if (!menu.open) autosubmit();
    } finally {
      box.ariaBusy = null;
    }
  });
}
