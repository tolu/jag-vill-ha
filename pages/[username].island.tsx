import type { CSSProperties } from 'react';
import '../src/styles.css';
import type { Props } from './[username].server';

export default function ListPage({ username, displayName, intro, wishes }: Props) {
  return (
    <main className="page">
      <header className="list-header">
        <p className="address">jagvillha.fyi/{username}</p>
        <h1>{displayName} vill ha</h1>
        {intro && <p className="intro">{intro}</p>}
      </header>

      {wishes.length === 0 ? (
        <p className="intro">Här var det tomt. {displayName} har inte önskat sig något än.</p>
      ) : (
        <>
          {/* Filtering is pure CSS: body:has(#f-…:checked) hides rows */}
          <fieldset className="filters" aria-label="Filtrera önskningar">
            <label>
              <input type="radio" name="filter" id="f-alla" defaultChecked />
              Alla
            </label>
            <label>
              <input type="radio" name="filter" id="f-lediga" />
              Lediga
            </label>
            <label>
              <input type="radio" name="filter" id="f-500" />
              Under 500 kr
            </label>
          </fieldset>

          <ul className="wishes">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="wish"
                data-state={wish.taken ? 'taken' : undefined}
                data-under-500={wish.under500 ? '' : undefined}
                style={{ '--thumb-hue': wish.hue } as CSSProperties}
              >
                <div className="thumb" aria-hidden="true">
                  {wish.icon ? (
                    <svg>
                      <use href={`/icons/wish-icons.svg#${wish.icon}`} />
                    </svg>
                  ) : (
                    wish.title.charAt(0).toUpperCase()
                  )}
                </div>
                {wish.mostWanted ? (
                  <div>
                    <span className="most">Önskar mest</span>
                    <h2>{wish.title}</h2>
                  </div>
                ) : (
                  <h2>{wish.title}</h2>
                )}
                {wish.meta && <p className="meta">{wish.meta}</p>}
                {wish.url && (
                  <p className="links">
                    <a href={wish.url} rel="noopener nofollow">
                      Visa i butik
                    </a>
                  </p>
                )}
                {wish.taken && <span className="badge other action">Paxad av {wish.takenBy}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
