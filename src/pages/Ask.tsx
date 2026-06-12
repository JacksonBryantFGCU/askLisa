import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { notifyLisa } from '../lib/notify';
import styles from './Ask.module.css';

type FormState = 'idle' | 'sending' | 'success' | 'error';

export default function Ask() {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setFormState('sending');

    const { error } = await supabase.from('questions').insert([{
      name: name.trim() || null,
      question: question.trim(),
      neighborhood: neighborhood.trim() || null,
      answer: null,
      category: null,
    }] as never[]);

    if (!error) {
      notifyLisa(
        'New question on AskLisa',
        `${name.trim() || 'Anonymous'} asked: ${question.trim()}`,
      );
    }
    setFormState(error ? 'error' : 'success');
  }

  if (formState === 'success') {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.success} role="status">
            <div className={styles.successIcon}>✉️</div>
            <p className={styles.successTitle}>Question sent!</p>
            <p className={styles.successBody}>
              Thanks for reaching out. Lisa will read your question and post an answer
              here on the site if it's helpful for the neighborhood.
            </p>
            <Link to="/" className={styles.backLink}>← Back to all questions</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}>← Back</Link>
        <h1 className={styles.heading}>Ask Lisa</h1>
        <p className={styles.subheading}>
          Have a question about Sunstone? Ask away. Lisa reads every message
          and posts helpful answers here for everyone to see.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formState === 'error' && (
            <div className={styles.errorBanner} role="alert">
              Something went wrong sending your question. Please try again.
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Your name <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="e.g. Maria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="neighborhood" className={styles.label}>
              Your street or area <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="neighborhood"
              type="text"
              className={styles.input}
              placeholder="e.g. Sunstone, Sunstone Lakeside..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
            <p className={styles.hint}>Helps Lisa give a more specific answer</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="question" className={styles.label}>
              Your question <span aria-hidden>*</span>
            </label>
            <textarea
              id="question"
              className={styles.textarea}
              placeholder="What would you like to ask Lisa?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={formState === 'sending' || !question.trim()}
            >
              {formState === 'sending' ? 'Sending…' : 'Send Question →'}
            </button>
            <p className={styles.privacyNote}>Your name is optional — ask anonymously.</p>
          </div>
        </form>
      </div>
    </main>
  );
}
