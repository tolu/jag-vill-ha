import '../../src/styles.css';
import { Icon } from '../../src/components/Icon';
import { Topbar } from '../../src/components/Topbar';
import { WishFields } from '../../src/components/WishFields';
import type { Props } from './[id].server';

export default function EditWishPage({ id, values, icon, failed, wasReset }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/lista">
          <Icon name="list" />
          Din lista
        </a>
      </Topbar>
      <main className="steps">
        <section className="step" aria-labelledby="rubrik">
          <h1 id="rubrik">Ändra önskning</h1>
          {failed && (
            <p className="notice" role="alert">
              Det gick inte att spara. Kolla att titeln är ifylld, att länken börjar med https:// och att bilden är en vanlig bildfil under 5 MB.
            </p>
          )}
          <form method="post" action={`/lista/${id}`} encType="multipart/form-data">
            <WishFields prefix="andra" values={values} icon={icon} autosave />
            <div className="buttons">
              <button className="btn wide">Spara</button>
              <a className="btn quiet wide" href="/lista">
                Avbryt
              </a>
            </div>
          </form>
        </section>

        <section className="step" aria-labelledby="nollstall-rubrik">
          <h2 id="nollstall-rubrik">Nollställ paxning</h2>
          <p className="lede">
            Har du ändrat önskningen så mycket att en gammal paxning inte längre stämmer? Då kan du göra den ledig igen. Du
            får inte veta om den var paxad.
          </p>
          <form method="post" action={`/lista/${id}`}>
            <div className="buttons">
              <button className="btn quiet wide" name="intent" value="reset">
                Nollställ paxning
              </button>
            </div>
            {wasReset && <p className="hint ok">Klart. Önskningen är ledig, oavsett hur det var innan.</p>}
          </form>
        </section>
      </main>
      <script type="module" src="/js/forms.js"></script>
      <script type="module" src="/js/picker.js"></script>
    </div>
  );
}
