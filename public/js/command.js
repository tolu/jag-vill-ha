// Buttons open dialogs with command="show-modal", which Safari before 26.2
// ignores: there "Paxa" did nothing. Only that one command is used here.
if (!('command' in HTMLButtonElement.prototype)) {
  addEventListener('click', (event) => {
    const button = event.target.closest?.('button[commandfor][command="show-modal"]');
    if (button) document.getElementById(button.getAttribute('commandfor'))?.showModal();
  });
}
