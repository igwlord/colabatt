/**
 * vacancy-card.js — Vacancy / Open Position Card
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.title - e.g. "L3 Network Support"
 * @param {string} props.bu
 * @param {string} props.priority - "critica" | "alta" | "normal"
 * @param {string[]} props.skills
 * @returns {string}
 */
export function VacancyCard({ id, title, bu, priority = 'critica', skills }) {
  return html`
    <div class="team-card team-card--vacancy" data-id="${id}">
      <div class="team-card__header">
        <div class="team-card__avatar-wrap">
          <div class="team-card__avatar team-card__avatar--vacancy" aria-label="Posicion vacante">
            <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 28px; color: var(--on-surface-variant);">person_search</span>
          </div>
          <span class="team-card__status-dot" style="background: var(--on-surface-variant)"></span>
        </div>
        <div class="team-card__bu-info">
          <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--error);">VACANTE</span>
          <span class="team-card__dept">${bu}</span>
        </div>
      </div>
      <div class="team-card__body">
        <h3 class="team-card__name" style="color: var(--white-alpha-50);">Posici${raw('&oacute;')}n Abierta</h3>
        <p class="team-card__role">${title}</p>
      </div>
      <div class="team-card__availability">
        <div class="team-card__avail-header">
          <span class="team-card__avail-label" style="opacity: 0.5;">Prioridad</span>
          <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--error); text-transform: uppercase;">${priority}</span>
        </div>
        <div class="progress-bar progress-bar--error" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar__fill" style="width: 100%; opacity: 0.2; animation: pulse 2s infinite;"></div>
        </div>
      </div>
      <div class="team-card__skills" style="opacity: 0.5;">
        ${raw(skills.map((s) => `<span class="skill-tag">${s}</span>`).join(''))}
      </div>
      <button
        class="btn btn--full team-card__action"
        style="background: transparent; border: 1px solid var(--error-alpha-50); color: var(--error);"
        data-action="manage-vacancy"
        data-id="${id}"
      >
        <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 16px;">ads_click</span>
        Gestionar Proceso
      </button>
    </div>
  `;
}
