/**
 * kpi-card.js — KPI Metric Card Component
 * Two variants: tech dashboard (simple) and team/deps (with icon + trend)
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * KPI Card for Tech Dashboard (border-left accent).
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {string} [props.trend] - e.g. "+3 hoy"
 * @param {'primary'|'secondary'|'success'|'warning'|'error'} [props.accentColor='primary']
 * @returns {string}
 */
export function KpiCard({ title, value, trend, accentColor = 'primary' }) {
  return html`
    <div class="kpi-card kpi-card--${accentColor}"
         aria-label="${title}: ${value}${trend ? `, ${trend}` : ''}">
      <span class="kpi-card__title">${title}</span>
      <div class="kpi-card__body">
        <span class="kpi-card__value">${value}</span>
        ${raw(trend ? `<span class="kpi-card__trend" style="color: var(--${accentColor})">${trend}</span>` : '')}
      </div>
    </div>
  `;
}

/**
 * KPI Card with icon (for team management / dependencies pages).
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {string} props.icon - Material icon name
 * @param {string} [props.trend] - e.g. "+2 este mes"
 * @param {'primary'|'secondary'|'success'|'warning'|'error'} [props.accentColor='primary']
 * @param {string} [props.subtitle] - e.g. "of total capacity"
 * @returns {string}
 */
export function KpiCardIcon({ title, value, icon, trend, accentColor = 'primary', subtitle }) {
  return html`
    <div class="card" style="padding: var(--space-6);"
         aria-label="${title}: ${value}${trend ? `, ${trend}` : ''}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
        <span style="color: var(--on-surface-variant); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${title}</span>
        <span class="material-symbols-outlined" style="color: var(--${accentColor}); font-size: 20px;" aria-hidden="true">${icon}</span>
      </div>
      <div style="font-family: var(--font-mono); font-size: var(--text-4xl); font-weight: 900; color: white;">${value}</div>
      ${raw(trend || subtitle ? `
        <div style="margin-top: var(--space-2); display: flex; align-items: center; gap: var(--space-1); font-size: 10px;">
          ${trend ? `<span style="color: var(--${accentColor}); font-weight: 700;">${trend}</span>` : ''}
          ${subtitle ? `<span style="color: var(--on-surface-variant);">${subtitle}</span>` : ''}
        </div>
      ` : '')}
    </div>
  `;
}
