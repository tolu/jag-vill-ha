export function Topbar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="topbar" aria-label="Konto">
      <a className="brand" href="/">
        <img src="/icons/icon.svg" alt="" width="24" height="24" />
        jagvillha
      </a>
      {children}
    </nav>
  );
}
