import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.name}>AskLisa</p>
        <p className={styles.tagline}>Your friendly neighborhood resource</p>
      </div>
    </footer>
  );
}
