/**
 * team-member-card.js — Team Member Card Component
 * Vertical card with avatar, status dot, availability bar, skills.
 */

import { html, raw } from '../../utils/safe-html.js';
import { ProgressBar } from '../ui/progress-bar.js';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.role - Job title
 * @param {string} props.bu
 * @param {string} props.department
 * @param {string} [props.avatarUrl]
 * @param {'free'|'partial'|'busy'} props.status
 * @param {number} props.availableHours
 * @param {number} props.totalHours - e.g. 40
 * @param {string[]} props.skills
 * @returns {string}
 */
export function TeamMemberCard({ id, name, role, bu, department, avatarUrl, status, availableHours, totalHours = 40, skills }) {
  const usedPercent = Math.round(((totalHours - availableHours) / totalHours) * 100);
  const barVariant = status === 'busy' ? 'error' : status === 'partial' ? 'warning' : 'primary';

  const statusColor = status === 'free' ? 'var(--primary)'
    : status === 'partial' ? 'var(--warning)'
    : 'var(--error)';

  const statusLabel = status === 'free' ? 'disponible'
    : status === 'partial' ? 'parcial'
    : 'ocupado';

  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return html`
    <div class="team-card" data-id="${id}">
      <div class="team-card__header">
        <div class="team-card__avatar-wrap">
          ${raw(avatarUrl
            ? `<img src="${avatarUrl}" alt="${name}" class="team-card__avatar" />`
            : `<div class="team-card__avatar team-card__avatar--fallback" role="img" aria-label="${name}">${initials}</div>`
          )}
          <span
            class="team-card__status-dot"
            style="background: ${statusColor}"
            aria-label="Estado: ${statusLabel}"
            title="${statusLabel}"
          ></span>
        </div>
        <div class="team-card__bu-info">
          <span class="team-card__bu">${bu}</span>
          <span class="team-card__dept">${department}</span>
        </div>
      </div>
      <div class="team-card__body">
        <h3 class="team-card__name">${name}</h3>
        <p class="team-card__role">${role}</p>
      </div>
      <div class="team-card__availability">
        <div class="team-card__avail-header">
          <span class="team-card__avail-label">Disponibilidad</span>
          <span class="team-card__avail-value">${availableHours}h disponibles</span>
        </div>
        ${raw(ProgressBar({ value: usedPercent, variant: barVariant, label: `${availableHours} horas disponibles de ${totalHours}` }))}
      </div>
      <div class="team-card__skills">
        ${raw(skills.map((s) => `<span class="skill-tag">${s}</span>`).join(''))}
      </div>
      <button
        class="btn btn--ghost btn--full team-card__action"
        data-action="contact"
        data-id="${id}"
      >
        <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 16px;">mail</span>
        Contactar
      </button>
    </div>
  `;
}
