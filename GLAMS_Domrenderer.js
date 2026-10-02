// Handles all Document Object Model manipulations
const UI = {
    init() {
        document.getElementById('welcome-text').innerText = `Welcome Back, ${GLAMS_DB.user.firstName}!`;
        this.renderCourses(GLAMS_DB.courses);
    },

    renderCourses(courses) {
        const grid = document.getElementById('course-grid');
        grid.innerHTML = '';
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <span class="course-icon">${course.icon}</span>
                <div class="course-title">${course.name}</div>
            `;
            card.onclick = () => window.App.startWar(course);
            grid.appendChild(card);
        });
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active-view');
            v.classList.add('hidden-view');
        });
        document.getElementById(viewId).classList.remove('hidden-view');
        document.getElementById(viewId).classList.add('active-view');
    },

    renderQuestion(qData) {
        document.getElementById('question-text').innerText = qData.text;
        const grid = document.getElementById('options-grid');
        grid.innerHTML = '';
        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => window.AppEngine.handleAnswer(idx, qData.correctIndex, btn);
            grid.appendChild(btn);
        });
    },

    renderResults(subject, score, total) {
        document.getElementById('result-subject').innerText = subject;
        document.getElementById('winner-name').innerText = GLAMS_DB.user.firstName;
        document.getElementById('winner-initials').innerText = GLAMS_DB.user.initials;

        // Calculate Attack/Defense metrics based on performance
        const winPct = (score / total) * 100;
        const atk = Math.floor(winPct);
        const def = Math.floor(winPct * 0.9);

        document.getElementById('w-atk').innerText = `${atk}%`;
        document.getElementById('w-def').innerText = `${def}%`;
        document.getElementById('l-atk').innerText = `${100 - atk}%`;
        document.getElementById('l-def').innerText = `${100 - def}%`;

        // Update pure CSS donut charts dynamically
        document.getElementById('chart-winner').style.background = `conic-gradient(var(--accent-green) ${atk}%, rgba(255,255,255,0.1) 0)`;
        document.getElementById('chart-loser').style.background = `conic-gradient(var(--accent-red) ${100 - atk}%, rgba(255,255,255,0.1) 0)`;
    }
};