import '../src/styles.css';

export default function HomePage() {
  return (
    <div className="page">
      <nav className="topbar" aria-label="Konto">
        <a className="brand" href="/">
          <img src="/icons/icon.svg" alt="" width="24" height="24" />
          jagvillha
        </a>
        <a href="/login">Logga in</a>
      </nav>

      <main>
        <header className="list-header hero">
          <h1>Tre brödrostar är två för många</h1>
          <p className="intro">
            Skriv upp vad du vill ha och skicka länken till släkten. De paxar utan konto.
          </p>
          <div className="header-actions">
            <a className="btn" href="/login">
              Skapa din lista
            </a>
          </div>
        </header>

        <ol className="points">
          <li>
            <h2>Skriv vad du vill ha</h2>
            <p>En titel räcker. Lägg till länk, bild och pris om du vill.</p>
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
    </div>
  );
}
