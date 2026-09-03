class EenTegenHonderdGame {
    constructor() {
        this.people = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            alive: true,
            answered: false,
        }));
        
        this.gameState = {
            isRunning: false,
            currentQuestion: 1,
            totalQuestions: 10,
            lives: 3,
            prize: 500,
            selectedAnswer: null,
        };

        this.currentQuestion = {
            text: '',
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: null,
        };

        this.prizeThresholds = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000];

        this.initializeEventListeners();
        this.renderPeopleGrid();
    }

    initializeEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('eliminateBtn').addEventListener('click', () => this.eliminateWrongAnswers());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('loadQuestionBtn').addEventListener('click', () => this.loadQuestion());
        document.getElementById('submitAnswerBtn').addEventListener('click', () => this.submitAnswer());

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectOption(btn.dataset.option));
        });
    }

    renderPeopleGrid() {
        const grid = document.getElementById('peopleGrid');
        grid.innerHTML = '';

        this.people.forEach(person => {
            const personEl = document.createElement('div');
            personEl.className = 'person';
            
            if (person.alive) {
                personEl.textContent = person.id;
                personEl.classList.add('alive');
            } else {
                personEl.textContent = '✗';
                personEl.classList.add('eliminated');
            }

            personEl.addEventListener('click', () => this.togglePerson(person.id));
            grid.appendChild(personEl);
        });

        this.updatePeopleStats();
    }

    togglePerson(personId) {
        const person = this.people.find(p => p.id === personId);
        if (person && this.gameState.isRunning) {
            person.alive = !person.alive;
            this.renderPeopleGrid();
        }
    }

    updatePeopleStats() {
        const active = this.people.filter(p => p.alive).length;
        const eliminated = 100 - active;
        
        document.getElementById('activePeople').textContent = active;
        document.getElementById('eliminatedPeople').textContent = eliminated;
    }

    startGame() {
        if (!this.currentQuestion.text) {
            alert('Please load a question first!');
            return;
        }

        this.gameState.isRunning = true;
        this.gameState.currentQuestion = 1;
        this.gameState.lives = 3;
        this.gameState.prize = this.prizeThresholds[0];
        this.people = this.people.map(p => ({ ...p, alive: true, answered: false }));

        this.updateUI();
        this.renderPeopleGrid();

        document.getElementById('startBtn').disabled = true;
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('eliminateBtn').disabled = false;
        document.getElementById('submitAnswerBtn').disabled = false;
    }

    loadQuestion() {
        const text = document.getElementById('questionInput').value;
        const optionA = document.getElementById('optionA').value;
        const optionB = document.getElementById('optionB').value;
        const optionC = document.getElementById('optionC').value;
        const optionD = document.getElementById('optionD').value;

        if (!text || !optionA || !optionB || !optionC || !optionD) {
            alert('Please fill in all fields!');
            return;
        }

        this.currentQuestion = {
            text,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctAnswer: null,
        };

        this.displayQuestion();
        this.gameState.selectedAnswer = null;
    }

    displayQuestion() {
        document.getElementById('questionText').textContent = this.currentQuestion.text;

        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            const option = btn.dataset.option;
            btn.querySelector('.option-text').textContent = this.currentQuestion.options[option];
            btn.classList.remove('selected', 'correct', 'wrong');
        });
    }

    selectOption(option) {
        this.gameState.selectedAnswer = option;
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        
        event.target.closest('.option-btn').classList.add('selected');
    }

    eliminateWrongAnswers() {
        const correctAnswer = document.getElementById('correctAnswerInput').value.toUpperCase();
        
        if (!correctAnswer) {
            alert('Enter the correct answer first!');
            return;
        }

        const alivePeople = this.people.filter(p => p.alive);
        const toEliminate = Math.floor(alivePeople.length * 0.2);

        let eliminated = 0;
        for (let person of this.people) {
            if (person.alive && eliminated < toEliminate) {
                person.alive = false;
                eliminated++;
            }
        }

        this.renderPeopleGrid();
    }

    submitAnswer() {
        const correctAnswer = document.getElementById('correctAnswerInput').value.toUpperCase();
        const contestantAnswer = document.getElementById('contestantAnswerInput').value.toUpperCase();

        if (!correctAnswer || !contestantAnswer) {
            alert('Enter both answers!');
            return;
        }

        const isCorrect = correctAnswer === contestantAnswer;

        if (isCorrect) {
            this.gameState.currentQuestion++;
            if (this.gameState.currentQuestion <= this.prizeThresholds.length) {
                this.gameState.prize = this.prizeThresholds[this.gameState.currentQuestion - 1];
            }
            this.showResult(true);
        } else {
            this.gameState.lives--;
            this.showResult(false);

            if (this.gameState.lives <= 0) {
                this.endGame();
                return;
            }
        }

        document.getElementById('questionInput').value = '';
        document.getElementById('optionA').value = '';
        document.getElementById('optionB').value = '';
        document.getElementById('optionC').value = '';
        document.getElementById('optionD').value = '';
        document.getElementById('correctAnswerInput').value = '';
        document.getElementById('contestantAnswerInput').value = '';

        this.updateUI();
    }

    showResult(isCorrect) {
        const resultMsg = isCorrect ? '✓ CORRECT!' : '✗ WRONG!';
        alert(resultMsg);

        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.dataset.option === document.getElementById('correctAnswerInput').value.toUpperCase()) {
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        });
    }

    nextQuestion() {
        this.displayQuestion();
        this.gameState.selectedAnswer = null;
    }

    updateUI() {
        document.getElementById('questionCount').textContent = `${this.gameState.currentQuestion}/${this.prizeThresholds.length}`;
        document.getElementById('prizeAmount').textContent = `€${this.gameState.prize.toLocaleString()}`;
        document.getElementById('contestantLives').textContent = '❤️'.repeat(this.gameState.lives);
    }

    endGame() {
        this.gameState.isRunning = false;
        alert(`Game Over! Final Prize: €${this.gameState.prize.toLocaleString()}`);
        this.resetGame();
    }

    resetGame() {
        this.gameState = {
            isRunning: false,
            currentQuestion: 1,
            totalQuestions: 10,
            lives: 3,
            prize: 500,
            selectedAnswer: null,
        };

        this.people = this.people.map(p => ({ ...p, alive: true, answered: false }));
        this.currentQuestion = { text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: null };

        this.updateUI();
        this.renderPeopleGrid();
        this.displayQuestion();

        document.getElementById('startBtn').disabled = false;
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('eliminateBtn').disabled = true;
        document.getElementById('submitAnswerBtn').disabled = true;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'wrong');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EenTegenHonderdGame();
});
