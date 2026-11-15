import { useState } from 'react';
import { auth, passkeyErrorMessage } from '../src/auth-client';

export default function Register() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const name = username.trim().toLowerCase();
    const result = await auth.passkey.addPasskey({ context: name, name, createSession: true });
    if (result?.error) {
      setError(passkeyErrorMessage(result.error));
      setPending(false);
      return;
    }
    window.location.assign('/konto');
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="namn">Användarnamn</label>
        <div className="prefixed">
          <span>jagvillha.fyi/</span>
          <input
            type="text"
            id="namn"
            name="namn"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            pattern="[a-z0-9\-]{3,30}"
            aria-describedby="namn-hjalp namn-fel"
            required
          />
        </div>
        <p className="hint" id="namn-hjalp">
          3–30 tecken: a–z, siffror och bindestreck.
        </p>
        <p className="hint error" id="namn-fel" role="alert">
          {error}
        </p>
      </div>
      <div className="buttons">
        <button className="btn wide" disabled={pending}>
          Skapa passkey
        </button>
      </div>
    </form>
  );
}
