import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import Register from './_Register' with { island: 'load' };

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
          <Register />
          <p className="hint">
            Tappar du din passkey kommer du inte åt listan. Du kan lägga till en e-postadress för återställning när listan är skapad.
          </p>
        </section>
      </main>
    </div>
  );
}
