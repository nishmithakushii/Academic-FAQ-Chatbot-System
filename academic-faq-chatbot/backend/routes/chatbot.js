const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  router.post('/chat', authenticate, async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const student_id = req.user.student_id;
    const userRole = req.user.role;

    // Build context from DB
    const announcements = db.prepare("SELECT * FROM announcements ORDER BY date DESC LIMIT 5").all();
    const crAnn = db.prepare("SELECT * FROM cr_announcements WHERE status='approved' ORDER BY date DESC LIMIT 3").all();
    const exams = db.prepare("SELECT * FROM exams ORDER BY exam_date ASC").all();
    const assignments = db.prepare("SELECT * FROM assignments ORDER BY deadline ASC").all();
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC LIMIT 5").all();

    let studentData = null;
    if (student_id) {
      const row = db.prepare("SELECT * FROM student_matrix WHERE student_id=?").get(student_id);
      if (row) studentData = { ...row, marks_data: JSON.parse(row.marks_data || '{}') };
    }

    const today = new Date().toISOString().split('T')[0];

    const contextText = `
You are an AI Academic Assistant for a college chatbot. Answer questions accurately using the provided data.
Today's date: ${today}

=== ADMIN ANNOUNCEMENTS ===
${announcements.map(a => `- [${a.priority.toUpperCase()}] ${a.title}: ${a.description} (Date: ${a.date})`).join('\n') || 'No announcements'}

=== CR ANNOUNCEMENTS (APPROVED) ===
${crAnn.map(a => `- ${a.title}: ${a.message} by ${a.cr_name} (Date: ${a.date})`).join('\n') || 'None'}

=== EXAM SCHEDULE ===
${exams.map(e => `- ${e.subject}: ${e.exam_date} at ${e.time}, Venue: ${e.venue}`).join('\n') || 'No exams scheduled'}

=== ASSIGNMENTS ===
${assignments.map(a => `- ${a.subject}: ${a.description} (Deadline: ${a.deadline})`).join('\n') || 'No assignments'}

=== UPCOMING EVENTS ===
${events.map(e => `- ${e.title} on ${e.date} at ${e.venue}: ${e.description}`).join('\n') || 'No events'}

${studentData ? `
=== YOUR STUDENT PROFILE (${student_id}) ===
Name: ${studentData.name}
Department: ${studentData.department}
Semester: ${studentData.semester}
CGPA: ${studentData.cgpa}
Class Rank: #${studentData.rank}
Attendance: ${studentData.attendance}%
Fee Status: ${studentData.fee_status}
Subject Marks: ${Object.entries(studentData.marks_data).map(([s,m]) => `${s}: ${m}`).join(', ')}
` : userRole !== 'student' ? '' : '\n=== STUDENT PROFILE ===\nNot found in matrix. Please contact admin.'}

INSTRUCTIONS:
- Answer concisely and accurately using ONLY the data above.
- If asked about specific exam, assignment, or announcement, provide full details.
- If information is not available, say "Information not updated yet. Please check with your admin."
- For student-specific queries (attendance, marks, rank, fee), use the student profile data.
- Format dates clearly (e.g., "December 18, 2024").
- Be friendly and helpful. Use bullet points for lists.
- Do not make up information not present in the data.
`;

    try {
      let responseText = '';

      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const chatHistory = (history || []).map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }));

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: contextText }] },
            { role: 'model', parts: [{ text: 'Understood. I am the Academic FAQ Chatbot. I will answer questions based on the provided academic data.' }] },
            ...chatHistory
          ]
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
      } else {
        // Fallback NLP without API key
        responseText = generateLocalResponse(message.toLowerCase(), { announcements, crAnn, exams, assignments, events, studentData });
      }

      // Log to DB
      db.prepare("INSERT INTO chatbot_logs (user_id, student_id, query, response, intent) VALUES (?,?,?,?,?)").run(req.user.id, student_id || null, message, responseText, detectIntent(message));

      res.json({ response: responseText });
    } catch (err) {
      console.error('Chatbot error:', err.message);
      const fallback = generateLocalResponse(message.toLowerCase(), { announcements, crAnn, exams, assignments, events, studentData });
      res.json({ response: fallback });
    }
  });

  // Get chat history
  router.get('/history', authenticate, (req, res) => {
    const logs = req.user.role === 'admin'
      ? db.prepare("SELECT * FROM chatbot_logs ORDER BY created_at DESC LIMIT 100").all()
      : db.prepare("SELECT * FROM chatbot_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 50").all(req.user.id);
    res.json(logs);
  });

  return router;
};

function detectIntent(msg) {
  msg = msg.toLowerCase();
  if (msg.includes('exam') || msg.includes('test') || msg.includes('schedule')) return 'exam_query';
  if (msg.includes('assignment') || msg.includes('homework') || msg.includes('deadline')) return 'assignment_query';
  if (msg.includes('attendance') || msg.includes('present')) return 'attendance_query';
  if (msg.includes('fee') || msg.includes('payment')) return 'fee_query';
  if (msg.includes('rank') || msg.includes('cgpa') || msg.includes('marks') || msg.includes('score')) return 'marks_query';
  if (msg.includes('announcement') || msg.includes('notice')) return 'announcement_query';
  if (msg.includes('event') || msg.includes('fest') || msg.includes('placement')) return 'event_query';
  return 'general';
}

function generateLocalResponse(msg, { announcements, crAnn, exams, assignments, events, studentData }) {
  // Exam queries
  if (msg.includes('exam') || msg.includes('schedule') || msg.includes('test')) {
    const subjectMatch = exams.find(e =>
      msg.includes(e.subject.toLowerCase()) ||
      e.subject.toLowerCase().split(' ').some(w => w.length > 3 && msg.includes(w.toLowerCase()))
    );
    if (subjectMatch) {
      return `📚 **${subjectMatch.subject}** Exam:\n- 📅 Date: ${subjectMatch.exam_date}\n- ⏰ Time: ${subjectMatch.time}\n- 📍 Venue: ${subjectMatch.venue}`;
    }
    if (exams.length === 0) return "Information not updated yet. Please check with your admin.";
    return `📅 **Upcoming Exams:**\n${exams.map(e => `• **${e.subject}** — ${e.exam_date} | ${e.time} | ${e.venue}`).join('\n')}`;
  }

  // Assignment queries
  if (msg.includes('assignment') || msg.includes('homework') || msg.includes('deadline') || msg.includes('pending')) {
    if (assignments.length === 0) return "No assignments found. Please check with your admin.";
    return `📝 **Pending Assignments:**\n${assignments.map(a => `• **${a.subject}** — Due: ${a.deadline}\n  ${a.description}`).join('\n\n')}`;
  }

  // Attendance
  if (msg.includes('attendance') || msg.includes('present')) {
    if (studentData) return `📊 Your attendance is **${studentData.attendance}%**.${studentData.attendance < 75 ? '\n⚠️ Warning: Below minimum 75% requirement!' : '\n✅ Good standing!'}`;
    return "Please log in with your Student ID to view attendance.";
  }

  // Fee
  if (msg.includes('fee') || msg.includes('payment') || msg.includes('due')) {
    if (studentData) {
      const feeMap = { paid: '✅ Paid', pending: '⚠️ Pending', partial: '🔶 Partially Paid' };
      return `💳 Your fee status: **${feeMap[studentData.fee_status] || studentData.fee_status}**.${studentData.fee_status !== 'paid' ? '\nPlease clear dues at the accounts office.' : ''}`;
    }
    return "Please log in with your Student ID to view fee status.";
  }

  // Marks/CGPA/Rank
  if (msg.includes('mark') || msg.includes('score') || msg.includes('cgpa') || msg.includes('gpa') || msg.includes('rank')) {
    if (studentData) {
      const marks = studentData.marks_data;
      const markStr = Object.entries(marks).map(([s, m]) => `• ${s}: **${m}**`).join('\n');
      return `📊 **Your Academic Performance:**\n${markStr}\n\n🏆 CGPA: **${studentData.cgpa}**\n📈 Class Rank: **#${studentData.rank}**`;
    }
    return "Please log in with your Student ID to view marks.";
  }

  // Announcements
  if (msg.includes('announcement') || msg.includes('notice') || msg.includes('news')) {
    const all = [...announcements, ...crAnn];
    if (all.length === 0) return "No announcements at this time.";
    return `📢 **Latest Announcements:**\n${all.slice(0, 3).map(a => `• **${a.title}** (${a.date || a.created_at?.split('T')[0]})\n  ${a.description || a.message}`).join('\n\n')}`;
  }

  // Events
  if (msg.includes('event') || msg.includes('fest') || msg.includes('placement') || msg.includes('happening')) {
    if (events.length === 0) return "No upcoming events found.";
    return `🎉 **Upcoming Events:**\n${events.map(e => `• **${e.title}** on ${e.date}\n  📍 ${e.venue}: ${e.description}`).join('\n\n')}`;
  }

  // Greetings
  if (msg.match(/^(hi|hello|hey|good\s+(morning|afternoon|evening))/)) {
    return `👋 Hello! I'm your Academic FAQ Assistant. I can help you with:\n\n• 📅 Exam schedules\n• 📝 Assignment deadlines\n• 📊 Your marks and attendance\n• 💳 Fee status\n• 📢 Announcements\n• 🎉 Events\n\nWhat would you like to know?`;
  }

  return `I'm not sure about that. I can help you with:\n• Exam schedules\n• Assignment deadlines\n• Your marks/attendance/fee status\n• Announcements and events\n\nTry asking something like "When is the DBMS exam?" or "What are pending assignments?"`;
}
