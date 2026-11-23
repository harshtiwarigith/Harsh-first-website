import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import StudentProfile from '../components/StudentProfile.jsx';
import SkillProgress from '../components/SkillProgress.jsx';
import BarChart from '../components/BarChart.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/student/overview'), api.get('/student/weekly')])
      .then(([o, w]) => { setData(o); setWeekly(w); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p className="muted">Loading...</p>;

  return (
    <>
      <h1>Welcome, {data.profile.name} 👋</h1>
      <p className="muted">Here is your learning overview.</p>
      <div className="grid-4">
        <StatCard icon="✅" label="Completed activities" value={data.completedActivities} tone="green" />
        <StatCard icon="⏳" label="Pending activities" value={data.pendingActivities} tone="orange" />
        <StatCard icon="🔓" label="Screen unlocks" value={data.screenUnlocks} tone="blue" />
        <StatCard icon="📚" label="Total activities" value={data.totalActivities} tone="purple" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Skill development</h3>
          {data.skills.map((s) => <SkillProgress key={s.id} skill={s} />)}
        </div>
        <div>
          <StudentProfile profile={data.profile} />
          <div className="card cta">
            <h3>Ready to learn?</h3>
            <p className="muted">Lock your screen and earn it back with knowledge.</p>
            <Link className="btn btn-primary" to="/lock">Open Screen Lock</Link>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Points earned (last 7 days)</h3>
        <BarChart data={weekly} />
      </div>
    </>
  );
}
