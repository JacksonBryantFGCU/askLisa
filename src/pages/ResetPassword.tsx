import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './AdminLogin.module.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>AskLisa</span>
        </Link>

        {!ready ? (
          <>
            <h1 className={styles.heading}>Verifying link…</h1>
            <p className={styles.sub}>Just a moment while we verify your reset link.</p>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Set new password</h1>
            <p className={styles.sub}>Choose a new password for your account</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              {error && <div className={styles.error} role="alert">{error}</div>}

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>New password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="confirm" className={styles.label}>Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
