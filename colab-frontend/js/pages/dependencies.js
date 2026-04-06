/**
 * dependencies.js — Dependencies Dashboard Page
 * /proyecto/:projectId/dependencias
 */

import { html, raw } from '../utils/safe-html.js';
import { delegateEvents } from '../utils/dom.js';
import { api } from '../api.js';
import { KpiCardIcon } from '../components/cards/kpi-card.js';
import { DependencyCard } from '../components/cards/dependency-card.js';
import { AlertBanner } from '../components/cards/alert-banner.js';
import { ErrorState, SkeletonLoader } from '../error-handler.js';

const PROJECTS = {
  'proj-001': { name: '5G Rollout', category: 'Infrastructure' },
};

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function Dependencies(container, ctx) {
  const projectId = ctx.params.projectId || 'proj-001';
  const project = PROJECTS[projectId] || { name: 'Project ' + projectId, category: 'General' };
  let abortController = new AbortController();

  // Show skeleton immediately
  container.innerHTML = SkeletonLoader('dashboard');

  function render(depsKpis, dependencies, criticalPathItems, alertData) {
    container.innerHTML = html`
      <header style="margin-bottom: var(--space-8); display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <nav style="display: flex; align-items: center; gap: var(--space-2); color: var(--on-surface-variant); font-size: var(--text-xs); margin-bottom: var(--space-2);">
            <span>Projects</span>
            <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
            <span>${project.category}</span>
            <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
            <span style="color: var(--primary);">${project.name}</span>
          </nav>
          <h1 style="font-size: var(--text-4xl); font-weight: 900; letter-spacing: -0.02em; color: white;">${project.name} Dependencies</h1>
        </div>
        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn--secondary btn--sm" data-action="export">
            <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 20px;">file_download</span>
            Export CSV
          </button>
          <button class="btn btn--secondary btn--sm" data-action="share">
            <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 20px;">share</span>
            Share View
          </button>
        </div>
      </header>

      ${raw(AlertBanner(alertData))}

      <div class="grid-4" style="margin-bottom: var(--space-8); margin-top: var(--space-8);">
        ${raw(depsKpis.map((k) => KpiCardIcon(k)).join(''))}
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-8);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h2 style="font-size: var(--text-xl); font-weight: 700; color: white;">Active Dependencies</h2>
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <button class="btn btn--ghost btn--sm btn--icon" data-action="toggle-filter" aria-label="Filtrar">
                <span class="material-symbols-outlined" style="font-size: 18px;">filter_list</span>
              </button>
              <button class="btn btn--ghost btn--sm btn--icon" data-action="toggle-view" aria-label="Vista">
                <span class="material-symbols-outlined" style="font-size: 18px;">grid_view</span>
              </button>
            </div>
          </div>
          <div class="grid-2" id="deps-grid">
            ${raw(dependencies.map((d) => DependencyCard(d)).join(''))}
          </div>
        </div>

        <div>
          <h2 style="font-size: var(--text-xl); font-weight: 700; color: white; margin-bottom: var(--space-6);">Critical Path</h2>
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            ${raw(criticalPathItems.map((item) => html`
              <div class="card" style="padding: var(--space-5); background: linear-gradient(90deg, color-mix(in srgb, var(--error) 10%, var(--surface-container)) 0%, var(--surface-container) 100%);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
                  <h4 style="font-weight: 700; color: white; font-size: var(--text-sm);">${item.title}</h4>
                  <span class="badge badge--critico">${item.status.toUpperCase()}</span>
                </div>
                <p style="font-size: var(--text-xs); color: var(--on-surface-variant); margin-bottom: var(--space-2);">${item.impact}</p>
                <p style="font-size: 10px; color: var(--on-surface-variant); font-family: var(--font-mono);">Owner: ${item.owner}</p>
              </div>
            `).join(''))}
          </div>
        </div>
      </div>
    `;
  }

  async function loadAll() {
    try {
      const [kpiData, depsData] = await Promise.all([
        api.get('/kpis/deps', { signal: abortController.signal }),
        api.get('/projects/' + projectId + '/dependencies', { signal: abortController.signal }),
      ]);
      const depsKpis = kpiData || [];
      const dependencies = depsData.items || [];
      const criticalPathItems = depsData.criticalPath || [];
      const alertData = depsData.alert || {};
      render(depsKpis, dependencies, criticalPathItems, alertData);
    } catch (err) {
      if (err.name === 'AbortError') return;
      container.innerHTML = ErrorState('No se pudieron cargar las dependencias.');
    }
  }

  loadAll();

  const cleanupEvents = delegateEvents(container, {
    'alert-action': () => {
      import('../utils/dom.js').then((m) => m.showToast('Abriendo resoluci\u00f3n...', 'info'));
    },
    'export': () => {
      import('../utils/dom.js').then((m) => m.showToast('Exportando CSV...', 'success'));
    },
    'share': () => {
      import('../utils/dom.js').then((m) => m.showToast('Enlace copiado al portapapeles', 'success'));
    },
  });

  return () => {
    cleanupEvents();
    if (abortController) abortController.abort();
  };
}
