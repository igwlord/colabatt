import { html, raw } from '../../utils/safe-html.js';

export function EmptyState({ icon = 'search_off', title = 'Sin resultados', message = '', actionLabel, actionRoute }) {
  return html`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-12) var(--space-6); text-align: center; gap: var(--space-4);">
      <span class="material-symbols-outlined" style="font-size: 48px; color: var(--on-surface-variant); opacity: 0.5;" aria-hidden="true">${icon}</span>
      <h3 style="font-size: var(--text-lg); font-weight: 600; color: white;">${title}</h3>
      ${raw(message ? html`<p style="font-size: var(--text-sm); color: var(--on-surface-variant); max-width: 400px;">${message}</p>` : '')}
      ${raw(actionLabel && actionRoute ? html`<a href="${actionRoute}" class="btn btn--secondary" style="margin-top: var(--space-4);">${actionLabel}</a>` : '')}
    </div>
  `;
}
