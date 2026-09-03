const express = require('express');
const http = require('http');
const multer = require('multer');
const XLSX = require('xlsx');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ storage: multer.memoryStorage() });
let questions = [];

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((c) => {
    if (c.readyState === c.OPEN) c.send(data);
  });
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    questions = json;
    broadcast({ type: 'questions', questions });
    return res.json({ ok: true, count: questions.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to parse XLSX' });
  }
});

app.get('/api/questions', (req, res) => res.json({ questions }));

app.post('/api/control', (req, res) => {
  const msg = { type: 'control', payload: req.body };
  broadcast(msg);
  res.json({ ok: true });
});

wss.on('connection', (ws) => {
  // send current state
  ws.send(JSON.stringify({ type: 'questions', questions }));
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      // broadcast to all
      broadcast(msg);
    } catch (e) {
      console.error('invalid ws msg', e);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
