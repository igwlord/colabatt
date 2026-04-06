/**
 * tech-dashboard.js — Technician Dashboard Page
 * /tecnico/oportunidades
 */

import { html, raw } from '../utils/safe-html.js';
import { delegateEvents, updateSection } from '../utils/dom.js';
import { appStore } from '../store.js';
import { api } from '../api.js';
import { KpiCard } from '../components/cards/kpi-card.js';
import { OpportunityCard } from '../components/cards/opportunity-card.js';
import { FilterBar } from '../components/filters/filter-bar.js';
import { ErrorState, SkeletonLoader } from '../error-handler.js';

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function TechDashboard(container, ctx) {
  const user = appStore.get('user');
  let abortController = null;
  let fetchTimeout = null;

  // Cached data from API
  let kpis = [];
  let allOpportunities = [];
  let filterOptions = [];

  // Show skeleton immediately
  container.innerHTML = SkeletonLoader('dashboard');

  function buildQueryString() {
    const cat = appStore.get('filters').category;
    const search = appStore.get('searchQuery') || '';
    const params = [];
    if (cat && cat !== 'all') params.push('category=' + encodeURIComponent(cat));
    if (search) params.push('search=' + encodeURIComponent(search));
    return params.length ? '?' + params.join('&') : '';
  }

  function renderFilterBar() {
    return FilterBar({
      label: 'Filtros',
      filterKey: 'category',
      options: filterOptions,
      activeValue: appStore.get('filters').category,
    });
  }

  function renderEmptyState() {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-12) 0; text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--outline-variant); margin-bottom: var(--space-4);">search_off</span>
        <h3 style="color: white; margin-bottom: var(--space-2);">Sin resultados</h3>
        <p style="color: var(--on-surface-variant); font-size: var(--text-sm);">No hay oportunidades que coincidan con este filtro.</p>
      </div>
    `;
  }

  function renderPage(opportunities) {
    const statusColor = user.status === 'free' ? 'var(--success)'
      : user.status === 'partial' ? 'var(--warning)'
      : 'var(--error)';
    const statusLabel = user.status === 'free' ? 'Disponible'
      : user.status === 'partial' ? 'Parcial'
      : 'Ocupado';

    container.innerHTML = html`
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-10);">
        <div>
          <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
            <span>Dashboard</span> / <span>T\u00e9cnico</span> / <span style="color: var(--primary);">Oportunidades</span>
          </nav>
          <h2 style="font-size: var(--text-4xl); font-weight: 600; letter-spacing: -0.02em; color: white; font-family: var(--font-sans);">Oportunidades disponibles</h2>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2);">
          <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-4); background: var(--surface-high); border-radius: var(--radius-lg); border: 1px solid var(--outline-alpha-20);">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${raw(statusColor)};"></span>
            <span style="font-size: var(--text-xs); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; color: ${raw(statusColor)};">${statusLabel}</span>
            <span style="height: 16px; width: 1px; background: var(--outline-alpha-30);"></span>
            <span style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--on-surface-variant);"><span style="color: white; font-weight: 700;">${user.availableHours}h</span>/sem disp.</span>
          </div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: var(--space-10);">
        ${raw(kpis.map((k) => KpiCard(k)).join(''))}
      </div>

      <div id="filter-section" style="margin-bottom: var(--space-8);">
        ${raw(renderFilterBar())}
      </div>

      <div id="opportunity-list" style="display: flex; flex-direction: column; gap: var(--space-4);">
        ${raw(opportunities.length > 0
          ? opportunities.map((o) => OpportunityCard(o)).join('')
          : renderEmptyState()
        )}
      </div>
    `;
  }

  async function fetchOpportunities() {
    // Cancel any pending request
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const qs = buildQueryString();

    try {
      const data = await api.get('/opportunities' + qs, { signal: abortController.signal });
      allOpportunities = data.items || [];
      if (data.filters && data.filters.length > 0) {
        filterOptions = data.filters;
      }
      return allOpportunities;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  }

  async function loadAll() {
    try {
      const [kpiData, oppData] = await Promise.all([
        api.get('/kpis/tech'),
        api.get('/opportunities' + buildQueryString()),
      ]);
      kpis = kpiData || [];
      allOpportunities = oppData.items || [];
      filterOptions = oppData.filters || [];
      renderPage(allOpportunities);
    } catch (err) {
      if (err.name === 'AbortError') return;
      container.innerHTML = ErrorState('No se pudieron cargar las oportunidades.');
    }
  }

  loadAll();

  // Event delegation
  const cleanupEvents = delegateEvents(container, {
    'postularme': (el) => {
      const id = el.dataset.id;
      const opp = allOpportunities.find((o) => o.id === id);
      import('../components/forms/postularme-modal.js').then((m) => m.openPostularmeModal(id, opp));
    },
    'filter': (el) => {
      const key = el.dataset.key;
      const value = el.dataset.value;
      appStore.set({ filters: { ...appStore.get('filters'), [key]: value } });
    },
  });

  // React to filter changes — re-fetch from API
  const unsubFilters = appStore.on('filters', async () => {
    updateSection('filter-section', renderFilterBar());
    try {
      const items = await fetchOpportunities();
      if (items === null) return; // aborted
      updateSection('opportunity-list',
        items.length > 0
          ? items.map((o) => OpportunityCard(o)).join('')
          : renderEmptyState()
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateSection('opportunity-list', ErrorState('No se pudieron cargar las oportunidades.'));
      }
    }
  });

  // React to search query changes
  const unsubSearch = appStore.on('searchQuery', async () => {
    try {
      const items = await fetchOpportunities();
      if (items === null) return; // aborted
      updateSection('opportunity-list',
        items.length > 0
          ? items.map((o) => OpportunityCard(o)).join('')
          : renderEmptyState()
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateSection('opportunity-list', ErrorState('No se pudieron cargar las oportunidades.'));
      }
    }
  });

  return () => {
    cleanupEvents();
    unsubFilters();
    unsubSearch();
    if (abortController) abortController.abort();
    if (fetchTimeout) clearTimeout(fetchTimeout);
  };
}
