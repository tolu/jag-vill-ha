import { useState } from 'react';
import { auth, passkeyErrorMessage } from '../src/auth-client';

export default function AddPasskey({ name }: { name: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function add() {
    setPending(true);
    setMessage(null);
    const result = await auth.passkey.addPasskey({ name });
    setFailed(Boolean(result?.error));
    setMessage(result?.error ? passkeyErrorMessage(result.error) : 'Ny passkey sparad.');
    setPending(false);
  }

  return (
    <div className="field">
      <div className="buttons">
        <button className="btn quiet wide" type="button" onClick={add} disabled={pending}>
          Skapa en passkey till
        </button>
      </div>
      <p className={failed ? 'hint error' : 'hint ok'} role="status">
        {message}
      </p>
    </div>
  );
}
