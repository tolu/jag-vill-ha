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
 */
export function WishFields({ values, prefix, icon }: { values?: Values; prefix: string; icon: string }) {
  const id = (name: string) => `${prefix}-${name}`;
  const menu = id('utseende');
  const anchor = `--${menu}`;
  return (
    <>
      <div className="appearance">
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
          <input type="text" id={id('titel')} name="titel" defaultValue={values?.title} maxLength={120} required />
        </div>

        <div id={menu} className="appearance-menu" popover="auto" style={{ positionAnchor: anchor } as CSSProperties}>
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
        <input type="url" id={id('lank')} name="lank" defaultValue={values?.url ?? ''} placeholder="https://butik.se/produkt" />
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
