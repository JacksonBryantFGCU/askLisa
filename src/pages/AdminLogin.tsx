import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>AskLisa</span>
        </Link>

        {mode === 'login' ? (
          <>
            <h1 className={styles.heading}>Welcome back, Lisa</h1>
            <p className={styles.sub}>Sign in to manage questions</p>

            <form className={styles.form} onSubmit={handleLogin}>
              {error && <div className={styles.error} role="alert">{error}</div>}

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => { setMode('forgot'); setError(''); }}
            >
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Reset password</h1>
            <p className={styles.sub}>We'll send a reset link to your email</p>

            {resetSent ? (
              <div className={styles.success} role="status">
                Check your inbox — a reset link is on its way.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleForgot}>
                {error && <div className={styles.error} role="alert">{error}</div>}

                <div className={styles.field}>
                  <label htmlFor="reset-email" className={styles.label}>Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <button type="submit" className={styles.btn} disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => { setMode('login'); setError(''); setResetSent(false); }}
            >
              ← Back to sign in
            </button>
          </>
        )}
      </div>
    </main>
  );
}
