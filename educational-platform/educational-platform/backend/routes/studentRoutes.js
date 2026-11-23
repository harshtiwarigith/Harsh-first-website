const router = require('express').Router();
const pool = require('../config/database');
const { auth, requireRole, wrap } = require('../middleware/auth');

router.use(auth, requireRole('student'));

router.get('/overview', wrap(async (req, res) => {
  const id = req.user.id;
  const [[profile]] = await pool.query('SELECT id, name, email, created_at FROM students WHERE id = ?', [id]);
  const [[done]] = await pool.query('SELECT COUNT(*) AS c FROM student_progress WHERE student_id = ? AND activity_id IS NOT NULL', [id]);
  const [[total]] = await pool.query('SELECT COUNT(*) AS c FROM learning_activities');
  const [[unlocks]] = await pool.query("SELECT COUNT(*) AS c FROM screen_lock_sessions WHERE student_id = ? AND status = 'unlocked'", [id]);
  const [skills] = await pool.query(
    `SELECT s.id, s.name, s.category, LEAST(100, COALESCE(SUM(p.points_earned),0)) AS progress
     FROM skills s LEFT JOIN student_progress p ON p.skill_id = s.id AND p.student_id = ?
     GROUP BY s.id ORDER BY s.id`, [id]);
  res.json({
    profile,
    completedActivities: done.c,
    totalActivities: total.c,
    pendingActivities: total.c - done.c,
    screenUnlocks: unlocks.c,
    skills,
  });
}));

router.get('/activities', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, sub.name AS subject_name, sk.name AS skill_name,
       EXISTS(SELECT 1 FROM student_progress p WHERE p.activity_id = a.id AND p.student_id = ?) AS completed
     FROM learning_activities a
     JOIN subjects sub ON sub.id = a.subject_id
     LEFT JOIN skills sk ON sk.id = a.skill_id ORDER BY a.id`, [req.user.id]);
  res.json(rows.map((r) => ({ ...r, completed: !!r.completed })));
}));

router.post('/activities/:id/complete', wrap(async (req, res) => {
  const [[act]] = await pool.query('SELECT * FROM learning_activities WHERE id = ?', [req.params.id]);
  if (!act) return res.status(404).json({ message: 'Activity not found' });
  const [dup] = await pool.query('SELECT id FROM student_progress WHERE student_id = ? AND activity_id = ?', [req.user.id, act.id]);
  if (dup.length) return res.status(409).json({ message: 'Already completed' });
  await pool.query('INSERT INTO student_progress (student_id, skill_id, activity_id, points_earned) VALUES (?,?,?,?)',
    [req.user.id, act.skill_id, act.id, act.points]);
  res.json({ message: 'Activity completed', points: act.points });
}));

router.get('/history', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.points_earned, p.created_at,
       CASE WHEN p.activity_id IS NOT NULL THEN 'Activity' ELSE 'Screen lock question' END AS type,
       COALESCE(a.title, LEFT(q.question_text, 80)) AS title, sk.name AS skill_name
     FROM student_progress p
     LEFT JOIN learning_activities a ON a.id = p.activity_id
     LEFT JOIN questions q ON q.id = p.question_id
     LEFT JOIN skills sk ON sk.id = p.skill_id
     WHERE p.student_id = ? ORDER BY p.created_at DESC LIMIT 50`, [req.user.id]);
  res.json(rows);
}));

router.get('/weekly', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%a %d') AS day, SUM(points_earned) AS points
     FROM student_progress WHERE student_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%a %d') ORDER BY DATE(created_at)`, [req.user.id]);
  res.json(rows);
}));

module.exports = router;
