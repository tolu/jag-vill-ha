type IconName =
  | 'key'
  | 'grip'
  | 'edit'
  | 'trash'
  | 'copy'
  | 'check'
  | 'plus'
  | 'globe'
  | 'share'
  | 'user'
  | 'sign-out'
  | 'list'
  | 'envelope'
  | 'minus'
  | 'arrows-out'
  | 'image'
  | 'gift';

/** An interface icon from public/icons/ui-icons.svg (Phosphor, light weight). */
export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="ui-icon" data-icon={name} aria-hidden="true">
      <use href={`/icons/ui-icons.svg#${name}`} />
    </svg>
  );
}
