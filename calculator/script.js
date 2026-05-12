let current = '0';
let stored = null;
let op = null;
let fresh = false;
let isNight = false;

const resultEl = document.getElementById('result');
const exprEl = document.getElementById('expr');
const calc = document.getElementById('calc');
const modeBtn = document.getElementById('modeBtn');

function show(val) {
    resultEl.classList.remove('errot');
    const num = parseFloat(val);
    if (!isNaN(num) && Math.abs(num) >= 1e10) {
        resultEl.textContent = num.toExponential(4);
    } else if (!isNaN(num) && !Number.isInteger(num)) {
        const s = String(parseFloat(num.toFixed(10)));
        resultEl.textContent = s.length > 12 ? parseFloat(num.toFixed(6)).toString() : s;
    } else {
        resultEl.textContent = val;
    }
}

function pressNum(n) {
    if (fresh || current === '0') {
        current = n;
        fresh = false;
    } else {
        if (current.replace('-', '').replace('.', '').length >= 12) return;
        current += n;
    }
    show(current);
}

function pressDot() {
    if (fresh) {
        current = '0.';
        fresh = false;
    } else if (!current.includes('.')) {
        current += '.';
    }
    show(current);
}

function percent() {
    const n = parseFloat(current);
    if (!isNaN(n)) {
        current = String(n / 100);
        show(current);
    }
}

function pressOp(o) {
    if (op && !fresh) {
        calculate(true);
    }
    stored = parseFloat(current);
    op = o;
    fresh = true;
    exprEl.textContent = current + ' ' + o;
}

function calculate(chain) {
    if (op === null || stored === null) return;
    const b = parseFloat(current);
    let res;
    if (op === '+') res = stored + b;
    else if (op === '-') res = stored - b;
    else if (op === '*') res = stored * b;
    else if (op === '/') {
        if (b === 0) { resultEl.textContent = 'Cannot ÷ 0'; resultEl.classList.add('error'); exprEl.textContent = ''; op = null; stored = null; fresh = true; current = '0'; return; }
        res = stored / b;
    }
    if (!chain) exprEl.textContent = stored + ' ' + op + ' ' + b + ' =';
    current = String(parseFloat(res.toFixed(10)));
    op = null;
    stored = null;
    fresh = true;
    show(current);
}

function clearAll() {
    current = '0';
    stored = null;
    op = null;
    fresh = false;
    exprEl.textContent = '';
    show('0');
}
function clearEntry() { 
    current = '0'; 
    fresh = false; 
    show('0'); 
}

function toggleMode() {
    isNight = !isNight;
    calc.classList.toggle('night-mode', isNight);
    modeBtn.textContent = isNight ? '☀️ Day' : '🌙 Night';
}

document.addEventListener('keydown', e => {
    if ('0123456789'.includes(e.key)) pressNum(e.key);
    else if (e.key === '.') pressDot();
    else if (e.key === '+') pressOp('+');
    else if (e.key === '-') pressOp('-');
    else if (e.key === '*') pressOp('*');
    else if (e.key === '/') { e.preventDefault(); pressOp('/'); }
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') clearEntry();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === '%') percent();
});