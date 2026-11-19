import '../src/styles.css';
import type { Props } from './index.server';

export default function HomePage({ deleted }: Props) {
  return (
    <div className="page">
      <nav className="topbar" aria-label="Konto">
        <a className="brand" href="/">
          <img src="/icons/icon.svg" alt="" width="24" height="24" />
          jagvillha
        </a>
      </nav>

      <main>
        <header className="list-header hero">
          {deleted && (
            <p className="notice calm" role="status">
              Kontot och listan är borttagna.
            </p>
          )}
          <h1>Tre brödrostar är två för många</h1>
          <p className="intro">
            Skriv upp vad du vill ha och skicka länken till släkten. De paxar utan konto.
          </p>
          <div className="header-actions">
            <a className="btn" href="/ny">
              Skapa din lista
            </a>
            {/* The login page says what will happen and has the way back in for whoever is stuck. */}
            <a className="btn quiet" href="/login">
              Logga in
            </a>
          </div>
          {/* Dev server only, and cut from a build: the way in as a test owner. */}
          {import.meta.env.DEV && (
            <p className="hint">
              Dev server: <a href="/dev/login">log in as the test owner</a>
            </p>
          )}
        </header>

        <ol className="points">
          <li>
            <h2>Skriv vad du vill ha</h2>
            <p>En titel räcker. Lägg till länk, bild och kommentar om du vill.</p>
          </li>
          <li>
            <h2>Skicka länken</h2>
            <p>Du får en egen adress, till exempel jagvillha.fyi/tobias.</p>
          </li>
          <li>
            <h2>Släkten paxar</h2>
            <p>De skriver sitt namn och är klara. Inget konto, ingen app.</p>
          </li>
        </ol>
      </main>
    </div>
  );
}
