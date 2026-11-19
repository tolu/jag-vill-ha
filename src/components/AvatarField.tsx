import { AVATAR_INTENT } from '../avatar-intent';
import { Icon } from './Icon';
import { opensPicture, PictureDialog } from './PictureDialog';

/**
 * The owner's own picture on the account page: the same box and dialog as a
 * wish's picture, as a circle. /js/picker.js sends the form as soon as a
 * picture is chosen or removed, with `data-autosubmit` as its intent.
 */
export function AvatarField({ avatarKey }: { avatarKey: string | null }) {
  return (
    <form
      className="appearance round"
      method="post"
      action="/konto"
      encType="multipart/form-data"
      data-max-side="400"
      data-autosubmit={AVATAR_INTENT}
    >
      <input type="hidden" name="intent" value={AVATAR_INTENT} />
      <button
        type="button"
        className="picker"
        {...opensPicture('profilbild')}
        aria-label={avatarKey ? 'Byt bild på dig' : 'Lägg till en bild på dig'}
      >
        <img src={avatarKey ? `/bild/${avatarKey}` : undefined} alt="" hidden={!avatarKey} draggable={false} />
        {/* The outline of a person says what the empty circle is for; the pencil says it can be changed. */}
        <Icon name="user" />
        <Icon name="edit" />
      </button>
      <p className="hint error picture-status" role="status"></p>
      <PictureDialog
        id="profilbild"
        title="Bild på dig"
        hasPicture={Boolean(avatarKey)}
        note="Bilden syns för alla som har länken, och när länken delas."
      >
        <noscript>
          <button className="btn wide">Spara</button>
        </noscript>
      </PictureDialog>
    </form>
  );
}
