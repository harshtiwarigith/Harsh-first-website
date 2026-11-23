import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import SearchBar from '../components/SearchBar.jsx';

const emptyQ = { subject_id: '', skill_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', difficulty: 'easy' };
const emptyA = { subject_id: '', skill_id: '', title: '', description: '', resource_url: '', points: 10 };

export default function Admin() {
  const [tab, setTab] = useState('students');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [q, setQ] = useState('');
  const [qForm, setQForm] = useState(emptyQ);
  const [aForm, setAForm] = useState(emptyA);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/admin/stats').then(setStats);
    api.get('/admin/students').then(setStudents);
    api.get('/admin/questions').then(setQuestions);
    api.get('/admin/activities').then(setActivities);
    api.get('/admin/subjects').then(setSubjects);
    api.get('/admin/skills').then(setSkills);
  };
  useEffect(() => { load(); }, []);

  const run = async (fn, ok) => {
    try { await fn(); setMsg(ok); load(); } catch (e) { setMsg(e.message); }
  };
  const del = (path) => window.confirm('Delete this record?') && run(() => api.del(path), 'Deleted');

  const subjectSel = (form, setForm) => (
    <select className="input" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
      <option value="">Subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
  const skillSel = (form, setForm) => (
    <select className="input" value={form.skill_id} onChange={(e) => setForm({ ...form, skill_id: e.target.value })}>
      <option value="">Skill (optional)</option>{skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );

  const filteredStudents = students.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(q.toLowerCase()));
  const delBtn = (path) => <button className="btn btn-danger" onClick={() => del(path)}>Delete</button>;

  return (
    <>
      <h1>Admin Dashboard</h1>
      {stats && (
        <div className="grid-4">
          <StatCard icon="🎓" label="Students" value={stats.students} tone="blue" />
          <StatCard icon="❓" label="Questions" value={stats.questions} tone="purple" />
          <StatCard icon="📚" label="Activities" value={stats.activities} tone="green" />
          <StatCard icon="🔓" label="Total unlocks" value={stats.unlocks} tone="orange" />
        </div>
      )}
      <div className="tabs">
        {['students', 'questions', 'activities'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setMsg(''); }}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {msg && <div className="alert info">{msg}</div>}

      {tab === 'students' && (
        <div className="card">
          <SearchBar value={q} onChange={setQ} placeholder="Search students" />
          <DataTable
            columns={[
              { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
              { key: 'activities_done', label: 'Activities done' }, { key: 'total_points', label: 'Total points' },
              { key: 'act', label: '', render: (r) => delBtn(`/admin/students/${r.id}`) },
            ]}
            rows={filteredStudents} />
        </div>
      )}

      {tab === 'questions' && (
        <>
          <form className="card form-grid" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/admin/questions', qForm); setQForm(emptyQ); }, 'Question added'); }}>
            <h3>Add question</h3>
            {subjectSel(qForm, setQForm)}{skillSel(qForm, setQForm)}
            <textarea className="input" placeholder="Question text" value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} required />
            {['a', 'b', 'c', 'd'].map((k) => (
              <input key={k} className="input" placeholder={`Option ${k.toUpperCase()}`} value={qForm[`option_${k}`]} onChange={(e) => setQForm({ ...qForm, [`option_${k}`]: e.target.value })} required />
            ))}
            <select className="input" value={qForm.correct_option} onChange={(e) => setQForm({ ...qForm, correct_option: e.target.value })}>
              {['a', 'b', 'c', 'd'].map((k) => <option key={k} value={k}>Correct: {k.toUpperCase()}</option>)}
            </select>
            <select className="input" value={qForm.difficulty} onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}>
              <option>easy</option><option>medium</option><option>hard</option>
            </select>
            <button className="btn btn-primary">Add question</button>
          </form>
          <div className="card">
            <DataTable
              columns={[
                { key: 'question_text', label: 'Question' }, { key: 'subject_name', label: 'Subject' },
                { key: 'correct_option', label: 'Answer', render: (r) => r.correct_option.toUpperCase() },
                { key: 'difficulty', label: 'Level' },
                { key: 'act', label: '', render: (r) => delBtn(`/admin/questions/${r.id}`) },
              ]}
              rows={questions} />
          </div>
        </>
      )}

      {tab === 'activities' && (
        <>
          <form className="card form-grid" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/admin/activities', aForm); setAForm(emptyA); }, 'Activity added'); }}>
            <h3>Add learning activity</h3>
            {subjectSel(aForm, setAForm)}{skillSel(aForm, setAForm)}
            <input className="input" placeholder="Title" value={aForm.title} onChange={(e) => setAForm({ ...aForm, title: e.target.value })} required />
            <input className="input" placeholder="Resource URL" value={aForm.resource_url} onChange={(e) => setAForm({ ...aForm, resource_url: e.target.value })} />
            <input className="input" type="number" min="1" placeholder="Points" value={aForm.points} onChange={(e) => setAForm({ ...aForm, points: e.target.value })} />
            <textarea className="input" placeholder="Description" value={aForm.description} onChange={(e) => setAForm({ ...aForm, description: e.target.value })} />
            <button className="btn btn-primary">Add activity</button>
          </form>
          <div className="card">
            <DataTable
              columns={[
                { key: 'title', label: 'Title' }, { key: 'subject_name', label: 'Subject' }, { key: 'points', label: 'Points' },
                { key: 'act', label: '', render: (r) => delBtn(`/admin/activities/${r.id}`) },
              ]}
              rows={activities} />
          </div>
        </>
      )}
    </>
  );
}
