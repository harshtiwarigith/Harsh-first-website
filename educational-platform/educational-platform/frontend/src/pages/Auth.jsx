import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Auth({ mode, onAuth }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.post(isLogin ? '/auth/login' : '/auth/register', form);
      onAuth(data.token, data.user);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand dark"><span>🎓</span> EduLock</div>
        <h2>{isLogin ? 'Welcome back' : 'Create your student account'}</h2>
        <p className="muted">Learn, unlock, and grow your skills.</p>
        {!isLogin && <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required />
        {error && <div className="alert">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}</button>
        <p className="small">
          {isLogin ? <>New student? <Link to="/register">Register</Link></> : <>Already registered? <Link to="/login">Login</Link></>}
        </p>
      </form>
    </div>
  );
}
