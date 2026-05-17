 const TOTAL = 10 * 60;
  let remaining = TOTAL;
  let paused = false;
  let glassCount = 0;
  let interval;

  const timerEl = document.getElementById('timer');
  const progressEl = document.getElementById('progress');
  const statusEl = document.getElementById('status');
  const pauseBtn = document.getElementById('pauseBtn');
  const countEl = document.getElementById('count');
  const dropsEl = document.getElementById('drops');

  function render() {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    const pct = (remaining / TOTAL) * 100;
    progressEl.style.width = pct + '%';
    const urgent = remaining <= 60;
    timerEl.className = 'timer-num' + (urgent ? ' urgent' : '');
    progressEl.className = 'progress-bar' + (urgent ? ' urgent' : '');
    statusEl.className = 'status' + (paused ? '' : (urgent ? ' urgent' : ' active'));
    statusEl.textContent = paused ? 'Timer paused.' : (urgent ? 'Time to drink water soon!' : 'Timer active!');
  }

  function renderDrops() {
    countEl.textContent = glassCount;
    dropsEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const d = document.createElement('div');
      d.className = 'drop' + (i < glassCount ? ' filled' : '');
      dropsEl.appendChild(d);
    }
  }

  function tick() {
    if (!paused && remaining > 0) {
      remaining--;
      render();
      if (remaining === 0) {
        statusEl.textContent = '💧 Drink water now!';
        statusEl.className = 'status urgent';
        if (Notification.permission === 'granted')
          new Notification('Hydration Timer', { body: 'Time to drink a glass of water! 💧' });
      }
    }
  }

  function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    render();
  }

  function resetTimer() {
    remaining = TOTAL;
    paused = false;
    pauseBtn.textContent = 'Pause';
    render();
  }

  function logGlass() {
    glassCount = Math.min(glassCount + 1, 8);
    renderDrops();
    resetTimer();
  }

  Notification.requestPermission();
  interval = setInterval(tick, 1000);
  render();
  renderDrops();