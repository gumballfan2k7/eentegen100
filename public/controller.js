/**
 * Een Tegen 100 - Controller Logic
 * Handles all UI interactions and game management
 */

// UI Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const startGameBtn = document.getElementById('startGameBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const endGameBtn = document.getElementById('endGameBtn');
const questionDisplay = document.getElementById('questionDisplay');
const answerGrid = document.getElementById('answerGrid');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const eliminatedInput = document.getElementById('eliminatedInput');
const answerFeedback = document.getElementById('answerFeedback');
const pollBtn = document.getElementById('pollBtn');
const askBtn = document.getElementById('askBtn');
const trustBtn = document.getElementById('trustBtn');
const lifelineOutput = document.getElementById('lifelineOutput');
const muteBtn = document.getElementById('muteBtn');
const statusText = document.getElementById('statusText');
const mobAlive = document.getElementById('mobAlive');
const eliminated = document.getElementById('eliminated');
const currentPrize = document.getElementById('currentPrize');
const totalPrize = document.getElementById('totalPrize');

// File upload handling
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    uploadBtn.disabled = false;
});

fileInput.addEventListener('change', () => {
    uploadBtn.disabled = fileInput.files.length === 0;
});

uploadBtn.addEventListener('click', async () => {
    if (fileInput.files.length === 0) return;

    uploadBtn.disabled = true;
    uploadStatus.textContent = '⏳ Parsing Excel file...';
    uploadStatus.className = 'status-message loading';

    try {
        const questions = await parseExcelFile(fileInput.files[0]);
        if (questions.length === 0) {
            throw new Error('No valid questions found in file');
        }
        gameEngine.state.questions = questions;
        gameEngine.saveState();
        startGameBtn.disabled = false;
        uploadStatus.textContent = `✅ Loaded ${questions.length} questions`;
        uploadStatus.className = 'status-message success';
    } catch (error) {
        uploadStatus.textContent = `❌ Error: ${error.message}`;
        uploadStatus.className = 'status-message error';
    } finally {
        uploadBtn.disabled = true;
    }
});

// Game control buttons
startGameBtn.addEventListener('click', () => {
    if (gameEngine.state.questions.length === 0) {
        alert('Please upload questions first');
        return;
    }
    gameEngine.startGame(gameEngine.state.questions);
    startGameBtn.disabled = true;
    nextQuestionBtn.disabled = false;
    endGameBtn.disabled = false;
    gameEngine.loadQuestion(0);
    updateUI();
});

nextQuestionBtn.addEventListener('click', () => {
    const nextIndex = gameEngine.state.currentQuestionIndex + 1;
    if (nextIndex < gameEngine.state.questions.length) {
        gameEngine.loadQuestion(nextIndex);
        updateUI();
    } else {
        alert('No more questions!');
    }
});

endGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to end the game?')) {
        gameEngine.endGame();
        startGameBtn.disabled = false;
        nextQuestionBtn.disabled = true;
        endGameBtn.disabled = true;
        updateUI();
    }
});

// Answer selection
let selectedAnswer = null;
answerGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.answer-btn');
    if (btn) {
        answerGrid.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAnswer = btn.dataset.answer;
        gameEngine.selectAnswer(selectedAnswer);
        submitAnswerBtn.disabled = false;
    }
});

submitAnswerBtn.addEventListener('click', () => {
    if (!selectedAnswer) return;
    
    const eliminated_count = parseInt(eliminatedInput.value) || 0;
    const question = gameEngine.getCurrentQuestion();
    const isCorrect = selectedAnswer === (question.correctAnswer || 'A');
    
    gameEngine.submitAnswer(isCorrect, eliminated_count);
    updateUI();
    
    setTimeout(() => {
        answerFeedback.textContent = isCorrect ? 
            `✅ Correct! ${eliminated_count} eliminated.` : 
            '❌ Wrong! Game Over!';
        answerFeedback.className = 'status-message ' + (isCorrect ? 'success' : 'error');
    }, 100);
    
    if (!isCorrect) {
        nextQuestionBtn.disabled = true;
        endGameBtn.disabled = true;
    }
});

// Lifelines
pollBtn.addEventListener('click', () => {
    if (gameEngine.useLifeline('poll')) {
        displayPollResults();
        pollBtn.disabled = true;
    }
});

askBtn.addEventListener('click', () => {
    if (gameEngine.useLifeline('ask')) {
        displayAskResults();
        askBtn.disabled = true;
    }
});

trustBtn.addEventListener('click', () => {
    if (gameEngine.useLifeline('trust')) {
        const question = gameEngine.getCurrentQuestion();
        const pollData = gameEngine.state.mobEliminationData.pollAnswers;
        if (Object.keys(pollData).length === 0) {
            gameEngine.generatePollData(question);
        }
        const trusted = Object.keys(pollData).reduce((a, b) => 
            pollData[a] > pollData[b] ? a : b
        );
        answerGrid.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        answerGrid.querySelector(`[data-answer="${trusted}"]`).classList.add('selected');
        selectedAnswer = trusted;
        lifelineOutput.innerHTML = `<div class="lifeline-result">🤝 Trusting mob choice: <strong>${trusted}</strong></div>`;
        trustBtn.disabled = true;
    }
});

function displayPollResults() {
    const pollData = gameEngine.state.mobEliminationData.pollAnswers;
    let html = '<div class="poll-results"><h4>Poll the Mob Results</h4>';
    ['A', 'B', 'C', 'D'].forEach(answer => {
        const pct = pollData[answer] || 0;
        html += `<div class="poll-bar">
            <span>${answer}: ${pct}%</span>
            <div class="bar-fill" style="width: ${pct}%"></div>
        </div>`;
    });
    html += '</div>';
    lifelineOutput.innerHTML = html;
}

function displayAskResults() {
    const members = gameEngine.state.mobEliminationData.askedMembers;
    let html = '<div class="ask-results"><h4>Ask the Mob Results</h4>';
    members.forEach((member, i) => {
        const label = member.isCorrect ? '✓ Correct Member' : 'Random Member';
        html += `<div class="member-advice">${label}: <strong>${member.answer}</strong></div>`;
    });
    html += '</div>';
    lifelineOutput.innerHTML = html;
}

// Audio toggle
muteBtn.addEventListener('click', () => {
    const isMuted = toggleAudioMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        muteBtn.click();
    }
});

// Update UI
function updateUI() {
    const state = gameEngine.getState();
    const question = gameEngine.getCurrentQuestion();

    // Update question display
    if (question) {
        questionDisplay.innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="question-meta">
                <span class="category">${question.category || 'General'}</span>
                <span class="difficulty">${'⭐'.repeat(question.difficulty || 1)}</span>
            </div>
        `;
    } else {
        questionDisplay.innerHTML = '<p class="no-question">No question loaded</p>';
    }

    // Update statistics
    const mobStatus = gameEngine.getMobStatus();
    mobAlive.textContent = mobStatus.alive;
    eliminated.textContent = mobStatus.eliminated;
    currentPrize.textContent = `€${state.currentPrize.toLocaleString()}`;
    totalPrize.textContent = `€${state.prizePool.toLocaleString()}`;

    // Update lifeline buttons
    pollBtn.disabled = state.usedLifelines.poll || !state.gameActive;
    askBtn.disabled = state.usedLifelines.ask || !state.gameActive;
    trustBtn.disabled = state.usedLifelines.trust || !state.gameActive;

    // Update status
    statusText.textContent = state.gameActive ? 'Game Active' : 'Ready';

    // Update answer feedback visibility
    if (!state.gameActive && state.revealedCorrectAnswer) {
        setTimeout(() => {
            answerGrid.querySelectorAll('.answer-btn').forEach(btn => {
                if (btn.dataset.answer === state.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn.dataset.answer === state.selectedAnswer) {
                    btn.classList.add('incorrect');
                }
            });
        }, 100);
    }
}

// Listen to game state changes
gameEngine.onStateChange((eventType, state) => {
    if (eventType === 'stateChanged') {
        updateUI();
    }
});

// Initial UI update
updateUI();

uploadLabel.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadLabel.style.background = 'rgba(255, 107, 0, 0.1)';
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
    }
});

// Upload handler
uploadBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) {
        uploadStatus.textContent = '❌ Please select a file';
        uploadStatus.style.color = '#FF3333';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        uploadStatus.textContent = '⏳ Uploading...';
        uploadStatus.style.color = '#FFB347';

        const response = await fetch(`${API_BASE}/api/upload-questions`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            questions = result.questions;
            uploadStatus.textContent = `✅ Loaded ${result.count} questions`;
            uploadStatus.style.color = '#00CC44';
            startGameBtn.disabled = false;
        } else {
            uploadStatus.textContent = `❌ ${result.error}`;
            uploadStatus.style.color = '#FF3333';
        }
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = '❌ Upload failed';
        uploadStatus.style.color = '#FF3333';
    }
});

// Game control handlers
startGameBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/controller/start-game`, { method: 'POST' });
        if (response.ok) {
            startGameBtn.disabled = true;
            nextQuestionBtn.disabled = false;
            endGameBtn.disabled = false;
            currentQuestionIndex = 0;
            loadQuestion();
        }
    } catch (error) {
        console.error('Start game error:', error);
    }
});

nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        questionContent.innerHTML = '<p>✅ All questions used!</p>';
        nextQuestionBtn.disabled = true;
    }
});

endGameBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/controller/end-game`, { method: 'POST' });
        if (response.ok) {
            startGameBtn.disabled = false;
            nextQuestionBtn.disabled = true;
            endGameBtn.disabled = true;
            questionContent.innerHTML = '<p>Game Ended</p>';
            selectedAnswer = null;
        }
    } catch (error) {
        console.error('End game error:', error);
    }
});

// Load and display question
async function loadQuestion() {
    try {
        const response = await fetch(`${API_BASE}/api/controller/load-question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionIndex: currentQuestionIndex })
        });

        const result = await response.json();
        if (response.ok) {
            const q = result.question;
            questionContent.innerHTML = `
                <div>
                    <p style="font-size: 1.2rem; margin-bottom: 20px;">Q${q.index + 1}: ${q.question}</p>
                    <div class="options">
                        <div class="option-item"><strong>A:</strong> ${q.options.A}</div>
                        <div class="option-item"><strong>B:</strong> ${q.options.B}</div>
                        <div class="option-item"><strong>C:</strong> ${q.options.C}</div>
                        <div class="option-item"><strong>D:</strong> ${q.options.D}</div>
                    </div>
                </div>
            `;
            submitCorrectBtn.disabled = false;
            selectedAnswer = null;
            resultMessage.textContent = '';
        }
    } catch (error) {
        console.error('Load question error:', error);
    }
}

// Answer selection
document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAnswer = btn.dataset.answer;
    });
});

// Submit answer
submitCorrectBtn.addEventListener('click', async () => {
    if (!selectedAnswer) {
        resultMessage.textContent = '❌ Select an answer first';
        resultMessage.classList.add('error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/controller/submit-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: selectedAnswer, isCorrect: true })
        });

        if (response.ok) {
            resultMessage.textContent = '✅ Answer recorded!';
            resultMessage.classList.remove('error');
            resultMessage.classList.add('success');
            setTimeout(() => {
                nextQuestionBtn.disabled = false;
            }, 500);
        }
    } catch (error) {
        console.error('Submit error:', error);
        resultMessage.textContent = '❌ Failed to submit';
        resultMessage.classList.add('error');
    }
});

// Lifeline handlers
document.querySelectorAll('.lifeline-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const lifeline = btn.dataset.lifeline;
        try {
            const response = await fetch(`${API_BASE}/api/controller/use-lifeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lifeline })
            });

            if (response.ok) {
                btn.disabled = true;
                btn.querySelector('.lifeline-status').textContent = 'Used';
            }
        } catch (error) {
            console.error('Lifeline error:', error);
        }
    });
});

// Update stats (mock implementation)
setInterval(() => {
    document.getElementById('eliminatedCount').textContent = Math.floor(Math.random() * 100);
    document.getElementById('prizePool').textContent = '€' + (Math.floor(Math.random() * 100000)).toLocaleString();
}, 2000);
