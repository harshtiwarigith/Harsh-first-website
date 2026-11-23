const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { auth, wrap } = require('../middleware/auth');

const sign = (u, role) =>
  jwt.sign({ id: u.id, role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a password of 6+ characters are required' });
  const [exists] = await pool.query('SELECT id FROM students WHERE email = ?', [email]);
  if (exists.length) return res.status(409).json({ message: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query('INSERT INTO students (name, email, password_hash) VALUES (?,?,?)', [name, email, hash]);
  const user = { id: r.insertId, name };
  res.status(201).json({ token: sign(user, 'student'), user: { ...user, email, role: 'student' } });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  let role = 'admin';
  let [rows] = await pool.query('SELECT * FROM administrators WHERE email = ?', [email]);
  if (!rows.length) {
    role = 'student';
    [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
  }
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
    return res.status(401).json({ message: 'Invalid email or password' });
  const u = rows[0];
  res.json({ token: sign(u, role), user: { id: u.id, name: u.name, email: u.email, role } });
}));

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
