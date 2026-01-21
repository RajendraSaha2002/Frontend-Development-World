// Pomodoro Timer
// Features:
// - configurable work/break lengths (minutes)
// - start / pause / reset / skip
// - auto-start next session (optional)
// - sound (WebAudio) and browser Notification
// - settings & state persisted in localStorage
// - keyboard: Space toggles start/pause

(function () {
  // Elements
  const workInput = document.getElementById('work-min');
  const breakInput = document.getElementById('break-min');
  const autoStartCheckbox = document.getElementById('auto-start');
  const timeEl = document.getElementById('time');
  const modeEl = document.getElementById('mode');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const skipBtn = document.getElementById('skip');
  const sessionsEl = document.getElementById('sessions');
  const ring = document.getElementById('ring');

  // Storage keys
  const SETTINGS_KEY = 'pomodoro-settings';
  const STATE_KEY = 'pomodoro-state';

  // State
  let timerInterval = null;
  let remainingSeconds = 0;
  let isRunning = false;
  let mode = 'work'; // 'work' | 'break'
  let sessionsCompleted = 0;

  // Defaults
  const defaults = {
    workMin: 25,
    breakMin: 5,
    autoStart: true,
  };

  // Helpers
  function saveSettings() {
    const s = {
      workMin: Number(workInput.value) || defaults.workMin,
      breakMin: Number(breakInput.value) || defaults.breakMin,
      autoStart: autoStartCheckbox.checked,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw ? JSON.parse(raw) : defaults;
    workInput.value = s.workMin ?? defaults.workMin;
    breakInput.value = s.breakMin ?? defaults.breakMin;
    autoStartCheckbox.checked = s.autoStart ?? defaults.autoStart;
  }

  function saveState() {
    const st = {
      remainingSeconds,
      isRunning,
      mode,
      sessionsCompleted,
      timestamp: Date.now(),
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(st));
  }

  function loadState() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return false;
    try {
      const st = JSON.parse(raw);
      // If state is recent (< 1 day), restore; otherwise ignore
      if (st && (Date.now() - (st.timestamp || 0)) < 24 * 60 * 60 * 1000) {
        remainingSeconds = st.remainingSeconds || 0;
        isRunning = !!st.isRunning;
        mode = st.mode || 'work';
        sessionsCompleted = st.sessionsCompleted || 0;
        return true;
      }
    } catch (e) {
      // ignore parse errors
    }
    return false;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateUI() {
    timeEl.textContent = formatTime(remainingSeconds);
    modeEl.textContent = mode === 'work' ? 'Work' : 'Break';
    sessionsEl.textContent = String(sessionsCompleted);
    ring.classList.toggle('work', mode === 'work');
    ring.classList.toggle('break', mode === 'break');

    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
  }

  function setRemainingFromMode() {
    const mins = mode === 'work' ? Number(workInput.value) : Number(breakInput.value);
    remainingSeconds = Math.max(1, Math.floor(mins)) * 60;
  }

  // Audio alert using WebAudio (no external file)
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);

      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      o.stop(now + 0.5);

      // close context after sound
      setTimeout(() => ctx.close().catch(() => {}), 700);
    } catch (e) {
      // fallback: tiny DOMAudio beep (rarely used)
      const a = new Audio();
      // can't generate a tone without a file, so skip fallback
      console.warn('Audio beep failed', e);
    }
  }

  // Notification
  function notify(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification(title, { body });
      });
    }
  }

  function switchMode(nextMode) {
    mode = nextMode || (mode === 'work' ? 'break' : 'work');
    if (mode === 'work') {
      setRemainingFromMode();
    } else {
      setRemainingFromMode();
    }
    if (mode === 'work') {
      // no extra handling
    } else {
      // break started
    }
    saveState();
    updateUI();
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateUI();
      saveState();
      return;
    }

    // session finished
    beep();
    const finishedMode = mode;
    if (finishedMode === 'work') {
      sessionsCompleted++;
    }

    const nextMode = finishedMode === 'work' ? 'break' : 'work';
    notify('Pomodoro', finishedMode === 'work' ? 'Work session finished — time for a break!' : 'Break finished — back to work!');

    // switch mode
    mode = nextMode;
    setRemainingFromMode();
    updateUI();
    saveState();

    // auto-start handling
    if (autoStartCheckbox.checked) {
      // continue running
      // no change to isRunning
    } else {
      // pause at the beginning of the next session
      pauseTimer();
    }
  }

  function startTimer() {
    if (isRunning) return;
    // if remaining is zero (fresh), initialize from mode
    if (!remainingSeconds) setRemainingFromMode();

    isRunning = true;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
    updateUI();
    saveState();
  }

  function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    updateUI();
    saveState();
  }

  function resetTimer() {
    pauseTimer();
    setRemainingFromMode();
    updateUI();
    saveState();
  }

  function skipSession() {
    // mark current session as done, switch mode and (optionally) start
    if (mode === 'work') sessionsCompleted++;
    mode = mode === 'work' ? 'break' : 'work';
    setRemainingFromMode();
    updateUI();
    saveState();
  }

  // Event wiring
  startBtn.addEventListener('click', () => {
    startTimer();
  });

  pauseBtn.addEventListener('click', () => {
    pauseTimer();
  });

  resetBtn.addEventListener('click', () => {
    resetTimer();
  });

  skipBtn.addEventListener('click', () => {
    skipSession();
  });

  // Persist settings on change
  [workInput, breakInput].forEach((el) => {
    el.addEventListener('change', () => {
      // sanitize values
      if (!el.value || Number(el.value) < Number(el.min || 1)) el.value = el.min || 1;
      saveSettings();
      // update remaining only if timer is not running
      if (!isRunning) {
        setRemainingFromMode();
        updateUI();
      }
    });
  });

  autoStartCheckbox.addEventListener('change', () => {
    saveSettings();
  });

  // Keyboard: Space toggles start/pause
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (isRunning) pauseTimer();
      else startTimer();
    }
  });

  // Visibility: when tab hidden, keep running but avoid skipping ticks if suspended
  document.addEventListener('visibilitychange', () => {
    // no-op: we rely on setInterval + saving state for good-enough behavior
  });

  // Initialize: load settings & state
  loadSettings();
  const restored = loadState();
  if (!restored) {
    mode = 'work';
    setRemainingFromMode();
    sessionsCompleted = 0;
  }

  updateUI();

  // If state was running when closed, don't auto-restart without user gesture
  if (isRunning) {
    // keep isRunning false until user presses Start to be safe with auto-play policies
    // but if you want it to resume automatically, comment the next two lines
    isRunning = false;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  // Ask for Notification permission proactively (but only if not denied)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(() => {});
  }

  // Save settings on unload
  window.addEventListener('beforeunload', () => {
    saveSettings();
    saveState();
  });

  // Expose for debug (optional)
  window.pomodoro = {
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    skip: skipSession,
  };
})();