require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/lock', require('./routes/lockRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const [rows] = await pool.query('SELECT id FROM administrators WHERE email = ?', [email]);
  if (!rows.length) {
    await pool.query('INSERT INTO administrators (name, email, password_hash) VALUES (?,?,?)',
      ['Administrator', email, await bcrypt.hash(password, 10)]);
    console.log('Default admin created:', email);
  }
}

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected');
    await ensureAdmin();
  } catch (e) {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
})();
