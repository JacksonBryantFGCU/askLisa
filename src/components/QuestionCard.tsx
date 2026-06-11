import type { Question } from '../types/database';
import styles from './QuestionCard.module.css';

type Props = { question: Question };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function QuestionCard({ question: q }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.questionRow}>
        <div className={styles.questionIcon} aria-hidden>Q</div>
        <p className={styles.questionText}>{q.question}</p>
      </div>
      <hr className={styles.divider} />
      <div className={styles.answerRow}>
        <div className={styles.avatar} aria-hidden>L</div>
        <p className={styles.answerText}>{q.answer}</p>
      </div>
      <div className={styles.meta}>
        {q.category && <span className={styles.category}>{q.category}</span>}
        <time className={styles.date} dateTime={q.answered_at ?? q.created_at}>
          {formatDate(q.answered_at ?? q.created_at)}
        </time>
      </div>
    </article>
  );
}
