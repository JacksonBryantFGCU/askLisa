import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Question, FollowUp } from '../types/database';
import styles from './Admin.module.css';

const CATEGORIES = ['Events', 'Community', 'City Services', 'Safety', 'Recommendations', 'General'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type DraftState = { answer: string; category: string };

type PendingFollowUp = FollowUp & { questions: { question: string } };

export default function Admin() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Question[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<PendingFollowUp[]>([]);
  const [answered, setAnswered] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [pendingRes, followUpRes, answeredRes] = await Promise.all([
      supabase.from('questions').select('*').is('answer', null).order('created_at', { ascending: true }).returns<Question[]>(),
      supabase.from('follow_ups').select('*, questions(question)').is('answer', null).order('created_at', { ascending: true }).returns<PendingFollowUp[]>(),
      supabase.from('questions').select('*').not('answer', 'is', null).order('answered_at', { ascending: false }).returns<Question[]>(),
    ]);
    setPending(pendingRes.data ?? []);
    setPendingFollowUps(followUpRes.data ?? []);
    setAnswered(answeredRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Live updates via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, () => { void load(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follow_ups' }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  function setDraft(id: string, field: keyof DraftState, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { answer: '', category: '' }), [field]: value },
    }));
  }

  async function handlePublish(q: Question) {
    const draft = drafts[q.id];
    if (!draft?.answer?.trim()) return;
    setSaving((prev) => ({ ...prev, [q.id]: true }));
    await supabase.from('questions').update({
      answer: draft.answer.trim(),
      category: draft.category || null,
      answered_at: new Date().toISOString(),
    } as never).eq('id', q.id);
    setSaving((prev) => ({ ...prev, [q.id]: false }));
    setDrafts((prev) => { const next = { ...prev }; delete next[q.id]; return next; });
    await load();
  }

  async function handlePublishFollowUp(fu: PendingFollowUp) {
    const draft = drafts[fu.id];
    if (!draft?.answer?.trim()) return;
    setSaving((prev) => ({ ...prev, [fu.id]: true }));
    await supabase.from('follow_ups').update({
      answer: draft.answer.trim(),
      answered_at: new Date().toISOString(),
    } as never).eq('id', fu.id);
    setSaving((prev) => ({ ...prev, [fu.id]: false }));
    setDrafts((prev) => { const next = { ...prev }; delete next[fu.id]; return next; });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    await supabase.from('questions').delete().eq('id', id);
    await load();
  }

  function startEdit(q: Question) {
    setDrafts((prev) => ({
      ...prev,
      [q.id]: { answer: q.answer ?? '', category: q.category ?? '' },
    }));
    setEditingId(q.id);
  }

  function cancelEdit(id: string) {
    setDrafts((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setEditingId(null);
  }

  async function handleSaveEdit(q: Question) {
    const draft = drafts[q.id];
    if (!draft?.answer?.trim()) return;
    setSaving((prev) => ({ ...prev, [q.id]: true }));
    await supabase.from('questions').update({
      answer: draft.answer.trim(),
      category: draft.category || null,
    } as never).eq('id', q.id);
    setSaving((prev) => ({ ...prev, [q.id]: false }));
    setEditingId(null);
    setDrafts((prev) => { const next = { ...prev }; delete next[q.id]; return next; });
    await load();
  }

  async function handleDeleteFollowUp(id: string) {
    if (!confirm('Delete this follow-up? This cannot be undone.')) return;
    await supabase.from('follow_ups').delete().eq('id', id);
    await load();
  }

  const totalPending = pending.length + pendingFollowUps.length;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.topbarTitle}>Lisa's Dashboard</span>
          {totalPending > 0 && <span className={styles.badge}>{totalPending}</span>}
          <span className={styles.liveDot} title="Live updates on" aria-label="Live" />
        </div>
        <div className={styles.topbarRight}>
          <Link to="/" className={styles.viewSiteLink}>View site →</Link>
          <button onClick={() => void handleLogout()} className={styles.logoutBtn}>Sign out</button>
        </div>
      </div>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading} role="status" aria-label="Loading" />
        ) : (
          <>
            {/* Pending questions */}
            <section className={styles.section}>
              <p className={styles.sectionHeading}>
                Waiting for your answer ({pending.length})
              </p>
              {pending.length === 0 ? (
                <p className={styles.empty}>No pending questions.</p>
              ) : pending.map((q) => {
                const draft = drafts[q.id] ?? { answer: '', category: '' };
                const isSaving = saving[q.id] ?? false;
                return (
                  <div key={q.id} className={styles.qCard}>
                    <div className={styles.qCardHeader}>
                      <div className={styles.qMeta}>
                        <span className={styles.qFrom}>{q.name ?? 'Anonymous'}</span>
                        {q.neighborhood && <span className={styles.qArea}>· {q.neighborhood}</span>}
                        <time className={styles.qDate} dateTime={q.created_at}>{formatDate(q.created_at)}</time>
                      </div>
                      <p className={styles.qText}>{q.question}</p>
                    </div>
                    <div className={styles.answerForm}>
                      <label className={styles.formLabel} htmlFor={`answer-${q.id}`}>Your answer</label>
                      <textarea
                        id={`answer-${q.id}`}
                        className={styles.textarea}
                        placeholder="Write your answer here…"
                        value={draft.answer}
                        onChange={(e) => setDraft(q.id, 'answer', e.target.value)}
                        rows={4}
                      />
                      <div className={styles.formRow}>
                        <select
                          className={styles.categorySelect}
                          value={draft.category}
                          onChange={(e) => setDraft(q.id, 'category', e.target.value)}
                          aria-label="Category"
                        >
                          <option value="">No category</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className={styles.deleteBtn} onClick={() => void handleDelete(q.id)} type="button">Delete</button>
                        <button
                          className={styles.publishBtn}
                          onClick={() => void handlePublish(q)}
                          disabled={!draft.answer?.trim() || isSaving}
                          type="button"
                        >
                          {isSaving ? 'Publishing…' : 'Publish Answer →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Pending follow-ups */}
            {pendingFollowUps.length > 0 && (
              <section className={styles.section}>
                <p className={styles.sectionHeading}>
                  Pending follow-ups ({pendingFollowUps.length})
                </p>
                {pendingFollowUps.map((fu) => {
                  const draft = drafts[fu.id] ?? { answer: '', category: '' };
                  const isSaving = saving[fu.id] ?? false;
                  return (
                    <div key={fu.id} className={styles.qCard}>
                      <div className={styles.qCardHeader}>
                        <p className={styles.fuContext}>Re: {fu.questions.question}</p>
                        <div className={styles.qMeta}>
                          <span className={styles.qFrom}>{fu.name ?? 'Anonymous'}</span>
                          <time className={styles.qDate} dateTime={fu.created_at}>{formatDate(fu.created_at)}</time>
                        </div>
                        <p className={styles.qText}>{fu.follow_up}</p>
                      </div>
                      <div className={styles.answerForm}>
                        <label className={styles.formLabel} htmlFor={`fu-answer-${fu.id}`}>Your answer</label>
                        <textarea
                          id={`fu-answer-${fu.id}`}
                          className={styles.textarea}
                          placeholder="Write your answer here…"
                          value={draft.answer}
                          onChange={(e) => setDraft(fu.id, 'answer', e.target.value)}
                          rows={3}
                        />
                        <div className={styles.formRow}>
                          <button className={styles.deleteBtn} onClick={() => void handleDeleteFollowUp(fu.id)} type="button">Delete</button>
                          <button
                            className={styles.publishBtn}
                            onClick={() => void handlePublishFollowUp(fu)}
                            disabled={!draft.answer?.trim() || isSaving}
                            type="button"
                          >
                            {isSaving ? 'Publishing…' : 'Publish Answer →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Answered */}
            {answered.length > 0 && (
              <section className={styles.section}>
                <p className={styles.sectionHeading}>Answered ({answered.length})</p>
                {answered.map((q) => {
                  const isEditing = editingId === q.id;
                  const draft = drafts[q.id] ?? { answer: q.answer ?? '', category: q.category ?? '' };
                  const isSaving = saving[q.id] ?? false;
                  return (
                    <div key={q.id} className={styles.answeredCard}>
                      <div className={styles.answeredBody}>
                        <p className={styles.answeredQ}>{q.question}</p>
                        {!isEditing && <p className={styles.answeredA}>{q.answer}</p>}
                        <div className={styles.answeredMeta}>
                          {q.category && <span className={styles.answeredCategory}>{q.category}</span>}
                          <time className={styles.answeredDate} dateTime={q.answered_at ?? ''}>
                            {q.answered_at ? formatDate(q.answered_at) : ''}
                          </time>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className={styles.editForm}>
                          <textarea
                            className={styles.textarea}
                            value={draft.answer}
                            onChange={(e) => setDraft(q.id, 'answer', e.target.value)}
                            rows={4}
                            autoFocus
                          />
                          <div className={styles.formRow}>
                            <select
                              className={styles.categorySelect}
                              value={draft.category}
                              onChange={(e) => setDraft(q.id, 'category', e.target.value)}
                              aria-label="Category"
                            >
                              <option value="">No category</option>
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button className={styles.deleteBtn} onClick={() => cancelEdit(q.id)} type="button">
                              Cancel
                            </button>
                            <button
                              className={styles.publishBtn}
                              onClick={() => void handleSaveEdit(q)}
                              disabled={!draft.answer?.trim() || isSaving}
                              type="button"
                            >
                              {isSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.answeredActions}>
                          <button className={styles.editBtn} onClick={() => startEdit(q)} type="button">
                            Edit
                          </button>
                          <button className={styles.deleteBtn} onClick={() => void handleDelete(q.id)} type="button">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
