import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import AddPasskey from './_AddPasskey' with { island: 'load' };
import type { Props } from './konto.server';

export default function AccountPage({ username, email, saved }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <form method="post" action="/konto">
          <button className="link" name="intent" value="logout">
            Logga ut
          </button>
        </form>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Ditt konto</h1>
          <p className="lede">
            Din lista finns på <a href={`/${username}`}>jagvillha.fyi/{username}</a>.
          </p>
        </section>

        <section className="step" aria-labelledby="epost-rubrik">
          <h2 id="epost-rubrik">Återställning</h2>
          <p className="lede">
            {email
              ? 'Tappar du din passkey mejlar vi en länk hit.'
              : 'Utan e-post går listan inte att återställa om du tappar din passkey.'}
          </p>
          <form method="post" action="/konto">
            <div className="field">
              <label htmlFor="epost">
                E-post <span className="optional">valfritt</span>
              </label>
              <input type="email" id="epost" name="epost" autoComplete="email" defaultValue={email ?? ''} />
              {saved === 'epost' && <p className="hint ok">Sparat.</p>}
              {saved === 'upptagen' && <p className="hint error">Den adressen används redan av ett annat konto.</p>}
              {saved === 'ogiltig' && <p className="hint error">Det där ser inte ut som en e-postadress.</p>}
            </div>
            <div className="buttons">
              <button className="btn wide" name="intent" value="email">
                Spara
              </button>
            </div>
          </form>
        </section>

        <section className="step" aria-labelledby="passkey-rubrik">
          <h2 id="passkey-rubrik">Passkeys</h2>
          <p className="lede">Bytt telefon eller dator? Skapa en passkey på den nya enheten också.</p>
          <AddPasskey name={username} />
        </section>
      </main>
    </div>
  );
}
