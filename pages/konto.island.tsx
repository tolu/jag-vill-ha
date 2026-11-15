import type { CSSProperties } from 'react';
import '../src/styles.css';
import { Icon } from '../src/components/Icon';
import { Topbar } from '../src/components/Topbar';
import type { Props } from './konto.server';

export default function AccountPage({ username, displayName, intro, avatarKey, email, saved }: Props) {
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
        <section className="step account-head" aria-labelledby="rubrik">
          <div>
            <h1 id="rubrik">Ditt konto</h1>
            <p className="lede">
              Din lista finns på <a href={`/${username}`}>jagvillha.fyi/{username}</a>.
            </p>
            {saved === 'fel-bild' && (
              <p className="hint error" role="alert">
                Det där var ingen vanlig bildfil under 5 MB.
              </p>
            )}
          </div>

          {/* Same box-and-popover as the icon picker; /js/picker.js saves as soon as a picture is chosen. */}
          <form
            className="appearance round"
            method="post"
            action="/konto"
            encType="multipart/form-data"
            data-max-side="400"
            data-autosubmit
          >
            <input type="hidden" name="intent" value="avatar" />
            <button
              type="button"
              className="picker"
              popoverTarget="profilbild"
              style={{ anchorName: '--profilbild' } as CSSProperties}
              aria-label={avatarKey ? 'Byt bild på dig' : 'Lägg till en bild på dig'}
            >
              <img src={avatarKey ? `/bild/${avatarKey}` : undefined} alt="" hidden={!avatarKey} />
              {/* The outline of a person says what the empty circle is for; the pencil says it can be changed. */}
              <Icon name="user" />
              <Icon name="edit" />
            </button>
            <div id="profilbild" className="appearance-menu" popover="auto" style={{ positionAnchor: '--profilbild' } as CSSProperties}>
              {/* Shown by /js/picker.js once there is a picture to crop. */}
              <div className="crop" hidden>
                <div className="crop-view" tabIndex={0} role="group" aria-label="Utsnitt. Dra eller använd piltangenterna för att flytta bilden.">
                  <img alt="" draggable={false} />
                </div>
                <label className="crop-zoom">
                  <span className="sr-only">Zoom</span>
                  <input type="range" min="1" max="5" step="0.01" defaultValue="1" />
                </label>
                <button type="button" className="btn quiet wide" data-crop-whole>
                  Visa hela bilden
                </button>
                <button type="button" className="btn wide" data-crop-done>
                  Klar
                </button>
              </div>
              <label className="btn quiet wide file">
                Välj en bild
                <input type="file" name="bild" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
              </label>
              {avatarKey && (
                <button className="btn quiet wide" name="tabortbild" value="1">
                  Ta bort bilden
                </button>
              )}
              <p className="hint">Bilden syns för alla som har länken, och när länken delas.</p>
              <noscript>
                <button className="btn wide">Spara</button>
              </noscript>
            </div>
          </form>
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
      <script type="module" src="/js/picker.js"></script>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
