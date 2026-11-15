import '../src/styles.css';
import { Icon } from '../src/components/Icon';
import { Topbar } from '../src/components/Topbar';

export default function LoginPage() {
  return (
    <div className="page narrow">
      <Topbar />
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Logga in</h1>
          <p className="lede">Använd den passkey du skapade när du gjorde listan.</p>
          <div className="buttons">
            <button className="btn wide" type="button" data-passkey="login" data-status="login-fel" data-next="/lista">
              <Icon name="key" />
              Logga in med passkey
            </button>
          </div>
          <p className="hint error" id="login-fel" role="alert"></p>
          <p className="hint">
            <a href="/aterstall">Tappat din passkey?</a> · <a href="/ny">Skapa en lista</a>
          </p>
          <noscript>
            <p className="notice">Passkeys kräver JavaScript. Slå på det för att logga in.</p>
          </noscript>
        </section>
      </main>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
