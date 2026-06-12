import { useState, type FormEvent } from 'react';
import type { Question, FollowUp } from '../types/database';
import { supabase } from '../lib/supabase';
import { notifyLisa } from '../lib/notify';
import styles from './QuestionCard.module.css';

type Props = { question: Question };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function FollowUpThread({ fu }: { fu: FollowUp }) {
  return (
    <div className={styles.followUpThread}>
      <div className={styles.followUpQ}>
        <div className={styles.followUpIcon} aria-hidden>Q</div>
        <p className={styles.followUpText}>{fu.follow_up}</p>
      </div>
      {fu.answer && (
        <div className={styles.followUpA}>
          <div className={styles.followUpAvatar} aria-hidden>L</div>
          <p className={styles.followUpAnswer}>{fu.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function QuestionCard({ question: q }: Props) {
  const answered = (q.follow_ups ?? []).filter((f) => f.answer !== null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!followUp.trim()) return;
    setSubmitState('sending');

    const { error } = await supabase.from('follow_ups').insert([{
      question_id: q.id,
      name: name.trim() || null,
      follow_up: followUp.trim(),
    }] as never[]);

    if (error) {
      setSubmitState('error');
    } else {
      notifyLisa(
        'New follow-up on AskLisa',
        `${name.trim() || 'Anonymous'} asked a follow-up: ${followUp.trim()}`,
      );
      setSubmitState('success');
      setName('');
      setFollowUp('');
    }
  }

  function handleCancel() {
    setShowForm(false);
    setName('');
    setFollowUp('');
    setSubmitState('idle');
  }

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

      {/* Follow-ups section */}
      <div className={styles.followUpsSection}>
        {answered.map((fu) => <FollowUpThread key={fu.id} fu={fu} />)}

        {!showForm && submitState !== 'success' && (
          <button
            className={styles.followUpToggle}
            onClick={() => setShowForm(true)}
            type="button"
          >
            Ask a follow-up
            <em className={styles.toggleArrow}>↓</em>
          </button>
        )}

        {submitState === 'success' && !showForm && (
          <p className={styles.followUpSuccess}>
            Follow-up sent! Lisa will answer soon.
          </p>
        )}

        {showForm && (
          <form className={styles.followUpForm} onSubmit={handleSubmit} noValidate>
            <p className={styles.followUpFormTitle}>Ask a follow-up</p>
            <input
              type="text"
              className={styles.followUpInput}
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
            />
            <textarea
              className={styles.followUpTextarea}
              placeholder="What else would you like to know?"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              rows={3}
              required
            />
            <div className={styles.followUpFormRow}>
              <button type="button" className={styles.followUpCancel} onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.followUpSubmit}
                disabled={!followUp.trim() || submitState === 'sending'}
              >
                {submitState === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
