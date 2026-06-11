import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/database';
import QuestionCard from '../components/QuestionCard';
import EmptyState from '../components/EmptyState';
import styles from './Questions.module.css';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('questions')
      .select('*, follow_ups(*)')
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
      <div className={styles.inner}>
        <h1 className={styles.heading}>Answered Questions</h1>
        <p className={styles.sub}>Browse everything Lisa has answered for the Sunstone community.</p>

        {loading ? (
          <div className={styles.loading} role="status" aria-label="Loading" />
        ) : (
          <>
            {questions.length > 0 && (
              <div className={styles.toolbar}>
                <span className={styles.count}>{questions.length} answered</span>
              </div>
            )}
            {questions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className={styles.list}>
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
