/**
 * postularme-modal.js — Application Modal
 */

import { html, raw } from '../../utils/safe-html.js';
import { openModal } from '../ui/modal.js';
import { showToast } from '../../utils/dom.js';
import { api } from '../../api.js';
import { handleApiError } from '../../error-handler.js';
import { appStore } from '../../store.js';
import { getSkillStatus } from '../../mock/growth-paths.js';
import { findCoursesBySkill } from '../../mock/ple-courses.js';

/**
 * Open the "Postularme" modal for a given opportunity.
 * @param {string} opportunityId
 * @param {Object} [opp] - Opportunity data (optional)
 */
export function openPostularmeModal(opportunityId, opp) {
  const user = appStore.get('user');

  // Classify skills
  const skillsHtml = opp ? opp.skills.map(s => {
    const status = getSkillStatus(user.id, s);
    const courses = findCoursesBySkill(s);
    const courseHint = courses.length ? courses[0].title + ' (' + courses[0].provider + ')' : '';

    if (status === 'acquired') {
      return html`<span class="pm-skill pm-skill--acquired"><span class="material-symbols-outlined pm-skill__icon" style="color: var(--success); font-variation-settings: 'FILL' 1;">check_circle</span>${s}</span>`;
    }
    if (status === 'in-progress') {
      return html`<span class="pm-skill pm-skill--progress"><span class="material-symbols-outlined pm-skill__icon" style="color: var(--primary);">trending_up</span>${s}</span>`;
    }
    return html`<span class="pm-skill pm-skill--gap" title="${courseHint ? 'PLE: ' + courseHint : ''}"><span class="material-symbols-outlined pm-skill__icon" style="color: var(--warning);">school</span>${s}</span>`;
  }).join('') : '';

  // Gap courses
  const gapCourses = opp ? opp.skills.filter(s => {
    const st = getSkillStatus(user.id, s);
    return st === 'gap' || st === 'planned';
  }).map(s => {
    const courses = findCoursesBySkill(s);
    if (!courses.length) return null;
    const c = courses[0];
    return { skill: s, title: c.title, provider: c.provider, duration: c.duration };
  }).filter(Boolean) : [];

  const bodyHtml = `
    <div class="pm-modal">
      ${opp ? `
        <!-- Header section -->
        <div class="pm-header">
          <div class="pm-header__top">
            <div class="pm-header__priority pm-header__priority--${opp.priority}">${esc(opp.priority)}</div>
            ${opp.applicantCount > 0 ? `<span class="pm-header__applicants">${opp.applicantCount} postulante${opp.applicantCount > 1 ? 's' : ''}</span>` : ''}
          </div>
          <h4 class="pm-header__title">${esc(opp.title)}</h4>
          ${opp.description ? `<p class="pm-header__desc">${esc(opp.description)}</p>` : ''}
        </div>

        <!-- Skills -->
        <div class="pm-section">
          <div class="pm-section__label">Skills requeridos</div>
          <div class="pm-skills">${skillsHtml}</div>
          <div class="pm-skills-legend">
            <span><span class="material-symbols-outlined" style="font-size: 10px; color: var(--success); font-variation-settings: 'FILL' 1; vertical-align: middle;">check_circle</span> Adquirido</span>
            <span><span class="material-symbols-outlined" style="font-size: 10px; color: var(--primary); vertical-align: middle;">trending_up</span> En curso</span>
            <span><span class="material-symbols-outlined" style="font-size: 10px; color: var(--warning); vertical-align: middle;">school</span> Gap (PLE)</span>
          </div>
        </div>

        <!-- Details grid -->
        <div class="pm-section">
          <div class="pm-section__label">Detalles del proyecto</div>
          <div class="pm-details">
            <div class="pm-detail">
              <span class="material-symbols-outlined pm-detail__icon">business_center</span>
              <div><span class="pm-detail__label">Business Unit</span><span class="pm-detail__value">${esc(opp.buName || opp.bu)}</span></div>
            </div>
            <div class="pm-detail">
              <span class="material-symbols-outlined pm-detail__icon">schedule</span>
              <div><span class="pm-detail__label">Dedicaci\u00f3n</span><span class="pm-detail__value">${opp.hoursPerWeek}h/semana</span></div>
            </div>
            <div class="pm-detail">
              <span class="material-symbols-outlined pm-detail__icon">calendar_month</span>
              <div><span class="pm-detail__label">Inicio estimado</span><span class="pm-detail__value">${esc(opp.startDate || 'Por definir')}</span></div>
            </div>
            <div class="pm-detail">
              <span class="material-symbols-outlined pm-detail__icon">location_on</span>
              <div><span class="pm-detail__label">Ubicaci\u00f3n</span><span class="pm-detail__value">${esc(opp.location || 'Remoto')}</span></div>
            </div>
          </div>
        </div>

        <!-- Contacts -->
        <div class="pm-section">
          <div class="pm-section__label">Contactos</div>
          <div class="pm-contacts">
            ${opp.managerName ? `
              <div class="pm-contact">
                <div class="pm-contact__avatar">${esc(initials(opp.managerName))}</div>
                <div class="pm-contact__info">
                  <span class="pm-contact__name">${esc(opp.managerName)}</span>
                  <span class="pm-contact__role">Manager</span>
                </div>
                <a href="mailto:${esc(opp.managerEmail)}" class="pm-contact__action" title="Enviar email">
                  <span class="material-symbols-outlined" style="font-size: 16px;">mail</span>
                </a>
              </div>
            ` : ''}
            ${opp.pmName ? `
              <div class="pm-contact">
                <div class="pm-contact__avatar pm-contact__avatar--pm">${esc(initials(opp.pmName))}</div>
                <div class="pm-contact__info">
                  <span class="pm-contact__name">${esc(opp.pmName)}</span>
                  <span class="pm-contact__role">Project Manager</span>
                </div>
                <a href="mailto:${esc(opp.pmEmail)}" class="pm-contact__action" title="Enviar email">
                  <span class="material-symbols-outlined" style="font-size: 16px;">mail</span>
                </a>
              </div>
            ` : ''}
            ${opp.teamsLink ? `
              <div class="pm-contact">
                <div class="pm-contact__avatar pm-contact__avatar--teams">
                  <span class="material-symbols-outlined" style="font-size: 16px;">videocam</span>
                </div>
                <div class="pm-contact__info">
                  <span class="pm-contact__name">Canal de Teams</span>
                  <span class="pm-contact__role">Reuniones del equipo</span>
                </div>
                <a href="${esc(opp.teamsLink)}" target="_blank" rel="noopener noreferrer" class="pm-contact__action" title="Unirse a Teams">
                  <span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>
                </a>
              </div>
            ` : ''}
          </div>
        </div>

        ${gapCourses.length ? `
        <!-- PLE recommendations -->
        <div class="pm-section pm-ple">
          <div class="pm-section__label"><span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; color: var(--warning);">school</span> Cursos PLE recomendados</div>
          <div class="pm-ple-list">
            ${gapCourses.map(c => `
              <div class="pm-ple-item">
                <div class="pm-ple-item__info">
                  <span class="pm-ple-item__skill">${esc(c.skill)}</span>
                  <span class="pm-ple-item__title">${esc(c.title)}</span>
                </div>
                <span class="pm-ple-item__meta">${esc(c.provider)} · ${esc(c.duration)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

      ` : `<p style="font-size: var(--text-xs); color: var(--on-surface-variant);">Cargando detalles...</p>`}

      <!-- Message -->
      <div class="pm-section">
        <label class="pm-section__label" for="postularme-message">Mensaje al manager <span style="color: var(--on-surface-variant); font-weight: 400;">(opcional)</span></label>
        <textarea
          id="postularme-message"
          class="pm-textarea"
          rows="3"
          placeholder="Explica por qu\u00e9 eres un buen fit para este proyecto..."
        ></textarea>
      </div>

      <!-- Info banner -->
      <div class="pm-info">
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary); flex-shrink: 0;">info</span>
        <span>Tu perfil y disponibilidad (<strong>${user.availableHours}h/sem</strong>) ser\u00e1n compartidos autom\u00e1ticamente.</span>
      </div>
    </div>
  `;

  const footerHtml = html`
    <button class="btn btn--ghost" data-action="close-modal">Cancelar</button>
    <button class="btn btn--primary" id="btn-confirm-postularme">
      <span class="material-symbols-outlined" aria-hidden="true">send</span>
      Enviar Postulaci\u00f3n
    </button>
  `;

  let close = openModal({
    title: 'Postularme al Proyecto',
    bodyHtml,
    footerHtml,
    size: 'md',
  });

  appStore.set({ modalOpen: 'postularme' });

  // Confirm handler
  let destroyed = false;
  const timerId = setTimeout(() => {
    if (destroyed) return;
    const confirmBtn = document.getElementById('btn-confirm-postularme');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const messageEl = document.getElementById('postularme-message');
        const message = messageEl ? messageEl.value.trim() : '';

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Enviando...';

        try {
          await api.post('/applications', {
            opportunityId,
            userId: user.id,
            message,
          });
          close();
          showToast('Postulaci\u00f3n enviada exitosamente!', 'success');
        } catch (err) {
          if (err.name === 'AbortError') return;
          handleApiError(err);
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">send</span>
            Enviar Postulaci\u00f3n
          `;
        }
      });
    }
  }, 50);

  const originalClose = close;
  close = () => { destroyed = true; clearTimeout(timerId); originalClose(); };
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
