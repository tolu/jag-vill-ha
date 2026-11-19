// The theme picker on the owner's list. Choosing a card dresses the page at
// once and saves in the background; the page is the confirmation. Without
// this script the form's own button saves, and the page comes back dressed.

const form = document.querySelector('form[data-theme-form]');

if (form) {
  const main = form.closest('main');
  const name = main.querySelector('[data-theme-name]');
  const verb = main.querySelector('[data-theme-verb]');
  form.querySelector('button').hidden = true;

  form.addEventListener('change', async () => {
    const chosen = form.querySelector('input[name="theme"]:checked');
    const dress = () => {
      if (chosen.value) main.dataset.theme = chosen.value;
      else delete main.dataset.theme;
      name.textContent = chosen.dataset.label;
      verb.textContent = chosen.value ? 'Byt' : 'Välj';
    };
    // The old look fades into the new, for those who have not asked for stillness.
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(dress);
    else dress();

    // Not saved: the page as the server has it is the honest answer.
    const saved = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json' } }).then(
      (response) => response.ok,
      () => false,
    );
    if (!saved) location.reload();
  });
}
