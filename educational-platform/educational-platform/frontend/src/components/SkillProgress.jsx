export default function SkillProgress({ skill }) {
  const pct = Number(skill.progress);
  const level = pct >= 70 ? 'Advanced' : pct >= 30 ? 'Intermediate' : 'Beginner';
  return (
    <div className="skill">
      <div className="skill-head">
        <span>{skill.name}</span>
        <span className="muted small">{level} · {pct}%</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
