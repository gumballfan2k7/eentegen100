import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
expressWs(app);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
// Serve audio and graphics from repo root so public pages can reference them
app.use('/audio', express.static(join(__dirname, 'audio')));
app.use('/graphics', express.static(join(__dirname, 'graphics')));
// Serve background.png directly
app.get('/background.png', (req, res) => res.sendFile(join(__dirname, 'background.png')));

const upload = multer({ dest: 'uploads/' });

let gameState = {
  currentQuestion: null,
  questions: [],
  contestants: Array(100).fill(null).map((_, i) => ({ id: i + 1, eliminated: false })),
  prizePool: 0,
  currentPrize: 500,
  eliminatedCount: 0,
  gameActive: false,
  currentCategory: null,
  lifelinesUsed: {
    pollTheMob: false,
    askTheMob: false,
    trustTheMob: false
  }
};

const clients = new Set();

// Broadcast game state to all connected spectators
function broadcastGameState() {
  const message = JSON.stringify({
    type: 'gameStateUpdate',
    data: gameState
  });
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
}

// WebSocket endpoint for spectators
app.ws('/ws/spectator', (ws, req) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to spectator feed' }));
  broadcastGameState();
  
  ws.on('close', () => {
    clients.delete(ws);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

// Upload and parse XLSX questions
app.post('/api/upload-questions', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const questions = data.map((row, index) => ({
      id: index + 1,
      question: row['Question'] || '',
      options: {
        A: row['OptionA'] || '',
        B: row['OptionB'] || '',
        C: row['OptionC'] || '',
        D: row['OptionD'] || ''
      },
      correct: row['CorrectAnswer']?.toUpperCase() || 'A',
      category: row['Category'] || 'Algemeen',
      difficulty: parseInt(row['Difficulty']) || 1
    }));

    gameState.questions = questions;
    gameState.currentCategory = 'Uploaded Category';
    
    fs.unlinkSync(req.file.path);
    res.json({ 
      success: true, 
      count: questions.length,
      questions: questions.slice(0, 3)
    });
  } catch (error) {
    console.error('Error parsing XLSX:', error);
    res.status(500).json({ error: 'Failed to parse file' });
  }
});

// Controller API endpoints
app.post('/api/controller/start-game', (req, res) => {
  gameState.gameActive = true;
  gameState.eliminatedCount = 0;
  gameState.contestants = Array(100).fill(null).map((_, i) => ({ id: i + 1, eliminated: false }));
  gameState.prizePool = 0;
  gameState.lifelinesUsed = { pollTheMob: false, askTheMob: false, trustTheMob: false };
  broadcastGameState();
  res.json({ success: true });
});

app.post('/api/controller/load-question', (req, res) => {
  const { questionIndex } = req.body;
  if (questionIndex >= 0 && questionIndex < gameState.questions.length) {
    gameState.currentQuestion = { ...gameState.questions[questionIndex], index: questionIndex };
    broadcastGameState();
    res.json({ success: true, question: gameState.currentQuestion });
  } else {
    res.status(400).json({ error: 'Invalid question index' });
  }
});

app.post('/api/controller/submit-answer', (req, res) => {
  const { answer, isCorrect } = req.body;
  
  if (isCorrect) {
    const eliminated = gameState.contestants.filter(c => !c.eliminated).length;
    gameState.eliminatedCount++;
    gameState.prizePool += gameState.currentPrize * (100 - gameState.eliminatedCount);
    gameState.currentPrize = Math.min(gameState.currentPrize * 2, 10000);
    
    gameState.contestants.forEach((c, i) => {
      if (Math.random() < 0.01 * gameState.eliminatedCount) {
        c.eliminated = true;
      }
    });
  } else {
    gameState.gameActive = false;
  }
  
  broadcastGameState();
  res.json({ success: true, gameState });
});

app.post('/api/controller/use-lifeline', (req, res) => {
  const { lifeline } = req.body;
  gameState.lifelinesUsed[lifeline] = true;
  broadcastGameState();
  res.json({ success: true });
});

app.post('/api/controller/end-game', (req, res) => {
  gameState.gameActive = false;
  gameState.currentQuestion = null;
  broadcastGameState();
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Een Tegen 100 Server running on http://localhost:${PORT}`);
});
