// Passkey sign-up, login and "add another passkey" without a framework.
// Talks to Better Auth's passkey endpoints and uses the browser's own JSON
// helpers for WebAuthn, so nothing else needs to be loaded.
//
// Markup contract:
//   <button data-passkey="login" data-status="id">       log in, then go to data-next
//   <form   data-passkey="register" data-status="id">    reads the "namn" field
//   <button data-passkey="add" data-status="id">         needs a session
import { toUsername, toUsernameWhileTyping } from './username.js';

const API = '/api/auth/passkey';

const MESSAGES = {
  // Cancelling means something different depending on what she was doing.
  cancelled: {
    register: 'Det blev ingen lista den här gången. Försök igen, och svara ja när telefonen eller datorn frågar.',
    login: 'Det blev ingen inloggning. Försök igen när du vill.',
    add: 'Det blev ingen ny nyckel. Försök igen när du vill.',
  },
  exists: 'Den här telefonen eller datorn har redan en nyckel till din lista. Du behöver ingen ny.',
  unsupported: 'Den här telefonen eller datorn behöver uppdateras för att det ska fungera.',
  unknown: 'Den nyckeln hör inte till någon lista här. Listan kan vara borttagen.',
  failed: 'Det gick inte just nu. Kolla att du har internet och försök igen.',
};

// A message that is ours and in Swedish, as opposed to whatever the browser
// or the login library put in an Error.
class Told extends Error {}

async function call(path, body) {
  const response = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Our own refusals (auth.ts marks them) are shown as they are. The login
    // library answers in English: the one an owner can run into, a passkey
    // whose account is gone, gets its own message and the rest a general one.
    if (data?.code === 'JVH') throw new Told(data.message);
    throw new Told(/passkey not found/i.test(data?.message ?? '') ? MESSAGES.unknown : MESSAGES.failed);
  }
  return data;
}

// The browser rejects with a DOMException when the user cancels or the
// authenticator already holds a credential for this account.
function explain(error, action) {
  if (error?.name === 'InvalidStateError') return MESSAGES.exists;
  if (error instanceof DOMException) return MESSAGES.cancelled[action];
  return error instanceof Told ? error.message : MESSAGES.failed;
}

async function create(query, extra) {
  const options = await call(`/generate-register-options?${new URLSearchParams(query)}`);
  const credential = await navigator.credentials.create({
    publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(options),
  });
  await call('/verify-registration', { response: credential.toJSON(), ...extra });
}

const actions = {
  async login() {
    const options = await call('/generate-authenticate-options');
    const credential = await navigator.credentials.get({
      publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options),
    });
    await call('/verify-authentication', { response: credential.toJSON() });
  },
  async register(element) {
    const name = toUsername(element.elements.namn.value);
    // The address and the e-mail travel together; src/signup.ts reads them.
    const context = new URLSearchParams({ namn: name, epost: element.elements.epost.value }).toString();
    await create({ context, name }, { name, createSession: true });
  },
  async add(element) {
    await create({ name: element.dataset.name }, { name: element.dataset.name });
  },
};

// The address field shows what the address will be: "Görel Lundin" turns into
// "gorel-lundin" as she types, instead of being refused afterwards.
for (const input of document.querySelectorAll('[data-passkey="register"] [name="namn"]')) {
  input.addEventListener('input', (event) => {
    if (event.isComposing) return;
    const tidy = toUsernameWhileTyping(input.value);
    if (tidy !== input.value) input.value = tidy;
  });
}

for (const element of document.querySelectorAll('[data-passkey]')) {
  const status = document.getElementById(element.dataset.status);
  const button = element.matches('form') ? element.querySelector('button') : element;

  element.addEventListener(element.matches('form') ? 'submit' : 'click', async (event) => {
    event.preventDefault();
    if (!window.PublicKeyCredential?.parseRequestOptionsFromJSON) {
      status.textContent = MESSAGES.unsupported;
      return;
    }
    button.disabled = true;
    status.textContent = '';
    status.className = 'hint error';
    try {
      await actions[element.dataset.passkey](element);
      if (element.dataset.next) return window.location.assign(element.dataset.next);
      status.className = 'hint ok';
      status.textContent = element.dataset.done ?? '';
    } catch (error) {
      status.textContent = explain(error, element.dataset.passkey);
    }
    button.disabled = false;
  });
}
