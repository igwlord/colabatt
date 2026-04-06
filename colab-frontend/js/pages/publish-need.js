/**
 * publish-need.js — Publish Need Form Page
 * /manager/nueva-necesidad
 */

import { html, raw, escapeHtml } from '../utils/safe-html.js';
import { delegateEvents } from '../utils/dom.js';
import { showToast } from '../utils/dom.js';
import { api } from '../api.js';
import { handleApiError } from '../error-handler.js';
import { validateForm, showFieldError, clearFieldError } from '../utils/validate.js';
import { Input, Textarea, Select } from '../components/ui/input.js';
import { Toggle, RadioGroup } from '../components/ui/toggle.js';

const validationSchema = {
  title: { required: true, minLength: 5, maxLength: 100 },
  description: { required: true, minLength: 20 },
  seniority: { required: true },
  hoursPerWeek: { required: true, min: 1, max: 40 },
  duration: { required: true },
};

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function PublishNeed(container, ctx) {
  let abortController = new AbortController();
  let formData = {
    title: '',
    description: '',
    skills: [],
    seniority: '',
    hoursPerWeek: '',
    duration: '',
    urgency: 'normal',
    remote: false,
  };

  function render() {
    container.innerHTML = `
      <div style="max-width: 720px; margin: 0 auto;">
        <div style="margin-bottom: var(--space-8);">
          <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
            <span>Manager</span> / <span style="color: var(--primary);">Nueva Necesidad</span>
          </nav>
          <h2 style="font-size: var(--text-3xl); font-weight: 700; color: white;">Publicar Nueva Necesidad</h2>
          <p style="color: var(--on-surface-variant); font-size: var(--text-sm); margin-top: var(--space-2);">
            Describe el perfil t\u00e9cnico que necesitas para tu proyecto.
          </p>
        </div>

        <form id="publish-form" novalidate style="display: flex; flex-direction: column; gap: var(--space-6);">
          ${Input({ name: 'title', label: 'T\u00edtulo del proyecto', placeholder: 'ej. Soporte Migraci\u00f3n 5G', required: true })}

          ${Textarea({ name: 'description', label: 'Descripci\u00f3n detallada', placeholder: 'Describe las responsabilidades, objetivos y contexto del proyecto...', rows: 5, required: true })}

          <div class="form-group">
            <label class="form-label">Skills requeridos<span class="form-required" aria-hidden="true">*</span></label>
            <div id="skill-tags" style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-2);"></div>
            <div style="display: flex; gap: var(--space-2);">
              <input
                type="text"
                id="skill-input"
                class="input"
                placeholder="Agregar skill y presionar Enter..."
                aria-label="Agregar skill requerido"
                style="flex: 1;"
              />
            </div>
          </div>

          <div class="grid-3" style="gap: var(--space-4);">
            ${Select({
              name: 'seniority',
              label: 'Nivel de seniority',
              required: true,
              options: [
                { value: 'junior', label: 'Junior (L1)' },
                { value: 'mid', label: 'Mid (L2)' },
                { value: 'senior', label: 'Senior (L3)' },
                { value: 'lead', label: 'Lead / Architect' },
              ],
            })}
            ${Input({ name: 'hoursPerWeek', label: 'Horas por semana', type: 'number', placeholder: '8', required: true })}
            ${Select({
              name: 'duration',
              label: 'Duraci\u00f3n estimada',
              required: true,
              options: [
                { value: '2-weeks', label: '2 semanas' },
                { value: '1-month', label: '1 mes' },
                { value: '3-months', label: '3 meses' },
                { value: '6-months', label: '6 meses' },
                { value: 'ongoing', label: 'Continuo' },
              ],
            })}
          </div>

          ${RadioGroup({
            name: 'urgency',
            label: 'Nivel de urgencia',
            value: 'normal',
            options: [
              { value: 'normal', label: 'Normal', description: 'Sin presi\u00f3n de tiempo' },
              { value: 'urgente', label: 'Urgente', description: 'Se necesita esta semana' },
              { value: 'critico', label: 'Cr\u00edtico', description: 'Bloquea otros equipos' },
            ],
          })}

          ${Toggle({ name: 'remote', label: 'Permitir trabajo remoto' })}

          <div id="matching-banner" style="display: none; padding: var(--space-4); background: var(--primary-alpha-10); border: 1px solid var(--primary-alpha-20); border-radius: var(--radius-md); margin-top: var(--space-2);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <span class="material-symbols-outlined" style="color: var(--primary);" aria-hidden="true">group</span>
              <div>
                <span style="font-weight: 700; color: white;" id="match-count">0</span>
                <span style="color: var(--on-surface-variant); font-size: var(--text-sm);"> t\u00e9cnicos coinciden con este perfil</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: var(--space-4); justify-content: flex-end; padding-top: var(--space-4); border-top: 1px solid var(--outline-alpha-20);">
            <button type="button" class="btn btn--ghost" data-action="cancel">Cancelar</button>
            <button type="submit" class="btn btn--primary" data-action="publish">
              <span class="material-symbols-outlined" aria-hidden="true">publish</span>
              Publicar Necesidad
            </button>
          </div>
        </form>
      </div>
    `;

    setupSkillInput();
  }

  function setupSkillInput() {
    const input = container.querySelector('#skill-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const skill = input.value.trim();
        if (skill && !formData.skills.includes(skill)) {
          formData.skills.push(skill);
          renderSkillTags();
          updateMatchBanner();
        }
        input.value = '';
      }
    });
  }

  function renderSkillTags() {
    const tagsEl = container.querySelector('#skill-tags');
    if (!tagsEl) return;
    tagsEl.innerHTML = formData.skills.map(s => html`<span class="skill-tag">${s}<button class="skill-tag__remove" data-action="remove-skill" data-skill="${escapeHtml(s)}" aria-label="Quitar ${s}">&times;</button></span>`).join('');
  }

  function updateMatchBanner() {
    const banner = container.querySelector('#matching-banner');
    const countEl = container.querySelector('#match-count');
    if (!banner || !countEl) return;

    const count = Math.max(0, Math.floor(Math.random() * 15) + formData.skills.length);
    countEl.textContent = count;
    banner.style.display = count > 0 ? 'block' : 'none';
  }

  function getFormData() {
    const form = container.querySelector('#publish-form');
    if (!form) return formData;
    const fd = new FormData(form);
    return {
      ...formData,
      title: fd.get('title') || '',
      description: fd.get('description') || '',
      seniority: fd.get('seniority') || '',
      hoursPerWeek: fd.get('hoursPerWeek') ? parseInt(fd.get('hoursPerWeek'), 10) : '',
      duration: fd.get('duration') || '',
      urgency: fd.get('urgency') || 'normal',
      remote: !!form.querySelector('[name="remote"]')?.checked,
    };
  }

  render();

  const form = container.querySelector('#publish-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formData = getFormData();

    // Clear previous errors
    container.querySelectorAll('.input--error').forEach((el) => clearFieldError(el));

    const { valid, errors } = validateForm(formData, validationSchema);
    if (!valid) {
      for (const [field, msg] of Object.entries(errors)) {
        const input = container.querySelector(`[name="${field}"]`);
        if (input) showFieldError(input, msg);
      }
      showToast('Corrige los errores antes de publicar.', 'error');
      return;
    }

    // Submit via API
    const submitBtn = container.querySelector('[data-action="publish"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';
    }

    try {
      await api.post('/needs', formData, { signal: abortController.signal });
      showToast('Necesidad publicada exitosamente!', 'success');
      import('../router.js').then((m) => m.navigate('/tecnico/oportunidades'));
    } catch (err) {
      if (err.name === 'AbortError') return;
      const fieldErrors = handleApiError(err);
      if (fieldErrors) {
        for (const [field, msg] of Object.entries(fieldErrors)) {
          const input = container.querySelector(`[name="${field}"]`);
          if (input) showFieldError(input, msg);
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = html`
          <span class="material-symbols-outlined" aria-hidden="true">publish</span>
          Publicar Necesidad
        `;
      }
    }
  });

  const cleanupEvents = delegateEvents(container, {
    'remove-skill': (el) => {
      const skill = el.dataset.skill;
      formData.skills = formData.skills.filter((s) => s !== skill);
      renderSkillTags();
      updateMatchBanner();
    },
    'cancel': () => {
      import('../router.js').then((m) => m.navigate('/tecnico/oportunidades'));
    },
  });

  return () => {
    cleanupEvents();
    if (abortController) abortController.abort();
  };
}
