import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import SkillProgress from '../components/SkillProgress.jsx';

const icons = { Programming: '💻', Communication: '🗣️', 'Problem Solving': '🧩', Technical: '⚙️' };

export default function Skills() {
  const [skills, setSkills] = useState([]);
  useEffect(() => { api.get('/student/overview').then((d) => setSkills(d.skills)).catch(() => {}); }, []);
  return (
    <>
      <h1>Skill Development</h1>
      <p className="muted">Earn points by completing activities and answering lock-screen questions.</p>
      <div className="grid-2">
        {skills.map((s) => (
          <div className="card" key={s.id}>
            <h3>{icons[s.category]} {s.category}</h3>
            <SkillProgress skill={s} />
          </div>
        ))}
      </div>
    </>
  );
}
