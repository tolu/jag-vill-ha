import '../src/styles.css';

export default function NotFoundPage() {
  return (
    <main className="page narrow">
      <header className="list-header">
        <h1>Här finns ingen lista</h1>
        <p className="intro">Kolla att adressen stämmer, eller fråga den som skickade länken.</p>
        <div className="header-actions">
          <a className="btn quiet" href="/">
            Till startsidan
          </a>
        </div>
      </header>
    </main>
  );
}
