const starsContainer = document.getElementById('stars');
for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --dur: ${2 + Math.random() * 4}s;
        --delay: ${Math.random() * 5}s;
        --max-opacity: ${0.2 + Math.random() * 0.7};
        width: ${Math.random() > 0.8 ? '2px' : '1px'};
        height: ${Math.random() > 0.8 ? '2px' : '1px'};
      `;
    starsContainer.appendChild(star);
}

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
    const now = new Date();
    const y = now.getFullYear();
    const mo = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const day = days[now.getDay()];
    const h = pad(now.getHours());
    const mi = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    document.getElementById('date').textContent = `${y}-${mo}-${d} ${day}`;
    document.getElementById('time').innerHTML =
        `${h}<span class="colon">:</span>${mi}<span class="colon">:</span>${s}`;
}

tick();
setInterval(tick, 1000);