// Rendered once, by pages/layout.tsx. The second line is for whoever looks
// after the site: when the version that is out was built, and from which commit.
export function Footer() {
  const { iso, label, commit } = __BUILD__;
  return (
    // `.page` gives it the width and gutter of the page above it
    <footer className="page site-footer">
      <div>
        <p>Du är inte produkten!</p>
        <p className="build">
          Byggd av{' '}
          <a href="https://github.com/tolu" target="_blank" rel="noopener nofollow" referrerPolicy="no-referrer">
            tolu
          </a>
          {' · '}
          <time dateTime={iso}>{label}</time>
          {commit && (
            <>
              {' · '}
              <a className="commit" href={commit.url} target="_blank" rel="noopener nofollow" referrerPolicy="no-referrer">
                {commit.short}
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
