import type { CSSProperties } from 'react';
import '../../src/styles.css';
import { Icon } from '../../src/components/Icon';
import { Thumb } from '../../src/components/Thumb';
import { Topbar } from '../../src/components/Topbar';
import { WishFields } from '../../src/components/WishFields';
import type { Props } from './index.server';

// Invoker commands open dialogs without JS; React has no typed props for them yet.
const opens = (id: string) => ({ commandfor: id, command: 'show-modal' });

export default function OwnerListPage({ username, wishes, failed, suggestedIcon }: Props) {
  return (
    <>
      <div className="page">
        <Topbar>
          <a href="/konto">Konto</a>
        </Topbar>

        <main>
          <header className="list-header compact">
            <p className="address">
              jagvillha.fyi/{username}
              {/* Shares through the phone's share sheet when there is one, otherwise copies the link. */}
              <button className="copy" type="button" data-copy={`/${username}`} aria-label="Dela listan">
                <Icon name="copy" />
                <Icon name="share" />
                <Icon name="check" />
              </button>
              <span className="copied" role="status"></span>
            </p>
            <h1>Din lista</h1>
            <p className="intro">
              Du ser inte vad som är paxat. <a href={`/${username}`}>Visa som besökare</a>
            </p>
            <div className="header-actions">
              <button className="btn" {...opens('ny')}>
                <Icon name="plus" />
                Lägg till önskning
              </button>
              {/* Needs JS to fetch and fill in the form, so /js/list.js reveals it. */}
              <button className="btn quiet" hidden data-needs-js {...opens('fran-lank')}>
                <Icon name="globe" />
                Från länk
              </button>
            </div>
            {failed && (
              <p className="notice" role="alert">
                Det gick inte att spara. Kolla att titeln är ifylld, att länken börjar med https:// och att bilden är en vanlig bildfil under 5 MB.
              </p>
            )}
          </header>

          {wishes.length === 0 ? (
            <p className="intro">Listan är tom. Lägg till det första du kommer att tänka på.</p>
          ) : (
            <ul className="wishes editable">
              {wishes.map((wish) => (
                <li key={wish.id} className="wish" data-id={wish.id} style={{ '--thumb-hue': wish.hue } as CSSProperties}>
                  <button
                    className="grip"
                    type="button"
                    aria-label={`Flytta ${wish.title}`}
                    title="Dra för att flytta, eller använd piltangenterna"
                  >
                    <Icon name="grip" />
                  </button>
                  <div className="thumb" aria-hidden="true">
                    <Thumb title={wish.title} icon={wish.icon} imageKey={wish.imageKey} />
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
        </main>
      </div>

      <dialog id="ny" className="sheet" {...{ closedby: 'any' }} aria-labelledby="ny-rubrik">
        <h2 id="ny-rubrik">Ny önskning</h2>
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
      <dialog id="fran-lank" className="sheet" {...{ closedby: 'any' }} aria-labelledby="fran-lank-rubrik">
        <h2 id="fran-lank-rubrik">Lägg till från länk</h2>
        <p className="reassure">Klistra in länken till det du vill ha, så hämtar vi namn och bild.</p>
        <form data-from-link>
          <div className="field">
            <label htmlFor="hamta-lank">Länk</label>
            <input type="url" id="hamta-lank" name="lank" placeholder="https://butik.se/produkt" required autoFocus />
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
      <script type="module" src="/js/forms.js"></script>
      <script type="module" src="/js/picker.js"></script>
      <script type="module" src="/js/list.js"></script>
    </>
  );
}
