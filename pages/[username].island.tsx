import type { CSSProperties } from 'react';
import '../src/styles.css';
import { Thumb } from '../src/components/Thumb';
import type { Props } from './[username].server';

// Invoker commands open dialogs without JS; React has no typed props for them yet.
const opens = (id: string) => ({ commandfor: id, command: 'show-modal' });

export default function ListPage({ username, displayName, intro, wishes, isOwner, notice, giverName }: Props) {
  const action = `/${username}`;
  return (
    <main className="page">
      <header className="list-header">
        <p className="address">jagvillha.fyi/{username}</p>
        <h1>{displayName} vill ha</h1>
        {intro && <p className="intro">{intro}</p>}
        {isOwner && (
          <p className="notice calm">
            Det här är din egen lista, så paxningar visas inte för dig. <a href="/lista">Tillbaka till din lista</a>
          </p>
        )}
        {notice === 'taken' && (
          <p className="notice" role="alert">
            Någon hann före. Den är redan paxad.
          </p>
        )}
        {notice === 'name' && (
          <p className="notice" role="alert">
            Skriv ditt namn för att paxa.
          </p>
        )}
      </header>

      {wishes.length === 0 ? (
        <p className="intro">Här var det tomt. {displayName} har inte önskat sig något än.</p>
      ) : (
        <>
          {/* Filtering is pure CSS: body:has(#f-…:checked) hides rows */}
          {!isOwner && (
            <fieldset className="filters" aria-label="Filtrera önskningar">
              <label>
                <input type="radio" name="filter" id="f-alla" defaultChecked />
                Alla
              </label>
              <label>
                <input type="radio" name="filter" id="f-lediga" />
                Lediga
              </label>
            </fieldset>
          )}

          <ul className="wishes">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="wish"
                data-state={wish.state === 'taken' || wish.state === 'mine' ? 'taken' : undefined}
                style={{ '--thumb-hue': wish.hue } as CSSProperties}
              >
                <div className="thumb" aria-hidden="true">
                  <Thumb title={wish.title} icon={wish.icon} imageKey={wish.imageKey} />
                </div>
                <h2>{wish.title}</h2>
                {wish.note && <p className="meta">{wish.note}</p>}
                {wish.url && (
                  <p className="links">
                    <a href={wish.url} rel="noopener nofollow">
                      {wish.shop}
                    </a>
                  </p>
                )}

                {wish.state === 'free' && (
                  <>
                    <button className="btn action" {...opens(`paxa-${wish.id}`)}>
                      Paxa
                    </button>
                    <dialog id={`paxa-${wish.id}`} className="sheet" {...{ closedby: 'any' }} aria-labelledby={`paxa-rubrik-${wish.id}`}>
                      <h2 id={`paxa-rubrik-${wish.id}`}>Paxa {wish.title}</h2>
                      <p className="reassure">{displayName} ser inte vad som är paxat.</p>
                      <form method="post" action={action}>
                        <input type="hidden" name="id" value={wish.id} />
                        <div className="field">
                          <label htmlFor={`namn-${wish.id}`}>Ditt namn</label>
                          <input
                            type="text"
                            id={`namn-${wish.id}`}
                            name="namn"
                            autoComplete="given-name"
                            defaultValue={giverName}
                            maxLength={40}
                            required
                          />
                          <p className="hint">Syns för andra som handlar, så att ni inte krockar.</p>
                        </div>
                        <div className="buttons">
                          <button className="btn wide" name="intent" value="paxa">
                            Paxa
                          </button>
                          <button className="btn quiet wide" type="submit" formMethod="dialog" formNoValidate>
                            Avbryt
                          </button>
                        </div>
                      </form>
                    </dialog>
                  </>
                )}
                {wish.state === 'taken' && <span className="badge other action">Paxad av {wish.takenBy}</span>}
                {wish.state === 'mine' && (
                  <form className="action mine" method="post" action={action}>
                    <input type="hidden" name="id" value={wish.id} />
                    <span className="badge">Paxad av dig</span>
                    <button className="link" name="intent" value="angra">
                      Ångra
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
