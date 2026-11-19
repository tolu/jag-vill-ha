/** How many rows load their picture at once. Below that they wait until scrolled near. */
export const EAGER_THUMBS = 8;

/**
 * What goes inside a `.thumb`: the uploaded image, else the icon, else the first letter.
 * The first rows are not lazy: a lazy picture is still empty when a page
 * transition takes its snapshot, so it pops in after the slide.
 */
export function Thumb({ title, icon, imageKey, index }: { title: string; icon: string | null; imageKey: string | null; index: number }) {
  if (imageKey) return <img src={`/bild/${imageKey}`} alt="" loading={index < EAGER_THUMBS ? 'eager' : 'lazy'} />;
  if (icon) {
    return (
      <svg>
        <use href={`/icons/wish-icons.svg#${icon}`} />
      </svg>
    );
  }
  return <>{title.charAt(0).toUpperCase()}</>;
}
