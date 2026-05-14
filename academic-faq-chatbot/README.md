# 🎓 AcadBot — Academic FAQ Chatbot System

> A full-stack AI-powered Academic FAQ Chatbot System built as a Final Year Capstone Project.
> Features role-based access (Admin, CR, Student), AI chatbot, student matrix, and comprehensive academic management.

---

## 🚀 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React + Vite + Tailwind CSS              |
| Backend     | Node.js + Express.js                     |
| Database    | SQLite (via better-sqlite3)              |
| Auth        | JWT (JSON Web Tokens) + bcryptjs         |
| AI Chatbot  | Google Gemini API (+ local NLP fallback) |
| Charts      | Recharts                                 |
| CSV Parsing | csv-parser (backend), PapaParse (frontend)|

---

## 📁 Project Structure

```
academic-faq-chatbot/
├── backend/
│   ├── db/
│   │   └── init.js            # DB initialization + seed data
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Login/auth routes
│   │   ├── announcements.js   # Admin + CR announcements
│   │   ├── academic.js        # Exams, Assignments, Events
│   │   ├── matrix.js          # Student matrix + CSV upload
│   │   ├── chatbot.js         # AI chatbot (Gemini + fallback)
│   │   └── analytics.js       # Admin analytics
│   ├── uploads/               # Temp CSV upload storage
│   ├── .env                   # Environment variables
│   ├── server.js              # Main Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SidebarLayout.jsx   # Shared sidebar layout
│   │   │   ├── Modal.jsx           # Reusable modal
│   │   │   └── StatCard.jsx        # Dashboard stat cards
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx     # Auth state + JWT
│   │   │   └── ThemeContext.jsx    # Dark/light mode
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Role-based login
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminHome.jsx
│   │   │   │   ├── AnnouncementsMgmt.jsx
│   │   │   │   ├── ExamsMgmt.jsx
│   │   │   │   ├── AssignmentsMgmt.jsx
│   │   │   │   ├── EventsMgmt.jsx
│   │   │   │   ├── StudentMatrix.jsx
│   │   │   │   ├── CRApprovals.jsx
│   │   │   │   └── Analytics.jsx
│   │   │   ├── cr/
│   │   │   │   ├── CRDashboard.jsx
│   │   │   │   ├── CRHome.jsx
│   │   │   │   └── CRAnnouncements.jsx
│   │   │   └── student/
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── StudentHome.jsx
│   │   │       ├── StudentAnnouncements.jsx
│   │   │       ├── StudentExams.jsx
│   │   │       ├── StudentAssignments.jsx
│   │   │       ├── StudentEvents.jsx
│   │   │       ├── StudentChatbot.jsx
│   │   │       └── StudentProfile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── sample_students.csv        # Sample CSV for matrix upload
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+ (https://nodejs.org)
- npm v8+
- VS Code (recommended)

---

### Step 1: Clone / Extract the Project

```bash
cd academic-faq-chatbot
```

---

### Step 2: Setup the Backend

```bash
cd backend
npm install
```

**Configure `.env`** (already created, update if needed):
```env
PORT=5000
JWT_SECRET=academic_faq_super_secret_jwt_key_2024
GEMINI_API_KEY=your_gemini_api_key_here   ← Add your key here
NODE_ENV=development
```

> **Get a free Gemini API key:** https://makersuite.google.com/app/apikey
> If no key is provided, the chatbot uses a built-in NLP fallback — still fully functional!

**Start the backend:**
```bash
npm run dev
# OR: npm start
```

The backend will start on **http://localhost:5000** and auto-create the SQLite database with demo data.

---

### Step 3: Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

---

### Step 4: Open in Browser

Visit: **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role    | Username     | Password     |
|---------|-------------|--------------|
| Admin   | `admin`     | `admin123`   |
| CR      | `cr001`     | `cr123`      |
| Student | `CS2021001` | `student123` |
| Student | `CS2021002` | `student123` |
| Student | `CS2021003` | `student123` |
| Student | `CS2021004` | `student123` |
| Student | `CS2021005` | `student123` |

---

## 🌟 Features by Role

### 👨‍💼 Admin Dashboard
- ✅ Create/Edit/Delete Announcements (with priority)
- ✅ Manage Exam Schedules (subject, date, time, venue)
- ✅ Manage Assignments (with deadlines)
- ✅ Manage Events
- ✅ Student Matrix — CSV upload, dynamic columns, auto-rank
- ✅ CR Announcement Approval Panel
- ✅ Analytics Dashboard with Recharts (attendance, CGPA, fee status)
- ✅ Top Rankers display

### 👥 CR Dashboard
- ✅ Create announcements (submitted for admin approval)
- ✅ View approval status (Pending / Approved / Rejected)
- ✅ Admin feedback/notes visible

### 🎓 Student Dashboard
- ✅ Personal academic matrix (marks, attendance, CGPA, rank)
- ✅ Admin + Approved CR Announcements
- ✅ Exam schedule with countdown
- ✅ Assignments with deadline tracking
- ✅ Upcoming events
- ✅ AI Chatbot (Gemini API + local NLP fallback)
- ✅ Student profile page

---

## 📊 CSV Upload Format

Use the `sample_students.csv` as a template. Required columns:

| Column      | Required | Description             |
|-------------|----------|-------------------------|
| Student ID  | ✅       | Unique student ID       |
| Name        | ✅       | Full name               |
| Department  | Optional | e.g. Computer Science   |
| Semester    | Optional | e.g. 6                  |
| CGPA        | Optional | e.g. 8.5                |
| Attendance  | Optional | Percentage, e.g. 87     |
| Fee Status  | Optional | paid / pending / partial|
| Any Subject | Optional | Auto-detected as marks  |

Any extra column that isn't a known field is auto-detected as a subject mark!

---

## 🤖 Chatbot Examples

| Query                              | Response                          |
|------------------------------------|-----------------------------------|
| "When is the DBMS exam?"           | Exact date, time, and venue       |
| "What assignments are pending?"    | List with deadlines               |
| "What is my attendance?"           | Personal attendance percentage    |
| "What is my fee status?"           | Paid / Pending / Partial          |
| "What is my class rank?"           | Rank + CGPA + all subject marks   |
| "What announcements are there?"    | Latest announcements              |
| "Show upcoming events"             | All events with dates & venues    |

---

## 🔐 Security Features
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens with 24h expiry
- Role-based route protection (frontend + backend)
- Protected API endpoints with middleware
- Input validation on all forms

---

## 🎨 UI Features
- Dark / Light mode toggle
- Responsive (mobile + tablet + desktop)
- Animated transitions
- Toast notifications
- Loading states
- Priority-colored announcement cards
- Progress bars for marks
- Countdown timers for exams/assignments

---

## 📡 API Endpoints

```
POST   /api/auth/login              Login
GET    /api/auth/me                 Get current user

GET    /api/announcements           Get all admin announcements
POST   /api/announcements           Create announcement (Admin)
PUT    /api/announcements/:id       Update announcement (Admin)
DELETE /api/announcements/:id       Delete announcement (Admin)
GET    /api/announcements/cr        Get CR announcements
POST   /api/announcements/cr        Submit CR announcement
PUT    /api/announcements/cr/:id/status  Approve/Reject CR announcement

GET    /api/exams                   Get all exams
POST   /api/exams                   Add exam (Admin)
PUT    /api/exams/:id               Update exam (Admin)
DELETE /api/exams/:id               Delete exam (Admin)

GET    /api/assignments             Get all assignments
POST   /api/assignments             Add assignment (Admin)
PUT    /api/assignments/:id         Update assignment (Admin)
DELETE /api/assignments/:id         Delete assignment (Admin)

GET    /api/events                  Get all events
POST   /api/events                  Add event (Admin)
PUT    /api/events/:id              Update event (Admin)
DELETE /api/events/:id              Delete event (Admin)

GET    /api/matrix                  Get student data (role-filtered)
POST   /api/matrix/upload           Upload CSV (Admin)
POST   /api/matrix                  Add/update student (Admin)
DELETE /api/matrix/:student_id      Delete student (Admin)

POST   /api/chatbot/chat            Send chatbot message
GET    /api/chatbot/history         Get chat logs

GET    /api/analytics               Admin analytics data
```

---

## 🛠️ VS Code Tips

1. Install extensions: **ESLint**, **Prettier**, **Tailwind CSS IntelliSense**
2. Run both terminals side by side using VS Code's split terminal
3. The SQLite database `academic.db` is auto-created in `backend/` on first run

---

## 📝 License

This project was created as a Final Year B.Tech Capstone Project. Free to use for educational purposes.

---

**Made with ❤️ for Final Year Presentation 2024**
