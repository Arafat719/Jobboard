import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api.js';
import './Login.css';

const getRoleRedirect = (role) =>
  role === 'employer' || role === 'admin' ? '/dashboard' : '/jobs';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      login(data.token, data.user);
      navigate(getRoleRedirect(data.user.role), { replace: true });
    } catch {
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="jb-auth-page">
      <div className="jb-card jb-auth-card">
        <h2 className="jb-auth-title">Sign In</h2>

        {error && (
          <div className="jb-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="jb-form-group">
            <label className="jb-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="jb-input"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="jb-form-group">
            <label className="jb-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="jb-input"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="jb-btn jb-btn-primary jb-auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <hr className="jb-divider" />
        <p className="jb-text-sm jb-text-center jb-text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
