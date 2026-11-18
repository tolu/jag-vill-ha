import type { ReactNode } from 'react';
import '../src/styles.css';
import { Footer } from '../src/components/Footer';

// Wraps every page, the not-found page too. What all of them share goes here.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      {children}
      <Footer />
    </div>
  );
}
