import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LockPage from './pages/LockPage.jsx';
import Skills from './pages/Skills.jsx';
import Learning from './pages/Learning.jsx';
import Progress from './pages/Progress.jsx';
import Admin from './pages/Admin.jsx';

function Guard({ user, role, onLogout }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return (
    <div className="app">
      <Sidebar role={user.role} />
      <div className="main">
        <Navbar user={user} onLogout={onLogout} />
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const login = (token, u) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} replace /> : <Auth mode="login" onAuth={login} />} />
      <Route path="/register" element={user ? <Navigate to={home} replace /> : <Auth mode="register" onAuth={login} />} />
      <Route element={<Guard user={user} role="student" onLogout={logout} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lock" element={<LockPage />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
      <Route element={<Guard user={user} role="admin" onLogout={logout} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
