import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import BarChart from '../components/BarChart.jsx';
import DataTable from '../components/DataTable.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');

export default function Progress() {
  const [weekly, setWeekly] = useState([]);
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/student/weekly').then(setWeekly).catch(() => {});
    api.get('/student/history').then(setHistory).catch(() => {});
    api.get('/lock/sessions').then(setSessions).catch(() => {});
  }, []);

  return (
    <>
      <h1>Progress Tracking</h1>
      <div className="card"><h3>Points earned (last 7 days)</h3><BarChart data={weekly} /></div>
      <div className="card">
        <h3>Learning history</h3>
        <DataTable
          columns={[
            { key: 'title', label: 'Item' }, { key: 'type', label: 'Type' },
            { key: 'skill_name', label: 'Skill', render: (r) => r.skill_name || '-' },
            { key: 'points_earned', label: 'Points' },
            { key: 'created_at', label: 'Date', render: (r) => fmt(r.created_at) },
          ]}
          rows={history} empty="No history yet." />
      </div>
      <div className="card">
        <h3>Screen lock sessions</h3>
        <DataTable
          columns={[
            { key: 'question', label: 'Question' }, { key: 'attempts', label: 'Attempts' },
            { key: 'status', label: 'Status', render: (r) => <span className={`badge ${r.status === 'unlocked' ? 'ok' : ''}`}>{r.status}</span> },
            { key: 'started_at', label: 'Started', render: (r) => fmt(r.started_at) },
          ]}
          rows={sessions} empty="No sessions yet." />
      </div>
    </>
  );
}
