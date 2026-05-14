const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  // Get all admin announcements (public to students/cr)
  router.get('/', authenticate, (req, res) => {
    const rows = db.prepare("SELECT * FROM announcements ORDER BY date DESC, created_at DESC").all();
    res.json(rows);
  });

  // Create announcement (admin only)
  router.post('/', authenticate, requireRole('admin'), (req, res) => {
    const { title, description, priority, date } = req.body;
    if (!title || !description || !date) return res.status(400).json({ error: 'Missing fields' });
    const info = db.prepare("INSERT INTO announcements (title, description, priority, date) VALUES (?, ?, ?, ?)").run(title, description, priority || 'normal', date);
    const row = db.prepare("SELECT * FROM announcements WHERE id = ?").get(info.lastInsertRowid);
    res.json(row);
  });

  // Update announcement
  router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
    const { title, description, priority, date } = req.body;
    db.prepare("UPDATE announcements SET title=?, description=?, priority=?, date=? WHERE id=?").run(title, description, priority, date, req.params.id);
    const row = db.prepare("SELECT * FROM announcements WHERE id = ?").get(req.params.id);
    res.json(row);
  });

  // Delete announcement
  router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
    db.prepare("DELETE FROM announcements WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  // CR Announcements
  router.get('/cr', authenticate, (req, res) => {
    let rows;
    if (req.user.role === 'admin') {
      rows = db.prepare("SELECT * FROM cr_announcements ORDER BY created_at DESC").all();
    } else if (req.user.role === 'cr') {
      rows = db.prepare("SELECT * FROM cr_announcements WHERE cr_user_id = ? ORDER BY created_at DESC").all(req.user.id);
    } else {
      rows = db.prepare("SELECT * FROM cr_announcements WHERE status = 'approved' ORDER BY date DESC").all();
    }
    res.json(rows);
  });

  router.post('/cr', authenticate, requireRole('cr'), (req, res) => {
    const { title, message, priority, date } = req.body;
    if (!title || !message || !date) return res.status(400).json({ error: 'Missing fields' });
    const info = db.prepare("INSERT INTO cr_announcements (title, message, priority, date, cr_name, cr_user_id) VALUES (?, ?, ?, ?, ?, ?)").run(title, message, priority || 'normal', date, req.user.name || 'CR', req.user.id);
    const row = db.prepare("SELECT * FROM cr_announcements WHERE id = ?").get(info.lastInsertRowid);
    res.json(row);
  });

  router.put('/cr/:id/status', authenticate, requireRole('admin'), (req, res) => {
    const { status, admin_note } = req.body;
    db.prepare("UPDATE cr_announcements SET status=?, admin_note=? WHERE id=?").run(status, admin_note || '', req.params.id);
    const row = db.prepare("SELECT * FROM cr_announcements WHERE id = ?").get(req.params.id);
    res.json(row);
  });

  return router;
};
