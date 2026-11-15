import type { CSSProperties } from 'react';
import '../src/styles.css';
import { Icon } from '../src/components/Icon';
import { Topbar } from '../src/components/Topbar';
import type { Props } from './konto.server';

export default function AccountPage({ username, displayName, intro, avatarKey, email, saved, recovered }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/lista">
          <Icon name="list" />
          Din lista
        </a>
        <form method="post" action="/konto">
          <button className="link" name="intent" value="logout">
            <Icon name="sign-out" />
            Logga ut
          </button>
        </form>
      </Topbar>
      <main className="steps">
        {recovered && (
          <section className="step" aria-labelledby="inne-rubrik">
            <h2 id="inne-rubrik">Du är inne</h2>
            <p className="lede">
              Spara en ny nyckel på den här telefonen eller datorn nu, så loggar du in som vanligt nästa gång. Annars behöver du en ny länk
              då.
            </p>
            <div className="buttons">
              <button
                className="btn wide"
                type="button"
                data-passkey="add"
                data-name={username}
                data-status="inne-status"
                data-done="Klart. Nästa gång loggar du in som vanligt."
              >
                Spara en ny nyckel
              </button>
            </div>
            <p className="hint" id="inne-status" role="status"></p>
          </section>
        )}
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
          {saved === 'lista' && (
            <p className="notice calm" role="status">
              Sparat.
            </p>
          )}
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
            </div>
            <div className="buttons">
              <button className="btn wide" name="intent" value="list">
                Spara namn och hälsning
              </button>
            </div>
          </form>
        </section>

        <section className="step" aria-labelledby="epost-rubrik">
          <h2 id="epost-rubrik">Om du inte kan logga in</h2>
          <p className="lede">
            {email
              ? 'Då mejlar vi en länk hit som loggar in dig. Adressen används inte till något annat.'
              : 'Lägg till din e-post, så kan vi mejla dig en länk som loggar in dig, till exempel med ny telefon. Utan e-post finns ingen väg in. Adressen används inte till något annat.'}
          </p>
          {saved === 'epost' && (
            <p className="notice calm" role="status">
              {email ? `Sparat. Vi har mejlat ${email}, så att du ser att adressen stämmer.` : 'Sparat. Nu finns ingen e-post kvar här.'}
            </p>
          )}
          {saved === 'upptagen' && (
            <p className="notice" role="alert">
              Den e-postadressen hör redan till en annan lista.
            </p>
          )}
          {saved === 'ogiltig' && (
            <p className="notice" role="alert">
              Det där ser inte ut som en e-postadress.
            </p>
          )}
          <form method="post" action="/konto">
            <div className="field">
              <label htmlFor="epost">E-post</label>
              <input type="email" id="epost" name="epost" autoComplete="email" defaultValue={email ?? ''} />
            </div>
            <div className="buttons">
              <button className="btn wide" name="intent" value="email">
                Spara e-post
              </button>
            </div>
          </form>
        </section>

        <section className="step" aria-labelledby="passkey-rubrik">
          <h2 id="passkey-rubrik">Inloggning</h2>
          <p className="lede">Ny telefon eller dator? Spara en nyckel på den också, så kan du logga in därifrån.</p>
          <div className="buttons">
            <button
              className="btn quiet wide"
              type="button"
              data-passkey="add"
              data-name={username}
              data-status="passkey-status"
              data-done="Ny nyckel sparad."
            >
              Spara en nyckel här
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

      <dialog id="ta-bort-konto" className="sheet" {...{ closedby: 'closerequest' }} aria-labelledby="ta-bort-rubrik">
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
