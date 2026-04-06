/**
 * chip.js — Filter Chip & Skill Tag Components
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * Filter chip (pill-shaped, toggleable).
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.active=false]
 * @param {string} [props.filterKey] - data-key for filter identification
 * @param {string} [props.filterValue] - data-value for filter value
 * @returns {string}
 */
export function Chip({ label, active = false, filterKey, filterValue }) {
  return html`
    <button
      class="chip ${raw(active ? 'chip--active' : '')}"
      role="option"
      aria-selected="${active ? 'true' : 'false'}"
      data-action="filter"
      ${raw(filterKey ? `data-key="${filterKey}"` : '')}
      ${raw(filterValue ? `data-value="${filterValue}"` : '')}
    >
      ${label}
    </button>
  `;
}

/**
 * Skill tag (small, mono font).
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.removable=false]
 * @returns {string}
 */
export function SkillTag({ label, removable = false }) {
  return html`
    <span class="skill-tag">
      ${label}
      ${raw(removable
        ? `<button class="skill-tag__remove" data-action="remove-skill" data-skill="${label}" aria-label="Quitar ${label}">&times;</button>`
        : ''
      )}
    </span>
  `;
}
