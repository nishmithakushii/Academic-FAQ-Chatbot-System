const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  // ─── EXAMS ───────────────────────────────────────────────
  router.get('/exams', authenticate, (req, res) => {
    const rows = db.prepare("SELECT * FROM exams ORDER BY exam_date ASC").all();
    res.json(rows);
  });

  router.post('/exams', authenticate, requireRole('admin'), (req, res) => {
    const { subject, exam_date, time, venue, department, semester } = req.body;
    if (!subject || !exam_date || !time || !venue) return res.status(400).json({ error: 'Missing fields' });
    const info = db.prepare("INSERT INTO exams (subject, exam_date, time, venue, department, semester) VALUES (?, ?, ?, ?, ?, ?)").run(subject, exam_date, time, venue, department || 'All', semester || 'All');
    const row = db.prepare("SELECT * FROM exams WHERE id = ?").get(info.lastInsertRowid);
    res.json(row);
  });

  router.put('/exams/:id', authenticate, requireRole('admin'), (req, res) => {
    const { subject, exam_date, time, venue, department, semester } = req.body;
    db.prepare("UPDATE exams SET subject=?, exam_date=?, time=?, venue=?, department=?, semester=? WHERE id=?").run(subject, exam_date, time, venue, department, semester, req.params.id);
    res.json(db.prepare("SELECT * FROM exams WHERE id=?").get(req.params.id));
  });

  router.delete('/exams/:id', authenticate, requireRole('admin'), (req, res) => {
    db.prepare("DELETE FROM exams WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  // ─── ASSIGNMENTS ─────────────────────────────────────────
  router.get('/assignments', authenticate, (req, res) => {
    const rows = db.prepare("SELECT * FROM assignments ORDER BY deadline ASC").all();
    res.json(rows);
  });

  router.post('/assignments', authenticate, requireRole('admin'), (req, res) => {
    const { subject, description, deadline, department, semester } = req.body;
    if (!subject || !description || !deadline) return res.status(400).json({ error: 'Missing fields' });
    const info = db.prepare("INSERT INTO assignments (subject, description, deadline, department, semester) VALUES (?, ?, ?, ?, ?)").run(subject, description, deadline, department || 'All', semester || 'All');
    res.json(db.prepare("SELECT * FROM assignments WHERE id=?").get(info.lastInsertRowid));
  });

  router.put('/assignments/:id', authenticate, requireRole('admin'), (req, res) => {
    const { subject, description, deadline, department, semester } = req.body;
    db.prepare("UPDATE assignments SET subject=?, description=?, deadline=?, department=?, semester=? WHERE id=?").run(subject, description, deadline, department, semester, req.params.id);
    res.json(db.prepare("SELECT * FROM assignments WHERE id=?").get(req.params.id));
  });

  router.delete('/assignments/:id', authenticate, requireRole('admin'), (req, res) => {
    db.prepare("DELETE FROM assignments WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  // ─── EVENTS ──────────────────────────────────────────────
  router.get('/events', authenticate, (req, res) => {
    const rows = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(rows);
  });

  router.post('/events', authenticate, requireRole('admin'), (req, res) => {
    const { title, description, date, venue } = req.body;
    if (!title || !description || !date || !venue) return res.status(400).json({ error: 'Missing fields' });
    const info = db.prepare("INSERT INTO events (title, description, date, venue) VALUES (?, ?, ?, ?)").run(title, description, date, venue);
    res.json(db.prepare("SELECT * FROM events WHERE id=?").get(info.lastInsertRowid));
  });

  router.put('/events/:id', authenticate, requireRole('admin'), (req, res) => {
    const { title, description, date, venue } = req.body;
    db.prepare("UPDATE events SET title=?, description=?, date=?, venue=? WHERE id=?").run(title, description, date, venue, req.params.id);
    res.json(db.prepare("SELECT * FROM events WHERE id=?").get(req.params.id));
  });

  router.delete('/events/:id', authenticate, requireRole('admin'), (req, res) => {
    db.prepare("DELETE FROM events WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  return router;
};
