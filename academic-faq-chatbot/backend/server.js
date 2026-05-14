require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function start() {
  const db = await initDB();

  app.use('/api/auth', require('./routes/auth')(db));
  app.use('/api/announcements', require('./routes/announcements')(db));
  app.use('/api', require('./routes/academic')(db));
  app.use('/api/matrix', require('./routes/matrix')(db));
  app.use('/api/chatbot', require('./routes/chatbot')(db));
  app.use('/api/analytics', require('./routes/analytics')(db));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    console.log(`\n🚀 AcadBot Backend running on http://localhost:${PORT}`);
    console.log(`\n📋 Demo Credentials:`);
    console.log(`   Admin   → admin / admin123`);
    console.log(`   CR      → cr001 / cr123`);
    console.log(`   Student → CS2021001 to CS2021005 / student123\n`);
  });
}

start().catch(console.error);
