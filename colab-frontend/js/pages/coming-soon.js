/**
 * coming-soon.js — Reusable "En Desarrollo" Page Component
 * Used for pages that are not yet implemented.
 */

import { html, raw } from '../utils/safe-html.js';
import { navigate } from '../router.js';
import { appStore } from '../store.js';

/**
 * @param {HTMLElement} container
 * @param {{ title: string, subtitle: string, icon: string, breadcrumbs: Array<{ label: string, href?: string|null, active?: boolean }> }} options
 * @returns {function(): void} cleanup
 */
export function ComingSoonPage(container, { title, subtitle, icon, breadcrumbs }) {
  const breadcrumbHtml = breadcrumbs
    .map((b, i) => {
      const separator = i < breadcrumbs.length - 1 ? ' / ' : '';
      if (b.active) {
        return html`<span style="color: var(--primary);">${b.label}</span>`;
      }
      return html`<span>${b.label}</span>${raw(separator)}`;
    })
    .join('');

  container.innerHTML = html`
    <div class="page-breadcrumb">
      <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
        ${raw(breadcrumbHtml)}
      </nav>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; gap: var(--space-6);">
      <span class="material-symbols-outlined" style="font-size: 48px; color: var(--primary);">${icon}</span>
      <h2 style="font-size: var(--text-3xl); color: white; font-weight: 700;">${title}</h2>
      <p style="font-size: var(--text-base); color: var(--on-surface-variant);">${subtitle}</p>
      <p style="font-size: var(--text-sm); color: var(--on-surface-variant);">Esta funcionalidad está en desarrollo activo.</p>
      <span style="background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary); font-size: var(--text-xs); font-family: var(--font-mono); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full);">Disponible Q2 2026</span>
      <button class="btn btn--secondary" data-action="back">Volver al inicio</button>
    </div>
  `;

  function handleClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (actionEl && actionEl.dataset.action === 'back') {
      e.preventDefault();
      const user = appStore.get('user');
      const home = (user?.role === 'manager' || user?.role === 'admin') ? '/manager/dashboard' : '/tecnico/oportunidades';
      navigate(home);
    }
  }

  container.addEventListener('click', handleClick);

  return () => {
    container.removeEventListener('click', handleClick);
  };
}
