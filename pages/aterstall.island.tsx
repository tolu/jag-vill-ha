import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import type { Props } from './aterstall.server';

export default function RecoverPage({ sent }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/login">Logga in</a>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Tappat din passkey?</h1>
          {sent ? (
            <p className="lede">
              Finns adressen på ett konto har vi mejlat en länk. Öppna den och skapa en ny passkey. Har du inte lagt till
              någon e-post går listan tyvärr inte att återställa.
            </p>
          ) : (
            <>
              <p className="lede">Skriv e-postadressen du lade till på ditt konto, så mejlar vi en länk.</p>
              <form method="post" action="/aterstall">
                <div className="field">
                  <label htmlFor="epost">E-post</label>
                  <input type="email" id="epost" name="epost" autoComplete="email" required />
                </div>
                <div className="buttons">
                  <button className="btn wide">Skicka länk</button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
