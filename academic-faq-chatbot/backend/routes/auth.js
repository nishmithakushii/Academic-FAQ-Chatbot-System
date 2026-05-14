const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // Login
  router.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    let user;
    if (role === 'student') {
      user = db.prepare("SELECT * FROM users WHERE student_id = ? AND role = 'student'").get(username);
    } else {
      user = db.prepare("SELECT * FROM users WHERE username = ? AND role = ?").get(username, role);
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, student_id: user.student_id, name: user.name, department: user.department, semester: user.semester },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, student_id: user.student_id, name: user.name, department: user.department, semester: user.semester }
    });
  });

  // Get current user
  router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
};
