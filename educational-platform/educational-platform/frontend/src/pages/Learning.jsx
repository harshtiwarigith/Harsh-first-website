import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import SearchBar from '../components/SearchBar.jsx';

export default function Learning() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');

  const load = () => api.get('/student/activities').then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const complete = async (id) => {
    try { const r = await api.post(`/student/activities/${id}/complete`); setMsg(`${r.message} (+${r.points} points)`); load(); }
    catch (e) { setMsg(e.message); }
  };

  const shown = items.filter((a) =>
    (filter === 'all' || (filter === 'done' ? a.completed : !a.completed)) &&
    `${a.title} ${a.subject_name} ${a.skill_name || ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>Learning</h1>
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search activities or subjects" />
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="done">Completed</option>
        </select>
      </div>
      {msg && <div className="alert info">{msg}</div>}
      <div className="grid-2">
        {shown.map((a) => (
          <div className="card activity" key={a.id}>
            <div className="badges">
              <span className="badge">{a.subject_name}</span>
              {a.skill_name && <span className="badge alt">{a.skill_name}</span>}
              <span className="badge ok">{a.points} pts</span>
            </div>
            <h3>{a.title}</h3>
            <p className="muted">{a.description}</p>
            <div className="row">
              {a.resource_url && <a className="btn btn-outline" href={a.resource_url} target="_blank" rel="noreferrer">Open resource</a>}
              {a.completed ? <span className="done">✅ Completed</span>
                : <button className="btn btn-primary" onClick={() => complete(a.id)}>Mark complete</button>}
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="muted">No activities match.</p>}
      </div>
    </>
  );
}
