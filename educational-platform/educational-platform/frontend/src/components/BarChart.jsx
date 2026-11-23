export default function BarChart({ data }) {
  if (!data.length) return <p className="muted">No activity in the last 7 days yet. Complete an activity or unlock the screen to see your chart.</p>;
  const max = Math.max(...data.map((d) => Number(d.points)), 1);
  return (
    <div className="chart">
      {data.map((d) => (
        <div key={d.day} className="chart-col">
          <span className="small">{d.points}</span>
          <div className="chart-bar" style={{ height: `${(Number(d.points) / max) * 140}px` }} />
          <span className="muted small">{d.day}</span>
        </div>
      ))}
    </div>
  );
}
