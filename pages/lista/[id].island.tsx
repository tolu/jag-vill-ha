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
              Det gick inte att spara. Kolla att du har skrivit vad du vill ha, att länken är hela adressen från butikens sida och att bilden är ett vanligt foto.
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
          <h2 id="nollstall-rubrik">Gör önskningen ledig igen</h2>
          <p className="lede">
            Har du bytt till något helt annat, så att en gammal paxning inte längre stämmer? Då kan du ta bort den. Du får inte veta om
            önskningen var paxad.
          </p>
          {wasReset && (
            <p className="notice calm" role="status">
              Klart. Önskningen är ledig, oavsett hur det var innan.
            </p>
          )}
          <div className="buttons">
            <button className="btn quiet wide" type="button" {...{ commandfor: 'nollstall', command: 'show-modal' }}>
              Ta bort paxningen
            </button>
          </div>
        </section>
      </main>

      {/* It undoes someone else's choice and tells nobody, so it asks first. */}
      <dialog id="nollstall" className="sheet" {...{ closedby: 'any' }} aria-labelledby="nollstall-fraga">
        <h2 id="nollstall-fraga">Ta bort paxningen?</h2>
        <p className="reassure">
          Har någon paxat den här önskningen får de inget veta, och de kan redan ha köpt den. Det går inte att ångra.
        </p>
        <form method="post" action={`/lista/${id}`}>
          <div className="buttons">
            <button className="btn wide danger" name="intent" value="reset">
              Ja, gör den ledig
            </button>
            <button className="btn quiet wide" type="submit" formMethod="dialog">
              Avbryt
            </button>
          </div>
        </form>
      </dialog>
      <script type="module" src="/js/command.js"></script>
      <script type="module" src="/js/forms.js"></script>
      <script type="module" src="/js/picker.js"></script>
    </div>
  );
}
