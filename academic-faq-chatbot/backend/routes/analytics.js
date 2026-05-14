const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  router.get('/', authenticate, requireRole('admin'), (req, res) => {
    const totalStudents = db.prepare("SELECT COUNT(*) as c FROM student_matrix").get().c;
    const feePending = db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE fee_status='pending'").get().c;
    const feePartial = db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE fee_status='partial'").get().c;
    const feePaid = db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE fee_status='paid'").get().c;
    const avgAttendance = db.prepare("SELECT AVG(attendance) as avg FROM student_matrix").get().avg || 0;
    const avgCGPA = db.prepare("SELECT AVG(cgpa) as avg FROM student_matrix").get().avg || 0;
    const topRankers = db.prepare("SELECT student_id, name, cgpa, rank, attendance FROM student_matrix ORDER BY rank ASC LIMIT 5").all();
    const lowAttendance = db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE attendance < 75").get().c;
    const totalAnnouncements = db.prepare("SELECT COUNT(*) as c FROM announcements").get().c;
    const pendingCRApprovals = db.prepare("SELECT COUNT(*) as c FROM cr_announcements WHERE status='pending'").get().c;
    const totalExams = db.prepare("SELECT COUNT(*) as c FROM exams").get().c;
    const totalAssignments = db.prepare("SELECT COUNT(*) as c FROM assignments").get().c;
    const totalChatLogs = db.prepare("SELECT COUNT(*) as c FROM chatbot_logs").get().c;

    // Attendance distribution
    const attendanceBuckets = [
      { label: '90-100%', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE attendance >= 90").get().c },
      { label: '75-90%', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE attendance >= 75 AND attendance < 90").get().c },
      { label: '60-75%', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE attendance >= 60 AND attendance < 75").get().c },
      { label: 'Below 60%', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE attendance < 60").get().c },
    ];

    // CGPA distribution
    const cgpaBuckets = [
      { label: '9-10', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE cgpa >= 9").get().c },
      { label: '8-9', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE cgpa >= 8 AND cgpa < 9").get().c },
      { label: '7-8', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE cgpa >= 7 AND cgpa < 8").get().c },
      { label: '6-7', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE cgpa >= 6 AND cgpa < 7").get().c },
      { label: 'Below 6', count: db.prepare("SELECT COUNT(*) as c FROM student_matrix WHERE cgpa < 6").get().c },
    ];

    res.json({
      totalStudents, feePending, feePartial, feePaid,
      avgAttendance: Math.round(avgAttendance * 10) / 10,
      avgCGPA: Math.round(avgCGPA * 100) / 100,
      topRankers, lowAttendance,
      totalAnnouncements, pendingCRApprovals,
      totalExams, totalAssignments, totalChatLogs,
      attendanceBuckets, cgpaBuckets,
      feeData: [
        { label: 'Paid', count: feePaid },
        { label: 'Pending', count: feePending },
        { label: 'Partial', count: feePartial }
      ]
    });
  });

  return router;
};
