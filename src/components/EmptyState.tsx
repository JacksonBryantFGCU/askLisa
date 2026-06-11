import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.wrapper} role="status">
      <div className={styles.icon}>💬</div>
      <p className={styles.title}>No answered questions yet</p>
      <p className={styles.body}>Be the first to ask — Lisa will answer soon!</p>
    </div>
  );
}
