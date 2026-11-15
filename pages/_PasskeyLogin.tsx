import { useState } from 'react';
import { auth, passkeyErrorMessage } from '../src/auth-client';

export default function PasskeyLogin() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    setError(null);
    const result = await auth.signIn.passkey();
    if (result?.error) {
      setError(passkeyErrorMessage(result.error));
      setPending(false);
      return;
    }
    window.location.assign('/konto');
  }

  return (
    <div className="field">
      <div className="buttons">
        <button className="btn wide" type="button" onClick={signIn} disabled={pending}>
          Logga in med passkey
        </button>
      </div>
      <p className="hint error" role="alert">
        {error}
      </p>
    </div>
  );
}
