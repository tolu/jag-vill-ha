import type { CSSProperties } from 'react';
import '../src/styles.css';
import { Thumb } from '../src/components/Thumb';
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
          </fieldset>

          <ul className="wishes">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="wish"
                data-state={wish.takenBy ? 'taken' : undefined}
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
                      Visa i butik
                    </a>
                  </p>
                )}
                {wish.takenBy && <span className="badge other action">Paxad av {wish.takenBy}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
