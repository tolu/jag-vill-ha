import '../src/styles.css';
import { Icon } from '../src/components/Icon';
import { Topbar } from '../src/components/Topbar';

export default function NewListPage() {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/login">Logga in</a>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Vad ska din lista heta?</h1>
          <p className="lede">Det här blir länken du delar. Du loggar in med en passkey, så det behövs varken lösenord eller e-post.</p>
          <form data-passkey="register" data-status="namn-fel" data-next="/lista">
            <div className="field">
              <label htmlFor="namn">Användarnamn</label>
              <div className="prefixed">
                <span>jagvillha.fyi/</span>
                <input
                  type="text"
                  id="namn"
                  name="namn"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  pattern="[a-z0-9\-]{3,30}"
                  aria-describedby="namn-hjalp namn-fel"
                  required
                />
              </div>
              <p className="hint" id="namn-hjalp">
                3–30 tecken: a–z, siffror och bindestreck.
              </p>
              <p className="hint error" id="namn-fel" role="alert"></p>
            </div>
            <div className="buttons">
              <button className="btn wide">
                <Icon name="key" />
                Skapa passkey
              </button>
            </div>
          </form>
          <p className="hint">
            Tappar du din passkey kommer du inte åt listan. Du kan lägga till en e-postadress för återställning när listan är skapad.
          </p>
          <noscript>
            <p className="notice">Passkeys kräver JavaScript. Slå på det för att skapa en lista.</p>
          </noscript>
        </section>
      </main>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
