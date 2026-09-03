const WS_URL = 'ws://localhost:3000/ws/spectator';
let ws = null;
let gameState = null;
let isConnected = false;

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const roundNumber = document.getElementById('roundNumber');
const currentPrize = document.getElementById('currentPrize');
const eliminatedCount = document.getElementById('eliminatedCount');
const remainingCount = document.getElementById('remainingCount');
const questionDisplay = document.getElementById('questionDisplay');
const mobGrid = document.getElementById('mobGrid');
const answersGrid = document.getElementById('answersGrid');

// Audio Elements
const correctAudio = document.getElementById('correctAudio');
const wrongAudio = document.getElementById('wrongAudio');
const eliminatedAudio = document.getElementById('eliminatedAudio');
const lockInAudio = document.getElementById('lockInAudio');
const suspenseAudio = document.getElementById('suspenseAudio');

// Connect to WebSocket
function connectWebSocket() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('Connected to server');
        isConnected = true;
        updateConnectionStatus(true);
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            handleMessage(message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        updateConnectionStatus(false);
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        isConnected = false;
        updateConnectionStatus(false);
        setTimeout(connectWebSocket, 3000);
    };
}

// Handle incoming messages
function handleMessage(message) {
    if (message.type === 'gameStateUpdate') {
        gameState = message.data;
        updateDisplay();
    } else if (message.type === 'connected') {
        console.log(message.message);
    }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    const indicator = connectionStatus;
    if (connected) {
        indicator.classList.remove('offline', 'connecting');
        indicator.classList.add('online');
        indicator.textContent = '🟢 Online';
    } else {
        indicator.classList.remove('online', 'connecting');
        indicator.classList.add('offline');
        indicator.textContent = '🔴 Offline';
    }
}

// Update display with current game state
function updateDisplay() {
    if (!gameState) return;

    // Update header info
    roundNumber.textContent = `${gameState.eliminatedCount}/100`;
    currentPrize.textContent = '€' + gameState.currentPrize.toLocaleString();
    eliminatedCount.textContent = gameState.eliminatedCount;
    remainingCount.textContent = 100 - gameState.eliminatedCount;

    // Update question display
    if (gameState.currentQuestion) {
        const q = gameState.currentQuestion;
        questionDisplay.innerHTML = `<p>${q.question}</p>`;
        questionDisplay.classList.remove('placeholder');

        // Update answer options
        const options = ['A', 'B', 'C', 'D'];
        options.forEach((opt, index) => {
            const answerElement = answersGrid.children[index];
            answerElement.querySelector(`#option${opt}`).textContent = q.options[opt];
            answerElement.classList.remove('correct', 'incorrect');
            answerElement.dataset.option = opt;
        });

        playAudio(suspenseAudio);
    } else {
        questionDisplay.innerHTML = '<p class="placeholder">Waiting for question...</p>';
    }

    // Update mob grid
    updateMobDisplay();

    // Update lifelines
    updateLifelines();

    // Update prize ladder
    updatePrizeLadder();
}

// Update mob member display
function updateMobDisplay() {
    mobGrid.innerHTML = '';
    gameState.contestants.forEach((contestant, index) => {
        const member = document.createElement('div');
        member.className = 'mob-member' + (contestant.eliminated ? ' eliminated' : '');
        member.textContent = index + 1;
        member.title = `Contestant ${index + 1}`;
        mobGrid.appendChild(member);
    });
}

// Update lifeline indicators
function updateLifelines() {
    const lifelines = ['pollTheMob', 'askTheMob', 'trustTheMob'];
    const lifelineIds = ['lifeline-poll', 'lifeline-ask', 'lifeline-trust'];

    lifelines.forEach((lifeline, index) => {
        const element = document.getElementById(lifelineIds[index]);
        if (gameState.lifelinesUsed[lifeline]) {
            element.classList.add('used');
            element.classList.remove('active');
        } else {
            element.classList.add('active');
            element.classList.remove('used');
        }
    });
}

// Update prize ladder
function updatePrizeLadder() {
    const steps = document.querySelectorAll('.prize-step');
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (gameState.eliminatedCount >= index * 20) {
            step.classList.add('active');
        }
    });
}

// Play audio safely
function playAudio(audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.log('Audio play prevented:', err));
}

// Reveal correct answer
function revealCorrectAnswer(correctAnswer) {
    const options = ['A', 'B', 'C', 'D'];
    options.forEach((opt, index) => {
        const answerElement = answersGrid.children[index];
        if (opt === correctAnswer) {
            answerElement.classList.add('correct');
            playAudio(correctAudio);
        } else {
            answerElement.classList.add('incorrect');
        }
    });
}

// Initialize spectator view
function initializeSpectator() {
    connectWebSocket();

    // Initialize mob grid with placeholder
    for (let i = 0; i < 100; i++) {
        const member = document.createElement('div');
        member.className = 'mob-member';
        member.textContent = i + 1;
        member.title = `Contestant ${i + 1}`;
        mobGrid.appendChild(member);
    }

    // Initialize answer options
    const optionIds = ['A', 'B', 'C', 'D'];
    optionIds.forEach(id => {
        const elem = document.getElementById(`option${id}`);
        if (elem) elem.textContent = 'Waiting...';
    });
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSpectator);

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'R' to reveal answer (for testing)
    if (e.key.toLowerCase() === 'r' && gameState?.currentQuestion) {
        revealCorrectAnswer(gameState.currentQuestion.correct);
    }
    // Press 'M' to toggle mute
    if (e.key.toLowerCase() === 'm') {
        correctAudio.muted = !correctAudio.muted;
    }
});
