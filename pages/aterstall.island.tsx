import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import type { Props } from './aterstall.server';

export default function RecoverPage({ sent, expired }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/login">Logga in</a>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Kommer du inte in?</h1>
          {sent ? (
            <>
              <p className="lede">
                Om adressen hör till en lista har vi mejlat en länk nu. Den gäller i en timme och bara en gång. Öppna den på telefonen
                eller datorn du vill använda.
              </p>
              <p className="lede">
                Kommer inget mejl? Titta i skräpposten, eller <a href="/aterstall">be om en ny länk</a>. Lade du aldrig till någon e-post
                finns tyvärr ingen väg in.
              </p>
            </>
          ) : (
            <>
              {expired && (
                <p className="notice" role="alert">
                  Länken var för gammal eller redan använd. Be om en ny här.
                </p>
              )}
              <p className="lede">Skriv e-postadressen du lade till för din lista, så mejlar vi en länk som loggar in dig.</p>
              <form method="post" action="/aterstall">
                <div className="field">
                  <label htmlFor="epost">E-post</label>
                  <input type="email" id="epost" name="epost" autoComplete="email" required />
                </div>
                <div className="buttons">
                  <button className="btn wide">Mejla mig en länk</button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
