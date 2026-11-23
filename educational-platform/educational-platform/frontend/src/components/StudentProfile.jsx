export default function StudentProfile({ profile }) {
  return (
    <div className="card profile">
      <div className="avatar big">{profile.name.charAt(0).toUpperCase()}</div>
      <h3>{profile.name}</h3>
      <p className="muted">{profile.email}</p>
      <p className="small muted">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
    </div>
  );
}
