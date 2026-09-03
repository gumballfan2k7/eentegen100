const API_BASE = 'http://localhost:3000';
let selectedAnswer = null;
let currentQuestionIndex = 0;
let questions = [];

// UI Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const startGameBtn = document.getElementById('startGameBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const endGameBtn = document.getElementById('endGameBtn');
const submitCorrectBtn = document.getElementById('submitCorrectBtn');
const questionContent = document.getElementById('questionContent');
const connectionStatus = document.getElementById('connectionStatus');
const resultMessage = document.getElementById('resultMessage');

// Set up drag and drop for file upload
const uploadLabel = document.querySelector('.upload-label');

uploadLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadLabel.style.background = 'rgba(255, 107, 0, 0.3)';
});

uploadLabel.addEventListener('dragleave', () => {
    uploadLabel.style.background = 'rgba(255, 107, 0, 0.1)';
});

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
