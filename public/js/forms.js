// Shows that a sent form is on its way: spinner on the button, fields locked.
// Deferred a tick, because a button disabled during submit drops its own value.
for (const form of document.querySelectorAll('form[method="post"]')) {
  form.addEventListener('submit', (event) => {
    const button = event.submitter;
    if (!button || button.formMethod === 'dialog') return;
    setTimeout(() => {
      button.dataset.busy = '';
      form.inert = true;
    });
  });
}

// Coming back with the browser's back button restores the page as it was left.
addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  for (const form of document.querySelectorAll('form[inert]')) form.inert = false;
  for (const button of document.querySelectorAll('[data-busy]')) delete button.dataset.busy;
});
