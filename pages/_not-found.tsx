import '../src/styles.css';
import { Footer } from '../src/components/Footer';

export default function NotFoundPage() {
  return (
    <div className="page">
      <main>
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
      <Footer />
    </div>
  );
}
