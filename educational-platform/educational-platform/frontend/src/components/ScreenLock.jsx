import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const UNLOCK_SECONDS = 300;

export default function ScreenLock({ onUnlocked }) {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining > 0]);

  const start = async () => {
    setError(''); setFeedback(''); setAttempts(0);
    try {
      const data = await api.post('/lock/start');
      setSession(data.sessionId);
      setQuestion(data.question);
    } catch (e) { setError(e.message); }
  };

  const answer = async (opt) => {
    try {
      const r = await api.post('/lock/answer', { sessionId: session, answer: opt });
      if (r.correct) {
        setQuestion(null); setSession(null);
        setRemaining(UNLOCK_SECONDS);
        setFeedback(`Correct! +${r.points} skill points earned.`);
        onUnlocked && onUnlocked();
      } else {
        setAttempts((a) => a + 1);
        setFeedback('Not quite. Try again.');
      }
    } catch (e) { setError(e.message); }
  };

  const unlocked = remaining > 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className={`lockscreen ${unlocked ? 'is-unlocked' : ''}`}>
      <div className="lock-time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="lock-date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="lock-icon">{unlocked ? '🔓' : '🔒'}</div>

      {unlocked && (
        <div className="lock-panel">
          <h2>Screen unlocked</h2>
          <p>Simulated unlock time remaining: <strong>{mm}:{ss}</strong></p>
          <button className="btn btn-light" onClick={() => setRemaining(0)}>Lock screen again</button>
        </div>
      )}

      {!unlocked && !question && (
        <div className="lock-panel">
          <h2>Screen locked</h2>
          <p>Answer an educational question correctly to unlock.</p>
          <button className="btn btn-light" onClick={start}>Start challenge</button>
        </div>
      )}

      {question && (
        <div className="lock-panel">
          <h3>{question.text}</h3>
          <div className="options">
            {Object.entries(question.options).map(([k, v]) => (
              <button key={k} className="option" onClick={() => answer(k)}>
                <b>{k.toUpperCase()}</b> {v}
              </button>
            ))}
          </div>
          {attempts > 0 && <p className="small">Attempts: {attempts}</p>}
        </div>
      )}

      {feedback && <p className="lock-feedback">{feedback}</p>}
      {error && <p className="lock-feedback error">{error}</p>}
    </div>
  );
}
