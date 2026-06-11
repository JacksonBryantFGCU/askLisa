import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="AskLisa home">
          <img src="/logo.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>AskLisa</span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/questions" className={linkClass}>Questions</NavLink>
          <div className={styles.divider} />
          <NavLink
            to={session ? '/admin' : '/admin/login'}
            className={({ isActive }) => `${styles.navLink} ${styles.adminLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            {session ? 'Dashboard' : 'Admin'}
          </NavLink>
          <Link to="/ask" className={styles.askButton}>Ask a Question</Link>
        </nav>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
        </button>
      </div>

      <nav
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-label="Mobile navigation"
      >
        <NavLink to="/" end className={mobileLinkClass}>Home</NavLink>
        <NavLink to="/questions" className={mobileLinkClass}>Questions</NavLink>
        <Link to="/ask" className={styles.mobileAskButton}>Ask a Question</Link>
        <Link
          to={session ? '/admin' : '/admin/login'}
          className={`${styles.mobileLink} ${styles.mobileAdminLink}`}
        >
          {session ? 'Dashboard' : 'Admin'}
        </Link>
      </nav>
    </header>
  );
}
