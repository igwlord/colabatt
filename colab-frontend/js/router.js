/**
 * router.js — Vanilla SPA Router
 * Features: dynamic params, query strings, route guards, base path, cleanup
 */

import { appStore } from './store.js';

const BASE_PATH = ''; // Change to '/colab' if served under sub-path
const routes = [];
let currentCleanup = null;
let currentPath = null;

/**
 * Register a route.
 * @param {string} path - Route pattern (e.g., '/manager/equipo/:projectId')
 * @param {function(HTMLElement, Object): function|void} handler - Page render function
 * @param {Object} [options]
 * @param {function(Object): boolean} [options.guard] - Route guard function
 * @param {string} [options.title] - Page title
 */
export function route(path, handler, options = {}) {
  const paramNames = [];
  const regexStr = path.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '(?<' + name + '>[^/]+)';
  });

  routes.push({
    path,
    regex: new RegExp('^' + regexStr + '/?$'),
    handler,
    guard: options.guard,
    title: options.title,
  });
}

/**
 * Navigate to a new path.
 * @param {string} path
 */
export function navigate(path) {
  const fullPath = BASE_PATH + path;
  history.pushState(null, '', fullPath);
  resolve();
}

/**
 * Resolve the current URL and render the matching route.
 */
export function resolve() {
  let path = location.pathname;

  // Strip base path
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }
  path = path || '/';

  // Parse query string
  const query = Object.fromEntries(new URLSearchParams(location.search));

  // Find matching route
  const match = routes.find((r) => r.regex.test(path));

  // Skip if same path AND same query string (avoid re-render on identical navigation)
  const currentSearch = location.search;
  if (path === currentPath && currentSearch === (window.__routerLastSearch || '')) return;
  window.__routerLastSearch = currentSearch;

  // Cleanup previous page
  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch (e) { console.error('Route cleanup error:', e); }
  }
  currentCleanup = null;

  if (!match) {
    currentPath = path;
    renderNotFound();
    return;
  }

  // Route guard — do NOT update currentPath on rejection so the user can retry
  if (match.guard) {
    const user = appStore.get('user');
    if (!match.guard(user)) {
      renderUnauthorized();
      return;
    }
  }

  currentPath = path;

  // Extract params
  const params = path.match(match.regex)?.groups || {};

  // Update document title
  if (match.title) {
    document.title = `${match.title} — CoLab Hub`;
  }

  // Update active nav
  updateActiveNav(path);

  // Render page
  const container = document.getElementById('page-content');
  if (container) {
    container.scrollTop = 0;
    const result = match.handler(container, { params, query });
    // Handle async handlers (dynamic import returns a Promise)
    if (result && typeof result.then === 'function') {
      result.then((cleanup) => {
        currentCleanup = typeof cleanup === 'function' ? cleanup : null;
      });
    } else {
      currentCleanup = typeof result === 'function' ? result : null;
    }
  }
}

/**
 * Update the active state in the side navigation.
 * @param {string} currentPath
 */
function updateActiveNav(currentPath) {
  const links = document.querySelectorAll('#side-nav [data-route]');
  links.forEach((link) => {
    const route = link.dataset.route;
    const isActive = currentPath.startsWith(route);
    link.classList.toggle('sidenav__link--active', isActive);

    // Update aria
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

/**
 * Render 404 page
 */
function renderNotFound() {
  const container = document.getElementById('page-content');
  if (container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--outline-variant); margin-bottom: var(--space-4);">explore_off</span>
        <h2 style="font-size: var(--text-3xl); color: white; margin-bottom: var(--space-2);">Página no encontrada</h2>
        <p style="color: var(--on-surface-variant); margin-bottom: var(--space-6);">La ruta solicitada no existe.</p>
        <button class="btn btn--primary" onclick="(function() { var u = window.__appStore && window.__appStore.get('user'); var h = (u && (u.role === 'manager' || u.role === 'admin')) ? '/manager/dashboard' : '/tecnico/oportunidades'; window.__router.navigate(h); })()">
          <span class="material-symbols-outlined">home</span>
          Volver al inicio
        </button>
      </div>
    `;
  }
}

/**
 * Render unauthorized page
 */
function renderUnauthorized() {
  const container = document.getElementById('page-content');
  if (container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--error); margin-bottom: var(--space-4);">lock</span>
        <h2 style="font-size: var(--text-3xl); color: white; margin-bottom: var(--space-2);">Acceso restringido</h2>
        <p style="color: var(--on-surface-variant); margin-bottom: var(--space-6);">No tienes permisos para acceder a esta sección.</p>
        <button class="btn btn--primary" onclick="(function() { var u = window.__appStore && window.__appStore.get('user'); var h = (u && (u.role === 'manager' || u.role === 'admin')) ? '/manager/dashboard' : '/tecnico/oportunidades'; window.__router.navigate(h); })()">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
      </div>
    `;
  }
}

// ── Event Listeners ──

// Intercept clicks on internal links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) {
    e.preventDefault();
    navigate(a.getAttribute('href'));
  }
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  currentPath = null; // Force re-resolve
  resolve();
});

// Expose navigate and store globally for inline onclick handlers (404, unauthorized pages)
window.__router = { navigate };
window.__appStore = appStore;
