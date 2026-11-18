import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';

export default function LoginPage() {
  return (
    <div className="page narrow">
      <Topbar />
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Logga in</h1>
          <p className="lede">Telefonen eller datorn frågar efter ansiktet, fingret eller din kod.</p>
          <div className="buttons">
            <button className="btn wide" type="button" data-passkey="login" data-status="login-fel" data-next="/lista">
              Logga in
            </button>
          </div>
          <p className="hint error" id="login-fel" role="alert"></p>
          {/* The browser's own dialog offers the phone, but nothing there says that is the way in. */}
          <p className="hint">Ny dator? Välj telefonen i rutan som kommer upp och skanna koden med kameran.</p>
          <div className="buttons">
            <a className="btn quiet wide" href="/aterstall">
              Kommer du inte in?
            </a>
            <a className="btn quiet wide" href="/ny">
              Skapa en lista
            </a>
          </div>
          <noscript>
            <p className="notice">Passkeys kräver JavaScript. Slå på det för att logga in.</p>
          </noscript>
        </section>
      </main>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
