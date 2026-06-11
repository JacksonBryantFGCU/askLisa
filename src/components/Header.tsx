import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="AskLisa home">
          <img src="/logo.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>AskLisa</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/ask" className={styles.askButton}>
            Ask a Question
          </Link>
        </nav>
      </div>
    </header>
  );
}
