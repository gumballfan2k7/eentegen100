class EenTegenHonderdGame {
    constructor() {
        this.data = null;
        this.selectedCategory = null;
        this.currentQuestionIndex = 0;
        this.people = [];
        this.gameState = {
            isRunning: false,
            lives: 3,
            correctAnswers: 0,
            prize: 500
        };
        
        this.prizeThresholds = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000];
        this.initializeGame();
    }

    async initializeGame() {
        try {
            const response = await fetch('data/questions.json');
            this.data = await response.json();
            this.renderCategories();
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';

        this.data.categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.style.color = category.color;
            card.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
                <p>${category.questions.length} vragen</p>
            `;
            card.addEventListener('click', () => this.selectCategory(category));
            grid.appendChild(card);
        });
    }

    selectCategory(category) {
        this.selectedCategory = category;
        this.currentQuestionIndex = 0;
        this.gameState.lives = 3;
        this.gameState.correctAnswers = 0;
        this.gameState.prize = this.prizeThresholds[0];
        
        // Initialize people
        this.people = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            alive: true
        }));

        // Switch to game screen
        document.getElementById('categoryScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        document.getElementById('categoryName').textContent = category.name;
        this.renderPeopleGrid();
        this.displayQuestion();
    }

    renderPeopleGrid() {
        const grid = document.getElementById('peopleGrid');
        grid.innerHTML = '';

        this.people.forEach(person => {
            const el = document.createElement('div');
            el.className = person.alive ? 'person' : 'person eliminated';
            el.textContent = person.id;
            el.addEventListener('click', () => this.togglePerson(person.id));
            grid.appendChild(el);
        });

        this.updatePeopleStats();
    }

    togglePerson(personId) {
        if (!this.gameState.isRunning) return;
        const person = this.people.find(p => p.id === personId);
        if (person) {
            person.alive = !person.alive;
            this.renderPeopleGrid();
        }
    }

    updatePeopleStats() {
        const active = this.people.filter(p => p.alive).length;
        document.getElementById('activePeople').textContent = active;
        document.getElementById('eliminatedPeople').textContent = 100 - active;
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.selectedCategory.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.selectedCategory.questions[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('questionNumber').textContent = `${this.currentQuestionIndex + 1}/${this.selectedCategory.questions.length}`;

        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            const option = btn.dataset.option;
            btn.querySelector('.option-text').textContent = question.options[option];
            btn.classList.remove('selected', 'correct', 'wrong');
            btn.disabled = false;
        });

        document.getElementById('correctAnswerInput').value = '';
        document.getElementById('submitAnswerBtn').disabled = false;
        document.getElementById('nextQuestionBtn').disabled = true;
        document.getElementById('showAnswerBtn').disabled = false;
    }

    startGame() {
        this.gameState.isRunning = true;
        document.getElementById('startGameBtn').disabled = true;
        document.getElementById('showAnswerBtn').disabled = false;
    }

    submitAnswer() {
        const correctAnswer = document.getElementById('correctAnswerInput').value.toUpperCase();
        if (!correctAnswer) {
            alert('Voer een antwoord in (A-D)');
            return;
        }

        const question = this.selectedCategory.questions[this.currentQuestionIndex];
        const isCorrect = correctAnswer === question.correct;

        if (isCorrect) {
            this.gameState.correctAnswers++;
            if (this.gameState.correctAnswers < this.prizeThresholds.length) {
                this.gameState.prize = this.prizeThresholds[this.gameState.correctAnswers];
            }
            
            const optionBtn = document.querySelector(`[data-option="${correctAnswer}"]`);
            optionBtn.classList.add('correct');
            alert('✓ CORRECT!');
            
            this.currentQuestionIndex++;
            document.getElementById('nextQuestionBtn').disabled = false;
        } else {
            this.gameState.lives--;
            
            const optionBtn = document.querySelector(`[data-option="${correctAnswer}"]`);
            optionBtn.classList.add('wrong');
            
            const correctBtn = document.querySelector(`[data-option="${question.correct}"]`);
            correctBtn.classList.add('correct');
            
            alert(`✗ FOUT! Het juiste antwoord is ${question.correct}`);
            
            if (this.gameState.lives <= 0) {
                setTimeout(() => this.endQuiz(), 1000);
                return;
            }
            
            this.currentQuestionIndex++;
            document.getElementById('nextQuestionBtn').disabled = false;
        }

        this.updateUI();
        document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    }

    nextQuestion() {
        this.displayQuestion();
    }

    showAnswer() {
        const question = this.selectedCategory.questions[this.currentQuestionIndex];
        alert(`Het antwoord is: ${question.correct}`);
    }

    endQuiz() {
        alert(`Quiz voltooid!\n\nCorrect: ${this.gameState.correctAnswers}\nPrijzen: €${this.gameState.prize.toLocaleString()}\nLevens over: ${this.gameState.lives}`);
        this.backToCategories();
    }

    backToCategories() {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('categoryScreen').classList.add('active');
        this.gameState.isRunning = false;
    }

    updateUI() {
        document.getElementById('contestantLives').textContent = '❤️'.repeat(Math.max(0, this.gameState.lives));
        document.getElementById('prizeAmount').textContent = `€${this.gameState.prize.toLocaleString()}`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new EenTegenHonderdGame();

    document.getElementById('startGameBtn').addEventListener('click', () => game.startGame());
    document.getElementById('nextQuestionBtn').addEventListener('click', () => game.nextQuestion());
    document.getElementById('showAnswerBtn').addEventListener('click', () => game.showAnswer());
    document.getElementById('submitAnswerBtn').addEventListener('click', () => game.submitAnswer());
    document.getElementById('backCategoryBtn').addEventListener('click', () => game.backToCategories());

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('correctAnswerInput').value = btn.dataset.option;
        });
    });
});
