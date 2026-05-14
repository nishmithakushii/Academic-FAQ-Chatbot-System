const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'academic.db');

class SyncDB {
  constructor(SQL, data) {
    this.db = data ? new SQL.Database(data) : new SQL.Database();
    this.SQL = SQL;
  }

  exec(sql) { this.db.run(sql); return this; }
  pragma() { return this; }

  _runSql(sql, params) {
    const stmt = this.db.prepare(sql);
    if (params && params.length > 0) stmt.bind(params);
    stmt.step();
    stmt.free();
    const rows = this.db.exec('SELECT last_insert_rowid() as id');
    return { lastInsertRowid: rows[0]?.values[0][0] || 0, changes: this.db.getRowsModified() };
  }

  _getSql(sql, params) {
    const stmt = this.db.prepare(sql);
    if (params && params.length > 0) stmt.bind(params);
    const result = [];
    while (stmt.step()) result.push(stmt.getAsObject());
    stmt.free();
    return result;
  }

  prepare(sql) {
    const self = this;
    return {
      get: (...params) => self._getSql(sql, params.flat())[0] || null,
      all: (...params) => self._getSql(sql, params.flat()),
      run: (...params) => {
        const result = self._runSql(sql, params.flat());
        self.save();
        return result;
      }
    };
  }

  save() {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

async function initDB() {
  const SQL = await initSqlJs();
  let syncDB;
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    syncDB = new SyncDB(SQL, data);
  } else {
    syncDB = new SyncDB(SQL);
  }
  const db = syncDB;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL, student_id TEXT, name TEXT, email TEXT, department TEXT, semester TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, priority TEXT DEFAULT 'normal', author TEXT DEFAULT 'Admin', author_role TEXT DEFAULT 'admin', date TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS cr_announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, message TEXT NOT NULL, priority TEXT DEFAULT 'normal', date TEXT NOT NULL, cr_name TEXT NOT NULL, cr_user_id INTEGER, status TEXT DEFAULT 'pending', admin_note TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS exams (id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, exam_date TEXT NOT NULL, time TEXT NOT NULL, venue TEXT NOT NULL, department TEXT DEFAULT 'All', semester TEXT DEFAULT 'All', created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, description TEXT NOT NULL, deadline TEXT NOT NULL, department TEXT DEFAULT 'All', semester TEXT DEFAULT 'All', attachment_name TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, date TEXT NOT NULL, venue TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS student_matrix (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, department TEXT, semester TEXT, marks_data TEXT, attendance REAL DEFAULT 0, fee_status TEXT DEFAULT 'pending', cgpa REAL DEFAULT 0, rank INTEGER, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS chatbot_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, student_id TEXT, query TEXT NOT NULL, response TEXT NOT NULL, intent TEXT, created_at TEXT DEFAULT (datetime('now')));
  `);
  db.save();

  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare("INSERT INTO users (username, password, role, name, email) VALUES (?, ?, 'admin', 'System Admin', 'admin@college.edu')").run('admin', hash);
  }
  const crExists = db.prepare("SELECT id FROM users WHERE username = 'cr001'").get();
  if (!crExists) {
    const hash = bcrypt.hashSync('cr123', 10);
    db.prepare("INSERT INTO users (username, password, role, name, email, department, semester) VALUES (?, ?, 'cr', 'Anika Sharma', 'anika@college.edu', 'Computer Science', '6')").run('cr001', hash);
  }
  const students = [
    { sid: 'CS2021001', name: 'Rahul Verma', dept: 'Computer Science', sem: '6' },
    { sid: 'CS2021002', name: 'Priya Patel', dept: 'Computer Science', sem: '6' },
    { sid: 'CS2021003', name: 'Arjun Singh', dept: 'Computer Science', sem: '6' },
    { sid: 'CS2021004', name: 'Sneha Nair', dept: 'Computer Science', sem: '6' },
    { sid: 'CS2021005', name: 'Karan Mehta', dept: 'Computer Science', sem: '6' },
  ];
  for (const s of students) {
    if (!db.prepare("SELECT id FROM users WHERE student_id = ?").get(s.sid)) {
      const hash = bcrypt.hashSync('student123', 10);
      db.prepare("INSERT INTO users (username, password, role, student_id, name, department, semester) VALUES (?, ?, 'student', ?, ?, ?, ?)").run(s.sid, hash, s.sid, s.name, s.dept, s.sem);
    }
  }

  const matrixData = [
    { student_id: 'CS2021001', name: 'Rahul Verma', dept: 'Computer Science', sem: '6', marks: JSON.stringify({DBMS: 88, OS: 82, CN: 79, SE: 91, AI: 85}), attendance: 92, fee_status: 'paid', cgpa: 8.5 },
    { student_id: 'CS2021002', name: 'Priya Patel', dept: 'Computer Science', sem: '6', marks: JSON.stringify({DBMS: 95, OS: 91, CN: 88, SE: 94, AI: 97}), attendance: 98, fee_status: 'paid', cgpa: 9.4 },
    { student_id: 'CS2021003', name: 'Arjun Singh', dept: 'Computer Science', sem: '6', marks: JSON.stringify({DBMS: 72, OS: 68, CN: 74, SE: 70, AI: 65}), attendance: 75, fee_status: 'pending', cgpa: 6.9 },
    { student_id: 'CS2021004', name: 'Sneha Nair', dept: 'Computer Science', sem: '6', marks: JSON.stringify({DBMS: 80, OS: 76, CN: 82, SE: 78, AI: 88}), attendance: 88, fee_status: 'paid', cgpa: 8.1 },
    { student_id: 'CS2021005', name: 'Karan Mehta', dept: 'Computer Science', sem: '6', marks: JSON.stringify({DBMS: 65, OS: 71, CN: 60, SE: 68, AI: 72}), attendance: 65, fee_status: 'partial', cgpa: 6.5 },
  ];
  for (const m of matrixData) {
    if (!db.prepare("SELECT id FROM student_matrix WHERE student_id = ?").get(m.student_id)) {
      db.prepare("INSERT INTO student_matrix (student_id, name, department, semester, marks_data, attendance, fee_status, cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(m.student_id, m.name, m.dept, m.sem, m.marks, m.attendance, m.fee_status, m.cgpa);
    }
  }
  const allStudents = db.prepare("SELECT id, cgpa FROM student_matrix ORDER BY cgpa DESC").all();
  allStudents.forEach((s, i) => db.prepare("UPDATE student_matrix SET rank = ? WHERE id = ?").run(i + 1, s.id));

  const annCount = db.prepare("SELECT COUNT(*) as c FROM announcements").get();
  if (!annCount || annCount.c === 0) {
    db.prepare("INSERT INTO announcements (title, description, priority, date) VALUES (?, ?, ?, ?)").run('Mid-Semester Examination Notice', 'Mid-semester exams will begin from December 18th. All students must carry their hall tickets. Syllabus coverage: Unit 1-3 for all subjects.', 'urgent', '2024-12-10');
    db.prepare("INSERT INTO announcements (title, description, priority, date) VALUES (?, ?, ?, ?)").run('Annual Cultural Fest – TechFiesta 2024', 'Register for TechFiesta 2024 happening on January 15-16. Online registration open till December 31st.', 'high', '2024-12-08');
    db.prepare("INSERT INTO announcements (title, description, priority, date) VALUES (?, ?, ?, ?)").run('Library Timings Extended', 'Library will remain open till 9 PM from December 1st for student convenience during exam period.', 'normal', '2024-12-01');
  }
  const examCount = db.prepare("SELECT COUNT(*) as c FROM exams").get();
  if (!examCount || examCount.c === 0) {
    db.prepare("INSERT INTO exams (subject, exam_date, time, venue) VALUES (?, ?, ?, ?)").run('Database Management Systems', '2024-12-18', '10:00 AM - 1:00 PM', 'Hall A - Block 2');
    db.prepare("INSERT INTO exams (subject, exam_date, time, venue) VALUES (?, ?, ?, ?)").run('Operating Systems', '2024-12-20', '10:00 AM - 1:00 PM', 'Hall B - Block 2');
    db.prepare("INSERT INTO exams (subject, exam_date, time, venue) VALUES (?, ?, ?, ?)").run('Computer Networks', '2024-12-22', '02:00 PM - 5:00 PM', 'Hall A - Block 3');
    db.prepare("INSERT INTO exams (subject, exam_date, time, venue) VALUES (?, ?, ?, ?)").run('Software Engineering', '2024-12-24', '10:00 AM - 1:00 PM', 'Hall C - Block 1');
    db.prepare("INSERT INTO exams (subject, exam_date, time, venue) VALUES (?, ?, ?, ?)").run('Artificial Intelligence', '2024-12-26', '02:00 PM - 5:00 PM', 'Lab Complex - Building 4');
  }
  const assignCount = db.prepare("SELECT COUNT(*) as c FROM assignments").get();
  if (!assignCount || assignCount.c === 0) {
    db.prepare("INSERT INTO assignments (subject, description, deadline) VALUES (?, ?, ?)").run('Database Management Systems', 'Design and implement an ER diagram for a Hospital Management System. Submit DDL and DML scripts.', '2024-12-15');
    db.prepare("INSERT INTO assignments (subject, description, deadline) VALUES (?, ?, ?)").run('Artificial Intelligence', 'Implement a basic Neural Network from scratch using Python. Include training/testing accuracy plots.', '2024-12-17');
    db.prepare("INSERT INTO assignments (subject, description, deadline) VALUES (?, ?, ?)").run('Computer Networks', 'Simulate a LAN network topology using Cisco Packet Tracer. Include subnetting calculations.', '2024-12-19');
  }
  const eventCount = db.prepare("SELECT COUNT(*) as c FROM events").get();
  if (!eventCount || eventCount.c === 0) {
    db.prepare("INSERT INTO events (title, description, date, venue) VALUES (?, ?, ?, ?)").run('TechFiesta 2024 – Annual Tech Fest', 'Join us for coding competitions, hackathons, robotics, and more! Register online.', '2025-01-15', 'Main Auditorium & Open Ground');
    db.prepare("INSERT INTO events (title, description, date, venue) VALUES (?, ?, ?, ?)").run('Campus Recruitment Drive – Infosys', 'Infosys is visiting for campus placements. Eligible: 6th semester CSE/IT with CGPA >= 7.0', '2024-12-28', 'Placement Cell, Admin Block');
    db.prepare("INSERT INTO events (title, description, date, venue) VALUES (?, ?, ?, ?)").run('Alumni Talk: Life in the Tech Industry', 'Senior alumni from Google and Microsoft share their journey and career tips.', '2024-12-20', 'Seminar Hall 1');
  }

  console.log('✅ Database initialized with seed data');
  return db;
}

module.exports = { initDB, DB_PATH };
