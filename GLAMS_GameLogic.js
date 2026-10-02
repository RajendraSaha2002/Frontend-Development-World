// Handles state, timers, and assessment calculations
const Engine = {
    currentCourse: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 10,

    initMatch(course) {
        this.currentCourse = course;
        // Fallback to default questions if specific subject isn't populated
        this.questions = GLAMS_DB.questions[course.id] || GLAMS_DB.questions["c2"];
        this.currentIndex = 0;
        this.score = 0;
        document.getElementById('p1-name').innerText = GLAMS_DB.user.firstName;
        UI.switchView('view-arena');
        this.loadNextQuestion();
    },

    loadNextQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.endMatch();
            return;
        }
        this.timeLeft = 10;
        document.getElementById('timer-fill').style.width = '100%';
        UI.renderQuestion(this.questions[this.currentIndex]);
        this.startTimer();
    },

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer-fill').style.width = `${(this.timeLeft / 10) * 100}%`;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.currentIndex++;
                this.loadNextQuestion();
            }
        }, 1000);
    },

    handleAnswer(selectedIndex, correctIndex, btnElement) {
        clearInterval(this.timer);
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.style.pointerEvents = 'none'); // Disable clicking

        if (selectedIndex === correctIndex) {
            btnElement.classList.add('correct');
            this.score++;
        } else {
            btnElement.classList.add('wrong');
            buttons[correctIndex].classList.add('correct'); // Show correct answer
        }

        setTimeout(() => {
            this.currentIndex++;
            this.loadNextQuestion();
        }, 1500); // Brief pause before next question
    },

    endMatch() {
        clearInterval(this.timer);
        UI.switchView('view-results');
        UI.renderResults(this.currentCourse.name, this.score, this.questions.length);
    }
};

window.AppEngine = Engine; // Expose to global scope for event handlers