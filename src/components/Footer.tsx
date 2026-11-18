// The same on every page. The second line is for whoever looks after the site:
// when the version that is out was built, and from which commit.
export function Footer() {
  const { iso, label, commit } = __BUILD__;
  return (
    <footer className="site-footer">
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
    </footer>
  );
}
