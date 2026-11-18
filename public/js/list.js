// Owner's list: copy the list link, and reorder wishes by dragging the grip
// or with the arrow keys while a grip has focus.

// --- Share or copy the list link -----------------------------------------------
// Phones get their own share sheet (which also offers "copy"); elsewhere the
// link is copied straight to the clipboard.
for (const button of document.querySelectorAll('[data-copy]')) {
  const status = button.parentElement.querySelector('[role="status"]');
  const url = new URL(button.dataset.copy, location.origin).href;
  const canShare = navigator.canShare?.({ url }) && matchMedia('(pointer: coarse)').matches;
  if (canShare) button.dataset.share = '';

  button.addEventListener('click', async () => {
    if (canShare) {
      // Closing the share sheet rejects; that is not an error.
      await navigator.share({ url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    button.dataset.copied = '';
    status.textContent = 'Kopierad';
    setTimeout(() => {
      delete button.dataset.copied;
      status.textContent = '';
    }, 2000);
  });
}

// --- Reorder ---------------------------------------------------------------
// While dragging, nothing moves in the DOM: the picked-up row follows the
// pointer and its neighbours slide out of the way, all with `translate`.
// On release the real move happens inside a view transition, so every row
// glides from where it is on screen to where it now belongs.
const list = document.querySelector('.wishes.editable');
const EDGE = 72; // px from the viewport edge where dragging starts to scroll
const SCROLL_STEP = 10;

const order = () => [...list.children].map((row) => row.dataset.id).join(',');

// Resolves once `change` has run. A view transition runs it a frame later,
// so anything that reads the new order has to wait for this.
async function withTransition(change) {
  if (!document.startViewTransition) return change();
  await document.startViewTransition(change).updateCallbackDone;
}

async function save(before) {
  if (order() === before) return;
  const body = new FormData();
  body.set('intent', 'order');
  body.set('ids', order());
  const response = await fetch('/lista', { method: 'POST', body }).catch(() => null);
  // The server is the truth: if it refused, show what it actually has.
  if (!response?.ok) location.reload();
}

for (const row of list?.children ?? []) {
  const grip = row.querySelector('.grip');

  grip.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    grip.setPointerCapture(event.pointerId);

    const before = order();
    const rows = [...list.children];
    const from = rows.indexOf(row);
    // Measured once, in page coordinates, so scrolling does not disturb them.
    const boxes = rows.map((item) => {
      const box = item.getBoundingClientRect();
      return { top: box.top + scrollY, height: box.height };
    });
    const startY = event.clientY + scrollY;
    let pointerY = event.clientY;
    let to = from;
    let frame;

    row.dataset.dragging = '';
    list.dataset.sorting = '';

    function place() {
      const moved = pointerY + scrollY - startY;
      const centre = boxes[from].top + boxes[from].height / 2 + moved;
      // The new index is the number of other rows whose middle is above us.
      to = boxes.filter((box, index) => index !== from && box.top + box.height / 2 < centre).length;

      row.style.translate = `0 ${moved}px`;
      rows.forEach((item, index) => {
        if (index === from) return;
        const up = index > from && index <= to;
        const down = index < from && index >= to;
        item.style.translate = up ? `0 ${-boxes[from].height}px` : down ? `0 ${boxes[from].height}px` : '';
      });
    }

    // Runs every frame so the list keeps scrolling while the pointer rests near an edge.
    function tick() {
      if (pointerY < EDGE) scrollBy(0, -SCROLL_STEP);
      else if (pointerY > innerHeight - EDGE) scrollBy(0, SCROLL_STEP);
      place();
      frame = requestAnimationFrame(tick);
    }

    const track = (moveEvent) => {
      pointerY = moveEvent.clientY;
    };

    const drop = () => {
      cancelAnimationFrame(frame);
      grip.removeEventListener('pointermove', track);
      grip.removeEventListener('pointerup', drop);
      grip.removeEventListener('pointercancel', drop);

      withTransition(() => {
        for (const item of rows) item.style.translate = '';
        delete row.dataset.dragging;
        delete list.dataset.sorting;
        if (to === from) return;
        const others = rows.filter((item) => item !== row);
        if (others[to]) others[to].before(row);
        else list.append(row);
      }).then(() => save(before));
    };

    grip.addEventListener('pointermove', track);
    grip.addEventListener('pointerup', drop);
    grip.addEventListener('pointercancel', drop);
    tick();
  });

  grip.addEventListener('keydown', (event) => {
    const neighbour = event.key === 'ArrowUp' ? row.previousElementSibling : event.key === 'ArrowDown' ? row.nextElementSibling : null;
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (!neighbour) return;
    const before = order();
    withTransition(() => {
      if (event.key === 'ArrowUp') neighbour.before(row);
      else neighbour.after(row);
      grip.focus();
    }).then(() => save(before));
  });
}

// --- Add from a link ---------------------------------------------------------
// Step one asks only for a link. The page is fetched, and the ordinary
// "Ny önskning" form then opens filled in, so the owner sees and can correct
// what was found before anything is saved.
const linkDialog = document.getElementById('fran-lank');
const linkForm = linkDialog?.querySelector('form[data-from-link]');
const wishDialog = document.getElementById('ny');

const REASONS = {
  blocked: 'Butiken släppte inte in oss. Fyll i själv i stället.',
  empty: 'Sidan sa inget om vad det är för sak. Fyll i själv i stället.',
  unreachable: 'Vi kom inte fram till den adressen. Stämmer länken?',
};

if (linkForm && wishDialog) {
  for (const button of document.querySelectorAll('[data-needs-js]')) button.hidden = false;

  const input = linkForm.elements.lank;
  const status = linkForm.querySelector('[role="alert"]');
  const fetchButton = linkForm.querySelector('button:not([type="button"]):not([formmethod])');
  const manual = linkForm.querySelector('[data-manual]');
  const wishForm = wishDialog.querySelector('form');

  // Moves on to the ordinary form with whatever is known so far.
  function review({ title, image }) {
    wishForm.elements.titel.value = title ?? '';
    wishForm.elements.lank.value = input.value;
    linkDialog.close();
    wishDialog.showModal();
    wishForm.elements.titel.focus();
    if (image) usePicture(image);
  }

  // The picture comes through our own server (the shop would not allow the
  // browser to read it), and then takes the same path as a chosen file:
  // downscaled here, shown in the box, uploaded with the form.
  async function usePicture(url) {
    const body = new FormData();
    body.set('bild', url);
    const response = await fetch('/api/bild', { method: 'POST', body }).catch(() => null);
    if (!response?.ok) return;
    const blob = await response.blob();
    const picture = new File([blob], 'bild', { type: blob.type });
    wishForm.querySelector('.appearance').dispatchEvent(new CustomEvent('picker:image', { detail: picture }));
  }

  linkForm.addEventListener('submit', async (event) => {
    if (event.submitter?.formMethod === 'dialog') return;
    event.preventDefault();
    status.textContent = '';
    manual.hidden = true;
    fetchButton.dataset.busy = '';
    fetchButton.disabled = true;
    input.readOnly = true;

    const body = new FormData();
    body.set('lank', input.value);
    const found = await fetch('/api/lank', { method: 'POST', body })
      .then((response) => (response.ok ? response.json() : { reason: 'unreachable' }))
      .catch(() => ({ reason: 'unreachable' }));

    delete fetchButton.dataset.busy;
    fetchButton.disabled = false;
    input.readOnly = false;

    if (found.reason) {
      status.textContent = REASONS[found.reason] ?? REASONS.unreachable;
      manual.hidden = false;
      return;
    }
    review(found);
  });

  manual.addEventListener('click', () => review({}));

  // Each visit to either dialog starts clean.
  linkDialog.addEventListener('close', () => {
    linkForm.reset();
    status.textContent = '';
    manual.hidden = true;
  });
  wishDialog.addEventListener('close', () => {
    wishForm.reset();
    wishForm.querySelector('.appearance').dispatchEvent(new CustomEvent('picker:reset'));
  });
}
