import '../../src/styles.css';
import { Topbar } from '../../src/components/Topbar';
import { WishFields } from '../../src/components/WishFields';
import type { Props } from './[id].server';

export default function EditWishPage({ id, values, icon, failed }: Props) {
  return (
    <div className="page narrow">
      <Topbar>
        <a href="/lista">Din lista</a>
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
            <WishFields prefix="andra" values={values} icon={icon} />
            <div className="buttons">
              <button className="btn wide">Spara</button>
              <a className="btn quiet wide" href="/lista">
                Avbryt
              </a>
            </div>
          </form>
        </section>
      </main>
      <script type="module" src="/js/picker.js"></script>
    </div>
  );
}
