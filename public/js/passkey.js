// Passkey sign-up, login and "add another passkey" without a framework.
// Talks to Better Auth's passkey endpoints and uses the browser's own JSON
// helpers for WebAuthn, so nothing else needs to be loaded.
//
// Markup contract:
//   <button data-passkey="login" data-status="id">       log in, then go to data-next
//   <form   data-passkey="register" data-status="id">    reads the "namn" field
//   <button data-passkey="add" data-status="id">         needs a session
const API = '/api/auth/passkey';

const MESSAGES = {
  cancelled: 'Det blev ingen passkey. Försök igen när du vill.',
  exists: 'Den här enheten har redan en passkey för kontot.',
  unsupported: 'Den här webbläsaren stöder inte passkeys.',
  unknown: 'Den passkeyn hör inte till något konto här.',
  failed: 'Något gick fel. Försök igen.',
};

async function call(path, body) {
  const response = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // The server answers in English; the one message an owner can run into
    // (a passkey whose account is gone) gets a Swedish one.
    const message = data?.message || MESSAGES.failed;
    throw new Error(/passkey not found/i.test(message) ? MESSAGES.unknown : message);
  }
  return data;
}

// The browser rejects with a DOMException when the user cancels or the
// authenticator already holds a credential for this account.
function explain(error) {
  if (error?.name === 'InvalidStateError') return MESSAGES.exists;
  if (error instanceof DOMException) return MESSAGES.cancelled;
  return error?.message || MESSAGES.failed;
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
    try {
      await call('/verify-authentication', { response: credential.toJSON() });
    } catch (error) {
      // A passkey for an account that is gone: tell the browser, so it stops
      // offering it next to the ones that work.
      if (error.message === MESSAGES.unknown) {
        await PublicKeyCredential.signalUnknownCredential?.({ rpId: options.rpId, credentialId: credential.id }).catch(() => {});
      }
      throw error;
    }
  },
  async register(element) {
    const name = element.elements.namn.value.trim().toLowerCase();
    await create({ context: name, name }, { name, createSession: true });
  },
  async add(element) {
    await create({ name: element.dataset.name }, { name: element.dataset.name });
  },
};

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
      status.textContent = explain(error);
    }
    button.disabled = false;
  });
}
