import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import type { Props } from './konto.server';

export default function AccountPage({ username, displayName, intro, email, saved }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/lista">Din lista</a>
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

        <section className="step" aria-labelledby="lista-rubrik">
          <h2 id="lista-rubrik">Listan</h2>
          <p className="lede">Så här presenteras listan för dem som får länken.</p>
          <form method="post" action="/konto">
            <div className="field">
              <label htmlFor="namn">Ditt namn</label>
              <input type="text" id="namn" name="namn" autoComplete="given-name" defaultValue={displayName} maxLength={40} required />
              <p className="hint">Rubriken blir ”{displayName} vill ha”.</p>
            </div>
            <div className="field">
              <label htmlFor="intro">
                Hälsning <span className="optional">valfritt</span>
              </label>
              <input type="text" id="intro" name="intro" defaultValue={intro} maxLength={300} />
              {saved === 'lista' && <p className="hint ok">Sparat.</p>}
            </div>
            <div className="buttons">
              <button className="btn wide" name="intent" value="list">
                Spara
              </button>
            </div>
          </form>
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
          <div className="buttons">
            <button
              className="btn quiet wide"
              type="button"
              data-passkey="add"
              data-name={username}
              data-status="passkey-status"
              data-done="Ny passkey sparad."
            >
              Skapa en passkey till
            </button>
          </div>
          <p className="hint" id="passkey-status" role="status"></p>
        </section>
        <section className="step danger-zone" aria-labelledby="fara-rubrik">
          <h2 id="fara-rubrik">Farligt område</h2>
          <div className="danger-row">
            <div>
              <strong>Ta bort kontot</strong>
              <p>Listan, alla önskningar, bilder och paxningar försvinner. Det går inte att ångra.</p>
            </div>
            <button className="btn quiet danger-outline" type="button" {...{ commandfor: 'ta-bort-konto', command: 'show-modal' }}>
              Ta bort kontot
            </button>
          </div>
          {saved === 'fel-namn' && (
            <p className="hint error" role="alert">
              Användarnamnet stämde inte, så inget togs bort.
            </p>
          )}
        </section>
      </main>

      <dialog id="ta-bort-konto" className="sheet" {...{ closedby: 'any' }} aria-labelledby="ta-bort-rubrik">
        <h2 id="ta-bort-rubrik">Ta bort kontot?</h2>
        <p className="reassure">
          jagvillha.fyi/{username} slutar fungera direkt, och allt som hör till listan raderas. De som har paxat något får
          inget veta.
        </p>
        <form method="post" action="/konto">
          <div className="field">
            <label htmlFor="bekrafta">
              Skriv <strong>{username}</strong> för att bekräfta
            </label>
            <input
              type="text"
              id="bekrafta"
              name="bekrafta"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              pattern={username}
              required
            />
          </div>
          <div className="buttons">
            <button className="btn wide danger" name="intent" value="delete">
              Ta bort kontot och listan
            </button>
            <button className="btn quiet wide" type="submit" formMethod="dialog" formNoValidate>
              Avbryt
            </button>
          </div>
        </form>
      </dialog>
      <script type="module" src="/js/forms.js"></script>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
