import type { CSSProperties } from 'react';
import '../../src/styles.css';
import '../../src/themes.css';
import { Icon } from '../../src/components/Icon';
import { Thumb } from '../../src/components/Thumb';
import { Topbar } from '../../src/components/Topbar';
import { WishFields } from '../../src/components/WishFields';
import { wishTransitionName } from '../../src/wish';
import type { Props } from './index.server';

// Invoker commands open dialogs without JS; React has no typed props for them yet.
const opens = (id: string) => ({ commandfor: id, command: 'show-modal' });

export default function OwnerListPage({ username, avatarKey, theme, themes, needsEmail, wishes, failed, suggestedIcon }: Props) {
  return (
    <>
      <div className="page">
        <Topbar>
          {/* Her own picture says "this is me"; the word stays, since most owners have no picture. */}
          <a className="account" href="/konto">
            {avatarKey ? <img className="avatar" src={`/bild/${avatarKey}`} alt="" /> : <Icon name="user" />}
            Konto
          </a>
          {/* The same button as on the account page, so nobody goes there only to leave. */}
          <form method="post" action="/konto">
            <button className="link" name="intent" value="logout">
              <Icon name="sign-out" />
              Logga ut
            </button>
          </form>
        </Topbar>

        {/* The page wears the list's theme, so she sees what her visitors will. */}
        <main data-theme={theme ?? undefined}>
          <header>
            {/* The theme's band goes behind the heading only: the buttons stay on the plain page. */}
            <div className="list-header compact">
              <h1>Din lista</h1>
              <p className="intro">
                Du ser inte vad som är paxat. <a href={`/${username}`}>Visa som besökare</a>
              </p>
            </div>
            <div className="list-tools">
            <div className="header-actions">
              <button className="btn" {...opens('ny')}>
                <Icon name="plus" />
                Lägg till önskning
              </button>
              {/* Shares through the phone's share sheet when there is one, otherwise copies the link. */}
              <button className="btn quiet" type="button" data-needs-js data-copy={`/${username}`}>
                <Icon name="copy" />
                <Icon name="share" />
                <Icon name="check" />
                Dela
              </button>
            </div>
            <p className="hint ok copied" role="status"></p>
            {/* Which theme the list wears. The whole line opens the picker. */}
            <button className="theme-line" type="button" {...opens('tema')}>
              Tema: <span data-theme-name>{themes.find(({ id }) => id === theme)?.label ?? 'inget'}</span> ·{' '}
              <span className="verb" data-theme-verb>
                {theme ? 'Byt' : 'Välj'}
              </span>
            </button>
            {needsEmail && (
              <p className="notice calm">
                Byter du telefon kan du bli utelåst från listan. <a href="/konto#epost-rubrik">Lägg till din e-post</a>, så kan vi mejla dig in
                igen.
              </p>
            )}
            {failed && (
              <p className="notice" role="alert">
                Det gick inte att spara. Kolla att du har skrivit vad du vill ha, att länken är hela adressen från butikens sida och att bilden är ett vanligt foto.
              </p>
            )}
            </div>
          </header>

          {wishes.length === 0 ? (
            <p className="intro">Listan är tom. Lägg till det första du kommer att tänka på.</p>
          ) : (
            <ul className="wishes editable">
              {wishes.map((wish, index) => (
                <li
                  key={wish.id}
                  className="wish"
                  data-id={wish.id}
                  style={{ '--thumb-hue': wish.hue, viewTransitionName: wishTransitionName(wish.id) } as CSSProperties}
                >
                  <button
                    className="grip"
                    type="button"
                    aria-label={`Flytta ${wish.title}`}
                    title="Dra för att flytta, eller använd piltangenterna"
                  >
                    <Icon name="grip" />
                  </button>
                  <div className="thumb" aria-hidden="true">
                    <Thumb title={wish.title} icon={wish.icon} imageKey={wish.imageKey} index={index} />
                  </div>
                  <div className="wish-text">
                    <h2>{wish.title}</h2>
                    {wish.note && <p className="meta">{wish.note}</p>}
                    {wish.url && (
                      <p className="links">
                        <a href={wish.url} target="_blank" rel="noopener nofollow" referrerPolicy="no-referrer">
                          {wish.shop}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="row-actions">
                    <a className="btn quiet icon" href={`/lista/${wish.id}`} aria-label={`Ändra ${wish.title}`} title="Ändra">
                      <Icon name="edit" />
                    </a>
                    <button
                      className="btn quiet icon"
                      type="button"
                      aria-label={`Ta bort ${wish.title}`}
                      title="Ta bort"
                      {...opens(`tabort-${wish.id}`)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                  <dialog id={`tabort-${wish.id}`} className="sheet" {...{ closedby: 'any' }} aria-labelledby={`tabort-rubrik-${wish.id}`}>
                    <h2 id={`tabort-rubrik-${wish.id}`}>Ta bort {wish.title}?</h2>
                    <p className="reassure">Den försvinner från listan direkt. Det går inte att ångra.</p>
                    <form method="post" action="/lista">
                      <input type="hidden" name="id" value={wish.id} />
                      <div className="buttons">
                        <button className="btn wide danger" name="intent" value="delete">
                          Ta bort
                        </button>
                        <button className="btn quiet wide" type="submit" formMethod="dialog">
                          Avbryt
                        </button>
                      </div>
                    </form>
                  </dialog>
                </li>
              ))}
            </ul>
          )}


          {/* Inside <main>, so they are dressed by the theme too. These two hold what she has typed, so a stray tap outside must not close them. */}
          <dialog id="ny" className="sheet" {...{ closedby: 'closerequest' }} aria-labelledby="ny-rubrik">
            <h2 id="ny-rubrik">Ny önskning</h2>
            {/* The other way to add a wish. It needs JS to fetch and fill in this form: hidden by CSS when scripting is off. */}
            <p className="reassure" data-needs-js>
              Har du en länk från en butik?{' '}
              <button className="link" type="button" {...opens('fran-lank')}>
                Klistra in den
              </button>
            </p>
            <form method="post" action="/lista" encType="multipart/form-data">
              <WishFields prefix="ny" icon={suggestedIcon} />
              <div className="buttons">
                <button className="btn wide" name="intent" value="add">
                  Lägg till
                </button>
                <button className="btn quiet wide" type="submit" formMethod="dialog" formNoValidate>
                  Avbryt
                </button>
              </div>
            </form>
          </dialog>
          {/* Choosing a card is the whole errand: /js/theme.js closes this, dresses the page and saves.
              Without the script «Spara» does it, and the page comes back dressed. */}
          <dialog id="tema" className="sheet theme-picker" {...{ closedby: 'any' }} aria-labelledby="tema-rubrik">
            <h2 id="tema-rubrik">Välj tema</h2>
            <form method="post" action="/lista" data-theme-form>
              <input type="hidden" name="intent" value="theme" />
              <fieldset aria-label="Tema">
                <label>
                  <input type="radio" name="theme" value="" data-label="inget" defaultChecked={!theme} />
                  <span className="theme-card"></span>
                  Utan tema
                </label>
                {themes.map(({ id, label }) => (
                  <label key={id}>
                    <input type="radio" name="theme" value={id} data-label={label} defaultChecked={id === theme} />
                    <span className="theme-card" data-card={id}></span>
                    {label}
                  </label>
                ))}
              </fieldset>
              <div className="buttons">
                <button className="btn wide" data-save>
                  Spara
                </button>
                <button className="btn quiet wide" type="submit" formMethod="dialog" formNoValidate data-close>
                  Avbryt
                </button>
              </div>
            </form>
          </dialog>
          <dialog id="fran-lank" className="sheet" {...{ closedby: 'closerequest' }} aria-labelledby="fran-lank-rubrik">
            <h2 id="fran-lank-rubrik">Lägg till från länk</h2>
            <p className="reassure">Klistra in länken till det du vill ha, så hämtar vi namn och bild.</p>
            <form data-from-link>
              <div className="field">
                <label htmlFor="hamta-lank">Länk</label>
                <input type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} id="hamta-lank" name="lank" required autoFocus />
                <p className="hint error" role="alert"></p>
              </div>
              <div className="buttons">
                <button className="btn wide">Hämta</button>
                <button className="btn quiet wide" type="button" hidden data-manual>
                  Fyll i själv
                </button>
                <button className="btn quiet wide" type="submit" formMethod="dialog" formNoValidate>
                  Avbryt
                </button>
              </div>
            </form>
          </dialog>
        </main>
      </div>
      <script type="module" src="/js/command.js"></script>
      <script type="module" src="/js/forms.js"></script>
      <script type="module" src="/js/picker.js"></script>
      <script type="module" src="/js/list.js"></script>
      <script type="module" src="/js/theme.js"></script>
    </>
  );
}
