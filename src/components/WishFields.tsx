import { WISH_ICONS } from '../icons';
import { Icon } from './Icon';
import { opensPicture, PictureDialog } from './PictureDialog';

type Values = {
  title: string;
  url: string | null;
  note: string | null;
  icon: string | null;
  imageKey: string | null;
};

/**
 * The fields shared by "Ny önskning" and "Ändra önskning". Works as plain HTML:
 * the box opens a dialog with the icons and a file input and shows whichever
 * icon is checked (CSS :has); /js/picker.js adds image preview, framing,
 * drag-and-drop and downscaling on top.
 *
 * `autosave` is for a wish that already exists: there the picture or icon is
 * saved when it is chosen, without waiting for "Spara".
 */
export function WishFields({ values, prefix, icon, autosave }: { values?: Values; prefix: string; icon: string; autosave?: boolean }) {
  const id = (name: string) => `${prefix}-${name}`;
  const dialog = id('utseende');
  return (
    <>
      {/* With `autosave` the form is sent, with intent "utseende", as soon as a picture or icon is chosen. */}
      <div className="appearance" data-autosubmit={autosave ? 'utseende' : undefined}>
        <button type="button" className="thumb picker" {...opensPicture(dialog)} aria-label="Välj ikon eller bild">
          <img src={values?.imageKey ? `/bild/${values.imageKey}` : undefined} alt="" hidden={!values?.imageKey} draggable={false} />
          {WISH_ICONS.map(([name]) => (
            <svg key={name} data-icon={name} aria-hidden="true">
              <use href={`/icons/wish-icons.svg#${name}`} />
            </svg>
          ))}
          {/* Shown over the box on hover: a click opens the choice of icon or picture. */}
          <Icon name="edit" />
        </button>
        <div className="field">
          <label htmlFor={id('titel')}>Vad vill du ha?</label>
          {/* A new wish starts in the title: the dialog would otherwise focus the picker, which comes first. */}
          <input type="text" id={id('titel')} name="titel" defaultValue={values?.title} maxLength={120} required autoFocus={!values} />
        </div>
        <p className="hint error picture-status" role="status"></p>

        <PictureDialog id={dialog} title="Ikon eller bild" hasPicture={Boolean(values?.imageKey)}>
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
        </PictureDialog>
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
        <p className="hint">Klistra in adressen från butikens sida.</p>
      </div>
      <div className="field">
        <label htmlFor={id('kommentar')}>
          Kommentar <span className="optional">valfritt</span>
        </label>
        <input
          type="text"
          id={id('kommentar')}
          name="kommentar"
          defaultValue={values?.note ?? ''}
          maxLength={200}
          placeholder="Storlek 44, gärna blå"
        />
      </div>
    </>
  );
}
