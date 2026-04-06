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

  // Build skills with status
  const skillsData = opp ? opp.skills.map(s => {
    const status = getSkillStatus(user.id, s);
    const courses = findCoursesBySkill(s);
    const course = courses.length ? courses[0] : null;
    return { name: s, status, course };
  }) : [];

  // Calculate match score: acquired=1, in-progress=0.5, rest=0
  const matchScore = skillsData.length
    ? Math.round(
        skillsData.reduce((sum, s) => {
          if (s.status === 'acquired') return sum + 1;
          if (s.status === 'in-progress') return sum + 0.5;
          return sum;
        }, 0) / skillsData.length * 100
      )
    : 0;

  const matchColor = matchScore >= 75 ? 'var(--success)' : matchScore >= 40 ? 'var(--warning)' : 'var(--error)';

  // Status chip renderer
  function statusChip(status, course) {
    if (status === 'acquired') {
      return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--on-tertiary-container);background:color-mix(in srgb,var(--success) 18%,transparent);padding:3px 8px;border-radius:var(--radius-full);"><span class="material-symbols-outlined" style="font-size:12px;color:var(--success);font-variation-settings:'FILL' 1;">check_circle</span>Tenés</span>`;
    }
    if (status === 'in-progress') {
      return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--primary);background:color-mix(in srgb,var(--primary) 12%,transparent);padding:3px 8px;border-radius:var(--radius-full);"><span class="material-symbols-outlined" style="font-size:12px;color:var(--primary);">trending_up</span>En curso</span>`;
    }
    const label = status === 'planned' ? 'Planificado' : 'Gap';
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--warning);background:color-mix(in srgb,var(--warning) 12%,transparent);padding:3px 8px;border-radius:var(--radius-full);"><span class="material-symbols-outlined" style="font-size:12px;color:var(--warning);">school</span>${label}${course ? ' (PLE)' : ''}</span>`;
  }

  // Skills match table
  function skillsTable() {
    if (!skillsData.length) return '';
    const rows = skillsData.map(s => `
      <div style="display:contents;">
        <div style="padding:var(--space-2) var(--space-3);display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:var(--text-xs);font-weight:600;color:white;">${esc(s.name)}</span>
          ${s.course && (s.status === 'gap' || s.status === 'planned')
            ? `<span style="font-size:10px;color:var(--on-surface-variant);">${esc(s.course.title)} · ${esc(s.course.provider)}</span>`
            : ''}
        </div>
        <div style="padding:var(--space-2) var(--space-3);display:flex;align-items:center;">
          ${statusChip(s.status, s.course)}
        </div>
      </div>
    `).join('');

    return `
      <div style="border:1px solid var(--outline-alpha-20);border-radius:var(--radius-md);overflow:hidden;margin-bottom:var(--space-3);">
        <div style="display:grid;grid-template-columns:1fr auto;background:var(--surface-high);">
          <div style="padding:var(--space-2) var(--space-3);font-size:10px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--on-surface-variant);">Skill requerido</div>
          <div style="padding:var(--space-2) var(--space-3);font-size:10px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--on-surface-variant);">Tu estado</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;">
          ${rows}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-3);">
        <div style="flex:1;height:6px;background:var(--surface-highest);border-radius:var(--radius-full);overflow:hidden;">
          <div style="height:100%;width:${matchScore}%;background:${matchColor};border-radius:var(--radius-full);transition:width var(--ease-smooth);"></div>
        </div>
        <span style="font-size:var(--text-xs);font-weight:700;color:${matchColor};min-width:60px;text-align:right;">
          <span style="font-size:var(--text-md);font-weight:800;">${matchScore}%</span> match
        </span>
      </div>
    `;
  }

  // Compact contacts line
  function contactsLine() {
    if (!opp) return '';
    const parts = [];
    if (opp.managerName) {
      parts.push(`
        <span style="display:inline-flex;align-items:center;gap:var(--space-2);">
          <span class="material-symbols-outlined" style="font-size:14px;color:var(--on-surface-variant);">person</span>
          <span style="font-size:var(--text-xs);color:white;font-weight:500;">${esc(opp.managerName)}</span>
          ${opp.managerEmail ? `<a href="mailto:${esc(opp.managerEmail)}" style="color:var(--primary);display:inline-flex;" title="Email manager"><span class="material-symbols-outlined" style="font-size:14px;">mail</span></a>` : ''}
        </span>
      `);
    }
    if (opp.pmName && opp.pmName !== opp.managerName) {
      parts.push(`
        <span style="display:inline-flex;align-items:center;gap:var(--space-2);">
          <span class="material-symbols-outlined" style="font-size:14px;color:var(--on-surface-variant);">badge</span>
          <span style="font-size:var(--text-xs);color:white;font-weight:500;">${esc(opp.pmName)}</span>
          ${opp.pmEmail ? `<a href="mailto:${esc(opp.pmEmail)}" style="color:var(--primary);display:inline-flex;" title="Email PM"><span class="material-symbols-outlined" style="font-size:14px;">mail</span></a>` : ''}
        </span>
      `);
    }
    if (opp.teamsLink) {
      parts.push(`
        <a href="${esc(opp.teamsLink)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--primary);font-weight:500;text-decoration:none;">
          <span class="material-symbols-outlined" style="font-size:14px;">videocam</span>
          Canal Teams
          <span class="material-symbols-outlined" style="font-size:12px;">open_in_new</span>
        </a>
      `);
    }
    if (!parts.length) return '';
    return `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4);padding:var(--space-3) var(--space-4);background:var(--surface-high);border-radius:var(--radius-md);margin-bottom:var(--space-4);">
        ${parts.join('<span style="color:var(--outline-variant);">·</span>')}
      </div>
    `;
  }

  const bodyHtml = `
    <div class="pm-modal" style="display:flex;flex-direction:column;gap:var(--space-4);">
      ${opp ? `
        <!-- Sección 1: Header compacto -->
        <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
              <span style="font-size:10px;font-weight:700;font-family:var(--font-mono);text-transform:uppercase;color:${opp.priority === 'urgente' ? 'var(--warning)' : opp.priority === 'critico' ? 'var(--error)' : 'var(--on-surface-variant)'};background:color-mix(in srgb,${opp.priority === 'urgente' ? 'var(--warning)' : opp.priority === 'critico' ? 'var(--error)' : 'var(--on-surface-variant)'} 12%,transparent);padding:2px 8px;border-radius:var(--radius-full);">${esc(opp.priority)}</span>
              ${opp.applicantCount > 0 ? `<span style="font-size:10px;color:var(--on-surface-variant);font-family:var(--font-mono);">${opp.applicantCount} postulante${opp.applicantCount > 1 ? 's' : ''}</span>` : ''}
            </div>
            <h4 style="font-size:var(--text-lg);font-weight:700;color:white;margin-bottom:var(--space-1);">${esc(opp.title)}</h4>
            ${opp.description ? `<p style="font-size:var(--text-xs);color:var(--on-surface-variant);line-height:1.5;">${esc(opp.description)}</p>` : ''}
          </div>
          <span style="font-size:var(--text-xl);font-weight:800;color:${matchColor};flex-shrink:0;">${matchScore}%</span>
        </div>

        <!-- Sección 2: Skills Match -->
        <div>
          <div style="font-size:10px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--on-surface-variant);margin-bottom:var(--space-2);">Skills Match</div>
          ${skillsTable()}
        </div>

        <!-- Sección 3: Detalles 2×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
          <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--surface-high);border-radius:var(--radius-md);">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">business_center</span>
            <div>
              <div style="font-size:10px;color:var(--on-surface-variant);">Business Unit</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:white;">${esc(opp.buName || opp.bu)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--surface-high);border-radius:var(--radius-md);">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">schedule</span>
            <div>
              <div style="font-size:10px;color:var(--on-surface-variant);">Dedicación</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:white;">${opp.hoursPerWeek}h/semana</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--surface-high);border-radius:var(--radius-md);">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">calendar_month</span>
            <div>
              <div style="font-size:10px;color:var(--on-surface-variant);">Inicio estimado</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:white;">${esc(opp.startDate || 'Por definir')}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--surface-high);border-radius:var(--radius-md);">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">location_on</span>
            <div>
              <div style="font-size:10px;color:var(--on-surface-variant);">Ubicación</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:white;">${esc(opp.location || 'Remoto')}</div>
            </div>
          </div>
        </div>

        <!-- Sección 4: Contacto 1 línea -->
        ${contactsLine()}
      ` : `<p style="font-size:var(--text-xs);color:var(--on-surface-variant);">Cargando detalles...</p>`}

      <!-- Sección 5: Mensaje -->
      <div>
        <label style="display:block;font-size:10px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--on-surface-variant);margin-bottom:var(--space-2);" for="postularme-message">
          Mensaje al manager <span style="color:var(--outline);font-weight:400;text-transform:none;letter-spacing:0;">(opcional)</span>
        </label>
        <textarea
          id="postularme-message"
          class="pm-textarea"
          rows="3"
          placeholder="Explica por qué eres un buen fit para este proyecto..."
        ></textarea>
      </div>

      <!-- Info banner -->
      <div class="pm-info">
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);flex-shrink:0;">info</span>
        <span>Tu perfil y disponibilidad (<strong>${user.availableHours}h/sem</strong>) serán compartidos automáticamente.</span>
      </div>
    </div>
  `;

  const footerHtml = html`
    <button class="btn btn--ghost" data-action="close-modal">Cancelar</button>
    <button class="btn btn--primary" id="btn-confirm-postularme">
      <span class="material-symbols-outlined" aria-hidden="true">send</span>
      Enviar Postulación
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
          showToast('Postulación enviada exitosamente!', 'success');
        } catch (err) {
          if (err.name === 'AbortError') return;
          handleApiError(err);
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">send</span>
            Enviar Postulación
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
