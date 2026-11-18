import type { CSSProperties } from 'react';
import { WISH_ICONS } from '../icons';

type Values = {
  title: string;
  url: string | null;
  note: string | null;
  icon: string | null;
  imageKey: string | null;
};

/**
 * The fields shared by "Ny önskning" and "Ändra önskning". Works as plain HTML:
 * the box shows whichever icon radio is checked (CSS :has), and /js/picker.js
 * adds image preview, drag-and-drop and downscaling on top.
 *
 * `autosave` is for a wish that already exists: there the picture or icon is
 * saved when it is chosen, without waiting for "Spara".
 */
export function WishFields({ values, prefix, icon, autosave }: { values?: Values; prefix: string; icon: string; autosave?: boolean }) {
  const id = (name: string) => `${prefix}-${name}`;
  const menu = id('utseende');
  const anchor = `--${menu}`;
  return (
    <>
      {/* With `autosave` the form is sent, with intent "utseende", as soon as a picture or icon is chosen. */}
      <div className="appearance" data-autosubmit={autosave ? 'utseende' : undefined}>
        <button
          type="button"
          className="thumb picker"
          popoverTarget={menu}
          style={{ anchorName: anchor } as CSSProperties}
          aria-label="Välj ikon eller bild"
        >
          <img src={values?.imageKey ? `/bild/${values.imageKey}` : undefined} alt="" hidden={!values?.imageKey} />
          {WISH_ICONS.map(([name]) => (
            <svg key={name} data-icon={name} aria-hidden="true">
              <use href={`/icons/wish-icons.svg#${name}`} />
            </svg>
          ))}
        </button>
        <div className="field">
          <label htmlFor={id('titel')}>Vad vill du ha?</label>
          {/* A new wish starts in the title: the dialog would otherwise focus the picker, which comes first. */}
          <input type="text" id={id('titel')} name="titel" defaultValue={values?.title} maxLength={120} required autoFocus={!values} />
        </div>

        <div id={menu} className="appearance-menu" popover="auto" style={{ positionAnchor: anchor } as CSSProperties}>
          {/* Shown by /js/picker.js once there is a picture to crop. */}
          <div className="crop" hidden>
            <div className="crop-view" tabIndex={0} role="group" aria-label="Utsnitt. Dra eller använd piltangenterna för att flytta bilden.">
              <img alt="" draggable={false} />
            </div>
            <label className="crop-zoom">
              <span className="sr-only">Zoom</span>
              <input type="range" min="1" max="5" step="0.01" defaultValue="1" />
            </label>
            <button type="button" className="btn quiet wide" data-crop-whole>
              Visa hela bilden
            </button>
            <button type="button" className="btn wide" data-crop-done>
              Klar
            </button>
            <button type="button" className="btn quiet wide" data-crop-clear>
              Byt till ikon
            </button>
          </div>
          <fieldset className="icons" aria-label="Ikon">
            {WISH_ICONS.map(([name, label]) => (
              <label key={name} title={label}>
                <input type="radio" name="ikon" value={name} aria-label={label} defaultChecked={name === icon} />
                <svg aria-hidden="true">
                  <use href={`/icons/wish-icons.svg#${name}`} />
                </svg>
              </label>
            ))}
          </fieldset>
          <label className="btn quiet wide file">
            Välj en bild
            <input type="file" name="bild" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
          </label>
          {values?.imageKey && (
            <label className="remove-image">
              <input type="checkbox" name="tabortbild" />
              Ta bort bilden
            </label>
          )}
        </div>
      </div>
      <div className="field">
        <label htmlFor={id('lank')}>
          Länk <span className="optional">valfritt</span>
        </label>
        {/* Plain text, not type="url": "www.butik.se/sak" is a fine thing to type, and the server adds the rest. */}
        <input
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          id={id('lank')}
          name="lank"
          defaultValue={values?.url ?? ''}
        />
        <p className="hint">Kopiera adressen från butikens sida och klistra in den här.</p>
      </div>
      <div className="field">
        <label htmlFor={id('kommentar')}>
          Kommentar <span className="optional">valfritt</span>
        </label>
        <input type="text" id={id('kommentar')} name="kommentar" defaultValue={values?.note ?? ''} maxLength={200} placeholder="Storlek 44, gärna blå" />
      </div>
    </>
  );
}
