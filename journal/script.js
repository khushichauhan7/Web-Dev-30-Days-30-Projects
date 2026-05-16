const MOODS = [
    { id: 'happy', label: '😊 happy', color: '#f4c842', bg: '#fffbe8' },
    { id: 'tired', label: '😴 tired', color: '#8aa5b5', bg: '#e8f0f5' },
    { id: 'chaotic', label: '🌀 chaotic', color: '#c8a0d8', bg: '#f5eeff' },
    { id: 'romanticizing', label: '🌹 romanticizing life', color: '#e8a0a0', bg: '#fff0f0' },
    { id: 'cooked', label: '💻 engineering cooked me', color: '#7a9478', bg: '#eef5ec' },
];

const STICKER_CATS = {
    '🌿 nature': ['🌸', '🌼', '🌻', '🌺', '🍀', '🌿', '🍃', '🌾', '🌵', '🍂', '🍁', '🌹', '🌷', '🌱', '🪷', '🌲'],
    '☕ cozy': ['☕', '🍵', '🧸', '📚', '🕯️', '🪴', '🎀', '🎶', '📖', '🖊️', '🫖', '🧁', '🍰', '🥐', '🫙', '🪵'],
    '✨ sparkle': ['⭐', '🌙', '✨', '💫', '🌟', '🔮', '💎', '🪄', '🌙', '⚡', '🌈', '☁️', '🌤️', '❄️'],
    '🎨 art': ['🎨', '🖌️', '📷', '📸', '🎭', '🎪', '🎠', '🎡', '🎢', '🎯', '🎲', '♟️', '🎻'],
    '🐾 animals': ['🐱', '🐰', '🐻', '🦋', '🐝', '🦋', '🐦', '🌈', '🦔', '🐸', '🦭', '🐧', '🦚'],
    '💌 love': ['💌', '💝', '💖', '💕', '🎁', '💍', '🌹', '💋', '🫶', '🤍', '🫀', '💐'],
    '🍃 totoro': ['🌿', '🍃', '⭐', '🌙', '✨', '🌳', '🌧️', '🍄', '🌲', '🌾', '🪵', '🪨'],
};

let currentTheme = 'vintage';
let selectedMood = null;
let currentPhotos = [];
let entries = JSON.parse(localStorage.getItem('vmj_entries') || '[]');
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let activeStickers = [];
let dragStickerEl = null;
let dragOffset = { x: 0, y: 0 };
let particlesOn = true;
let rainOn = false;
let rainAnim = null;
let currentDetailId = null;
let activeStickerCat = Object.keys(STICKER_CATS)[0];

function enterApp() {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    setTimeout(() => { splash.style.display = 'none'; document.getElementById('app').style.display = 'block'; }, 800);
    initApp();
}

function initApp() {
    setDisplayDate();
    renderMoodPicker();
    renderStickerPanel();
    renderCalendar();
    initParticles();
    initRain();
}

function setDisplayDate() {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    document.getElementById('display-date').textContent = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    document.getElementById('display-day').textContent = days[now.getDay()] + ' ✦ ' + (now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening');
}

function setTheme(theme, btn) {
    currentTheme = theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const paper = document.getElementById('journal-paper');
    paper.className = 'journal-paper paper-' + theme + ' corner-fold';
}

function renderMoodPicker() {
    const row = document.getElementById('mood-picker');
    row.innerHTML = '';
    MOODS.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'mood-chip';
        btn.innerHTML = m.label;
        btn.style.borderColor = m.color;
        btn.onclick = () => selectMood(m, btn);
        row.appendChild(btn);
    });
}

function selectMood(mood, btn) {
    selectedMood = mood;
    document.querySelectorAll('.mood-chip').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    btn.style.background = mood.color + '33';
    btn.style.boxShadow = '0 4px 16px ' + mood.color + '44';
    document.querySelector('.entry-date-block .entry-date-display').style.color = mood.color;
}

function renderStickerPanel() {
    const catContainer = document.getElementById('sticker-categories');
    const gridContainer = document.getElementById('sticker-grid');
    catContainer.innerHTML = '';
    Object.keys(STICKER_CATS).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'sticker-cat-btn' + (cat === activeStickerCat ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => { activeStickerCat = cat; renderStickerPanel(); };
        catContainer.appendChild(btn);
    });
    gridContainer.innerHTML = '';
    STICKER_CATS[activeStickerCat].forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'sticker-item';
        btn.textContent = emoji;
        btn.draggable = true;
        btn.ondragstart = (e) => { e.dataTransfer.setData('sticker', emoji); };
        btn.onclick = () => placeSticker(emoji, null, null); // click to place center
        gridContainer.appendChild(btn);
    });

    const paper = document.getElementById('journal-paper');
    paper.ondragover = (e) => { e.preventDefault(); };
    paper.ondrop = (e) => {
        e.preventDefault();
        const emoji = e.dataTransfer.getData('sticker');
        if (!emoji) return;
        const rect = paper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        placeSticker(emoji, x, y);
    };
}

function placeSticker(emoji, x, y) {
    const paper = document.getElementById('journal-paper');
    const rect = paper.getBoundingClientRect();
    const px = x !== null ? x : (100 + Math.random() * (rect.width - 200));
    const py = y !== null ? y : (100 + Math.random() * 300);
    const rotation = (Math.random() * 30 - 15);
    const scale = 0.9 + Math.random() * 0.6;

    const el = document.createElement('div');
    el.className = 'placed-sticker';
    el.textContent = emoji;
    el.style.left = px + 'px';
    el.style.top = py + 'px';
    el.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    el.style.fontSize = (1.6 + Math.random() * 1.2) + 'rem';

    const delBtn = document.createElement('button');
    delBtn.className = 'sticker-del';
    delBtn.innerHTML = '✕';
    delBtn.onclick = (e) => { e.stopPropagation(); el.remove(); };
    el.appendChild(delBtn);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    let isResizing = false, startSize, startY;
    resizeHandle.onmousedown = (e) => {
        e.stopPropagation();
        isResizing = true;
        startSize = parseFloat(el.style.fontSize);
        startY = e.clientY;
        const onMove = (me) => {
            if (!isResizing) return;
            const diff = (startY - me.clientY) * 0.02;
            el.style.fontSize = Math.max(0.8, startSize + diff) + 'rem';
        };
        const onUp = () => { isResizing = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };
    el.appendChild(resizeHandle);

    let isDragging = false, dsx, dsy, dleft, dtop;
    el.onmousedown = (e) => {
        if (e.target === delBtn || e.target === resizeHandle) return;
        isDragging = true;
        dsx = e.clientX; dsy = e.clientY;
        dleft = parseFloat(el.style.left) || 0;
        dtop = parseFloat(el.style.top) || 0;
        el.style.zIndex = 100;
        const onMove = (me) => {
            if (!isDragging) return;
            el.style.left = (dleft + me.clientX - dsx) + 'px';
            el.style.top = (dtop + me.clientY - dsy) + 'px';
        };
        const onUp = () => { isDragging = false; el.style.zIndex = 50; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    paper.appendChild(el);
    activeStickers.push({ emoji, x: px, y: py, rotation, scale });

    el.animate([{ transform: `rotate(${rotation}deg) scale(0)` }, { transform: `rotate(${rotation}deg) scale(${scale * 1.2})` }, { transform: `rotate(${rotation}deg) scale(${scale})` }], { duration: 300, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => addPhotoToPage(e.target.result, file.name);
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function addPhotoToPage(src, name) {
    const zone = document.getElementById('photo-zone');
    const styles = ['photo-polaroid', 'tape-photo'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const rotation = (Math.random() * 10 - 5);

    const wrapper = document.createElement('div');
    wrapper.className = 'photo-item ' + style;
    wrapper.style.transform = `rotate(${rotation}deg)`;

    const img = document.createElement('img');
    img.src = src;

    wrapper.appendChild(img);

    if (style === 'photo-polaroid') {
        const cap = document.createElement('div');
        cap.className = 'caption';
        cap.contentEditable = true;
        cap.textContent = name.replace(/\.[^.]+$/, '');
        wrapper.appendChild(cap);
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-photo';
    delBtn.innerHTML = '✕';
    delBtn.onclick = () => { wrapper.remove(); currentPhotos = currentPhotos.filter(p => p !== src); };
    wrapper.appendChild(delBtn);

    makeDraggableInZone(wrapper, zone);

    zone.insertBefore(wrapper, zone.querySelector('.upload-btn-area'));
    currentPhotos.push(src);
}

function makeDraggableInZone(el, container) {
    let down = false, sx, sy, ox, oy;
    el.onmousedown = (e) => {
        if (e.target.classList.contains('delete-photo')) return;
        down = true; sx = e.clientX; sy = e.clientY;
        ox = el.offsetLeft; oy = el.offsetTop;
        el.style.position = 'relative'; el.style.zIndex = 99;
        const move = (me) => {
            if (!down) return;
        };
        const up = () => { down = false; el.style.zIndex = ''; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    };
}

function saveEntry() {
    const text = document.getElementById('journal-text').value.trim();
    if (!text && !currentPhotos.length) { showToast('✏️ Write something first!'); return; }

    const paperStickers = [];
    document.querySelectorAll('#journal-paper .placed-sticker').forEach(el => {
        paperStickers.push({ emoji: el.textContent.trim().replace('✕', '').replace('resize', '').trim().split('')[0], x: el.style.left, y: el.style.top, rotation: el.style.transform, fontSize: el.style.fontSize });
    });

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        theme: currentTheme,
        mood: selectedMood,
        quote: document.getElementById('quote-input').value.trim(),
        text: text,
        photos: currentPhotos.slice(),
        stickers: paperStickers,
        song: document.getElementById('song-input').value.trim(),
    };

    entries.unshift(entry);
    localStorage.setItem('vmj_entries', JSON.stringify(entries));
    showToast('✨ Entry saved!');
    clearEntry();
    renderCalendar();
}

function clearEntry() {
    document.getElementById('journal-text').value = '';
    document.getElementById('quote-input').value = '';
    document.getElementById('song-input').value = '';
    selectedMood = null;
    currentPhotos = [];
    document.querySelectorAll('.mood-chip').forEach(b => { b.classList.remove('selected'); b.style.background = ''; b.style.boxShadow = ''; });
    document.querySelectorAll('#journal-paper .placed-sticker').forEach(el => el.remove());
    const zone = document.getElementById('photo-zone');
    zone.querySelectorAll('.photo-item').forEach(el => el.remove());
    document.querySelector('.entry-date-display').style.color = '';
}

function renderEntriesList() {
    const grid = document.getElementById('entries-grid');
    const noEl = document.getElementById('no-entries');
    const statsEl = document.getElementById('stats-banner');
    grid.innerHTML = '';

    if (!entries.length) { noEl.style.display = 'block'; statsEl.innerHTML = ''; return; }
    noEl.style.display = 'none';

    const moodCounts = {};
    entries.forEach(e => { if (e.mood) moodCounts[e.mood.label] = (moodCounts[e.mood.label] || 0) + 1; });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    statsEl.innerHTML = `
    <div class="stat-pill"><div class="val">${entries.length}</div><div class="lbl">entries</div></div>
    ${topMood ? `<div class="stat-pill"><div class="val">${topMood[0]}</div><div class="lbl">most felt mood</div></div>` : ''}
    <div class="stat-pill"><div class="val">${entries.filter(e => e.photos && e.photos.length).length}</div><div class="lbl">with photos</div></div>
  `;

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'entry-card paper-' + (entry.theme || 'vintage');
        const d = new Date(entry.date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        card.innerHTML = `
      <div class="tape-corner"></div>
      <div class="card-date">${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}</div>
      <div class="card-mood" style="color:${entry.mood ? entry.mood.color : 'inherit'}">${entry.mood ? entry.mood.label : '—'}</div>
      ${entry.quote ? `<div style="font-style:italic;font-family:'Playfair Display',serif;opacity:0.65;font-size:0.9rem;margin-bottom:8px;">"${entry.quote}"</div>` : ''}
      <div class="card-preview">${entry.text || ''}</div>
      ${entry.stickers && entry.stickers.length ? `<div class="card-stickers">${entry.stickers.slice(0, 6).map(s => s.emoji).join('')}</div>` : ''}
      ${entry.song ? `<div style="font-family:'Caveat',cursive;font-size:0.85rem;opacity:0.6;margin-top:6px;">🎵 ${entry.song}</div>` : ''}
    `;
        card.onclick = () => showDetail(entry.id);
        grid.appendChild(card);
    });
}

function showDetail(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    currentDetailId = id;
    const d = new Date(entry.date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    document.getElementById('detail-content').innerHTML = `
    <div class="journal-paper paper-${entry.theme || 'vintage'} corner-fold" style="max-width:820px;margin:0 auto;position:relative;">
      <div class="entry-header-row">
        <div>
          <div class="entry-date-display" style="color:${entry.mood ? entry.mood.color : 'inherit'}">${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}</div>
          <div class="entry-day-display">${days[d.getDay()]}</div>
        </div>
        ${entry.mood ? `<div class="mood-chip selected" style="border-color:${entry.mood.color};background:${entry.mood.color}22">${entry.mood.label}</div>` : ''}
      </div>
      ${entry.quote ? `<div class="quote-input" style="font-family:'Playfair Display',serif;font-style:italic;text-align:center;padding:10px 0 16px;opacity:0.75;border-bottom:1px dashed currentColor;">"${entry.quote}"</div>` : ''}
      <div class="paper-divider"><span>❧</span></div>
      <div style="font-family:'Crimson Pro',serif;font-size:1.15rem;line-height:1.9;white-space:pre-wrap;">${entry.text}</div>
      ${entry.photos && entry.photos.length ? `
        <div class="paper-divider"><span>✿</span></div>
        <div class="photo-zone">
          ${entry.photos.map((p, i) => `<div class="photo-item photo-polaroid" style="transform:rotate(${(i % 2 === 0 ? -4 : 4) + i * 0.5}deg)"><img src="${p}" style="width:140px;height:120px;object-fit:cover"></div>`).join('')}
        </div>` : ''}
      ${entry.stickers && entry.stickers.length ? entry.stickers.map(s => `<div class="placed-sticker" style="left:${s.x};top:${s.y};transform:${s.rotation};font-size:${s.fontSize || '2rem'}">${s.emoji}</div>`).join('') : ''}
      ${entry.song ? `<div class="song-row" style="margin-top:20px"><span class="song-icon">🎵</span><span style="font-family:'Caveat',cursive;font-size:1.1rem;opacity:0.8;">${entry.song}</span></div>` : ''}
      <div style="margin-top:24px;display:flex;gap:10px">
        <button class="btn-secondary" onclick="deleteEntry(${entry.id})" style="border-color:#cc4444;color:#cc4444">🗑️ Delete</button>
      </div>
    </div>
  `;
    showView('detail-view', null);
}

function deleteEntry(id) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem('vmj_entries', JSON.stringify(entries));
    showToast('🗑️ Entry deleted');
    showView('entries-view', null);
    renderEntriesList();
    renderCalendar();
}

function renderCalendar() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('cal-month-label').textContent = months[currentMonth] + ' ' + currentYear;
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
        const label = document.createElement('div');
        label.className = 'cal-day-label';
        label.textContent = d;
        grid.appendChild(label);
    });
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        dayEl.textContent = d;
        const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const dayEntry = entries.find(e => e.date.startsWith(dateStr));
        if (today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d) dayEl.classList.add('today');
        if (dayEntry) {
            dayEl.classList.add('has-entry');
            const pip = document.createElement('div');
            pip.className = 'mood-pip';
            pip.style.background = dayEntry.mood ? dayEntry.mood.color : 'var(--gold)';
            dayEl.appendChild(pip);
            dayEl.onclick = () => showDetail(dayEntry.id);
        } else {
            const thisDate = new Date(currentYear, currentMonth, d);
            if (thisDate <= today) {
                dayEl.onclick = () => {
                    document.getElementById('journal-text').value = '';
                    showView('entry-view', document.querySelector('.nav-btn:nth-child(2)'));
                };
            }
        }
        grid.appendChild(dayEl);
    }
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
}

function showView(viewId, btn) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (btn) btn.classList.add('active');
    if (viewId === 'entries-view') renderEntriesList();
    if (viewId === 'entry-view') setDisplayDate();
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function initParticles() {
    const container = document.getElementById('particles-container');
    const items = ['✿', '✦', '🌿', '⭐', '🍂', '✨', '🌸', '❧', '◈', '✾'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = items[Math.floor(Math.random() * items.length)];
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.animationDuration = (8 + Math.random() * 16) + 's';
        p.style.animationDelay = (Math.random() * 12) + 's';
        p.style.fontSize = (10 + Math.random() * 10) + 'px';
        container.appendChild(p);
    }
}

function toggleParticles() {
    particlesOn = !particlesOn;
    document.getElementById('particles-container').style.display = particlesOn ? '' : 'none';
    document.getElementById('particle-label').textContent = particlesOn ? 'Sparkles On' : 'Sparkles Off';
}

function initRain() {
    const canvas = document.getElementById('rain-canvas');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    const drops = Array.from({ length: 80 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, speed: 3 + Math.random() * 5, length: 15 + Math.random() * 25, opacity: 0.1 + Math.random() * 0.25 }));
    function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drops.forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 2, d.y + d.length);
            ctx.strokeStyle = `rgba(180,200,220,${d.opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            d.y += d.speed;
            if (d.y > canvas.height + 30) { d.y = -30; d.x = Math.random() * canvas.width; }
        });
        rainAnim = requestAnimationFrame(drawRain);
    }
    window._drawRain = drawRain;
}

function toggleRain() {
    rainOn = !rainOn;
    const canvas = document.getElementById('rain-canvas');
    canvas.style.opacity = rainOn ? '1' : '0';
    document.getElementById('rain-label').textContent = rainOn ? 'Rain Off' : 'Rain On';
    if (rainOn) window._drawRain();
    else { if (rainAnim) cancelAnimationFrame(rainAnim); }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
});