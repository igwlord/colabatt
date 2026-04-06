/**
 * opportunity-card.js — Opportunity Card Component
 * Horizontal card with BU badge, skills, hours, priority, and CTA.
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.title
 * @param {string} props.bu - e.g. "BU-01"
 * @param {string[]} props.skills
 * @param {number} props.hoursPerWeek
 * @param {'urgente'|'normal'|'critico'} props.priority
 * @returns {string}
 */
export function OpportunityCard({ id, title, bu, buName, skills, hoursPerWeek, priority }) {
  const borderColor = priority === 'urgente' ? 'var(--error)'
    : priority === 'critico' ? 'var(--error-container)'
    : 'transparent';

  const priorityLabel = priority === 'urgente' ? 'Urgente'
    : priority === 'critico' ? 'Cr\u00edtico'
    : 'Normal';

  const priorityColor = priority === 'normal' ? 'var(--primary-container)' : 'var(--error)';

  const isUrgent = priority === 'urgente' || priority === 'critico';

  return html`
    <div class="opportunity-card" style="border-left-color: ${borderColor}">
      <div class="opportunity-card__left">
        <div class="opportunity-card__bu">${buName || bu}</div>
        <div class="opportunity-card__info">
          <h3 class="opportunity-card__title">${title}</h3>
          <div class="opportunity-card__meta">
            <div class="opportunity-card__skills">
              ${raw(skills.map((s) => `<span class="skill-tag">${s}</span>`).join(''))}
            </div>
            <span class="opportunity-card__separator"></span>
            <span class="opportunity-card__hours">${hoursPerWeek}h/sem</span>
          </div>
        </div>
      </div>
      <div class="opportunity-card__right">
        <div class="opportunity-card__priority" style="--priority-color: ${priorityColor}">
          <span class="opportunity-card__priority-dot" style="background: ${priorityColor}"></span>
          <span class="opportunity-card__priority-label" style="color: ${priorityColor}">${priorityLabel}</span>
        </div>
        <button
          class="btn ${raw(isUrgent ? 'btn--primary' : 'btn--secondary')}"
          data-action="postularme"
          data-id="${id}"
        >Postularme</button>
      </div>
    </div>
  `;
}
