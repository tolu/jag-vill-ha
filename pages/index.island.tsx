import '../src/styles.css';
import { Icon } from '../src/components/Icon';

export default function HomePage() {
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
          <h1>Tre brödrostar är två för många</h1>
          <p className="intro">
            Skriv upp vad du vill ha och skicka länken till släkten. De paxar utan konto.
          </p>
          <div className="header-actions">
            <a className="btn" href="/ny">
              Skapa din lista
            </a>
            {/* A link without JS; with JS the passkey prompt opens right here. */}
            <a className="btn quiet" href="/login" data-passkey="login" data-status="login-fel" data-next="/lista">
              <Icon name="key" />
              Logga in
            </a>
          </div>
          <p className="hint error" id="login-fel" role="alert"></p>
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

      <footer className="site-footer">
        <p>Gratis. Ingen reklam, inga affiliate-länkar. Du är inte produkten.</p>
      </footer>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
