import { useState } from 'react';
import api from '../services/api';
import { go } from '../utils/go';
import { PageTitle } from './Shared';

/* ------------------------------- Login ------------------------------- */

function resolveReturnTo() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('returnTo');
    if (!raw) return null;
    // Only allow same-origin relative paths
    if (!raw.startsWith('/')) return null;
    return raw;
  } catch {
    return null;
  }
}

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('databridge_token', data.token);
      localStorage.setItem('databridge_user', JSON.stringify(data.user));

      if (typeof onLogin === 'function') {
        onLogin(data.user);
      }

      const returnTo = resolveReturnTo();

      if (returnTo) {
        go(returnTo);
        return;
      }

      if (data.user.role === 'OFFICER') {
        go('/databridge');
      } else if (data.user.role === 'ADMIN') {
        go('/admin/dashboard');
      } else {
        go('/');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to sign in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTitle
      eyebrow="SECURE ACCESS"
      title="Sign in to your service space."
    >
      <form className="message-form login-form" onSubmit={submit}>
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              required
              minLength="8"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(value => !value)}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn" disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>

        <p>
          Don't have an account?{' '}
          <button
            className="inline"
            type="button"
            onClick={() => {
              const returnTo = resolveReturnTo();
              go(returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : '/register');
            }}
          >
            Create an account
          </button>
        </p>

        <p>
          Authorized officers can use the{' '}
          <button
            className="inline"
            type="button"
            onClick={() => go('/databridge')}
          >
            officer portal
          </button>
          .
        </p>
      </form>
    </PageTitle>
  );
}

/* ------------------------------ Register ------------------------------ */

function resolveReturnToForRegister() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('returnTo');
    if (!raw || !raw.startsWith('/')) return null;
    return raw;
  } catch {
    return null;
  }
}

export function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const change = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async event => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.phone && !/^[0-9+\- ]{7,20}$/.test(form.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      // Auto-login the newly registered citizen
      if (data?.token && data?.user) {
        localStorage.setItem('databridge_token', data.token);
        localStorage.setItem('databridge_user', JSON.stringify(data.user));

        if (typeof onLogin === 'function') {
          onLogin(data.user);
        }

        const returnTo = resolveReturnToForRegister();
        setSuccess(true);

        // Short delay so the success screen renders, then navigate
        setTimeout(() => {
          if (returnTo) {
            go(returnTo);
          } else {
            go('/');
          }
        }, 600);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to create account.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const returnTo = resolveReturnToForRegister();
    return (
      <PageTitle
        eyebrow="ACCOUNT CREATED"
        title="Welcome to NagarikPath."
      >
        <div className="confirmation">
          <i>✓</i>
          <h2>Your account has been created.</h2>
          <p>
            {returnTo
              ? 'Taking you back to your application…'
              : 'Please sign in to continue to your citizen service dashboard.'}
          </p>
          {!returnTo && (
            <button className="btn" type="button" onClick={() => go('/login')}>
              Sign in →
            </button>
          )}
        </div>
      </PageTitle>
    );
  }

  return (
    <PageTitle
      eyebrow="CREATE A CITIZEN ACCOUNT"
      title="Begin your service journey."
    >
      <form
        className="message-form login-form"
        onSubmit={submit}
        noValidate
      >
        <label>
          Full name
          <input
            name="name"
            required
            value={form.name}
            onChange={change}
            autoComplete="name"
          />
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={change}
            autoComplete="email"
          />
        </label>

        <label>
          Phone number <small>(optional)</small>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={change}
            autoComplete="tel"
          />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              required
              value={form.password}
              onChange={change}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow(value => !value)}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label>
          Confirm password
          <input
            name="confirm"
            type={show ? 'text' : 'password'}
            required
            value={form.confirm}
            onChange={change}
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>

        <p>
          Already have an account?{' '}
          <button
            className="inline"
            type="button"
            onClick={() => {
              const returnTo = resolveReturnToForRegister();
              go(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
            }}
          >
            Sign in
          </button>
        </p>
      </form>
    </PageTitle>
  );
}