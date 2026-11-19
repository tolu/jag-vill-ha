// Buttons open and close dialogs with command="show-modal" and "close", which
// Safari before 26.2 ignores: there "Paxa" did nothing. Only those two are used here.
if (!('command' in HTMLButtonElement.prototype)) {
  addEventListener('click', (event) => {
    const button = event.target.closest?.('button[commandfor][command]');
    const dialog = button && document.getElementById(button.getAttribute('commandfor'));
    if (!dialog) return;
    const command = button.getAttribute('command');
    if (command === 'show-modal' && !dialog.open) dialog.showModal();
    if (command === 'close') dialog.close();
  });
}
