/**
 * team-management.js — Team Management Page
 * /manager/equipo/:projectId
 */

import { html, raw } from '../utils/safe-html.js';
import { delegateEvents, updateSection } from '../utils/dom.js';
import { appStore } from '../store.js';
import { api } from '../api.js';
import { KpiCardIcon } from '../components/cards/kpi-card.js';
import { TeamMemberCard } from '../components/cards/team-member-card.js';
import { VacancyCard } from '../components/cards/vacancy-card.js';
import { FilterBar } from '../components/filters/filter-bar.js';
import { ErrorState, SkeletonLoader } from '../error-handler.js';

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function TeamManagement(container, ctx) {
  const projectId = ctx.params.projectId || 'proj-001';
  let activeFilter = 'all';
  let abortController = new AbortController();

  // Cached data from API
  let teamKpis = [];
  let teamMembers = [];
  let vacancies = [];
  let teamFilterOptions = [];

  // Show skeleton immediately
  container.innerHTML = SkeletonLoader('cards');

  function getFiltered() {
    if (activeFilter === 'all') return teamMembers;
    return teamMembers.filter((m) =>
      m.department.toLowerCase().includes(activeFilter)
    );
  }

  function renderEmptyState() {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-12) 0; text-align: center; grid-column: 1 / -1;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--outline-variant); margin-bottom: var(--space-4);">search_off</span>
        <h3 style="color: white; margin-bottom: var(--space-2);">Sin resultados</h3>
        <p style="color: var(--on-surface-variant); font-size: var(--text-sm);">No hay miembros que coincidan con este filtro.</p>
      </div>
    `;
  }

  function renderCards() {
    const filtered = getFiltered();
    if (filtered.length === 0 && vacancies.length === 0) {
      return renderEmptyState();
    }
    return `
      ${filtered.map((m) => TeamMemberCard(m)).join('')}
      ${vacancies.map((v) => VacancyCard(v)).join('')}
    `;
  }

  function render() {
    container.innerHTML = html`
      <section style="margin-bottom: var(--space-12); display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <span style="color: var(--primary); font-family: var(--font-mono); font-size: var(--text-sm); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: var(--space-2); display: block;">Enterprise Infrastructure</span>
          <h2 style="font-size: var(--text-4xl); font-weight: 900; color: white; line-height: 1.1;">
            Soporte Migraci\u00f3n 5G —<br/>
            <span style="color: var(--on-surface-variant);">Gesti\u00f3n de Equipo</span>
          </h2>
        </div>
        <button class="btn btn--primary" data-action="publish-vacancy">
          <span class="material-symbols-outlined" aria-hidden="true">person_add</span>
          Publicar nueva vacante
        </button>
      </section>

      <section class="grid-4" style="margin-bottom: var(--space-12);">
        ${raw(teamKpis.map((k) => KpiCardIcon(k)).join(''))}
      </section>

      <section id="team-filter" style="margin-bottom: var(--space-8);">
        ${raw(FilterBar({
          label: 'FILTRAR POR',
          filterKey: 'team-filter',
          options: teamFilterOptions,
          activeValue: activeFilter,
          showSort: true,
        }))}
      </section>

      <section id="team-grid" class="grid-4">
        ${raw(renderCards())}
      </section>
    `;
  }

  async function loadAll() {
    try {
      const [kpiData, teamData] = await Promise.all([
        api.get('/kpis/team', { signal: abortController.signal }),
        api.get('/team/' + projectId + '/members', { signal: abortController.signal }),
      ]);
      teamKpis = kpiData || [];
      teamMembers = teamData.members || [];
      vacancies = teamData.vacancies || [];
      teamFilterOptions = teamData.filters || [];
      render();
    } catch (err) {
      if (err.name === 'AbortError') return;
      container.innerHTML = ErrorState('No se pudo cargar el equipo.');
    }
  }

  loadAll();

  const cleanupEvents = delegateEvents(container, {
    'filter': (el) => {
      activeFilter = el.dataset.value;
      updateSection('team-filter', FilterBar({
        label: 'FILTRAR POR',
        filterKey: 'team-filter',
        options: teamFilterOptions,
        activeValue: activeFilter,
        showSort: true,
      }));
      updateSection('team-grid', renderCards());
    },
    'contact': (el) => {
      const id = el.dataset.id;
      const member = teamMembers.find((m) => m.id === id);
      if (member) {
        import('../utils/dom.js').then((m) => m.showToast(`Contactando a ${member.name}...`, 'info'));
      }
    },
    'manage-vacancy': (el) => {
      import('../utils/dom.js').then((m) => m.showToast('Abriendo gesti\u00f3n de vacante...', 'info'));
    },
    'publish-vacancy': () => {
      import('../router.js').then((m) => m.navigate('/manager/nueva-necesidad'));
    },
  });

  return () => {
    cleanupEvents();
    if (abortController) abortController.abort();
  };
}
