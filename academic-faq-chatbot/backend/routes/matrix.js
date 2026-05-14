const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { authenticate, requireRole } = require('../middleware/auth');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

function recalcRanks(db) {
  const all = db.prepare("SELECT id, cgpa FROM student_matrix ORDER BY cgpa DESC").all();
  all.forEach((s, i) => db.prepare("UPDATE student_matrix SET rank=? WHERE id=?").run(i + 1, s.id));
}

module.exports = (db) => {
  // Get all students (admin) or single student (student)
  router.get('/', authenticate, (req, res) => {
    if (req.user.role === 'admin' || req.user.role === 'cr') {
      const rows = db.prepare("SELECT * FROM student_matrix ORDER BY rank ASC").all();
      res.json(rows.map(r => ({ ...r, marks_data: JSON.parse(r.marks_data || '{}') })));
    } else {
      const row = db.prepare("SELECT * FROM student_matrix WHERE student_id = ?").get(req.user.student_id);
      if (!row) return res.status(404).json({ error: 'Student not found in matrix' });
      res.json({ ...row, marks_data: JSON.parse(row.marks_data || '{}') });
    }
  });

  // Upload CSV
  router.post('/upload', authenticate, requireRole('admin'), upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        fs.unlinkSync(filePath);
        let imported = 0;
        let errors = [];

        for (const row of results) {
          try {
            const student_id = row['Student ID'] || row['student_id'] || row['StudentID'];
            const name = row['Name'] || row['name'] || row['Student Name'];
            const department = row['Department'] || row['department'] || row['Dept'];
            const semester = row['Semester'] || row['semester'] || row['Sem'];
            const attendance = parseFloat(row['Attendance'] || row['attendance'] || 0);
            const fee_status = (row['Fee Status'] || row['fee_status'] || 'pending').toLowerCase();
            const cgpa = parseFloat(row['CGPA'] || row['cgpa'] || 0);

            if (!student_id || !name) { errors.push(`Row missing student ID or name`); continue; }

            // Extract subject marks (any column not in known fields)
            const knownCols = ['Student ID','student_id','StudentID','Name','name','Student Name','Department','department','Dept','Semester','semester','Sem','Attendance','attendance','Fee Status','fee_status','CGPA','cgpa'];
            const marks_data = {};
            for (const [key, val] of Object.entries(row)) {
              if (!knownCols.includes(key) && val !== undefined && val !== '') {
                marks_data[key] = parseFloat(val) || 0;
              }
            }

            const exists = db.prepare("SELECT id FROM student_matrix WHERE student_id=?").get(student_id);
            if (exists) {
              db.prepare("UPDATE student_matrix SET name=?,department=?,semester=?,marks_data=?,attendance=?,fee_status=?,cgpa=? WHERE student_id=?").run(name, department, semester, JSON.stringify(marks_data), attendance, fee_status, cgpa, student_id);
            } else {
              db.prepare("INSERT INTO student_matrix (student_id,name,department,semester,marks_data,attendance,fee_status,cgpa) VALUES (?,?,?,?,?,?,?,?)").run(student_id, name, department, semester, JSON.stringify(marks_data), attendance, fee_status, cgpa);
            }
            imported++;
          } catch (e) {
            errors.push(e.message);
          }
        }

        recalcRanks(db);
        res.json({ imported, errors, total: results.length });
      })
      .on('error', (err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // Manual add/update
  router.post('/', authenticate, requireRole('admin'), (req, res) => {
    const { student_id, name, department, semester, marks_data, attendance, fee_status, cgpa } = req.body;
    if (!student_id || !name) return res.status(400).json({ error: 'Missing required fields' });
    const exists = db.prepare("SELECT id FROM student_matrix WHERE student_id=?").get(student_id);
    if (exists) {
      db.prepare("UPDATE student_matrix SET name=?,department=?,semester=?,marks_data=?,attendance=?,fee_status=?,cgpa=? WHERE student_id=?").run(name, department, semester, JSON.stringify(marks_data || {}), attendance || 0, fee_status || 'pending', cgpa || 0, student_id);
    } else {
      db.prepare("INSERT INTO student_matrix (student_id,name,department,semester,marks_data,attendance,fee_status,cgpa) VALUES (?,?,?,?,?,?,?,?)").run(student_id, name, department, semester, JSON.stringify(marks_data || {}), attendance || 0, fee_status || 'pending', cgpa || 0);
    }
    recalcRanks(db);
    res.json({ success: true });
  });

  router.delete('/:student_id', authenticate, requireRole('admin'), (req, res) => {
    db.prepare("DELETE FROM student_matrix WHERE student_id=?").run(req.params.student_id);
    recalcRanks(db);
    res.json({ success: true });
  });

  return router;
};
