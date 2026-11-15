import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';

export default function NewListPage() {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/login">Logga in</a>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Välj adress till din lista</h1>
          <p className="lede">Det är den du skickar till släkten. Ditt förnamn brukar funka.</p>
          <form data-passkey="register" data-status="namn-fel" data-next="/lista">
            <div className="field">
              <label htmlFor="namn">Adress</label>
              <div className="prefixed">
                <span>jagvillha.fyi/</span>
                <input
                  type="text"
                  id="namn"
                  name="namn"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoCorrect="off"
                  maxLength={30}
                  aria-describedby="namn-hjalp"
                  required
                />
              </div>
              <p className="hint" id="namn-hjalp">
                Minst tre tecken. Mellanslag blir bindestreck, och å, ä och ö blir a och o.
              </p>
            </div>
            <div className="field">
              <label htmlFor="epost">
                E-post <span className="optional">valfritt</span>
              </label>
              <input type="email" id="epost" name="epost" autoComplete="email" />
              <p className="hint">
                Används till en enda sak: att mejla dig en länk om du inte kan logga in, till exempel med ny telefon. Ingen reklam.
              </p>
            </div>
            <p className="lede">
              Du behöver inget lösenord. Telefonen eller datorn frågar om den får spara en nyckel åt dig: svara ja och godkänn med ansiktet,
              fingret eller din kod. Så loggar du in nästa gång också.
            </p>
            <div className="buttons">
              <button className="btn wide">Skapa min lista</button>
            </div>
            <p className="hint error" id="namn-fel" role="alert"></p>
          </form>
          <noscript>
            <p className="notice">Passkeys kräver JavaScript. Slå på det för att skapa en lista.</p>
          </noscript>
        </section>
      </main>
      <script type="module" src="/js/passkey.js"></script>
    </div>
  );
}
