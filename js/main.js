const API_URL = `https://api.github.com/users/${GITHUB_USER}`;
const CACHE_KEY = 'gh-repos-v2';
const CACHE_TTL_MS = 30 * 60 * 1000;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function repoUrl(repo) {
  return `https://github.com/${GITHUB_USER}/${repo}`;
}

function chipList(items) {
  const list = el('ul', 'chips');
  items.forEach((item) => list.append(el('li', null, item)));
  return list;
}

function repoLink(repo, label, className) {
  const link = el('a', className, label);
  link.href = repoUrl(repo);
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

// Linha de metadados preenchida depois pela API (estrelas, última atualização).
function metaLine(repo) {
  const meta = el('p', 'project-meta');
  meta.dataset.repoMeta = repo;
  meta.hidden = true;
  return meta;
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
    img.loading = 'lazy';
    wrap.append(img);
  } else if (visual.type === 'phones') {
    visual.images.forEach((image) => {
      const phone = el('div', 'phone');
      const img = el('img');
      img.src = image.src;
      img.alt = image.alt;
      img.loading = 'lazy';
      phone.append(img);
      wrap.append(phone);
    });
  }
  return wrap;
}

function buildFeatured(project) {
  const article = el('article', 'project reveal');
  const body = el('div', 'project-body');

  const heading = el('div', 'project-heading');
  heading.append(el('h3', null, project.title));
  if (project.status) heading.append(el('span', 'badge', project.status));

  const highlights = el('ul', 'highlights');
  project.highlights.forEach((item) => highlights.append(el('li', null, item)));

  const actions = el('div', 'project-actions');
  actions.append(repoLink(project.repo, 'Ver no GitHub →', 'btn btn-ghost btn-sm'));

  body.append(
    heading,
    el('p', 'project-tagline', project.tagline),
    el('p', 'project-description', project.description),
    highlights,
    chipList(project.stack),
    metaLine(project.repo),
    actions,
  );

  article.append(buildVisual(project.visual), body);
  return article;
}

function buildCard(project) {
  const card = el('article', 'card reveal');
  card.append(
    el('h3', null, project.title),
    el('p', 'project-tagline', project.tagline),
    el('p', 'project-description', project.description),
    chipList(project.stack),
    metaLine(project.repo),
    repoLink(project.repo, 'Ver no GitHub →', 'card-link'),
  );
  return card;
}

function renderProjects() {
  const featured = document.getElementById('featured');
  FEATURED_PROJECTS.forEach((project) => featured.append(buildFeatured(project)));

  const others = document.getElementById('others');
  OTHER_PROJECTS.forEach((project) => others.append(buildCard(project)));
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

function formatMonth(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function applyGithubData(repos) {
  const curated = [...FEATURED_PROJECTS, ...OTHER_PROJECTS].map((p) => p.repo);
  const byName = new Map(repos.map((repo) => [repo.name, repo]));

  document.querySelectorAll('[data-repo-meta]').forEach((node) => {
    const repo = byName.get(node.dataset.repoMeta);
    if (!repo) return;
    const parts = [`Atualizado em ${formatMonth(repo.pushed_at)}`];
    if (repo.stargazers_count > 0) parts.unshift(`★ ${repo.stargazers_count}`);
    node.textContent = parts.join(' · ');
    node.hidden = false;
  });

  // Repos Flutter novos, ainda sem texto curado, entram sozinhos na grade.
  const discovered = repos.filter(
    (repo) =>
      !repo.fork && !repo.archived && isFlutterRepo(repo) &&
      !curated.includes(repo.name) && !HIDDEN_REPOS.includes(repo.name),
  );
  const others = document.getElementById('others');
  discovered.forEach((repo) => {
    const card = buildCard({
      repo: repo.name,
      title: repo.name,
      tagline: 'Flutter',
      description: repo.description || 'Projeto em Flutter.',
      stack: ['Flutter', 'Dart'],
    });
    others.prepend(card);
    card.classList.add('is-visible');
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
setupThemeToggle();
setupReveal();
// O site funciona inteiro sem a API; ela só enriquece os cards.
fetchGithub().then(applyGithubData).catch(() => {});
