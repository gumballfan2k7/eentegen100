/**
 * Een Tegen 100 - Shared Game Engine
 * Client-side game logic and state management
 * Uses localStorage for persistence and cross-window communication
 */

class GameEngine {
  constructor() {
    this.state = {
      gameActive: false,
      currentQuestionIndex: 0,
      questions: [],
      eliminatedCount: 0,
      prizePool: 0,
      currentPrize: 0,
      usedLifelines: {
        poll: false,
        ask: false,
        trust: false
      },
      selectedAnswer: null,
      correctAnswer: null,
      revealedCorrectAnswer: false,
      mobEliminationData: {
        pollAnswers: {},
        askedMembers: []
      }
    };
    
    this.prizeProgression = [
      500, 1000, 2000, 5000, 10000, 20000, 50000, 
      100000, 250000, 500000, 1000000
    ];
    
    this.loadState();
    this.setupStorageListener();
  }

  loadState() {
    const saved = localStorage.getItem('eentegen100_gamestate');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }

  saveState() {
    localStorage.setItem('eentegen100_gamestate', JSON.stringify(this.state));
    this.notifyListeners('stateChanged');
  }

  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'eentegen100_gamestate') {
        this.loadState();
        this.notifyListeners('stateChanged');
      }
    });
  }

  // Listener system for real-time updates
  listeners = [];
  
  onStateChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(eventType) {
    this.listeners.forEach(cb => cb(eventType, this.state));
  }

  // Game initialization
  startGame(questions) {
    this.state = {
      gameActive: true,
      currentQuestionIndex: 0,
      questions: questions,
      eliminatedCount: 0,
      prizePool: 0,
      currentPrize: 0,
      usedLifelines: {
        poll: false,
        ask: false,
        trust: false
      },
      selectedAnswer: null,
      correctAnswer: null,
      revealedCorrectAnswer: false,
      mobEliminationData: {
        pollAnswers: {},
        askedMembers: []
      }
    };
    this.saveState();
    playSound('bed_cue');
  }

  endGame() {
    this.state.gameActive = false;
    this.saveState();
    playSound('cha_ching');
  }

  getCurrentQuestion() {
    if (this.state.currentQuestionIndex >= this.state.questions.length) {
      return null;
    }
    return this.state.questions[this.state.currentQuestionIndex];
  }

  loadQuestion(index) {
    if (index >= 0 && index < this.state.questions.length) {
      this.state.currentQuestionIndex = index;
      this.state.selectedAnswer = null;
      this.state.correctAnswer = null;
      this.state.revealedCorrectAnswer = false;
      this.state.mobEliminationData = {
        pollAnswers: {},
        askedMembers: []
      };
      this.saveState();
      playSound('reveal_question');
    }
  }

  selectAnswer(answer) {
    this.state.selectedAnswer = answer;
    this.saveState();
  }

  submitAnswer(correct, eliminated) {
    const question = this.getCurrentQuestion();
    if (!question) return;

    this.state.correctAnswer = question.correctAnswer || 'A';
    this.state.revealedCorrectAnswer = true;

    if (correct) {
      playSound('correct_answer');
      const oldEliminated = this.state.eliminatedCount;
      this.state.eliminatedCount = Math.min(this.state.eliminatedCount + eliminated, 100);
      
      // Update prize based on eliminations
      const prizeIndex = Math.min(
        Math.floor(this.state.eliminatedCount / 10),
        this.prizeProgression.length - 1
      );
      this.state.currentPrize = this.prizeProgression[prizeIndex];
      this.state.prizePool += this.state.currentPrize;

      if (this.state.eliminatedCount === 100) {
        playSound('cha_ching');
      }
    } else {
      playSound('wrong_answer');
      this.state.gameActive = false;
    }

    this.saveState();
  }

  useLifeline(lifeline) {
    if (this.state.usedLifelines[lifeline]) {
      return false; // Already used
    }

    const question = this.getCurrentQuestion();
    if (!question) return false;

    playSound('use_lifeline');
    this.state.usedLifelines[lifeline] = true;

    if (lifeline === 'poll') {
      this.generatePollData(question);
    } else if (lifeline === 'ask') {
      this.generateAskData(question);
    }

    this.saveState();
    return true;
  }

  generatePollData(question) {
    const answers = ['A', 'B', 'C', 'D'];
    const correctIndex = answers.indexOf(question.correctAnswer || 'A');
    const randomPercentages = this.generateRandomPercentages(correctIndex);
    
    this.state.mobEliminationData.pollAnswers = {
      A: randomPercentages[0],
      B: randomPercentages[1],
      C: randomPercentages[2],
      D: randomPercentages[3]
    };
  }

  generateAskData(question) {
    const answers = ['A', 'B', 'C', 'D'];
    const correctAnswer = question.correctAnswer || 'A';
    const wrongAnswers = answers.filter(a => a !== correctAnswer);
    const randomWrongAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    
    this.state.mobEliminationData.askedMembers = [
      { answer: correctAnswer, isCorrect: true },
      { answer: randomWrongAnswer, isCorrect: false }
    ];
  }

  generateRandomPercentages(correctIndex) {
    let values = [0, 0, 0, 0];
    values[correctIndex] = Math.floor(Math.random() * 30) + 40; // 40-70% for correct
    
    let remaining = 100 - values[correctIndex];
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        values[i] = Math.floor(remaining * (Math.random() * 0.4 + 0.3));
        remaining -= values[i];
      }
    }
    
    // Distribute remainder randomly
    while (remaining > 0) {
      const idx = Math.floor(Math.random() * 4);
      if (idx !== correctIndex) {
        values[idx]++;
        remaining--;
      }
    }
    
    return values;
  }

  getMobStatus() {
    return {
      alive: 100 - this.state.eliminatedCount,
      eliminated: this.state.eliminatedCount,
      total: 100
    };
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state)); // Deep copy
  }

  resetGame() {
    this.state = {
      gameActive: false,
      currentQuestionIndex: 0,
      questions: [],
      eliminatedCount: 0,
      prizePool: 0,
      currentPrize: 0,
      usedLifelines: {
        poll: false,
        ask: false,
        trust: false
      },
      selectedAnswer: null,
      correctAnswer: null,
      revealedCorrectAnswer: false,
      mobEliminationData: {
        pollAnswers: {},
        askedMembers: []
      }
    };
    localStorage.removeItem('eentegen100_gamestate');
    this.notifyListeners('gameReset');
  }
}

// Audio management
function playSound(soundName) {
  try {
    const audio = new Audio(`../audio/${soundName}.mp3`);
    audio.volume = localStorage.getItem('eentegen100_muted') === 'true' ? 0 : 0.8;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (e) {
    console.error('Audio error:', e);
  }
}

function toggleAudioMute() {
  const isMuted = localStorage.getItem('eentegen100_muted') === 'true';
  localStorage.setItem('eentegen100_muted', !isMuted);
  return !isMuted;
}

// XLSX Parser using SheetJS CDN
async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const questions = jsonData.map(row => ({
          question: row.Question || row.question || '',
          options: [
            row.OptionA || row.optionA || row['Option A'] || '',
            row.OptionB || row.optionB || row['Option B'] || '',
            row.OptionC || row.optionC || row['Option C'] || '',
            row.OptionD || row.optionD || row['Option D'] || ''
          ],
          correctAnswer: (row.CorrectAnswer || row.correctAnswer || 'A').toUpperCase()[0],
          category: row.Category || row.category || 'General',
          difficulty: row.Difficulty || row.difficulty || 1
        })).filter(q => q.question && q.options.every(o => o));
        
        resolve(questions);
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Global instance
const gameEngine = new GameEngine();
