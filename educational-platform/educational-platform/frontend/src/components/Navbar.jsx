export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div>
        <strong>Hello, {user.name}</strong>
        <div className="muted small">{user.role === 'admin' ? 'Administrator' : 'Student'}</div>
      </div>
      <div className="nav-right">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <button className="btn btn-outline" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
