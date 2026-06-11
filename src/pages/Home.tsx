import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/database';
import QuestionCard from '../components/QuestionCard';
import EmptyState from '../components/EmptyState';
import styles from './Home.module.css';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('questions')
      .select('*')
      .not('answer', 'is', null)
      .order('answered_at', { ascending: false })
      .returns<Question[]>()
      .then(({ data }) => {
        setQuestions(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Neighborhood Q&amp;A</p>
          <h1 className={styles.heroTitle}>Got a question about<br />the neighborhood?</h1>
          <p className={styles.heroSubtitle}>
            Lisa knows the community inside and out. Ask anything —
            local services, events, recommendations, or just how things work around here.
          </p>
          <Link to="/ask" className={styles.heroCta}>
            Ask Lisa a Question →
          </Link>
        </div>
      </section>

      <section className={styles.aboutStrip} aria-label="About Lisa">
        <div className={styles.aboutInner}>
          <div className={styles.lisaAvatar} aria-hidden>L</div>
          <div className={styles.aboutText}>
            <p>
              <strong>Hi, I'm Lisa!</strong> I've lived in this neighborhood for over 15 years
              and love helping neighbors find what they need. Whether it's a plumber recommendation,
              park hours, or who to call about a streetlight — I'm here to help.
            </p>
          </div>
        </div>
      </section>

      <section id="questions" className={styles.qaSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Answered Questions</h2>
          {!loading && questions.length > 0 && (
            <span className={styles.count}>{questions.length} answered</span>
          )}
        </div>
        {loading ? (
          <div className={styles.loading} role="status" aria-label="Loading questions" />
        ) : questions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={styles.qaList}>
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
