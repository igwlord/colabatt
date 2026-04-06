/**
 * team-display.js — Team Display Page (read-only view)
 * /equipo/:teamId
 */

import { html, raw } from '../utils/safe-html.js';
import { delegateEvents } from '../utils/dom.js';
import { api } from '../api.js';
import { TeamMemberCard } from '../components/cards/team-member-card.js';
import { ErrorState, SkeletonLoader } from '../error-handler.js';

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function TeamDisplay(container, ctx) {
  const teamId = ctx.params.teamId || 'team-001';
  let abortController = new AbortController();
  let members = [];

  // Show skeleton immediately
  container.innerHTML = SkeletonLoader('cards');

  function render() {
    container.innerHTML = html`
      <div style="margin-bottom: var(--space-8);">
        <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
          <span>Equipos</span> / <span style="color: var(--primary);">Equipo ${teamId}</span>
        </nav>
        <h2 style="font-size: var(--text-4xl); font-weight: 900; color: white;">Miembros del Equipo</h2>
      </div>

      <div class="grid-4">
        ${raw(members.map((m) => TeamMemberCard(m)).join(''))}
      </div>
    `;
  }

  async function loadData() {
    try {
      const data = await api.get('/team/' + teamId + '/members', { signal: abortController.signal });
      members = data.members || [];
      render();
    } catch (err) {
      if (err.name === 'AbortError') return;
      container.innerHTML = ErrorState('No se pudo cargar el equipo.');
    }
  }

  loadData();

  const cleanupEvents = delegateEvents(container, {
    'contact': (el) => {
      const id = el.dataset.id;
      const member = members.find((m) => m.id === id);
      if (member) {
        import('../utils/dom.js').then((m) => m.showToast(`Contactando a ${member.name}...`, 'info'));
      }
    },
  });

  return () => {
    cleanupEvents();
    if (abortController) abortController.abort();
  };
}
