const list = document.querySelector('#task-list');
const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
let tasks = [];
let activeFilter = 'all';

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) {
    const details = response.status === 400 ? await response.json() : null;
    throw new Error(details?.errors?.title?.[0] ?? `Erro ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function render() {
  const pending = tasks.filter(task => !task.isCompleted).length;
  const completed = tasks.length - pending;
  document.querySelector('#nav-count').textContent = tasks.length;
  document.querySelector('#task-total').textContent = tasks.length;
  document.querySelector('#count-all').textContent = tasks.length;
  document.querySelector('#count-pending').textContent = pending;
  document.querySelector('#count-completed').textContent = completed;
  document.querySelector('#footer-count').textContent = `${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'} no total`;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  document.querySelector('#progress-label').textContent = `${percent}% concluído`;
  document.querySelector('#progress-fill').style.width = `${percent}%`;
  document.querySelector('#summary-title').textContent = tasks.length === 0 ? 'Vamos começar?' : pending === 0 ? 'Tudo concluído!' : 'Você está no caminho certo';
  document.querySelector('#summary-copy').textContent = tasks.length === 0 ? 'Adicione uma tarefa para organizar seu dia.' : `${pending} ${pending === 1 ? 'tarefa pendente' : 'tarefas pendentes'} para você avançar.`;

  const visible = tasks.filter(task => activeFilter === 'all' || (activeFilter === 'pending' ? !task.isCompleted : task.isCompleted));
  list.replaceChildren(...visible.map(createTaskRow));
  const empty = document.querySelector('#empty-state');
  empty.classList.toggle('hidden', visible.length !== 0);
  document.querySelector('#empty-title').textContent = tasks.length === 0 ? 'Tudo começa com uma tarefa' : 'Nenhuma tarefa por aqui';
  document.querySelector('#empty-copy').textContent = tasks.length === 0 ? 'Adicione o primeiro item e tire uma ideia da cabeça.' : 'Experimente outro filtro ou adicione uma nova tarefa.';
}

function createTaskRow(task) {
  const row = document.createElement('article');
  row.className = `task-row${task.isCompleted ? ' completed' : ''}`;
  const check = document.createElement('button');
  check.className = 'check-button';
  check.type = 'button';
  check.setAttribute('aria-label', task.isCompleted ? 'Marcar como pendente' : 'Concluir tarefa');
  check.textContent = task.isCompleted ? '✓' : '';
  check.addEventListener('click', () => changeTask(task.id, 'complete'));

  const details = document.createElement('div');
  details.className = 'task-details';
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;
  details.append(title);
  if (task.description) {
    const description = document.createElement('div');
    description.className = 'task-description';
    description.textContent = task.description;
    details.append(description);
  }
  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.textContent = `Criada em ${new Date(task.createdAt).toLocaleDateString('pt-BR')}`;
  details.append(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = task.isCompleted ? 'Concluída' : 'Pendente';
  const remove = document.createElement('button');
  remove.className = 'delete-button';
  remove.type = 'button';
  remove.setAttribute('aria-label', `Remover ${task.title}`);
  remove.textContent = '×';
  remove.addEventListener('click', () => deleteTask(task.id));
  actions.append(status, remove);
  row.append(check, details, actions);
  return row;
}

async function refresh() {
  try {
    tasks = await api('/api/tasks');
    document.querySelector('#loading').classList.add('hidden');
    document.querySelector('#connection-error').classList.add('hidden');
    render();
  } catch (error) {
    document.querySelector('#loading').classList.add('hidden');
    document.querySelector('#connection-error').classList.remove('hidden');
  }
}

async function changeTask(id, action) {
  try { await api(`/api/tasks/${id}/${action}`, { method: 'PATCH' }); await refresh(); }
  catch { showConnectionError(); }
}

async function deleteTask(id) {
  try { await api(`/api/tasks/${id}`, { method: 'DELETE' }); await refresh(); }
  catch { showConnectionError(); }
}

function showConnectionError() {
  const error = document.querySelector('#connection-error');
  error.textContent = 'Não foi possível salvar a alteração. Verifique o servidor e tente novamente.';
  error.classList.remove('hidden');
}

function openForm() {
  form.classList.remove('hidden');
  titleInput.focus();
}

document.querySelector('#open-form').addEventListener('click', openForm);
document.querySelector('#empty-add').addEventListener('click', openForm);
document.querySelector('#cancel-form').addEventListener('click', () => { form.reset(); form.classList.add('hidden'); document.querySelector('#form-error').textContent = ''; });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(form);
  try {
    await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title: data.get('title'), description: data.get('description') }) });
    form.reset();
    form.classList.add('hidden');
    document.querySelector('#form-error').textContent = '';
    await refresh();
  } catch (error) { document.querySelector('#form-error').textContent = error.message; }
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
}));

document.querySelector('#today').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date());
refresh();
