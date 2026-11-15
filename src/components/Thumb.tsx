/** What goes inside a `.thumb`: the uploaded image, else the icon, else the first letter. */
export function Thumb({ title, icon, imageKey }: { title: string; icon: string | null; imageKey: string | null }) {
  if (imageKey) return <img src={`/bild/${imageKey}`} alt="" loading="lazy" />;
  if (icon) {
    return (
      <svg>
        <use href={`/icons/wish-icons.svg#${icon}`} />
      </svg>
    );
  }
  return <>{title.charAt(0).toUpperCase()}</>;
}
