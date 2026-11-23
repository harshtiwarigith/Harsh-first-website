const router = require('express').Router();
const pool = require('../config/database');
const { auth, requireRole, wrap } = require('../middleware/auth');

router.use(auth, requireRole('student'));

const publicQuestion = (q) => ({
  id: q.id, text: q.question_text,
  options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
});

router.post('/start', wrap(async (req, res) => {
  const [[q]] = await pool.query('SELECT * FROM questions ORDER BY RAND() LIMIT 1');
  if (!q) return res.status(404).json({ message: 'No questions available. Ask an admin to add some.' });
  const [r] = await pool.query('INSERT INTO screen_lock_sessions (student_id, question_id) VALUES (?,?)', [req.user.id, q.id]);
  res.json({ sessionId: r.insertId, question: publicQuestion(q) });
}));

router.post('/answer', wrap(async (req, res) => {
  const { sessionId, answer } = req.body;
  const [[s]] = await pool.query('SELECT * FROM screen_lock_sessions WHERE id = ? AND student_id = ?', [sessionId, req.user.id]);
  if (!s) return res.status(404).json({ message: 'Session not found' });
  if (s.status === 'unlocked') return res.status(400).json({ message: 'Session already unlocked' });
  const [[q]] = await pool.query('SELECT * FROM questions WHERE id = ?', [s.question_id]);
  const correct = String(answer).toLowerCase() === q.correct_option.toLowerCase();
  if (correct) {
    await pool.query("UPDATE screen_lock_sessions SET status='unlocked', attempts = attempts + 1, ended_at = NOW() WHERE id = ?", [s.id]);
    await pool.query('INSERT INTO student_progress (student_id, skill_id, question_id, points_earned) VALUES (?,?,?,?)',
      [req.user.id, q.skill_id, q.id, 5]);
    return res.json({ correct: true, unlocked: true, points: 5 });
  }
  await pool.query('UPDATE screen_lock_sessions SET attempts = attempts + 1 WHERE id = ?', [s.id]);
  res.json({ correct: false, unlocked: false });
}));

router.get('/sessions', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.status, s.attempts, s.started_at, s.ended_at, LEFT(q.question_text, 80) AS question
     FROM screen_lock_sessions s JOIN questions q ON q.id = s.question_id
     WHERE s.student_id = ? ORDER BY s.id DESC LIMIT 20`, [req.user.id]);
  res.json(rows);
}));

module.exports = router;
