import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** Props for the button that opens a picture dialog. */
export const opensPicture = (id: string) => ({ commandfor: id, command: 'show-modal' });

/**
 * The modal dialog where a picture is chosen and framed: the wish's icon or
 * picture, and the owner's own picture. Without a picture it shows `children`
 * (the icons) and "Välj en bild"; /js/picker.js shows the frame once there is
 * one. Without script the choices, the file input and "Klar" still work.
 *
 * `hasPicture` adds the field that asks the server to remove the stored one;
 * `note` is a line just above "Klar".
 */
export function PictureDialog({
  id,
  title,
  hasPicture,
  note,
  children,
}: {
  id: string;
  title: string;
  hasPicture: boolean;
  note?: string;
  children?: ReactNode;
}) {
  const heading = `${id}-rubrik`;
  return (
    <dialog id={id} className="sheet picture-dialog" {...{ closedby: 'any' }} aria-labelledby={heading}>
      <div className="picture-body">
        {/* The dialog's name for screen readers; what it is for shows by itself. */}
        <h2 id={heading} className="sr-only">
          {title}
        </h2>
        <div className="crop" hidden>
          <div className="crop-frame">
            <div className="crop-view" tabIndex={0} role="group" aria-label="Utsnitt. Dra eller använd piltangenterna för att flytta bilden.">
              <img alt="" draggable={false} />
            </div>
            <button type="button" className="btn quiet icon crop-whole" data-crop-whole aria-label="Visa hela bilden" title="Visa hela bilden">
              <Icon name="arrows-out" />
            </button>
          </div>
          <p className="crop-hint" aria-hidden="true">
            Dra i bilden för att flytta den.
          </p>
          <div className="crop-zoom">
            <button type="button" className="btn quiet icon" data-zoom="out" aria-label="Zooma ut">
              <Icon name="minus" />
            </button>
            <label>
              <span className="sr-only">Zoom</span>
              <input type="range" min="1" max="5" step="0.01" defaultValue="1" />
            </label>
            <button type="button" className="btn quiet icon" data-zoom="in" aria-label="Zooma in">
              <Icon name="plus" />
            </button>
          </div>
        </div>
        {children}
        <p className="hint error picture-status" role="status"></p>
        <label className="drop">
          <Icon name="image" />
          Välj en bild
          <small>eller dra hit den</small>
          <input type="file" name="bild" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
        </label>
        <div className="picture-actions">
          <button type="button" className="btn quiet" data-pick>
            <Icon name="image" />
            Byt bild
          </button>
          <button type="button" className="btn quiet danger-outline" data-crop-clear>
            <Icon name="trash" />
            Ta bort
          </button>
        </div>
        {/* Ticked by "Ta bort" through /js/picker.js; shown to tick by hand only without script. */}
        {hasPicture && (
          <label className="remove-image">
            <input type="checkbox" name="tabortbild" />
            Ta bort bilden
          </label>
        )}
        {note && <p className="hint">{note}</p>}
        <button type="button" className="btn wide" {...{ commandfor: id, command: 'close' }}>
          <Icon name="check" />
          Klar
        </button>
      </div>
    </dialog>
  );
}
