import '../src/styles.css';
import { Topbar } from '../src/components/Topbar';
import PasskeyLogin from './_PasskeyLogin' with { island: 'load' };

export default function LoginPage() {
  return (
    <div className="page narrow">
      <Topbar />
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Logga in</h1>
          <p className="lede">Använd den passkey du skapade när du gjorde listan.</p>
          <PasskeyLogin />
          <p className="hint">
            <a href="/aterstall">Tappat din passkey?</a> · <a href="/ny">Skapa en lista</a>
          </p>
        </section>
      </main>
    </div>
  );
}
