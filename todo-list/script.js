// ── Select DOM Elements ────────────────────────────────────
const input       = document.getElementById("todo-input");
const addBtn      = document.getElementById("add-btn");
const list        = document.getElementById("todo-list");
const emptyState  = document.getElementById("empty-state");
const totalCount  = document.getElementById("total-count");
const doneCount   = document.getElementById("done-count");
const leftCount   = document.getElementById("left-count");
const progressFill = document.getElementById("progress-fill");
const tabs        = document.querySelectorAll(".tab");

// ── Load saved todos ───────────────────────────────────────
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

let currentFilter = 'all';

// ── Persist todos ──────────────────────────────────────────
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── Update stats bar ───────────────────────────────────────
function updateStats() {
  const total = todos.length;
  const done  = todos.filter(t => t.completed).length;
  const left  = total - done;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  totalCount.textContent  = total;
  doneCount.textContent   = done;
  leftCount.textContent   = left;
  progressFill.style.width = pct + '%';
}

// ── Create a DOM node for a todo item ──────────────────────
function createToDoNode(todo, index) {
  const li = document.createElement('li');
  if (todo.completed) li.classList.add('completed-item');

  // Checkbox for toggle completion
  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.checked = !!todo.completed;
  checkbox.addEventListener('change', () => {
    todo.completed = checkbox.checked;
    textSpan.style.textDecoration = todo.completed ? 'line-through' : '';
    if (todo.completed) li.classList.add('completed-item');
    else                li.classList.remove('completed-item');
    saveTodos();
    updateStats();
  });

  // Text of the todo
  const textSpan = document.createElement('span');
  textSpan.textContent = todo.text;
  textSpan.style.margin = '0 8px';
  if (todo.completed) textSpan.style.textDecoration = 'line-through';

  // Double-click to edit
  textSpan.addEventListener('dblclick', () => {
    const newText = prompt('Edit your task ✏️', todo.text);
    if (newText !== null && newText.trim() !== '') {
      todo.text = newText.trim();
      textSpan.textContent = todo.text;
      saveTodos();
    }
  });

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => {
    li.style.animation = 'none';
    li.style.transform = 'scale(.95)';
    li.style.opacity   = '0';
    li.style.transition = 'all .25s ease';
    setTimeout(() => {
      todos.splice(index, 1);
      render();
      saveTodos();
    }, 220);
  });

  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

// ── Render visible todos based on active filter ────────────
function render() {
  list.innerHTML = '';

  const filtered = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'done')   return  todo.completed;
    return true;
  });

  filtered.forEach((todo) => {
    // Pass the real index in the todos array for correct splice
    const realIndex = todos.indexOf(todo);
    const node = createToDoNode(todo, realIndex);
    list.appendChild(node);
  });

  // Empty state
  if (filtered.length === 0) emptyState.classList.add('show');
  else                        emptyState.classList.remove('show');

  updateStats();
}

// ── Add a new todo ─────────────────────────────────────────
function addTodo() {
  const text = input.value.trim();
  if (!text) {
    input.style.outline = '2px solid rgba(255,120,120,0.6)';
    setTimeout(() => input.style.outline = '', 700);
    return;
  }
  todos.push({ text, completed: false });
  input.value = '';
  render();
  saveTodos();
}

// ── Enter key support ──────────────────────────────────────
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// ── Add button ─────────────────────────────────────────────
addBtn.addEventListener('click', addTodo);

// ── Filter tabs ────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    render();
  });
});

// ── Initial render ─────────────────────────────────────────
render();
