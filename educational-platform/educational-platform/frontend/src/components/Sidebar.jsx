import { NavLink } from 'react-router-dom';

const studentLinks = [
  ['/dashboard', '🏠', 'Dashboard'],
  ['/lock', '🔒', 'Screen Lock'],
  ['/skills', '🧠', 'Skills'],
  ['/learning', '📚', 'Learning'],
  ['/progress', '📈', 'Progress'],
];
const adminLinks = [['/admin', '🛠️', 'Admin Dashboard']];

export default function Sidebar({ role }) {
  const links = role === 'admin' ? adminLinks : studentLinks;
  return (
    <aside className="sidebar">
      <div className="brand"><span>🎓</span> EduLock</div>
      <nav>
        {links.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
