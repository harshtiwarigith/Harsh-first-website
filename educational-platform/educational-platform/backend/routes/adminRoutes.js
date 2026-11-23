const router = require('express').Router();
const pool = require('../config/database');
const { auth, requireRole, wrap } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

router.get('/stats', wrap(async (req, res) => {
  const [[s]] = await pool.query('SELECT COUNT(*) AS c FROM students');
  const [[q]] = await pool.query('SELECT COUNT(*) AS c FROM questions');
  const [[a]] = await pool.query('SELECT COUNT(*) AS c FROM learning_activities');
  const [[l]] = await pool.query("SELECT COUNT(*) AS c FROM screen_lock_sessions WHERE status='unlocked'");
  res.json({ students: s.c, questions: q.c, activities: a.c, unlocks: l.c });
}));

router.get('/students', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT st.id, st.name, st.email, st.created_at,
       COALESCE(SUM(p.points_earned),0) AS total_points,
       COUNT(p.activity_id) AS activities_done
     FROM students st LEFT JOIN student_progress p ON p.student_id = st.id
     GROUP BY st.id ORDER BY st.created_at DESC`);
  res.json(rows);
}));

router.delete('/students/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
  res.json({ message: 'Student removed' });
}));

router.get('/subjects', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM subjects ORDER BY name');
  res.json(rows);
}));

router.get('/skills', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM skills ORDER BY id');
  res.json(rows);
}));

router.get('/questions', wrap(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT q.*, s.name AS subject_name FROM questions q JOIN subjects s ON s.id = q.subject_id ORDER BY q.id DESC');
  res.json(rows);
}));

router.post('/questions', wrap(async (req, res) => {
  const { subject_id, skill_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty } = req.body;
  if (!subject_id || !question_text || !option_a || !option_b || !option_c || !option_d || !/^[abcd]$/i.test(correct_option || ''))
    return res.status(400).json({ message: 'All fields are required and correct option must be a, b, c or d' });
  await pool.query(
    `INSERT INTO questions (subject_id, skill_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [subject_id, skill_id || null, question_text, option_a, option_b, option_c, option_d, correct_option.toLowerCase(), difficulty || 'easy']);
  res.status(201).json({ message: 'Question added' });
}));

router.delete('/questions/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
  res.json({ message: 'Question deleted' });
}));

router.get('/activities', wrap(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT a.*, s.name AS subject_name FROM learning_activities a JOIN subjects s ON s.id = a.subject_id ORDER BY a.id DESC');
  res.json(rows);
}));

router.post('/activities', wrap(async (req, res) => {
  const { subject_id, skill_id, title, description, resource_url, points } = req.body;
  if (!subject_id || !title) return res.status(400).json({ message: 'Subject and title are required' });
  await pool.query(
    'INSERT INTO learning_activities (subject_id, skill_id, title, description, resource_url, points) VALUES (?,?,?,?,?,?)',
    [subject_id, skill_id || null, title, description || '', resource_url || '', points || 10]);
  res.status(201).json({ message: 'Activity added' });
}));

router.delete('/activities/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM learning_activities WHERE id = ?', [req.params.id]);
  res.json({ message: 'Activity deleted' });
}));

module.exports = router;
