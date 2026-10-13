const API_URL = `https://api.github.com/users/${GITHUB_USER}`;
const CACHE_KEY = 'gh-repos-v2';
const CACHE_TTL_MS = 30 * 60 * 1000;
const CARD_CHIPS = 3;

// Dados da API por nome do repo; preenchido quando (e se) o GitHub responder.
const githubRepos = new Map();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function chipList(items) {
  const list = el('ul', 'chips');
  items.forEach((item) => list.append(el('li', null, item)));
  return list;
}

function formatMonth(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function buildVisual(visual) {
  const wrap = el('div', `project-visual visual-${visual.type}`);

  if (visual.type === 'cover') {
    wrap.classList.add(`cover-${visual.theme}`);
    wrap.append(el('span', 'cover-emoji', visual.emoji), el('span', 'cover-label', visual.label));
    wrap.setAttribute('aria-hidden', 'true');
  } else if (visual.type === 'image') {
    const img = el('img');
    img.src = visual.src;
    img.alt = visual.alt;
    wrap.append(img);
  } else if (visual.type === 'phones') {
    visual.images.forEach((image) => {
      const phone = el('div', 'phone');
      const img = el('img');
      img.src = image.src;
      img.alt = image.alt;
      phone.append(img);
      wrap.append(phone);
    });
  }
  return wrap;
}

function heading(project, tag) {
  const wrap = el('div', 'project-heading');
  wrap.append(el(tag, null, project.title));
  if (project.status) wrap.append(el('span', 'badge', project.status));
  return wrap;
}

function buildCard(project) {
  const card = el('button', 'project-card reveal');
  card.type = 'button';
  card.setAttribute('aria-haspopup', 'dialog');
  card.append(
    heading(project, 'h3'),
    el('p', 'project-tagline', project.tagline),
    chipList(project.stack.slice(0, CARD_CHIPS)),
    el('span', 'card-more', 'Ver detalhes →'),
  );
  card.addEventListener('click', () => openProject(project));
  return card;
}

function openProject(project) {
  const dialog = document.getElementById('project-dialog');
  const content = dialog.querySelector('.dialog-content');
  content.replaceChildren();

  if (project.visual) content.append(buildVisual(project.visual));

  const body = el('div', 'dialog-body');
  const title = heading(project, 'h3');
  title.querySelector('h3').id = 'project-dialog-title';
  body.append(title, el('p', 'project-tagline', project.tagline), el('p', 'project-description', project.description));

  if (project.highlights) {
    const highlights = el('ul', 'highlights');
    project.highlights.forEach((item) => highlights.append(el('li', null, item)));
    body.append(highlights);
  }
  body.append(chipList(project.stack));

  const repo = githubRepos.get(project.repo);
  if (repo) {
    const parts = [`Atualizado em ${formatMonth(repo.pushed_at)}`];
    if (repo.stargazers_count > 0) parts.unshift(`★ ${repo.stargazers_count}`);
    body.append(el('p', 'project-meta', parts.join(' · ')));
  }

  const link = el('a', 'btn btn-primary btn-sm', 'Ver no GitHub →');
  link.href = `https://github.com/${GITHUB_USER}/${project.repo}`;
  link.target = '_blank';
  link.rel = 'noopener';
  const actions = el('div', 'project-actions');
  actions.append(link);
  body.append(actions);

  content.append(body);
  dialog.showModal();
  dialog.scrollTop = 0;
}

function setupDialog() {
  const dialog = document.getElementById('project-dialog');
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  // Clique fora do conteúdo (no backdrop) fecha o modal.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function renderProjects() {
  const list = document.getElementById('projects');
  [...FEATURED_PROJECTS, ...OTHER_PROJECTS].forEach((project) => list.append(buildCard(project)));
}

async function fetchGithub() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  } catch (_) {
    // Cache corrompido ou indisponível: busca de novo.
  }

  const res = await fetch(`${API_URL}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error('GitHub API indisponível');

  const data = await res.json();
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch (_) {
    // Sem sessionStorage (modo privado): segue sem cache.
  }
  return data;
}

function isFlutterRepo(repo) {
  return repo.language === 'Dart' || (repo.topics || []).includes('flutter');
}

function applyGithubData(repos) {
  repos.forEach((repo) => githubRepos.set(repo.name, repo));

  // Repos Flutter novos, ainda sem texto curado, entram sozinhos na lista.
  const curated = [...FEATURED_PROJECTS, ...OTHER_PROJECTS].map((p) => p.repo);
  const list = document.getElementById('projects');
  repos
    .filter(
      (repo) =>
        !repo.fork && !repo.archived && isFlutterRepo(repo) &&
        !curated.includes(repo.name) && !HIDDEN_REPOS.includes(repo.name),
    )
    .forEach((repo) => {
      const card = buildCard({
        repo: repo.name,
        title: repo.name,
        tagline: 'Flutter',
        description: repo.description || 'Projeto em Flutter.',
        stack: ['Flutter', 'Dart'],
      });
      card.classList.add('is-visible');
      list.append(card);
    });
}

function setupThemeToggle() {
  const root = document.documentElement;
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  items.forEach((item) => observer.observe(item));
}

document.getElementById('year').textContent = new Date().getFullYear();
renderProjects();
setupDialog();
setupThemeToggle();
setupReveal();
// O site funciona inteiro sem a API; ela só enriquece os detalhes.
fetchGithub().then(applyGithubData).catch(() => {});
